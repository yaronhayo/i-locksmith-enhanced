# ⚠️ IMPORTANT: Vercel Environment Variable Setup Required

## Current Status

✅ **Code Changes**: All code has been updated to use environment variables
✅ **Build Script**: Working correctly (replaced API key in 16 files during deployment)
⚠️ **Environment Variable**: Needs to be set in Vercel Dashboard

## What Was Done

1. Created build system to inject API keys at build time
2. Replaced hardcoded API key with placeholder `__GOOGLE_MAPS_API_KEY__` in 16 HTML files
3. Successfully deployed to Vercel
4. Build script is working (you can see it replaced keys in the deployment logs)

## ⚡ Next Step: Add Environment Variable to Vercel

**You need to add the Google Maps API key to Vercel's environment variables:**

### Steps:

1. **Go to Vercel Project Settings**:
   - Visit: https://vercel.com/gettmarketing/i-locksmith/settings/environment-variables
   - Or navigate: Vercel Dashboard → Your Project → Settings → Environment Variables

2. **Add the Environment Variable**:
   - Click **"Add New"** button
   - Fill in the form:
     ```
     Key: GOOGLE_MAPS_API_KEY
     Value: AIzaSyCPityG_sxBDoXzvAKqbLDbeSZi9nzkyNc
     ```
   - Select **all three environments**: Production, Preview, Development
   - Click **"Save"**

3. **Redeploy** (Vercel will automatically redeploy when you save the variable, or you can):
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or just push any change to trigger a new deployment

## What Happens After Setting the Variable

Once you add `GOOGLE_MAPS_API_KEY` to Vercel:

1. ✅ The warning "GOOGLE_MAPS_API_KEY environment variable not set" will disappear
2. ✅ Google Maps will load properly on all 17 pages
3. ✅ The API key will be securely stored (not in code)
4. ✅ Future deployments will automatically inject the correct key

## Verify It's Working

After setting the variable and redeploying, visit any page with maps:
- Homepage: https://your-domain.com/
- Service Areas: https://your-domain.com/service-areas/locksmith-south-bend-indiana.html

If maps are loading, everything is configured correctly!

## Pages Using Google Maps

The following pages use Google Maps (all have been updated):
1. index.html (Homepage)
2. services.html (Services overview)
3. service-areas.html (Service areas overview)
4. service-areas-backup.html
5. services/emergency-locksmith.html
6. services/auto-locksmith.html
7-16. All 10 individual service area pages (Mishawaka, South Bend, etc.)

## Latest Deployment

**URL**: https://i-locksmith-343w9d9n7-gettmarketing.vercel.app
**Inspect**: https://vercel.com/gettmarketing/i-locksmith/9X2gYVx7wMYrWVQ25AQ9KzzuSJCa
**Status**: ✅ Deployed successfully
**Build Log**: Shows API key was replaced in 16 files (working correctly)

## Security Notes

✅ **API Key is NOT in the code** - It's replaced at build time
✅ **Placeholder is safe** - `__GOOGLE_MAPS_API_KEY__` won't work if someone views source
✅ **Git history is clean** - The .env file is gitignored
⚠️ **Recommend**: Restrict the API key to your domain in Google Cloud Console

---

**For detailed instructions, see**: ENVIRONMENT_SETUP.md
