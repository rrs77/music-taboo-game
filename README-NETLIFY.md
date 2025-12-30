# Deploying Music Taboo to Netlify

## Quick Deploy

1. **Option 1: Drag and Drop**
   - Go to [Netlify](https://app.netlify.com)
   - Drag the entire `Music Taboo` folder onto the Netlify dashboard
   - Your site will be live in seconds!

2. **Option 2: Git Integration**
   - Push your code to GitHub/GitLab/Bitbucket
   - Connect your repository to Netlify
   - Netlify will automatically deploy

3. **Option 3: Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy
   netlify deploy --prod
   ```

## Important Notes

- **Data Persistence**: The app uses `localStorage` for browser storage, which means data is stored per browser/device
- **Server-Side Storage**: For shared data across devices, you'll need to set up the PHP backend (`save-data.php`) on your Netlify site
  - Netlify doesn't support PHP by default, so you'll need to use Netlify Functions or a separate backend service
  - Alternatively, use the Node.js backend with Netlify Functions

## File Structure

The following files are needed:
- `Taboo.html` (main entry point)
- `styles.css`
- `game-data.js`
- `game-logic.js`
- `app.js`
- `netlify.toml` (configuration)
- `_redirects` (for SPA routing)

## Custom Domain

After deployment, you can add a custom domain in Netlify's site settings.

## Environment Variables (Optional)

If using API keys for AI features, add them in Netlify:
- Site Settings → Environment Variables
- Add `GEMINI_API_KEY` and/or `OPENAI_API_KEY` if needed

