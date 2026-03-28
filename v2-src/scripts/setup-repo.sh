#!/bin/bash
set -euo pipefail

# ─────────────────────────────────────────────
# 一鍵設定 repo 結構
#
# 將 v2 原始碼複製進現有 smart-stock repo，
# 並設定好 GitHub Actions 自動部署。
#
# 執行方式：
#   bash /tmp/smart-stock-v2/scripts/setup-repo.sh
#
# 執行後的 repo 結構：
#   smart-stock/
#   ├── index.html           ← v1 (不動)
#   ├── v2-src/              ← v2 Next.js 原始碼
#   │   ├── app/
#   │   ├── components/
#   │   ├── lib/
#   │   ├── ...
#   │   ├── package.json
#   │   └── next.config.js
#   └── .github/
#       └── workflows/
#           └── deploy.yml   ← 自動 build + deploy
# ─────────────────────────────────────────────

REPO_DIR="/tmp/smart-stock-push"
V2_DIR="/tmp/smart-stock-v2"

echo "📁 Setting up repo structure..."

# Clean any previous v2 setup
rm -rf "$REPO_DIR/v2-src"
rm -rf "$REPO_DIR/.github"

# Copy v2 source (excluding node_modules, out, .next)
mkdir -p "$REPO_DIR/v2-src"
cd "$V2_DIR"

# Copy all source files
for item in app components config hooks lib store types scripts \
            package.json next.config.js tsconfig.json tailwind.config.ts \
            postcss.config.js; do
  if [ -e "$item" ]; then
    cp -r "$item" "$REPO_DIR/v2-src/"
  fi
done

# Copy GitHub Actions workflow
mkdir -p "$REPO_DIR/.github/workflows"
cp "$V2_DIR/.github/workflows/deploy.yml" "$REPO_DIR/.github/workflows/"

# Create .nojekyll at repo root
touch "$REPO_DIR/.nojekyll"

# Create v2-src/.gitignore
cat > "$REPO_DIR/v2-src/.gitignore" << 'GITIGNORE'
node_modules/
.next/
out/
*.tsbuildinfo
GITIGNORE

echo ""
echo "✅ Repo structure ready!"
echo ""
echo "  $REPO_DIR/"
echo "  ├── index.html        (v1 — untouched)"
echo "  ├── .nojekyll"
echo "  ├── .github/workflows/deploy.yml"
echo "  └── v2-src/           (v2 Next.js source)"
echo ""
echo "Next steps:"
echo "  cd $REPO_DIR"
echo "  git add -A"
echo "  git commit -m 'Add v2 source + GitHub Actions deploy'"
echo "  git push"
echo ""
echo "Then in GitHub → Settings → Pages:"
echo "  Source: Deploy from a branch"
echo "  Branch: gh-pages / root"
echo ""
