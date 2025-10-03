# Verify Vercel Environment Variable is Set Correctly

## Before Deploying - Check This:

### 1. Go to Vercel Environment Variables Settings
Visit: https://vercel.com/gettmarketing/i-locksmith/settings/environment-variables

### 2. Verify the Variable Exists
You should see:
- **Variable Name**: `GOOGLE_MAPS_API_KEY`
- **Value**: Your API key (should start with `AIzaSy...`)
- **Environments**: All three checkboxes selected:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### 3. IMPORTANT: Variable Name Must Be EXACT
- ✅ Correct: `GOOGLE_MAPS_API_KEY` (exactly this)
- ❌ Wrong: `GOOGLE_MAPS_API_KEY ` (extra space)
- ❌ Wrong: `google_maps_api_key` (lowercase)
- ❌ Wrong: `GOOGLE_MAP_API_KEY` (singular "MAP")

### 4. Check the Value
The value should be your full Google Maps API key:
- Format: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Length: Usually 39 characters
- No spaces before or after
- No quotes around it

## After Setting the Variable

1. **Trigger a new deployment** (push any change or click "Redeploy" in Vercel)
2. **Watch the build logs** - you should see:
   ```
   🔍 Debug: Environment check
   - GOOGLE_MAPS_API_KEY present: true
   - GOOGLE_MAPS_API_KEY length: 39
   - GOOGLE_MAPS_API_KEY (first 10 chars): AIzaSyCPit...
   ✅ Replaced API key in: index.html
   ```

3. **If the build fails**, the logs will show:
   ```
   ❌ ERROR: GOOGLE_MAPS_API_KEY environment variable not set!
   ```
   This means the variable isn't configured correctly in Vercel.

## Common Issues

### Issue: Variable not found during build
**Solution**:
- Delete the variable in Vercel
- Re-add it exactly as `GOOGLE_MAPS_API_KEY`
- Make sure all three environment checkboxes are selected
- Redeploy

### Issue: Maps still show "For development purposes only"
**Solutions**:
1. **Check the deployed HTML** - View source and look for:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCPit...&libraries=geometry"></script>
   ```
   - ✅ If you see the full API key → Environment variable worked!
   - ❌ If you see `key=&libraries` (empty) → Variable not set correctly
   - ❌ If you see `key=__GOOGLE_MAPS_API_KEY__` → Build script didn't run

2. **Enable billing** on Google Cloud Console (if not already)
3. **Wait 5 minutes** after enabling billing
4. **Clear browser cache** or use incognito mode

## Next Steps

After verifying the variable is set:

1. Commit and push the latest changes (done)
2. Vercel will auto-deploy or click "Redeploy"
3. Check build logs for the debug output
4. Visit the site and view source to verify API key is present
5. Maps should load without watermark

## Need to Check Build Logs?

Latest deployment: https://vercel.com/gettmarketing/i-locksmith/deployments

Click on the latest deployment → Click "Building" → Scroll to see the build output
