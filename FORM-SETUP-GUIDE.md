# I Locksmith Form Integration Setup Guide

This guide explains how to complete the setup of the enhanced form system with validation, reCAPTCHA, address autocomplete, and email notifications.

## 🔧 Required API Keys & Environment Variables

### 1. Google reCAPTCHA v3 Setup
1. Go to https://www.google.com/recaptcha/admin/create
2. Create a new reCAPTCHA v3 site
3. Add your domain(s): `ilocksmithindiana.com`, `localhost` (for testing)
4. Get your **Site Key** and **Secret Key**

**Update in files:**
- Replace `6LdYour_Site_Key_Here` in all HTML files with your actual site key
- Add secret key to your server environment

### 2. Google Maps Places API
1. Go to https://console.developers.google.com/
2. Enable "Places API" and "Maps JavaScript API"
3. Create credentials (API Key)
4. Restrict the key to your domain for security

**Update in files:**
- Replace `YOUR_GOOGLE_API_KEY` in all HTML files with your actual API key

### 3. Resend Email Service
1. Sign up at https://resend.com/
2. Get your API key from the dashboard
3. Verify your sending domain or use their test domain

**Add to environment:**
- `RESEND_API_KEY=your_resend_api_key_here`

## 📁 File Structure
```
/i-locksmith/
├── js/
│   └── form-handler.js           # ✅ Complete - Form validation & handling
├── api/
│   └── submit-form.js            # ✅ Complete - Server-side email processing
├── thank-you.html                # ✅ Complete - Success page
├── book.html                     # ✅ Updated - Form integration complete
├── contact.html                  # ✅ Updated - Form integration complete
├── service-areas/               # 🟡 Needs update - 10 files to update
│   ├── locksmith-south-bend-indiana.html
│   ├── locksmith-mishawaka-indiana.html
│   └── ... (8 more files)
└── FORM-SETUP-GUIDE.md          # This file
```

## 🔄 Form Integration Status

### ✅ Completed Pages
- **book.html** - Full integration with new form handler
- **contact.html** - Full integration with new form handler
- **thank-you.html** - Success page created with I Locksmith branding

### 🟡 Partially Completed
- **Service Area Pages (10 files)** - Need form handler integration
  - Forms exist but need updated validation attributes and scripts

### 📋 Next Steps Needed

#### 1. Update Service Area Pages
Each service area page needs:
```javascript
// Add these scripts before closing </body>
<!-- reCAPTCHA -->
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY"></script>

<!-- Google Places API -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initAutocomplete"></script>

<!-- Form Handler -->
<script src="../js/form-handler.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const formHandler = new FormHandler();
    window.initAutocomplete = function() {
        formHandler.initAddressAutocomplete();
    };
});
</script>
```

#### 2. Form Field Updates Needed
Update form inputs with:
- `data-validation="required,name"` attributes
- `data-error-target="field-error"` attributes
- `data-autocomplete="address"` for address fields
- Error message containers: `<div id="field-error" class="error-message mt-1 text-sm text-red-500 hidden"></div>`

#### 3. Environment Variables
Create `.env` file (or set in Vercel/hosting):
```bash
RESEND_API_KEY=re_xxxxxxxxxx
GOOGLE_RECAPTCHA_SECRET_KEY=6Ld_xxxxxxxxxx
```

#### 4. Deploy API Endpoint
The `api/submit-form.js` file is ready for Vercel deployment. It will:
- ✅ Process form submissions
- ✅ Send styled email notifications to yaron@gettmarketing.com
- ✅ Include all user data and session info
- ✅ Use I Locksmith brand colors and styling
- ✅ Redirect to /thank-you.html on success

## 🎨 Email Template Features
The email notifications include:
- **I Locksmith brand colors** (#DC143C, #FF4500)
- **Complete lead information** (name, phone, address, service type, urgency)
- **Session tracking data** (page, referrer, user agent)
- **Professional styling** with gradient headers
- **Priority indicators** for urgent requests (ASAP)
- **Direct contact links** (click-to-call, maps)

## 🚀 Testing Checklist
Once API keys are configured:

1. **Form Validation** - Try submitting empty/invalid data
2. **Address Autocomplete** - Start typing an address
3. **reCAPTCHA** - Verify invisible reCAPTCHA works
4. **Email Delivery** - Submit a test form
5. **Success Redirect** - Verify redirect to /thank-you.html
6. **Mobile Responsiveness** - Test on mobile devices

## 🔒 Security Features Implemented
- ✅ Input sanitization and validation
- ✅ reCAPTCHA v3 spam protection
- ✅ Server-side validation
- ✅ API key restrictions (Maps/reCAPTCHA)
- ✅ Rate limiting ready (can be added to API endpoint)
- ✅ No sensitive data logged

## 📊 Lead Intelligence Captured
Each form submission captures:
- Customer contact information
- Service requirements and urgency
- Geographic location data
- Session information (referral source, page visited)
- Device/browser information
- Timestamp and priority scoring

This comprehensive form system will significantly improve lead capture and conversion rates while providing a professional user experience that matches the I Locksmith brand.