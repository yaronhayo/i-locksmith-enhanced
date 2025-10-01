# I Locksmith Form System Setup Guide

## 🚀 Quick Start

1. **Copy environment file**: `cp .env.example .env`
2. **Configure your credentials** in `.env`
3. **Test forms** work properly
4. **Deploy** to your web server

## 📋 Environment Configuration

### Required Variables
Copy `.env.example` to `.env` and configure these essential variables:

```bash
# reCAPTCHA (Get from https://www.google.com/recaptcha/admin)
RECAPTCHA_SITE_KEY=your_actual_site_key_here
RECAPTCHA_SECRET_KEY=your_actual_secret_key_here

# Resend Email API (Get from https://resend.com/api-keys)
RESEND_API_KEY=re_your_actual_api_key_here

# Business Configuration
NOTIFICATION_EMAIL=your-business-email@example.com
FROM_EMAIL=noreply@yourdomain.com
WEBSITE_URL=https://yourdomain.com
```

### Optional Configuration
```bash
# Business Information
BUSINESS_NAME=I Locksmith
BUSINESS_PHONE=+1 (574) 318-7797
BUSINESS_EMAIL=info@yourdomain.com
BUSINESS_ADDRESS=South Bend, IN

# Security & Performance
SESSION_SECRET=your_random_32_character_string_here
RATE_LIMIT=50
MAX_FILE_SIZE=5

# Development
NODE_ENV=production
DEBUG_MODE=false
```

## 🔧 System Components

### Backend Files
- `api/submit-form.php` - Main form processing endpoint
- `api/config.php` - Environment configuration loader
- `api/get-config.php` - Frontend configuration API

### Frontend Files
- `js/form-handler.js` - Client-side form handling
- `.env.example` - Environment configuration template

### Integrated Forms (16 total)
- **Main Forms**: index.html, book.html, contact.html
- **Service Pages**: services.html, service-areas.html
- **Service Area Pages**: 10 location-specific forms
- **Newsletter**: blog.html (simple form, no backend)

## 📧 Email System Features

### Customer Emails
- **Confirmation**: Sent immediately after form submission
- **Professional formatting** with business branding
- **Service details** and next steps
- **Contact information** for follow-up

### Business Notifications
- **Detailed lead information** with all form data
- **Source page tracking** to identify best performing forms
- **Timestamp and IP logging** for analytics
- **Priority flagging** for urgent requests

## 🔒 Security Features

### reCAPTCHA Integration
- **Dynamic loading** of site keys from environment
- **Fallback to test keys** during development
- **Validation on both** frontend and backend
- **Error handling** for failed verifications

### Input Protection
- **Server-side validation** of all inputs
- **XSS protection** with proper sanitization
- **Rate limiting** to prevent spam
- **IP tracking** for abuse monitoring

## 🎯 Form Validation

### Real-time Validation
- **Field-level validation** as user types
- **Visual feedback** with color coding
- **Error messages** below each field
- **Submit button** disabled until valid

### Validation Rules
- **Name**: Required, minimum 2 characters
- **Phone**: Required, valid format
- **Email**: Valid email format (where applicable)
- **Address**: Required for service requests
- **Service Type**: Must select from dropdown

## 📊 Performance Optimizations

### Loading Strategy
- **Lazy loading** of reCAPTCHA script
- **Conditional loading** based on form presence
- **Error boundaries** for failed API calls
- **Graceful degradation** when JS disabled

### Caching
- **Configuration caching** to reduce API calls
- **15-minute cache** on config endpoint
- **Browser caching** of static assets

## 🛠️ Deployment Checklist

### Pre-deployment
- [ ] Configure all environment variables
- [ ] Test reCAPTCHA with real keys
- [ ] Verify email delivery with Resend
- [ ] Test form submission end-to-end
- [ ] Check all 16 forms load correctly

### Production Setup
- [ ] Set `NODE_ENV=production`
- [ ] Disable `DEBUG_MODE`
- [ ] Configure proper `SESSION_SECRET`
- [ ] Set up SSL certificate
- [ ] Configure server permissions for logs/

### Post-deployment
- [ ] Test forms from different devices
- [ ] Verify email notifications arrive
- [ ] Check thank-you page redirects
- [ ] Monitor error logs for issues

## 🐛 Troubleshooting

### Common Issues

**Forms not submitting**
- Check `.env` configuration exists
- Verify API endpoints are accessible
- Check browser console for JavaScript errors

**reCAPTCHA not loading**
- Verify `RECAPTCHA_SITE_KEY` is correct
- Check domain is registered with Google
- Ensure HTTPS is enabled in production

**Emails not sending**
- Verify `RESEND_API_KEY` is valid
- Check `FROM_EMAIL` domain is verified
- Review error logs in `logs/form-submissions.log`

**Validation errors**
- Ensure all required fields have values
- Check field naming matches between HTML and JS
- Verify form IDs are correctly targeted

### Log Files
- **Form submissions**: `logs/form-submissions.log`
- **PHP errors**: Check server error logs
- **JavaScript errors**: Browser developer console

### Testing Commands
```bash
# Test PHP syntax
php -l api/submit-form.php

# Check configuration loading
curl http://localhost/api/get-config.php

# Test form submission (with proper data)
curl -X POST http://localhost/api/submit-form.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"555-0123","email":"test@example.com"}'
```

## 📈 Analytics Integration

### Form Tracking
- **Submission source** tracking by page
- **Conversion funnel** analysis capability
- **Error rate monitoring** by form
- **Performance metrics** collection

### Google Analytics Events
Forms automatically trigger these events:
- `form_start` - User begins filling form
- `form_submit_attempt` - User clicks submit
- `form_submit_success` - Successful submission
- `form_submit_error` - Submission failed

## 🔄 Maintenance

### Regular Tasks
- **Monitor** error logs weekly
- **Update** environment variables as needed
- **Test** email delivery monthly
- **Review** form analytics quarterly

### Security Updates
- **Rotate** API keys annually
- **Update** reCAPTCHA configurations
- **Review** rate limiting rules
- **Monitor** for spam patterns

## 📞 Support

### Technical Issues
- Check this documentation first
- Review error logs in `logs/` directory
- Test with browser developer tools
- Verify environment configuration

### API Issues
- **Resend**: Check https://resend.com/docs
- **reCAPTCHA**: Check https://developers.google.com/recaptcha

---

*Last updated: $(date)*
*System version: 1.0*