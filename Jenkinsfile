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
                    // Build một image tạm thời chứa code và chạy 'go test' trực tiếp bên trong
                    sh '''
                        cd shopping-backend
                        docker build -t backend-test-img -f- . <<'EOF'
FROM golang:1.23-alpine
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
                    echo '---> Kiểm tra đóng gói Docker Compose Build...'
                    sh 'docker compose build'
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
            echo ' ❌ BUILD FAILED (ĐỎ 🔴) - UNIT TEST BỊ LỖI!'
            echo '=================================================='
        }
    }
}