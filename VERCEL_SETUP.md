# Quick Vercel Deployment Checklist

## Before Deploying

1. ✅ Code is pushed to GitHub
2. ✅ Database tables are created (run `npm run migrate` locally first)
3. ✅ Environment variables are ready

## Deployment Steps

### 1. Connect to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository: `yuviii21/kodbank`
3. Vercel will auto-detect settings from `vercel.json`

### 2. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```
DB_HOST = mysql-3cff29ea-login-app.b.aivencloud.com
DB_PORT = 28014
DB_USER = avnadmin
DB_PASSWORD = your-aiven-database-password
DB_NAME = defaultdb
DB_SSL = true

JWT_SECRET = [Generate a strong random string]
JWT_EXPIRES_IN = 1h

COOKIE_NAME = KODBANK_TOKEN

FRONTEND_ORIGIN = https://your-app-name.vercel.app
```

**Important**: After first deployment, update `FRONTEND_ORIGIN` with your actual Vercel URL.

### 3. Build Settings (Auto-detected)

- **Framework Preset**: Other
- **Root Directory**: ./
- **Build Command**: `npm run install:all && cd frontend && npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### 4. Deploy

Click "Deploy" and wait for the build to complete.

### 5. Post-Deployment

1. **Update FRONTEND_ORIGIN**: Set it to your actual Vercel URL
2. **Redeploy**: Trigger a new deployment after updating environment variables
3. **Test**: Visit your Vercel URL and test registration/login

## Troubleshooting

- **Build fails**: Check that all dependencies are in package.json files
- **API routes 404**: Verify `api/index.js` exists and `vercel.json` rewrites are correct
- **Database errors**: Check environment variables and Aiven firewall settings. In Aiven, ensure "Allow access from anywhere" or add Vercel's IP ranges - serverless functions use dynamic IPs.
- **CORS errors**: Update FRONTEND_ORIGIN to match your Vercel URL (e.g. `https://your-app.vercel.app`)
- **"A server error occurred" / "Unexpected token"**: Usually means the API crashed before returning. Check: (1) All env vars set in Vercel, (2) Aiven allows connections from Vercel, (3) Database tables exist (run `npm run migrate` locally)

## Project Structure

```
kodbank/
├── api/
│   └── index.js          # Vercel serverless function
├── backend/
│   └── src/              # Express backend
├── frontend/
│   └── src/              # React frontend
├── vercel.json           # Vercel config
└── package.json          # Root package.json
```
