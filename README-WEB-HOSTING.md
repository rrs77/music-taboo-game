# Web Hosting Setup Instructions

## For PHP Hosting (Most Common)

1. Upload all files to your web server
2. Make sure `save-data.php` has write permissions (chmod 644 or 666)
3. The app will automatically save to `taboo-game-data.json` on the server

## For Node.js Hosting

1. Upload all files to your server
2. Install dependencies: `npm install express cors`
3. Run the server: `node save-data-node.js`
4. Or use PM2 for production: `pm2 start save-data-node.js`

## File Permissions

Make sure the web server can write to the directory:
- PHP: `chmod 755` on directory, `chmod 644` on `taboo-game-data.json`
- Node.js: Ensure the process has write permissions

## Data File Location

The data file `taboo-game-data.json` will be created in the same directory as your HTML file.

## Security Note

For production, you may want to:
- Add authentication to the save/load endpoints
- Restrict CORS to your domain only
- Add rate limiting

