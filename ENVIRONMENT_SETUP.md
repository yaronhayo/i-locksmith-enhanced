# Environment Variables Setup Guide

This document explains how to configure environment variables for the I Locksmith website, particularly for the Google Maps API integration.

## Overview

The website uses environment variables to securely store API keys and sensitive configuration. During the build process, these variables are injected into the HTML files.

## Google Maps API Key

The website uses Google Maps on the following pages:
- Homepage (index.html)
- Services overview (services.html)
- Service areas overview (service-areas.html)
- Individual service area pages (10 pages)
- Emergency locksmith page
- Auto locksmith page
- Contact page

### How It Works

1. **Placeholder in HTML**: All HTML files contain the placeholder `__GOOGLE_MAPS_API_KEY__` instead of the actual API key
2. **Build Script**: The `build-replace-env.js` script runs during deployment and replaces the placeholder with the actual API key from environment variables
3. **Environment Variable**: The actual API key is stored securely in Vercel's project settings

## Setup Instructions

### For Vercel Deployment

1. **Add Environment Variable in Vercel Dashboard**:
   - Go to your Vercel project: https://vercel.com/gettmarketing/i-locksmith
   - Navigate to **Settings** → **Environment Variables**
   - Click **Add New**
   - Add the following variable:
     - **Name**: `GOOGLE_MAPS_API_KEY`
     - **Value**: Your Google Maps API key (e.g., `AIzaSyCPityG_sxBDoXzvAKqbLDbeSZi9nzkyNc`)
     - **Environment**: Select all environments (Production, Preview, Development)
   - Click **Save**

2. **Redeploy**:
   - After adding the environment variable, trigger a new deployment
   - The build script will automatically inject the API key into all HTML files

### For Local Development

1. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Add your API key**:
   Edit `.env` and replace the placeholder:
   ```
   GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
   ```

3. **Run build script**:
   ```bash
   npm run build
   ```
   This will replace all placeholders in HTML files with your local API key.

4. **Start local server**:
   ```bash
   python3 -m http.server 8000
   ```

## Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **API Key**
6. (Recommended) Restrict the API key:
   - **Application restrictions**: HTTP referrers (websites)
   - Add your domain(s): `*.ilocksmithindiana.com/*`, `*.vercel.app/*`
   - **API restrictions**: Select Maps JavaScript API

## Security Notes

- ✅ **Never commit** `.env` file to git (it's in `.gitignore`)
- ✅ **Never commit** HTML files with actual API keys
- ✅ Always use the placeholder `__GOOGLE_MAPS_API_KEY__` in HTML files
- ✅ Restrict your API key to your domains only
- ✅ Monitor your API usage in Google Cloud Console

## Build Process

When deploying to Vercel:

1. Vercel detects `package.json` and runs `npm run build` (or `vercel-build` script)
2. The `build-replace-env.js` script executes
3. It searches all HTML files for the placeholder `__GOOGLE_MAPS_API_KEY__`
4. It replaces the placeholder with the value from `process.env.GOOGLE_MAPS_API_KEY`
5. The modified files are deployed

## Troubleshooting

### Maps not loading after deployment

1. Check that the environment variable is set in Vercel dashboard
2. Verify the API key is valid and not restricted to wrong domains
3. Check browser console for API key errors
4. Ensure the build script ran successfully (check deployment logs)

### "InvalidKeyMapError" in console

- Your API key might be restricted to different domains
- Add your Vercel domain to the allowed referrers in Google Cloud Console

### Build script not running

- Check that `package.json` exists in the root directory
- Verify the `vercel-build` script is defined
- Check Vercel deployment logs for errors

## Additional Environment Variables

See `.env.example` for other available environment variables:
- `RECAPTCHA_SITE_KEY` / `RECAPTCHA_SECRET_KEY` - For form spam protection
- `RESEND_API_KEY` - For email notifications
- `NOTIFICATION_EMAIL` - Email address for form submissions

All of these can be configured in Vercel's environment variables section.
