# Deployment Guide - Xentro App

## 🚀 Deploying to Vercel via GitHub

This guide will help you deploy the Xentro app to Vercel so your client can test the prototype.

---

## Prerequisites

1. **GitHub Account** (free)
2. **Vercel Account** (free) - Sign up at https://vercel.com
3. **Git installed** on your computer

---

## Step 1: Prepare Your Project

### 1.1 Check Current Status

```bash
cd /Users/macbook/Desktop/Exchange
git status
```

If you see "not a git repository", we'll initialize it.

### 1.2 Ensure All Files Are Ready

✅ All code is saved
✅ No localhost URLs hardcoded (we'll check this)
✅ `.gitignore` is properly configured

---

## Step 2: Initialize Git Repository (if needed)

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Xentro MVP prototype"
```

---

## Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `xentro-app` (or your preferred name)
3. Description: "Malaysian Stock Trading App Prototype - MVP Demo"
4. Choose: **Private** (recommended for client demos) or **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

---

## Step 4: Push to GitHub

GitHub will show you commands. Run these in your terminal:

```bash
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/xentro-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: If you get authentication errors, you may need to:
- Use a Personal Access Token instead of password
- Or use SSH keys
- Or use GitHub Desktop app

---

## Step 5: Deploy to Vercel

### 5.1 Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (easiest option)
4. Authorize Vercel to access your GitHub

### 5.2 Import Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `xentro-app` repository
3. Click **"Import"**

### 5.3 Configure Project

Vercel will auto-detect Next.js settings. Verify:

- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅

### 5.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. Vercel will provide a URL like: `https://xentro-app.vercel.app`

---

## Step 6: Verify Deployment

1. Visit your Vercel URL
2. Test the app:
   - ✅ Register/Login works
   - ✅ Market page loads
   - ✅ Trading works
   - ✅ Portfolio shows data
   - ✅ All pages accessible

---

## Step 7: Share with Client

1. **Get the Vercel URL** (e.g., `https://xentro-app.vercel.app`)
2. **Share credentials**:
   - Email: `demo@xentro.demo`
   - Password: `demo123`
   - Or they can register a new account

3. **Provide demo instructions**:
   - "This is a prototype/demo - no real trades are executed"
   - "All data is mock/simulated"
   - "Feel free to explore all features"

---

## 🔄 Updating the Deployment

Whenever you make changes:

```bash
# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push

# Vercel will automatically redeploy! ✨
```

Vercel automatically detects GitHub pushes and redeploys your app.

---

## 🛠️ Troubleshooting

### Build Fails on Vercel

1. **Check build logs** in Vercel dashboard
2. **Common issues**:
   - TypeScript errors → Fix in local, push again
   - Missing dependencies → Check `package.json`
   - Environment variables → Add in Vercel settings (if needed)

### App Works Locally but Not on Vercel

1. **Check browser console** for errors
2. **Verify API routes** work (they should - Next.js API routes work on Vercel)
3. **Check TradingView widgets** - they should work (they're client-side)

### TradingView Charts Not Loading

- TradingView widgets are client-side and should work
- If issues, check browser console
- Make sure `support_host` is set correctly in `TradingViewWidget.tsx`

---

## 📝 Environment Variables (if needed)

Currently, the app doesn't require environment variables. If you add them later:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables (e.g., `NEXT_PUBLIC_API_URL`)
3. Redeploy

---

## ✅ What Works on Vercel

- ✅ All Next.js features (App Router, API Routes)
- ✅ TradingView widgets (client-side)
- ✅ Zustand state management
- ✅ All pages and routes
- ✅ Mock database (in-memory, resets on redeploy - fine for demo)
- ✅ Authentication (session-based)
- ✅ All trading functionality

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** on Vercel URL
2. **Share with client** for feedback
3. **Collect feedback** and iterate
4. **Update code** → Push to GitHub → Auto-deploys to Vercel

---

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console
3. Verify all files are committed to GitHub
4. Ensure `package.json` has all dependencies

---

**Your app will be live and accessible to your client! 🎉**

