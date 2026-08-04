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
                    // Sử dụng pwd() để lấy đường dẫn chính xác và cd vào thư mục shopping-backend
                    sh '''
                        docker run --rm \
                          -v "$(pwd)/shopping-backend":/app \
                          -w /app \
                          golang:1.23-alpine go test ./...
                    '''
                }
            }
        }

        stage('3. Run Frontend Unit Tests') {
            steps {
                script {
                    echo '---> Đang chạy Unit Test cho Frontend (Skip nếu chưa cấu hình)...'
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