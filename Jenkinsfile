pipeline {
    agent any

    stages {
        stage('1. Checkout Code') {
            steps {
                checkout scm
                echo '---> Đã lấy code mới nhất từ Git thành công!'
            }
        }

        stage('2. Run Backend Unit Tests') {
            steps {
                script {
                    echo '---> Đang chạy Unit Test cho Golang Backend...'
                    sh '''
                        cd shopping-backend
                        docker build -t backend-test-img -f- . <<'EOF'
FROM golang:alpine
ENV GOTOOLCHAIN=auto
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
CMD ["go", "test", "./..."]
EOF
                        docker run --rm backend-test-img
                    '''
                }
            }
        }

        stage('3. Run Frontend Unit Tests') {
            steps {
                script {
                    echo '---> Skip Frontend tests...'
                    echo 'No frontend tests specified, skipping...'
                }
            }
        }

        stage('4. Verify Docker Build') {
            steps {
                script {
                    echo '---> Kiểm tra đóng gói Docker Images...'
                    sh '''
                        if command -v "docker compose" >/dev/null 2>&1; then
                            docker compose build
                        elif command -v docker-compose >/dev/null 2>&1; then
                            docker-compose build
                        else
                            echo "Đang verify build trực tiếp từng Dockerfile..."
                            docker build -t backend-service ./shopping-backend
                            docker build -t frontend-service ./shopping-frontend
                        fi
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo ' 🎉 BUILD SUCCESS (XANH 🟢) - ĐẠT TIÊU CHUẨN DOD!'
            echo '=================================================='
        }
        failure {
            echo '=================================================='
            echo ' ❌ BUILD FAILED (ĐỎ 🔴) - BỊ LỖI!'
            echo '=================================================='
        }
    }
}