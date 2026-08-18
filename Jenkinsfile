pipeline {
    agent any

    triggers {
        cron('0 2 * * 0')
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('0. Disable CSP Security') {
            steps {
                script {
                    // Tắt chính sách CSP tĩnh của Jenkins để tránh mất style báo cáo
                    System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "")
                }
            }
        }

        stage('1. Dynamic Dependencies Setup') {
            steps {
                script {
                    echo '=== Cài đặt thư viện động theo cấu trúc cây thư mục ==='
                    
                    // 1. Quét động và cài npm cho TẤT CẢ các thư mục có package.json
                    sh '''
                        find . -name "package.json" -not -path "*/node_modules/*" | while read pkg; do
                            dir=$(dirname "$pkg")
                            echo "[+] Installing Node dependencies in: $dir"
                            (cd "$dir" && npm ci || npm install)
                        done
                    '''

                    // 2. Quét động và cài Go dependencies cho TẤT CẢ thư mục có go.mod
                    sh '''
                        find . -name "go.mod" -not -path "*/vendor/*" | while read gomod; do
                            dir=$(dirname "$gomod")
                            echo "[+] Tidying Go module in: $dir"
                            (cd "$dir" && go mod tidy || true)
                        done
                    '''

                    // 3. Quét động và cài Gemfile cho Ruby
                    sh '''
                        find . -name "Gemfile" -not -path "*/vendor/*" | while read gem; do
                            dir=$(dirname "$gem")
                            echo "[+] Installing Ruby gems in: $dir"
                            (cd "$dir" && bundle install || true)
                        done
                    '''
                }
            }
        }

        stage('2. Execute Complexity Audit') {
            steps {
                script {
                    echo '=== Chạy script kiểm tra độ phức tạp code ==='
                    sh 'chmod +x ./scripts/run-complexity-check.sh'
                    sh './scripts/run-complexity-check.sh || true'
                }
            }
        }

        stage('3. Publish HTML Report') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'complexity-report.html',
                    reportName: 'Dynamic Code Complexity Audit',
                    reportTitles: 'Multi-Language Code Complexity Audit Report'
                ])
            }
        }
    }

    post {
        always {
            echo '=== Tiến trình hoàn tất ==='
        }
    }
}