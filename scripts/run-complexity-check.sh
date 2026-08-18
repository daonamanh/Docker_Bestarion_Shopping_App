
# #!/usr/bin/env bash
# set -e

# export PATH="$HOME/bin:$PATH"

# echo "========================================="
# echo "   CODE COMPLEXITY AUDIT RUNNER         "
# echo "========================================="

# OUTPUT_DIR="reports"
# mkdir -p "$OUTPUT_DIR"
# REPORT_FILE="$OUTPUT_DIR/complexity-report.html"

# # Mở đầu HTML với Layout cố định độ rộng cột
# cat <<EOF > "$REPORT_FILE"
# <!DOCTYPE html>
# <html lang="vi">
# <head>
#     <meta charset="UTF-8">
#     <meta name="viewport" content="width=device-width, initial-scale=1.0">
#     <title>Code Complexity Audit Report</title>
#     <style>
#         :root {
#             --bg-body: #f8fafc;
#             --card-bg: #ffffff;
#             --text-main: #0f172a;
#             --text-muted: #64748b;
#             --border-color: #e2e8f0;
#             --pass-bg: #f0fdf4;
#             --pass-text: #15803d;
#             --pass-border: #bbf7d0;
#             --fail-bg: #fef2f2;
#             --fail-text: #b91c1c;
#             --fail-border: #fecaca;
#             --rule-bg: #f1f5f9;
#         }

#         body { 
#             font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
#             margin: 0; 
#             padding: 30px 20px; 
#             background-color: var(--bg-body); 
#             color: var(--text-main);
#             line-height: 1.5;
#         }

#         .container { max-width: 1200px; margin: 0 auto; }

#         .header { 
#             background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
#             color: white; 
#             padding: 24px 30px; 
#             border-radius: 12px; 
#             box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
#             margin-bottom: 24px;
#         }
#         .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
#         .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }

#         .section { 
#             background: var(--card-bg); 
#             padding: 24px; 
#             margin-bottom: 24px; 
#             border-radius: 12px; 
#             border: 1px solid var(--border-color);
#             box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
#         }

#         .section-header {
#             display: flex;
#             justify-content: space-between;
#             align-items: center;
#             margin-bottom: 16px;
#             padding-bottom: 12px;
#             border-bottom: 1px solid #f1f5f9;
#         }

#         .section-title { font-size: 18px; font-weight: 600; margin: 0; }

#         .badge {
#             padding: 6px 14px;
#             border-radius: 20px;
#             font-size: 13px;
#             font-weight: 600;
#         }
#         .badge-pass { background: var(--pass-bg); color: var(--pass-text); border: 1px solid var(--pass-border); }
#         .badge-fail { background: var(--fail-bg); color: var(--fail-text); border: 1px solid var(--fail-border); }

#         /* Ép bảng theo chiều rộng cố định để đồng bộ 100% cột */
#         .audit-table {
#             width: 100%;
#             border-collapse: collapse;
#             margin-top: 10px;
#             font-size: 14px;
#             table-layout: fixed; /* Khóa độ rộng cột */
#         }
#         .audit-table th {
#             background-color: #f8fafc;
#             color: var(--text-muted);
#             text-align: left;
#             padding: 10px 14px;
#             font-weight: 600;
#             border-bottom: 2px solid var(--border-color);
#         }
#         .audit-table td {
#             padding: 12px 14px;
#             border-bottom: 1px solid var(--border-color);
#             vertical-align: top;
#             word-wrap: break-word; /* Tránh tràn chữ */
#         }
#         .audit-table tr:last-child td { border-bottom: none; }

#         /* Định nghĩa tỉ lệ kích thước 3 cột thống nhất */
#         .col-location { width: 25%; }
#         .col-message  { width: 55%; }
#         .col-rule     { width: 20%; }
        
