# Building Music Taboo as a Standalone Program

This guide will help you build the Music Taboo game as a standalone executable program.

## Prerequisites

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

## Installation Steps

1. **Open Terminal** in the Music Taboo folder

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Test the app (optional):**
   ```bash
   npm start
   ```
   This will open the app in Electron for testing.

## Building the Executable

### For macOS:
```bash
npm run build-mac
```
This creates a `.dmg` file in the `dist` folder.

### For Windows:
```bash
npm run build-win
```
This creates a `.exe` installer in the `dist` folder.

### For Linux:
```bash
npm run build-linux
```
This creates an `AppImage` file in the `dist` folder.

### For All Platforms:
```bash
npm run build
```

## Output

After building, you'll find the executable in the `dist` folder:
- **macOS**: `Music Taboo-1.0.0.dmg`
- **Windows**: `Music Taboo Setup 1.0.0.exe`
- **Linux**: `Music Taboo-1.0.0.AppImage`

## Features in the Standalone App

✅ All editing features work
✅ Add and edit game sets
✅ Create custom games
✅ Automatic backups to app folder
✅ All game functionality
✅ Score tracking
✅ User management

## Distribution

You can distribute the executable file to others. They don't need to install Node.js or any dependencies - just run the executable!

## Troubleshooting

If you get errors:
1. Make sure Node.js is installed: `node --version`
2. Delete `node_modules` folder and `package-lock.json` if they exist
3. Run `npm install` again
4. Try building again

