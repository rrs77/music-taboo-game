# Setting Up GitHub Repository

## Initial Setup

1. **Create a new repository on GitHub**
   - Go to [github.com](https://github.com) and create a new repository
   - Name it something like `music-taboo-game`
   - Don't initialize with README (we already have one)

2. **Connect your local repository to GitHub**

```bash
# Add all files
git add .

# Make your first commit
git commit -m "Initial commit: Music Taboo Game"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Ongoing Updates

After making changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## GitHub Pages Deployment

To deploy to GitHub Pages:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **main branch** and **/ (root)**
4. Click **Save**
5. Your site will be available at: `https://YOUR_USERNAME.github.io/REPO_NAME/`

**Note:** Make sure `Taboo.html` is in the root directory for GitHub Pages to work.

## Automatic Backups

You can set up GitHub Actions to automatically backup your data. Create `.github/workflows/backup.yml`:

```yaml
name: Backup
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Backup data
        run: |
          # Add backup script here if needed
          echo "Backup completed"
```

## Collaboration

To collaborate with others:

1. They can clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
   ```

2. They make changes and push:
   ```bash
   git add .
   git commit -m "Their changes"
   git push
   ```

3. You pull their changes:
   ```bash
   git pull
   ```

