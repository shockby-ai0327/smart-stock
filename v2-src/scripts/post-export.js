/**
 * Post-export script for GitHub Pages deployment
 *
 * 1. Copies index.html → 404.html (SPA fallback for client-side routing)
 * 2. Creates .nojekyll (prevents GitHub from ignoring _next/ folder)
 *
 * Why 404.html works:
 * GitHub Pages serves 404.html for any URL that doesn't match a static file.
 * Next.js's client-side router then picks up the URL and renders the correct page.
 */

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');

// 1. Copy index.html → 404.html
const indexPath = path.join(outDir, 'index.html');
const notFoundPath = path.join(outDir, '404.html');

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('✅ 404.html created (copy of index.html)');
} else {
  console.error('❌ index.html not found in out/ — build may have failed');
  process.exit(1);
}

// 2. Create .nojekyll
const nojekyllPath = path.join(outDir, '.nojekyll');
fs.writeFileSync(nojekyllPath, '');
console.log('✅ .nojekyll created');

console.log('🚀 Post-export complete. Ready to deploy.');
