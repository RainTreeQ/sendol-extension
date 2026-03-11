#!/bin/bash
# Quick workflow validation script

echo "🔍 Checking GitHub Actions Workflows..."
echo ""

# Check if workflows exist
echo "📁 Workflow Files:"
ls -1 .github/workflows/*.yml | while read file; do
  echo "  ✓ $(basename $file)"
done
echo ""

# Validate YAML syntax
echo "🔧 YAML Syntax Validation:"
for file in .github/workflows/*.yml; do
  if command -v yamllint &> /dev/null; then
    yamllint -d relaxed "$file" && echo "  ✓ $(basename $file) - Valid" || echo "  ✗ $(basename $file) - Invalid"
  else
    # Basic check - just try to parse with Python
    if python3 -c "import yaml; yaml.safe_load(open('$file'))" 2>/dev/null; then
      echo "  ✓ $(basename $file) - Valid"
    else
      echo "  ✗ $(basename $file) - Invalid"
    fi
  fi
done
echo ""

# Check schedule syntax
echo "⏰ Scheduled Runs:"
grep -A 2 "schedule:" .github/workflows/*.yml | grep "cron:" | while read line; do
  echo "  $line"
done
echo ""

# Check required secrets
echo "🔐 Required Secrets (optional for email):"
echo "  - MAIL_USERNAME (for email notifications)"
echo "  - MAIL_PASSWORD (for email notifications)"
echo "  - NOTIFY_EMAIL (for email notifications)"
echo ""

echo "✅ Workflow validation complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Visit: https://github.com/RainTreeQ/sendall-extension/actions"
echo "  2. Check if workflows appear in the Actions tab"
echo "  3. Manually trigger 'E2E Monitor (Daily)' to test"
echo "  4. (Optional) Add email secrets in Settings → Secrets → Actions"
