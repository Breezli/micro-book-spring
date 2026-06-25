pipeline {
    agent any

    environment {
        REGISTRY = "ghcr.io/breezli/micro-book-spring"
        IMAGE_TAG = "${BUILD_NUMBER}"
        K8S_NAMESPACE = "micro-book"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }

        stage('Docker Build') {
            steps {
                sh """
                    docker build -t ${REGISTRY}/auth-service:${IMAGE_TAG} -f auth-service/Dockerfile .
                    docker build -t ${REGISTRY}/book-service:${IMAGE_TAG} -f book-service/Dockerfile .
                    docker build -t ${REGISTRY}/gateway:${IMAGE_TAG} -f gateway/Dockerfile .
                """
            }
        }

        stage('Docker Push') {
            steps {
                sh """
                    docker push ${REGISTRY}/auth-service:${IMAGE_TAG}
                    docker push ${REGISTRY}/book-service:${IMAGE_TAG}
                    docker push ${REGISTRY}/gateway:${IMAGE_TAG}
                """
            }
        }

        stage('Deploy to K8s') {
            steps {
                sh """
                    kubectl set image deployment/auth-service -n ${K8S_NAMESPACE} \\
                        auth-service=${REGISTRY}/auth-service:${IMAGE_TAG}
                    kubectl set image deployment/book-service -n ${K8S_NAMESPACE} \\
                        book-service=${REGISTRY}/book-service:${IMAGE_TAG}
                    kubectl set image deployment/gateway -n ${K8S_NAMESPACE} \\
                        gateway=${REGISTRY}/gateway:${IMAGE_TAG}
                """
            }
        }
    }
}
