# ATHENA Deployment Guide

This guide will help you deploy the ATHENA application to Vercel (frontend) and Render (backend) with MongoDB Atlas.

## Prerequisites

- Vercel account (free tier)
- Render account (free tier)
- MongoDB Atlas account (free M0 tier)
- Git repository with your code

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Create a database user with a strong password
4. Allow network access from anywhere (0.0.0.0/0) for Render
5. Get your connection string: `mongodb+srv://<username>:<password>@<cluster>/athena?retryWrites=true&w=majority`

## Step 2: Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: athena-backend
   - **Branch**: main
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Runtime**: Node
6. Add Environment Variables:
   - `PORT`: 5000
   - `NODE_ENV`: production
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a strong random string (use: `openssl rand -base64 32`)
   - `JWT_EXPIRE`: 7d
   - `FRONTEND_URL`: Will add after deploying frontend
7. Click "Deploy Web Service"
8. Wait for deployment and note your backend URL (e.g., `https://athena-backend.onrender.com`)

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL with `/api` (e.g., `https://athena-backend.onrender.com/api`)
6. Click "Deploy"
7. Wait for deployment and note your frontend URL (e.g., `https://athena.vercel.app`)

## Step 4: Update Backend CORS

1. Go back to your Render dashboard
2. Navigate to athena-backend → Environment
3. Update `FRONTEND_URL` to your Vercel frontend URL
4. Deploy again (or let it auto-deploy)

## Step 5: Seed Admin Account in Production

Since the seed script doesn't run in production, you need to create the admin account manually:

1. Use the registration form to create an admin account (will be created as Coach by default)
2. Or add a one-time seed script and run it locally with production credentials
3. Or use MongoDB Compass/Atlas to directly create the admin user

**Recommended approach:** Create a temporary seed script:

```javascript
// backend/seed-prod.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'ADMIN',
      isActive: true
    });
    console.log('Admin created:', admin.email);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
```

Run it once with your production `.env`:
```bash
cd backend
node seed-prod.js
```

Then delete the file.

## Step 6: Test the Deployment

### 1. Health Check
- Visit: `https://your-backend.onrender.com/api/health`
- Should return: `{"status":"ok","message":"ATHENA API is running"}`

### 2. Frontend Test
- Visit: `https://your-frontend.vercel.app`
- Should load the login page

### 3. Login Test
- Type (don't paste) admin credentials
- Test with capital letters and trailing space
- Verify login works

### 4. Registration Test
- Register a new athlete
- Register a new coach
- Check they appear in Admin > Users

### 5. Assignment Test
- Assign athlete to coach
- Check My Athletes shows the assignment

### 6. Refresh Test
- Navigate to `/admin/users`
- Refresh the page
- Should not show 404

## Environment Variables Summary

### Backend (Render)
- `PORT`: 5000
- `NODE_ENV`: production
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Strong random string
- `JWT_EXPIRE`: 7d
- `FRONTEND_URL`: Vercel frontend URL

### Frontend (Vercel)
- `VITE_API_URL`: Render backend URL with `/api`

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your Vercel URL exactly
- Check browser console for specific CORS errors

### Database Connection
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check MONGODB_URI format is correct
- Ensure database user has correct permissions

### 404 on Sub-page Refresh
- Ensure `vercel.json` exists in frontend root
- It should have the rewrites configuration

### Build Failures
- Check `package.json` scripts are correct
- Ensure all dependencies are installed
- Verify Node version compatibility

## Security Notes

- **Never commit `.env` files** to Git
- Use strong, random secrets for JWT_SECRET
- Change default admin password immediately
- Enable MongoDB Atlas IP whitelisting for production
- Use HTTPS only (automatically enabled on Vercel/Render)
- Review and update CORS settings regularly
