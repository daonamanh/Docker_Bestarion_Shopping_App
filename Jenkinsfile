// pipeline {
//     agent any

//     stages {
//         stage('1. Checkout Code') {
//             steps {
//                 checkout scm
//                 echo '---> Đã lấy code mới nhất từ Git thành công!'
//             }
//         }

//         stage('2. Run Backend Unit Tests') {
//             steps {
//                 script {
//                     echo '---> Đang chạy Unit Test cho Golang Backend...'
//                     sh '''
//                         cd shopping-backend
//                         docker build -t backend-test-img -f- . <<'EOF'
// FROM golang:alpine
// ENV GOTOOLCHAIN=auto
// WORKDIR /app
// COPY go.mod go.sum ./
// RUN go mod download
// COPY . .
// CMD ["go", "test", "./..."]
// EOF
//                         docker run --rm backend-test-img
//                     '''
//                 }
//             }
//         }

//         stage('3. Run Frontend Unit Tests') {
//             steps {
//                 script {
//                     echo '---> Skip Frontend tests...'
//                     echo 'No frontend tests specified, skipping...'
//                 }
//             }
//         }

//         stage('4. Verify Docker Build') {
//             steps {
//                 script {
//                     echo '---> Kiểm tra đóng gói Docker Images...'
//                     sh '''
//                         if command -v "docker compose" >/dev/null 2>&1; then
//                             docker compose build
//                         elif command -v docker-compose >/dev/null 2>&1; then
//                             docker-compose build
//                         else
//                             echo "Đang verify build trực tiếp từng Dockerfile..."
//                             docker build -t backend-service ./shopping-backend
//                             docker build -t frontend-service ./shopping-frontend
//                         fi
//                     '''
//                 }
//             }
//         }
//     }

//     post {
//         success {
//             echo '=================================================='
//             echo ' 🎉 BUILD SUCCESS (XANH 🟢) - ĐẠT TIÊU CHUẨN DOD!'
//             echo '=================================================='
//         }
//         failure {
//             echo '=================================================='
//             echo ' ❌ BUILD FAILED (ĐỎ 🔴) - BỊ LỖI!'
//             echo '=================================================='
//         }
//     }
// }





pipeline {
    agent any

    // Lập lịch tự động chạy vào 02:00 AM sáng Chủ Nhật hàng tuần
    triggers {
        cron('0 2 * * 0')
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        // ĐÃ XÓA STAGE 1 (Checkout SCM): Tránh gọi Git fetch 2 lần gây timeout port 443

        stage('1. Install Dependencies & Tools') {
            steps {
                script {
                    echo '=== Cài đặt các thư viện và linter ==='
                    
                    // 1. JavaScript / TypeScript
                    if (fileExists('package.json')) {
                        echo '[+] Installing Node.js packages...'
                        sh 'npm ci || npm install'
                    }

                    // 2. Go / Golang
                    if (fileExists('.golangci.yml') || fileExists('go.mod')) {
                        echo '[+] Checking/Installing Go dependencies...'
                        sh '''
                            if [ -f "go.mod" ]; then
                                go mod tidy || true
                            fi
                        '''
                    }

                    // 3. Ruby
                    if (fileExists('.rubocop.yml') || fileExists('Gemfile')) {
                        echo '[+] Checking/Installing RuboCop...'
                        sh '''
                            if ! command -v rubocop &> /dev/null; then
                                gem install rubocop || true
                            fi
                            if [ -f "Gemfile" ]; then
                                bundle install || true
                            fi
                        '''
                    }
                }
            }
        }

        stage('2. Run Complexity Audit') {
            steps {
                script {
                    echo '=== Chạy script kiểm tra độ phức tạp code ==='
                    sh 'chmod +x ./scripts/run-complexity-check.sh'
                    
                    // Thực thi runner kiểm tra (JS/TS, Go v1.61.0, Ruby)
                    sh './scripts/run-complexity-check.sh || true'
                }
            }
        }

        stage('3. Publish HTML Report') {
            steps {
                echo '=== Đẩy báo cáo HTML lên giao diện Jenkins ==='
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'complexity-report.html',
                    reportName: 'Weekly Code Complexity Audit',
                    reportTitles: 'Divoro Code Complexity Compliance Report'
                ])
            }
        }
    }

    post {
        always {
            echo '=== Hoàn tất tiến trình kiểm tra Code Complexity ==='
        }
    }
}