#         .code-location {
#             font-family: monospace;
#             font-size: 13px;
#             color: #2563eb;
#             font-weight: 500;
#         }
#         .rule-tag {
#             display: inline-block;
#             background: var(--rule-bg);
#             color: #475569;
#             padding: 2px 8px;
#             border-radius: 4px;
#             font-family: monospace;
#             font-size: 12px;
#             max-width: 100%;
#             overflow: hidden;
#             text-overflow: ellipsis;
#             white-space: nowrap;
#         }
#         .rule-tag.cyclo-tag {
#             background: var(--fail-bg);
#             color: var(--fail-text);
#             border: 1px solid var(--fail-border);
#             font-weight: bold;
#         }
#     </style>
# </head>
# <body>
#     <div class="container">
#         <div class="header">
#             <h1>📊 Multi-Language Code Complexity Audit Report</h1>
#             <p>Target Compliance: Divoro Diligence Work | Generated: $(date)</p>
#         </div>
# EOF

# # =========================================================
# # 1. JAVASCRIPT / TYPESCRIPT AUDIT (ESLint Parse JSON)
# # =========================================================
# if [ -f "package.json" ]; then
#     echo "[+] Running ESLint for TypeScript/JavaScript..."
    
#     set +e
#     npx eslint . --ext .js,.jsx,.ts,.tsx --format json > "$OUTPUT_DIR/eslint-tmp.json" 2>&1
#     ESLINT_STATUS=$?
#     set -e

#     cat <<EOF >> "$REPORT_FILE"
#     <div class="section">
#         <div class="section-header">
#             <h2 class="section-title">🟨 TypeScript / JavaScript Audit (ESLint)</h2>
# EOF

#     if [ $ESLINT_STATUS -eq 0 ]; then
#         echo "<span class='badge badge-pass'>✅ PASSED</span></div>" >> "$REPORT_FILE"
#         echo "<p style='color: var(--text-muted); margin: 0;'>No complexity violations detected in JS/TS files.</p>" >> "$REPORT_FILE"
#     else
#         echo "<span class='badge badge-fail'>⚠️ VIOLATIONS DETECTED</span></div>" >> "$REPORT_FILE"
#         echo "<table class='audit-table'><thead><tr><th class='col-location'>Location</th><th class='col-message'>Message</th><th class='col-rule'>Rule ID</th></tr></thead><tbody>" >> "$REPORT_FILE"
        
#         node -e '
#             const fs = require("fs");
#             try {
#                 const data = JSON.parse(fs.readFileSync("'"$OUTPUT_DIR/eslint-tmp.json"'"));
#                 data.forEach(file => {
#                     file.messages.forEach(msg => {
#                         const loc = `${file.filePath.replace(process.cwd(), "")}:${msg.line}:${msg.column}`;
#                         console.log(`<tr><td class="code-location">${loc}</td><td>${msg.message}</td><td><span class="rule-tag" title="${msg.ruleId || ""}">${msg.ruleId || "N/A"}</span></td></tr>`);
#                     });
#                 });
#             } catch (e) {}
#         ' >> "$REPORT_FILE"

#         echo "</tbody></table>" >> "$REPORT_FILE"
#     fi

#     rm -f "$OUTPUT_DIR/eslint-tmp.json"
#     echo "</div>" >> "$REPORT_FILE"
# fi

# # =========================================================
# # 2. GO / GOLANG AUDIT (Parsed Cleanly for HTML Report)
# # =========================================================
# export GOPATH="${GOPATH:-$HOME/go}"
# export PATH="$HOME/bin:$GOPATH/bin:/usr/local/go/bin:$PATH"

# echo "[+] Running Complexity Audit for Go..."

# set +e
# # Tự động đảm bảo các công cụ CLI đã được cài đặt
# command -v gocyclo &> /dev/null || go install github.com/fzipp/gocyclo/cmd/gocyclo@latest > /dev/null 2>&1 || true
# command -v gocognit &> /dev/null || go install github.com/uudashr/gocognit/cmd/gocognit@latest > /dev/null 2>&1 || true

# GO_VIOLATIONS=""
# GO_TARGETS=$(find . -name "*.go" -not -path "*/node_modules/*" -not -path "*/vendor/*")

# if [ -n "$GO_TARGETS" ]; then
#     CYCLO_OUT=""
#     COGNIT_OUT=""
    
#     if command -v gocyclo &> /dev/null; then
#         CYCLO_OUT=$(gocyclo -over 5 $GO_TARGETS 2>&1 || true)
#     fi
    
#     if command -v gocognit &> /dev/null; then
#         COGNIT_OUT=$(gocognit -over 5 $GO_TARGETS 2>&1 || true)
#     fi

