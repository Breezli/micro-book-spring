#!/bin/bash
# K8s 一键部署脚本
# 前置条件: minikube 二进制已放在 ~/.local/bin/minikube
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NAMESPACE=micro-book

echo "=== 1. 验证 minikube ==="
export PATH="$HOME/.local/bin:$PATH"
minikube version
minikube status 2>/dev/null || minikube start --driver=docker --cpus=4 --memory=4096 --image-mirror-country=cn

echo "=== 2. 使用 Docker 原生环境构建镜像 ==="
# 告诉 minikube 使用本地 Docker 守护进程
eval $(minikube docker-env)

cd "$PROJECT_DIR"

echo "--- 构建 auth-service ---"
docker build -t micro-book-auth:latest -f auth-service/Dockerfile .
echo "--- 构建 book-service ---"
docker build -t micro-book-book:latest -f book-service/Dockerfile .
echo "--- 构建 gateway ---"
docker build -t micro-book-gateway:latest -f gateway/Dockerfile .

echo "=== 3. 部署到 K8s ==="
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/consul-deployment.yaml

echo "--- 等待 consul 就绪 ---"
kubectl wait --for=condition=ready pod -l app=consul -n $NAMESPACE --timeout=120s

# 部署 Redis（book-service 缓存用）
kubectl apply -f k8s/redis-deployment.yaml

kubectl apply -f k8s/auth-deployment.yaml
kubectl apply -f k8s/book-deployment.yaml
kubectl apply -f k8s/gateway-deployment.yaml
kubectl apply -f k8s/ingress.yaml

echo "=== 4. 等待所有 Pod 就绪 ==="
kubectl wait --for=condition=ready pod -l app=auth-service -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=ready pod -l app=book-service -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=ready pod -l app=gateway -n $NAMESPACE --timeout=120s

echo "=== 5. 验证 ==="
echo "--- Pod 状态 ---"
kubectl get pods -n $NAMESPACE

echo "--- Service 状态 ---"
kubectl get svc -n $NAMESPACE

echo "--- 暴露 Gateway (新终端运行) ---"
echo "执行以下命令访问:"
echo "  minikube service gateway -n $NAMESPACE"
echo ""
echo "或者使用端口转发:"
echo "  kubectl port-forward -n $NAMESPACE service/gateway 8088:8080"
echo ""
echo "测试登录: curl -X POST http://localhost:8088/auth/login \\"
echo '  -H "Content-Type: application/json" \'
echo '  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"'
