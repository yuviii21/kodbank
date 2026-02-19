# Vercel Deployment Guide

This guide will help you deploy the Kodbank application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional, but recommended)
3. Your Aiven database credentials

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository `yuviii21/kodbank`
   - Vercel will auto-detect the project settings

3. **Configure Environment Variables**
   In the Vercel project settings, add these environment variables:
   
   ```
   DB_HOST=mysql-3cff29ea-login-app.b.aivencloud.com
   DB_PORT=28014
   DB_USER=avnadmin
   DB_PASSWORD=your-aiven-database-password
   DB_NAME=defaultdb
   DB_SSL=true
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=1h
   
   COOKIE_NAME=KODBANK_TOKEN
   
   FRONTEND_ORIGIN=https://your-app-name.vercel.app
   ```

4. **Configure Build Settings**
   - **Root Directory**: Leave empty (or set to project root)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install` (runs in root, then installs backend and frontend deps)

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-app-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DB_HOST
   vercel env add DB_PORT
   vercel env add DB_USER
   vercel env add DB_PASSWORD
   vercel env add DB_NAME
   vercel env add DB_SSL
   vercel env add JWT_SECRET
   vercel env add JWT_EXPIRES_IN
   vercel env add COOKIE_NAME
   vercel env add FRONTEND_ORIGIN
   ```

5. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

1. **Run Database Migration**
   After deployment, you need to run the migration to create tables. You can do this by:
   - Using a local script: `npm run migrate` (with your local .env pointing to the database)
   - Or create a one-time API endpoint to run migrations (not recommended for production)

2. **Update CORS Settings**
   After deployment, update the `FRONTEND_ORIGIN` environment variable in Vercel to match your actual Vercel deployment URL.

3. **Test the Application**
   - Visit your Vercel URL
   - Test registration, login, and balance checking

## Important Notes

- **Database Connection**: Ensure your Aiven database allows connections from Vercel's IP addresses. You may need to whitelist Vercel IPs or allow all IPs in Aiven settings.

- **Environment Variables**: Never commit `.env` files with real credentials. Use Vercel's environment variables feature.

- **Cookie Security**: In production, ensure cookies are set with `secure: true` (already configured in the code).

- **API Routes**: The `/api/*` routes are handled by Vercel serverless functions, which will automatically scale.

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Ensure Node.js version is compatible (Vercel uses Node 18.x by default)

### Database Connection Errors
- Verify environment variables are set correctly in Vercel dashboard
- Check Aiven database firewall settings
- Ensure SSL is enabled (DB_SSL=true)

### CORS Errors
- Update `FRONTEND_ORIGIN` environment variable to your Vercel URL
- Check that credentials are included in fetch requests

### API Routes Not Working
- Verify `vercel.json` configuration
- Check that `api/index.js` exists and exports the Express app correctly

## Project Structure for Vercel

```
kodbank/
├── api/
│   └── index.js          # Vercel serverless function entry point
├── backend/
│   └── src/              # Express backend code
├── frontend/
│   └── src/              # React frontend code
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json
```

## Support

If you encounter issues, check:
- Vercel deployment logs in the dashboard
- Backend logs for API errors
- Browser console for frontend errors