#     if [ -n "$CYCLO_OUT" ]; then
#         GO_VIOLATIONS="$CYCLO_OUT"
#     fi
#     if [ -n "$COGNIT_OUT" ]; then
#         GO_VIOLATIONS="${GO_VIOLATIONS}
# ${COGNIT_OUT}"
#     fi
# fi
# set -e

# cat <<EOF >> "$REPORT_FILE"
#     <div class="section">
#         <div class="section-header">
#             <h2 class="section-title">🟦 Go / Golang Audit</h2>
# EOF

# # Lọc bỏ dòng trống
# GO_VIOLATIONS=$(echo "$GO_VIOLATIONS" | sed '/^$/d')

# if [ -z "$GO_VIOLATIONS" ]; then
#     echo "<span class='badge badge-pass'>✅ PASSED</span></div>" >> "$REPORT_FILE"
#     echo "<p style='color: var(--text-muted); margin: 0;'>Complexity is within acceptable threshold (&le; 5) for all Go functions.</p>" >> "$REPORT_FILE"
# else
#     echo "<span class='badge badge-fail'>⚠️ VIOLATIONS DETECTED</span></div>" >> "$REPORT_FILE"
#     echo "<table class='audit-table'><thead><tr><th class='col-location'>Location</th><th class='col-message'>Message / Function</th><th class='col-rule'>Complexity Metric</th></tr></thead><tbody>" >> "$REPORT_FILE"
    
#     # Parse chính xác các cột dựa vào cấu trúc output của gocyclo/gocognit: [Score] [Pkg] [Func] [File:Line:Col]
#     echo "$GO_VIOLATIONS" | while read -r line; do
#         if [ -n "$line" ]; then
#             score=$(echo "$line" | awk '{print $1}')
#             func=$(echo "$line" | awk '{print $3}')
#             loc=$(echo "$line" | awk '{print $4}')
            
#             # Fallback nếu tên hàm hoặc location bị lệch cột
#             if [[ "$loc" != *":"* ]] && [[ "$func" == *":"* ]]; then
#                 tmp="$func"
#                 func="$loc"
#                 loc="$tmp"
#             fi
            
#             echo "<tr><td class='code-location'>$loc</td><td>Function <b>$func</b> exceeds complexity limit.</td><td><span class='rule-tag cyclo-tag'>Score: $score</span></td></tr>" >> "$REPORT_FILE"
#         fi
#     done

#     echo "</tbody></table>" >> "$REPORT_FILE"
# fi

# echo "</div>" >> "$REPORT_FILE"

# # =========================================================
# # 3. RUBY AUDIT (RuboCop Parse JSON)
# # =========================================================
# if [ -f ".rubocop.yml" ] && command -v rubocop &> /dev/null; then
#     echo "[+] Running RuboCop for Ruby..."
    
#     set +e
#     rubocop --config .rubocop.yml --format json -o "$OUTPUT_DIR/rubocop-tmp.json" 2>&1
#     RUBY_STATUS=$?
#     set -e

#     cat <<EOF >> "$REPORT_FILE"
#     <div class="section">
#         <div class="section-header">
#             <h2 class="section-title">🟥 Ruby Audit (RuboCop)</h2>
# EOF

#     if [ $RUBY_STATUS -eq 0 ]; then
#         echo "<span class='badge badge-pass'>✅ PASSED</span></div>" >> "$REPORT_FILE"
#         echo "<p style='color: var(--text-muted); margin: 0;'>No RuboCop complexity rules violated.</p>" >> "$REPORT_FILE"
#     else
#         echo "<span class='badge badge-fail'>⚠️ VIOLATIONS DETECTED</span></div>" >> "$REPORT_FILE"
#         echo "<table class='audit-table'><thead><tr><th class='col-location'>Location</th><th class='col-message'>Message</th><th class='col-rule'>Cop Name</th></tr></thead><tbody>" >> "$REPORT_FILE"

#         ruby -r json -e '
#             begin
#                 file_content = File.read("'"$OUTPUT_DIR/rubocop-tmp.json"'")
#                 data = JSON.parse(file_content)
#                 data["files"].each do |file|
#                     file["offenses"].each do |off|
#                         loc = "#{file["path"]}:#{off["location"]["line"]}:#{off["location"]["column"]}"
#                         puts "<tr><td class=\"code-location\">#{loc}</td><td>#{off["message"]}</td><td><span class=\"rule-tag\" title=\"#{off["cop_name"]}\">#{off["cop_name"]}</span></td></tr>"
#                     end
#                 end
#             rescue => e
#             end
#         ' >> "$REPORT_FILE"

