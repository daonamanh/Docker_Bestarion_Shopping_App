#!/usr/bin/env bash
set -e

export PATH="$HOME/bin:$PATH"

OUTPUT_DIR="reports"
mkdir -p "$OUTPUT_DIR"
REPORT_FILE="$OUTPUT_DIR/complexity-report.html"

# Sinh Header động với Thời gian thực
cat <<EOF > "$REPORT_FILE"
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Complexity Audit Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 30px 20px; background-color: #f8fafc; color: #0f172a; line-height: 1.5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #0f172a; color: white; padding: 24px 30px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .header p { margin: 6px 0 0 0; font-size: 13px; color: #94a3b8; }
        .section { background: #ffffff; padding: 24px; margin-bottom: 24px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .section-header { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
        .section-title { font-size: 18px; font-weight: 600; margin: 0; display: inline-block; }
        .badge { float: right; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .badge-pass { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
        .badge-fail { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .audit-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; table-layout: fixed; }
        .audit-table th { background-color: #f8fafc; color: #64748b; text-align: left; padding: 10px 14px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
        .audit-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top; word-wrap: break-word; }
        .col-location { width: 35%; }
        .col-message { width: 45%; }
        .col-rule { width: 20%; }
        .code-location { font-family: monospace; font-size: 13px; color: #2563eb; font-weight: 500; }
        .rule-tag { display: inline-block; background: #f1f5f9; color: #475569; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; }
        .rule-tag.cyclo-tag { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Dynamic Code Complexity Audit Report</h1>
            <p>Execution Time: $(date '+%Y-%m-%d %H:%M:%S')</p>
        </div>
EOF

# =========================================================
# 1. QUÉT ĐỘNG JAVASCRIPT / TYPESCRIPT (JS/TS)
# =========================================================
JS_PROJECTS=$(find . -name "package.json" -not -path "*/node_modules/*" 2>/dev/null)

if [ -n "$JS_PROJECTS" ]; then
    echo "[+] Scanning JavaScript / TypeScript projects..."
    echo "[]" > "$OUTPUT_DIR/eslint-tmp.json"
    ESLINT_STATUS=0

    for pkg in $JS_PROJECTS; do
        proj_dir=$(dirname "$pkg" | sed 's|^\./||')
        echo "    -> Processing Node project: $proj_dir"
        
        set +e
        (cd "$proj_dir" && npx eslint . --format json 2>/dev/null) > "$OUTPUT_DIR/eslint-single.json"
        SINGLE_STATUS=$?
        set -e

        [ $SINGLE_STATUS -ne 0 ] && ESLINT_STATUS=1

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

    echo '<div class="section"><div class="section-header"><h2 class="section-title">🟨 JavaScript / TypeScript Audit</h2>' >> "$REPORT_FILE"

    if [ $ESLINT_STATUS -eq 0 ]; then
        echo '<span class="badge badge-pass">✅ PASSED</span></div><p style="color: #64748b; margin: 0;">No complexity violations detected.</p>' >> "$REPORT_FILE"
    else
        echo '<span class="badge badge-fail">⚠️ VIOLATIONS DETECTED</span></div>' >> "$REPORT_FILE"
        echo '<table class="audit-table"><thead><tr><th class="col-location">Location</th><th class="col-message">Message</th><th class="col-rule">Rule ID</th></tr></thead><tbody>' >> "$REPORT_FILE"
        
        node -e '
            const fs = require("fs");
            try {
                const data = JSON.parse(fs.readFileSync("'"$OUTPUT_DIR/eslint-tmp.json"'"));
                data.forEach(file => {
                    if (file.messages && file.messages.length > 0) {
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

        echo '</tbody></table>' >> "$REPORT_FILE"
    fi

    rm -f "$OUTPUT_DIR/eslint-tmp.json"
    echo '</div>' >> "$REPORT_FILE"
fi

# =========================================================
# 2. QUÉT ĐỘNG GO / GOLANG
# =========================================================
GO_FILES=$(find . -name "*.go" -not -path "*/node_modules/*" -not -path "*/vendor/*" 2>/dev/null)

if [ -n "$GO_FILES" ]; then
    echo "[+] Scanning Go projects..."
    export GOPATH="${GOPATH:-$HOME/go}"
    export PATH="$HOME/bin:$GOPATH/bin:/usr/local/go/bin:$PATH"

    set +e
    command -v gocyclo &> /dev/null || go install github.com/fzipp/gocyclo/cmd/gocyclo@latest > /dev/null 2>&1 || true
    command -v gocognit &> /dev/null || go install github.com/uudashr/gocognit/cmd/gocognit@latest > /dev/null 2>&1 || true

    TMP_GO_REPORT="$OUTPUT_DIR/go-violations.tmp"
    rm -f "$TMP_GO_REPORT"

    if command -v gocyclo &> /dev/null; then
        gocyclo -over 10 $GO_FILES 2>/dev/null | awk '{
            printf "%s\tFunction %s exceeds Cyclomatic complexity limit.\tCyclomatic: %s\n", $4, $3, $1
        }' >> "$TMP_GO_REPORT" || true
    fi
    
    if command -v gocognit &> /dev/null; then
        gocognit -over 10 $GO_FILES 2>/dev/null | awk '{
            printf "%s\tFunction %s exceeds Cognitive complexity limit.\tCognitive: %s\n", $4, $3, $1
        }' >> "$TMP_GO_REPORT" || true
    fi
    set -e

    echo '<div class="section"><div class="section-header"><h2 class="section-title">🟦 Go / Golang Audit</h2>' >> "$REPORT_FILE"

    if [ ! -s "$TMP_GO_REPORT" ]; then
        echo '<span class="badge badge-pass">✅ PASSED</span></div><p style="color: #64748b; margin: 0;">Complexity is within acceptable limit (&le; 10).</p>' >> "$REPORT_FILE"
    else
        echo '<span class="badge badge-fail">⚠️ VIOLATIONS DETECTED</span></div>' >> "$REPORT_FILE"
        echo '<table class="audit-table"><thead><tr><th class="col-location">Location</th><th class="col-message">Message / Function</th><th class="col-rule">Metric & Score</th></tr></thead><tbody>' >> "$REPORT_FILE"
        
        sort -u "$TMP_GO_REPORT" | while IFS=$'\t' read -r loc msg metric; do
            if [ -n "$loc" ]; then
                echo "<tr><td class='code-location'>$loc</td><td>$msg</td><td><span class='rule-tag cyclo-tag'>$metric</span></td></tr>" >> "$REPORT_FILE"
            fi
        done

        echo '</tbody></table>' >> "$REPORT_FILE"
    fi

    rm -f "$TMP_GO_REPORT"
    echo '</div>' >> "$REPORT_FILE"
fi

# =========================================================
# 3. QUÉT ĐỘNG RUBY
# =========================================================
RUBY_FILES=$(find . -name "*.rb" -not -path "*/node_modules/*" -not -path "*/vendor/*" 2>/dev/null)

if [ -n "$RUBY_FILES" ] && command -v rubocop &> /dev/null; then
    echo "[+] Scanning Ruby projects..."
    
    set +e
    rubocop --format json -o "$OUTPUT_DIR/rubocop-tmp.json" 2>&1
    RUBY_STATUS=$?
    set -e

    echo '<div class="section"><div class="section-header"><h2 class="section-title">🟥 Ruby Audit (RuboCop)</h2>' >> "$REPORT_FILE"

    if [ $RUBY_STATUS -eq 0 ]; then
        echo '<span class="badge badge-pass">✅ PASSED</span></div><p style="color: #64748b; margin: 0;">No RuboCop violations detected.</p>' >> "$REPORT_FILE"
    else
        echo '<span class="badge badge-fail">⚠️ VIOLATIONS DETECTED</span></div>' >> "$REPORT_FILE"
        echo '<table class="audit-table"><thead><tr><th class="col-location">Location</th><th class="col-message">Message</th><th class="col-rule">Cop Name</th></tr></thead><tbody>' >> "$REPORT_FILE"

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

        echo '</tbody></table>' >> "$REPORT_FILE"
    fi

    rm -f "$OUTPUT_DIR/rubocop-tmp.json"
    echo '</div>' >> "$REPORT_FILE"
fi

cat <<EOF >> "$REPORT_FILE"
    </div>
</body>
</html>
EOF

echo "[+] Report successfully generated at: $REPORT_FILE"
exit 0