#!/bin/bash
# 拼音魔法公主 - 一键构建部署脚本
# 用法: bash scripts/build.sh

set -e
cd "$(dirname "$0")/.."

echo "=== 1. 清理旧构建 ==="
rm -rf dist docs

echo "=== 2. Expo Web 构建 ==="
npx expo export --platform web

echo "=== 3. 复制音频文件到构建产物 ==="
mkdir -p dist/assets/audio
cp assets/audio/*.mp3 dist/assets/audio/
echo "已复制 $(ls dist/assets/audio/*.mp3 | wc -l) 个音频文件"

echo "=== 4. 准备 GitHub Pages ==="
mv dist docs
touch docs/.nojekyll

echo "=== 5. Git 提交 ==="
git add -A
git commit -m "deploy: rebuild web bundle with audio assets" || echo "(no changes)"

echo ""
echo "=== 构建完成 ==="
echo "下一步: git push origin main"
echo "线上预览: https://xinglingliu299.github.io/pinyin-gem/"
