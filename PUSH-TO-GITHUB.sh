#!/bin/bash
# Script to push Music Taboo Game to GitHub

echo "🚀 Pushing Music Taboo Game to GitHub"
echo ""

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin)
    echo "✅ GitHub remote configured: $REMOTE_URL"
    echo ""
    echo "Pushing to GitHub..."
    git push -u origin main
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🌐 Your code is now backed up on GitHub"
    else
        echo ""
        echo "❌ Push failed. Make sure you have:"
        echo "   - Created the repository on GitHub"
        echo "   - Set up authentication (SSH key or personal access token)"
    fi
else
    echo "❌ No GitHub remote configured yet."
    echo ""
    echo "To set it up, run:"
    echo ""
    echo "  git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo ""
    echo "Or provide the repository URL and I can help you set it up."
fi

