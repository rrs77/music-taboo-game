# GitHub Push Instructions

## Step 1: Create the Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `music-taboo-game`
3. Description: "Educational music learning game with taboo-style cards"
4. Make it **Public** or **Private** (your choice)
5. **DO NOT** check "Initialize with README"
6. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, you have two options:

### Option A: Using HTTPS (requires authentication)

```bash
cd "/Users/rfreich-storer/Music Taboo"
git push -u origin main
```

You'll be prompted for:
- **Username**: rrs77
- **Password**: Use a Personal Access Token (not your GitHub password)

To create a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "Music Taboo Push"
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. Copy the token and use it as your password when pushing

### Option B: Using SSH (recommended for frequent pushes)

1. Check if you have an SSH key:
   ```bash
   ls -al ~/.ssh
   ```

2. If you don't have one, generate it:
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

3. Add the SSH key to GitHub:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output, then:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

4. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:rrs77/music-taboo-game.git
   git push -u origin main
   ```

## Quick Push (After Repository is Created)

Once the repository exists on GitHub, just run:

```bash
cd "/Users/rfreich-storer/Music Taboo"
git push -u origin main
```

If you get authentication errors, use Option A or B above.

