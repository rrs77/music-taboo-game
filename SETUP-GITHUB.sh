#!/bin/bash
# Quick setup script for GitHub

echo "🚀 Setting up GitHub repository for Music Taboo Game"
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ GitHub remote already configured:"
    git remote get-url origin
    echo ""
    echo "To push your code, run:"
    echo "  git push -u origin main"
else
    echo "📝 To connect to GitHub:"
    echo ""
    echo "1. Create a new repository on GitHub.com"
    echo "2. Then run these commands (replace YOUR_USERNAME and REPO_NAME):"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
fi

echo ""
echo "📦 Current status:"
git status --short | head -10

echo ""
echo "✅ Ready to push to GitHub!"

