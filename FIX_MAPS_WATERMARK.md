# Fix "For Development Purposes Only" Google Maps Watermark

## Problem
Google Maps is displaying with a "For development purposes only" watermark overlay on the map.

## Root Cause
This watermark appears when:
1. ❌ **Billing is NOT enabled** on your Google Cloud project (most common)
2. ❌ Maps JavaScript API is not enabled
3. ❌ API key restrictions are blocking your domain

## Solution

### Step 1: Enable Billing on Google Cloud ⭐ MOST IMPORTANT

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/billing

2. **Link a Billing Account**:
   - If you don't have a billing account, click **"Create Account"**
   - If you have one, click **"Link a Billing Account"**
   - Follow the prompts to add a credit card

3. **Associate Billing with Your Project**:
   - Go to: https://console.cloud.google.com/
   - Select your project (the one with the API key ending in `...nzkyNc`)
   - Click the menu (☰) → **Billing**
   - Click **"Link a billing account"** if not already linked

**Note**: Google offers $200 free credit per month for Maps API. Your usage will likely stay within the free tier.

### Step 2: Verify Maps JavaScript API is Enabled

1. **Go to API Library**:
   - Visit: https://console.cloud.google.com/apis/library

2. **Search for "Maps JavaScript API"**:
   - Click on **"Maps JavaScript API"**
   - If it says "ENABLE", click it
   - If it says "MANAGE", you're good ✅

### Step 3: Check API Key Restrictions

1. **Go to Credentials**:
   - Visit: https://console.cloud.google.com/apis/credentials

2. **Find Your API Key**:
   - Look for the key ending in `...nzkyNc`
   - Click on it to edit

3. **Update Restrictions**:
   - **Application restrictions**: Select "HTTP referrers (websites)"
   - **Website restrictions**, add:
     ```
     ilocksmithindiana.com/*
     *.ilocksmithindiana.com/*
     *.vercel.app/*
     localhost:8000/*
     ```
   - **API restrictions**: Select "Restrict key"
   - Check **only**:
     - ✅ Maps JavaScript API
     - ✅ Places API (if you use it)
     - ✅ Geocoding API (if you use it)

4. **Save** the restrictions

### Step 4: Wait and Test

After enabling billing and configuring the API key:

1. **Wait 5 minutes** for changes to propagate
2. **Clear your browser cache** (or open incognito)
3. **Visit your site**: https://ilocksmithindiana.com/
4. **Check the map** - watermark should be gone!

## Pricing Information

**Google Maps Platform Pricing**:
- First **$200/month of usage is FREE**
- After free credit, pricing starts at:
  - Dynamic Maps: $7 per 1,000 loads
  - Static Maps: $2 per 1,000 loads

**Estimated Cost for Your Site**:
- With typical traffic (1,000-5,000 visitors/month)
- Viewing 1-3 pages with maps per visit
- **Monthly cost**: $0 (well within free tier)

**To Monitor Usage**:
- Go to: https://console.cloud.google.com/google/maps-apis/metrics
- View your daily API calls
- Set up budget alerts if desired

## Verification

To verify everything is working:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Visit**: https://ilocksmithindiana.com/
4. **Look for errors**:
   - ✅ No errors = Working correctly
   - ❌ "This API project is not authorized..." = Check restrictions
   - ❌ "ApiNotActivatedMapError" = Enable Maps JavaScript API
   - ❌ "Development purposes only" = Enable billing

## Current API Key

Your current API key (last 4 chars): `...kyNc`

This key is currently:
- ✅ Stored in Vercel environment variables
- ✅ Being injected into HTML files at build time
- ✅ Loaded on 16 pages across the site
- ⚠️ Needs billing enabled to remove watermark

## Quick Checklist

- [ ] Enable billing on Google Cloud project
- [ ] Verify Maps JavaScript API is enabled
- [ ] Configure API key restrictions (HTTP referrers)
- [ ] Add your domains to allowed referrers
- [ ] Wait 5 minutes
- [ ] Clear browser cache
- [ ] Test the site
- [ ] Verify watermark is gone

---

**Need Help?**
- Google Maps Platform Support: https://developers.google.com/maps/support
- Billing Documentation: https://cloud.google.com/billing/docs
- API Key Best Practices: https://developers.google.com/maps/api-security-best-practices
