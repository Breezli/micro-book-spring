package com.microbook.gateway.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthGatewayFilterFactory
        extends AbstractGatewayFilterFactory<JwtAuthGatewayFilterFactory.Config> {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthGatewayFilterFactory.class);

    private final SecretKey key;

    public JwtAuthGatewayFilterFactory(
            @Value("${jwt.secret}") String secret) {
        super(Config.class);
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // 白名单路径跳过验证
            String path = exchange.getRequest().getURI().getPath();
            if (config.getExcludedPaths() != null) {
                for (String exclude : config.getExcludedPaths()) {
                    if (path.startsWith(exclude)) {
                        return chain.filter(exchange);
                    }
                }
            }

            // 从请求头中获取 Token
            String authHeader = exchange.getRequest().getHeaders()
                    .getFirst(HttpHeaders.AUTHORIZATION);

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return unauthorized(exchange, "未授权，请先登录");
            }

            String token = authHeader.substring(7);

            return Mono.fromCallable(() -> {
                // JWT 验证是阻塞操作，放到非 reactive 线程执行
                Claims claims = Jwts.parser()
                        .verifyWith(key)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
                return claims;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(claims -> {
                ServerWebExchange modifiedExchange = exchange.mutate()
                        .request(r -> r.header("X-User-Id", claims.getSubject())
                                        .header("X-Username",
                                                claims.get("username", String.class)))
                        .build();
                return chain.filter(modifiedExchange);
            })
            .onErrorResume(e -> {
                log.warn("JWT filter error for {} {}: {}",
                    exchange.getRequest().getMethod(),
                    exchange.getRequest().getURI().getPath(),
                    e.toString());
                return unauthorized(exchange, "Token 无效或已过期");
            });
        };
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
        byte[] body = ("{\"error\":\"" + message + "\"}").getBytes();
        return exchange.getResponse().writeWith(
                Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }

    public static class Config {
        private List<String> excludedPaths;

        public List<String> getExcludedPaths() { return excludedPaths; }
        public void setExcludedPaths(List<String> excludedPaths) {
            this.excludedPaths = excludedPaths;
        }
    }
}