#         echo "</tbody></table>" >> "$REPORT_FILE"
#     fi

#     rm -f "$OUTPUT_DIR/rubocop-tmp.json"
#     echo "</div>" >> "$REPORT_FILE"
# fi

# # Đóng HTML
# cat <<EOF >> "$REPORT_FILE"
#     </div>
# </body>
# </html>
# EOF

# echo "[+] Report successfully generated at: $REPORT_FILE"
# exit 0







#!/usr/bin/env bash
set -e

export PATH="$HOME/bin:$PATH"

echo "========================================="
echo "   CODE COMPLEXITY AUDIT RUNNER         "
echo "========================================="

OUTPUT_DIR="reports"
mkdir -p "$OUTPUT_DIR"
REPORT_FILE="$OUTPUT_DIR/complexity-report.html"

cat <<EOF > "$REPORT_FILE"
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Complexity Audit Report</title>
    <style>
        :root {
            --bg-body: #f8fafc;
            --card-bg: #ffffff;
            --text-main: #0f172a;
            --text-muted: #64748b;
            --border-color: #e2e8f0;
            --pass-bg: #f0fdf4;
            --pass-text: #15803d;
            --pass-border: #bbf7d0;
            --fail-bg: #fef2f2;
            --fail-text: #b91c1c;
            --fail-border: #fecaca;
            --rule-bg: #f1f5f9;
        }

        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
            margin: 0; 
            padding: 30px 20px; 
            background-color: var(--bg-body); 
            color: var(--text-main);
            line-height: 1.5;
        }

        .container { max-width: 1200px; margin: 0 auto; }

        .header { 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); 
            color: white; 
            padding: 24px 30px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
        }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }

        .section { 
            background: var(--card-bg); 
            padding: 24px; 
            margin-bottom: 24px; 
            border-radius: 12px; 
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
        }

        .section-title { font-size: 18px; font-weight: 600; margin: 0; }

        .badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
        }
        .badge-pass { background: var(--pass-bg); color: var(--pass-text); border: 1px solid var(--pass-border); }
        .badge-fail { background: var(--fail-bg); color: var(--fail-text); border: 1px solid var(--fail-border); }

        .audit-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 14px;
            table-layout: fixed;
        }
        .audit-table th {
            background-color: #f8fafc;
            color: var(--text-muted);
            text-align: left;
            padding: 10px 14px;
            font-weight: 600;
            border-bottom: 2px solid var(--border-color);
        }
        .audit-table td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--border-color);
            vertical-align: top;
            word-wrap: break-word;
        }
        .audit-table tr:last-child td { border-bottom: none; }

        .col-location { width: 40%; }
        .col-message  { width: 38%; }
        .col-rule     { width: 22%; }
        
        .code-location {
            font-family: monospace;
            font-size: 13px;
            color: #2563eb;
            font-weight: 500;
        }
        .rule-tag {
            display: inline-block;
            background: var(--rule-bg);
            color: #475569;
            padding: 3px 8px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            white-space: nowrap;
        }
        .rule-tag.cyclo-tag {
            background: var(--fail-bg);
            color: var(--fail-text);
            border: 1px solid var(--fail-border);
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Multi-Language Code Complexity Audit Report</h1>
            <p>Target Compliance: Divoro Diligence Work | Generated: $(date)</p>
        </div>
EOF

# =========================================================
# 1. JAVASCRIPT / TYPESCRIPT AUDIT
# =========================================================
JS_PROJECTS=$(find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null)

if [ -n "$JS_PROJECTS" ]; then
    echo "[+] Running ESLint for TypeScript/JavaScript..."
    echo "[]" > "$OUTPUT_DIR/eslint-tmp.json"
    ESLINT_STATUS=0

    for pkg in $JS_PROJECTS; do
        proj_dir=$(dirname "$pkg" | sed 's|^\./||')
        
        set +e
        (cd "$proj_dir" && npx eslint . --ext .js,.jsx,.ts,.tsx --format json 2>/dev/null) > "$OUTPUT_DIR/eslint-single.json"
        SINGLE_STATUS=$?
        set -e

        if [ $SINGLE_STATUS -ne 0 ]; then
            ESLINT_STATUS=1
        fi

        node -e '
            const fs = require("fs");
            try {
                let main = JSON.parse(fs.readFileSync("'"$OUTPUT_DIR/eslint-tmp.json"'", "utf8") || "[]");
                let single = JSON.parse(fs.readFileSync("'"$OUTPUT_DIR/eslint-single.json"'", "utf8") || "[]");
                let projDir = "'"$proj_dir"'";
                single.forEach(f => {
                    let relativePath = f.filePath.replace(process.cwd(), "").replace(/^\//, "");
                    if (projDir !== "." && !relativePath.startsWith(projDir)) {
                        relativePath = projDir + "/" + relativePath;
                    }
                    f.filePath = relativePath;
                });
                fs.writeFileSync("'"$OUTPUT_DIR/eslint-tmp.json"'", JSON.stringify(main.concat(single)));
            } catch(e) {}
        ' 2>/dev/null || true
    done
    rm -f "$OUTPUT_DIR/eslint-single.json"

    cat <<EOF >> "$REPORT_FILE"
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">🟨 TypeScript / JavaScript Audit (ESLint)</h2>
EOF

    if [ $ESLINT_STATUS -eq 0 ]; then
        echo "<span class='badge badge-pass'>✅ PASSED</span></div>" >> "$REPORT_FILE"
        echo "<p style='color: var(--text-muted); margin: 0;'>No complexity violations detected in JS/TS files.</p>" >> "$REPORT_FILE"
    else
        echo "<span class='badge badge-fail'>⚠️ VIOLATIONS DETECTED</span></div>" >> "$REPORT_FILE"
        echo "<table class='audit-table'><thead><tr><th class='col-location'>Location</th><th class='col-message'>Message</th><th class='col-rule'>Rule ID</th></tr></thead><tbody>" >> "$REPORT_FILE"
        
        node -e '
            const fs = require("fs");
            try {
                const data = JSON.parse(fs.readFileSync("'"$OUTPUT_DIR/eslint-tmp.json"'"));
                data.forEach(file => {
                    if (file.messages) {
                        file.messages.forEach(msg => {
                            const cleanPath = file.filePath.replace(/^\.\//, "");
                            const loc = `${cleanPath}:${msg.line}:${msg.column}`;
                            const escMsg = msg.message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                            console.log(`<tr><td class="code-location">${loc}</td><td>${escMsg}</td><td><span class="rule-tag">${msg.ruleId || "N/A"}</span></td></tr>`);
                        });
                    }
                });
            } catch (e) {}
        ' >> "$REPORT_FILE"

        echo "</tbody></table>" >> "$REPORT_FILE"
    fi

    rm -f "$OUTPUT_DIR/eslint-tmp.json"
    echo "</div>" >> "$REPORT_FILE"
fi

# =========================================================
# 2. GO / GOLANG AUDIT (Fixed Parsing & Layout)
# =========================================================
export GOPATH="${GOPATH:-$HOME/go}"
export PATH="$HOME/bin:$GOPATH/bin:/usr/local/go/bin:$PATH"

echo "[+] Running Complexity Audit for Go..."

set +e
command -v gocyclo &> /dev/null || go install github.com/fzipp/gocyclo/cmd/gocyclo@latest > /dev/null 2>&1 || true
command -v gocognit &> /dev/null || go install github.com/uudashr/gocognit/cmd/gocognit@latest > /dev/null 2>&1 || true

GO_TARGETS=$(find . -name "*.go" -not -path "*/node_modules/*" -not -path "*/vendor/*")

cat <<EOF >> "$REPORT_FILE"
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">🟦 Go / Golang Audit</h2>
EOF

TMP_GO_REPORT="$OUTPUT_DIR/go-violations.tmp"
rm -f "$TMP_GO_REPORT"

if [ -n "$GO_TARGETS" ]; then
    # Format output: Location [TAB] Message [TAB] Metric & Score
    if command -v gocyclo &> /dev/null; then
        gocyclo -over 10 $GO_TARGETS 2>/dev/null | awk '{
            score = $1;
            fn = $3;
            loc = $4;
            printf "%s\tFunction %s exceeds Cyclomatic complexity limit.\tCyclomatic: %s\n", loc, fn, score
        }' >> "$TMP_GO_REPORT" || true
    fi
    
    if command -v gocognit &> /dev/null; then
        gocognit -over 10 $GO_TARGETS 2>/dev/null | awk '{
            score = $1;
            fn = $3;
            loc = $4;
            printf "%s\tFunction %s exceeds Cognitive complexity limit.\tCognitive: %s\n", loc, fn, score
        }' >> "$TMP_GO_REPORT" || true
    fi
fi
set -e

if [ ! -s "$TMP_GO_REPORT" ]; then
    echo "<span class='badge badge-pass'>✅ PASSED</span></div>" >> "$REPORT_FILE"
    echo "<p style='color: var(--text-muted); margin: 0;'>Complexity is within acceptable threshold (&le; 10) for all Go functions.</p>" >> "$REPORT_FILE"
else
    echo "<span class='badge badge-fail'>⚠️ VIOLATIONS DETECTED</span></div>" >> "$REPORT_FILE"
    echo "<table class='audit-table'><thead><tr><th class='col-location'>Location</th><th class='col-message'>Message / Function</th><th class='col-rule'>Metric & Score</th></tr></thead><tbody>" >> "$REPORT_FILE"
    
    # Parse TAB-delimited rows safely
    sort -u "$TMP_GO_REPORT" | while IFS=$'\t' read -r loc msg metric; do
        if [ -n "$loc" ]; then
            echo "<tr><td class='code-location'>$loc</td><td>$msg</td><td><span class='rule-tag cyclo-tag'>$metric</span></td></tr>" >> "$REPORT_FILE"
        fi
    done

    echo "</tbody></table>" >> "$REPORT_FILE"
fi

rm -f "$TMP_GO_REPORT"
echo "</div>" >> "$REPORT_FILE"

# =========================================================
# 3. RUBY AUDIT
# =========================================================
if [ -f ".rubocop.yml" ] && command -v rubocop &> /dev/null; then
    echo "[+] Running RuboCop for Ruby..."
    
    set +e
    rubocop --config .rubocop.yml --format json -o "$OUTPUT_DIR/rubocop-tmp.json" 2>&1
    RUBY_STATUS=$?
    set -e

    cat <<EOF >> "$REPORT_FILE"
    <div class="section">
        <div class="section-header">
            <h2 class="section-title">🟥 Ruby Audit (RuboCop)</h2>
EOF

    if [ $RUBY_STATUS -eq 0 ]; then
        echo "<span class='badge badge-pass'>✅ PASSED</span></div>" >> "$REPORT_FILE"
        echo "<p style='color: var(--text-muted); margin: 0;'>No RuboCop complexity rules violated.</p>" >> "$REPORT_FILE"
    else
        echo "<span class='badge badge-fail'>⚠️ VIOLATIONS DETECTED</span></div>" >> "$REPORT_FILE"
        echo "<table class='audit-table'><thead><tr><th class='col-location'>Location</th><th class='col-message'>Message</th><th class='col-rule'>Cop Name</th></tr></thead><tbody>" >> "$REPORT_FILE"

        ruby -r json -e '
            begin
                file_content = File.read("'"$OUTPUT_DIR/rubocop-tmp.json"'")
                data = JSON.parse(file_content)
                data["files"].each do |file|
                    file["offenses"].each do |off|
                        loc = "#{file["path"]}:#{off["location"]["line"]}:#{off["location"]["column"]}"
                        msg = off["message"].gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;")
                        puts "<tr><td class=\"code-location\">#{loc}</td><td>#{msg}</td><td><span class=\"rule-tag\">#{off["cop_name"]}</span></td></tr>"
                    end
                end
            rescue => e
            end
        ' >> "$REPORT_FILE"

        echo "</tbody></table>" >> "$REPORT_FILE"
    fi

    rm -f "$OUTPUT_DIR/rubocop-tmp.json"
    echo "</div>" >> "$REPORT_FILE"
fi

cat <<EOF >> "$REPORT_FILE"
    </div>
</body>
</html>
EOF

echo "[+] Report successfully generated at: $REPORT_FILE"
exit 0