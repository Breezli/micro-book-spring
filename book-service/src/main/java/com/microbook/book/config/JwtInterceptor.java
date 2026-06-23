package com.microbook.book.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    private final RestTemplate restTemplate;

    // Auth 服务在 Consul 中的服务名
    private static final String AUTH_SERVICE_URL = "http://auth-service/auth/validate";

    public JwtInterceptor(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        // 放过 /books/public 路径（如果 future 需要）
        String path = request.getRequestURI();
        if (path.startsWith("/books/public")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"未授权，请先登录\"}");
            return false;
        }

        try {
            // 通过 RestTemplate 调用 auth-service 验证 Token
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> authResponse = restTemplate.exchange(
                AUTH_SERVICE_URL,
                HttpMethod.POST,
                entity,
                Map.class
            );

            if (authResponse.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Token 验证失败");
            }

            // 将用户信息存入 request attribute
            Map<String, Object> userInfo = authResponse.getBody();
            if (userInfo != null) {
                request.setAttribute("userId", userInfo.get("userId"));
                request.setAttribute("username", userInfo.get("username"));
            }
            return true;

        } catch (Exception e) {
            response.setStatus(401);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Token 无效或已过期\"}");
            return false;
        }
    }
}
