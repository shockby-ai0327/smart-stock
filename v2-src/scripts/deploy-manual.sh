#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────
# 手動部署腳本
#
# 用法：
#   cd /path/to/smart-stock-v2
#   bash scripts/deploy-manual.sh
#
# 前提：
#   1. Node.js 18+ 已安裝
#   2. 已 npm install
#   3. 已設定 git remote
# ─────────────────────────────────────────────

echo "🔨 Step 1: Build Next.js static export..."
npm run build

echo "📄 Step 2: Post-export (404.html + .nojekyll)..."
node scripts/post-export.js

echo "📁 Step 3: Verify build output..."
if [ ! -f "out/index.html" ]; then
  echo "❌ Build failed — out/index.html not found"
  exit 1
fi
echo "   ✅ out/ contains $(find out -name '*.html' | wc -l) HTML files"

echo ""
echo "✅ Build complete! Files are in out/"
echo ""
echo "════════════════════════════════════════"
echo "  Next steps (choose one):"
echo "════════════════════════════════════════"
echo ""
echo "  Option A — GitHub Actions (recommended):"
echo "    1. Copy v2-src/ folder into your smart-stock repo"
echo "    2. Copy .github/workflows/deploy.yml"
echo "    3. git push → auto deploys"
echo ""
echo "  Option B — Manual push:"
echo "    1. cd /path/to/smart-stock repo"
echo "    2. rm -rf v2/"
echo "    3. cp -r /path/to/smart-stock-v2/out v2/"
echo "    4. touch .nojekyll"
echo "    5. git add v2/ .nojekyll"
echo "    6. git commit -m 'Deploy v2'"
echo "    7. git push"
echo ""
echo "  Then set GitHub Pages source to main branch (root)"
echo ""
