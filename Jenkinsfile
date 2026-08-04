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
                    // Chạy test Go bên trong container tạm thời
                    sh 'docker run --rm -v $PWD/shopping-backend:/app -w /app golang:1.23-alpine go test ./...'
                }
            }
        }

        stage('3. Run Frontend Unit Tests') {
            steps {
                script {
                    echo '---> Đang chạy Unit Test cho Frontend (nếu có)...'
                    // Trường hợp Frontend có test
                    // sh 'docker run --rm -v $PWD/shopping-frontend:/app -w /app node:20-slim npm test -- --watchAll=false'
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