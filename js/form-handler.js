/**
 * I Locksmith Form Handler
 * Comprehensive form validation, reCAPTCHA integration, and submission handling
 */

class LocksmithFormHandler {
    constructor() {
        this.forms = [];
        this.recaptchaLoaded = false;
        this.init();
    }

    init() {
        // Initialize all forms on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeForms();
            this.loadRecaptcha();
            this.initializeAddressAutocomplete();
        });
    }

    initializeForms() {
        // Find all booking forms on the page
        const forms = document.querySelectorAll('form[id*="booking"], form[class*="booking"], form.service-form');

        forms.forEach(form => {
            this.setupForm(form);
        });
    }

    setupForm(form) {
        const formData = {
            element: form,
            isValid: false,
            fields: {},
            recaptchaId: null
        };

        // Setup field validation
        this.setupFieldValidation(formData);

        // Setup form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(formData);
        });

        // Setup real-time validation
        this.setupRealTimeValidation(formData);

        this.forms.push(formData);
    }

    setupFieldValidation(formData) {
        const form = formData.element;

        // Define validation rules
        const validationRules = {
            name: {
                required: true,
                minLength: 2,
                pattern: /^[a-zA-Z\s'-]+$/,
                message: 'Please enter a valid name (letters, spaces, hyphens, and apostrophes only)'
            },
            phone: {
                required: true,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                message: 'Please enter a valid phone number'
            },
            email: {
                required: false,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            address: {
                required: true,
                minLength: 5,
                message: 'Please enter a complete service address'
            },
            service_type: {
                required: true,
                message: 'Please select a service type'
            },
            needed: {
                required: true,
                message: 'Please select when you need the service'
            }
        };

        // Store validation rules for this form
        formData.validationRules = validationRules;

        // Initialize field objects
        Object.keys(validationRules).forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                formData.fields[fieldName] = {
                    element: field,
                    isValid: !validationRules[fieldName].required,
                    errorElement: this.createErrorElement(field)
                };
            }
        });
    }

    createErrorElement(field) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error text-red-500 text-xs mt-1 hidden';
        errorDiv.setAttribute('role', 'alert');
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
        return errorDiv;
    }

    setupRealTimeValidation(formData) {
        Object.keys(formData.fields).forEach(fieldName => {
            const fieldData = formData.fields[fieldName];
            const field = fieldData.element;

            // Add event listeners for real-time validation
            field.addEventListener('blur', () => {
                this.validateField(formData, fieldName);
            });

            field.addEventListener('input', () => {
                // Clear error on input
                this.clearFieldError(fieldData);

                // Validate on input for certain fields
                if (['email', 'phone'].includes(fieldName)) {
                    setTimeout(() => {
                        this.validateField(formData, fieldName);
                    }, 500);
                }
            });
        });
    }

    validateField(formData, fieldName) {
        const fieldData = formData.fields[fieldName];
        const field = fieldData.element;
        const rules = formData.validationRules[fieldName];

        if (!field || !rules) return true;

        let isValid = true;
        let errorMessage = '';

        const value = field.value.trim();

        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} is required`;
        }

        // Min length validation
        if (isValid && rules.minLength && value.length > 0 && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(field)} must be at least ${rules.minLength} characters`;
        }

        // Pattern validation
        if (isValid && rules.pattern && value.length > 0 && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }

        // Update field state
        fieldData.isValid = isValid;

        if (!isValid) {
            this.showFieldError(fieldData, errorMessage);
            this.markFieldInvalid(field);
        } else {
            this.clearFieldError(fieldData);
            this.markFieldValid(field);
        }

        return isValid;
    }

    getFieldLabel(field) {
        const label = field.parentNode.querySelector('label');
        if (label) {
            return label.textContent.replace('*', '').trim();
        }
        return field.getAttribute('name') || 'Field';
    }

    showFieldError(fieldData, message) {
        const errorElement = fieldData.errorElement;
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }

    clearFieldError(fieldData) {
        const errorElement = fieldData.errorElement;
        errorElement.classList.add('hidden');
    }

    markFieldInvalid(field) {
        field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
        field.classList.remove('border-green-500', 'focus:ring-green-500', 'focus:border-green-500');
    }

    markFieldValid(field) {
        field.classList.add('border-green-500');
        field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
    }

    loadRecaptcha() {
        if (window.grecaptcha || this.recaptchaLoaded) return;

        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            this.recaptchaLoaded = true;
            this.initRecaptchaForForms();
        };
        document.head.appendChild(script);
    }

    initRecaptchaForForms() {
        this.forms.forEach(formData => {
            const recaptchaContainer = formData.element.querySelector('.g-recaptcha');
            if (recaptchaContainer && window.grecaptcha) {
                formData.recaptchaId = grecaptcha.render(recaptchaContainer, {
                    sitekey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Test key - replace with actual
                    theme: 'light',
                    size: 'normal'
                });
            }
        });
    }

    initializeAddressAutocomplete() {
        // Load Google Places API if not already loaded
        if (!window.google || !window.google.maps) {
            this.loadGoogleMapsAPI();
            return;
        }

        this.setupAddressAutocomplete();
    }

    loadGoogleMapsAPI() {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCPityG_sxBDoXzvAKqbLDbeSZi9nzkyNc&libraries=places&callback=initAddressAutocomplete`;
        script.async = true;
        script.defer = true;

        window.initAddressAutocomplete = () => {
            this.setupAddressAutocomplete();
        };

        document.head.appendChild(script);
    }

    setupAddressAutocomplete() {
        this.forms.forEach(formData => {
            const addressField = formData.fields.address?.element;
            if (addressField && window.google && window.google.maps && window.google.maps.places) {
                const autocomplete = new google.maps.places.Autocomplete(addressField, {
                    types: ['address'],
                    componentRestrictions: { country: 'US' },
                    bounds: new google.maps.LatLngBounds(
                        new google.maps.LatLng(41.5, -86.5), // Southwest bound (South Bend area)
                        new google.maps.LatLng(41.8, -85.8)  // Northeast bound
                    ),
                    strictBounds: false
                });

                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.formatted_address) {
                        addressField.value = place.formatted_address;
                        this.validateField(formData, 'address');
                    }
                });
            }
        });
    }

    async handleSubmit(formData) {
        const form = formData.element;
        const submitButton = form.querySelector('button[type="submit"]');

        // Disable submit button
        this.setSubmitButtonState(submitButton, 'loading');

        try {
            // Validate all fields
            let isFormValid = true;
            Object.keys(formData.fields).forEach(fieldName => {
                if (!this.validateField(formData, fieldName)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                this.setSubmitButtonState(submitButton, 'error');
                this.showFormError(form, 'Please correct the errors above before submitting.');
                return;
            }

            // Validate reCAPTCHA
            if (formData.recaptchaId !== null && window.grecaptcha) {
                const recaptchaResponse = grecaptcha.getResponse(formData.recaptchaId);
                if (!recaptchaResponse) {
                    this.setSubmitButtonState(submitButton, 'error');
                    this.showFormError(form, 'Please complete the reCAPTCHA verification.');
                    return;
                }
            }

            // Collect form data
            const submissionData = this.collectFormData(formData);

            // Submit form
            const success = await this.submitForm(submissionData);

            if (success) {
                // Redirect to thank you page
                window.location.href = '/thank-you.html';
            } else {
                this.setSubmitButtonState(submitButton, 'error');
                this.showFormError(form, 'There was an error submitting your request. Please try again or call us directly at (574) 318-7797.');
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.setSubmitButtonState(submitButton, 'error');
            this.showFormError(form, 'There was an unexpected error. Please call us directly at (574) 318-7797.');
        }
    }

    collectFormData(formData) {
        const form = formData.element;
        const data = {
            // Form fields
            name: form.querySelector('[name="name"]')?.value?.trim() || '',
            phone: form.querySelector('[name="phone"]')?.value?.trim() || '',
            email: form.querySelector('[name="email"]')?.value?.trim() || '',
            address: form.querySelector('[name="address"]')?.value?.trim() || '',
            service_type: form.querySelector('[name="service_type"]')?.value?.trim() || '',
            needed: form.querySelector('[name="needed"]')?.value?.trim() || '',
            notes: form.querySelector('[name="notes"]')?.value?.trim() || '',

            // Session information
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            screen_resolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

            // reCAPTCHA response
            recaptcha_response: formData.recaptchaId !== null && window.grecaptcha ?
                grecaptcha.getResponse(formData.recaptchaId) : null
        };

        return data;
    }

    async submitForm(data) {
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            return response.ok;
        } catch (error) {
            console.error('API submission error:', error);

            // Fallback to email submission
            return await this.submitViaEmail(data);
        }
    }

    async submitViaEmail(data) {
        try {
            // Create email content
            const emailContent = this.createEmailContent(data);

            // Submit via Resend API (this would need to be implemented server-side)
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer re_YOUR_RESEND_API_KEY', // Replace with actual key
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'noreply@ilocksmithindiana.com',
                    to: ['yaron@gettmarketing.com'],
                    subject: `🔐 New Lead - ${data.service_type} - ${data.name}`,
                    html: emailContent
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Email submission error:', error);
            return false;
        }
    }

    createEmailContent(data) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #DC143C, #FF4500); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
                .content { padding: 30px; }
                .field-group { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #DC143C; }
                .field-label { font-weight: bold; color: #DC143C; margin-bottom: 5px; }
                .field-value { color: #333; font-size: 16px; }
                .priority-high { border-left-color: #ff0000; background: #fff5f5; }
                .session-info { border-top: 2px solid #eee; padding-top: 20px; margin-top: 30px; }
                .session-info h3 { color: #666; font-size: 16px; margin-bottom: 15px; }
                .session-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .session-item { font-size: 14px; color: #666; }
                .session-label { font-weight: bold; color: #333; }
                .footer { background: #1C1C1C; color: white; padding: 20px; text-align: center; font-size: 14px; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #DC143C, #FF4500); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 10px 5px; }
                @media (max-width: 600px) {
                    .session-grid { grid-template-columns: 1fr; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 New Locksmith Lead</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">I Locksmith - Service Request</p>
                </div>

                <div class="content">
                    <div class="field-group ${data.needed === 'ASAP' ? 'priority-high' : ''}">
                        <div class="field-label">🚨 Priority Level</div>
                        <div class="field-value" style="font-weight: bold; font-size: 18px;">${data.needed === 'ASAP' ? '🔥 URGENT - ASAP' : data.needed}</div>
                    </div>

                    <div class="field-group">
                        <div class="field-label">👤 Customer Name</div>
                        <div class="field-value">${data.name}</div>
                    </div>

                    <div class="field-group">
                        <div class="field-label">📞 Phone Number</div>
                        <div class="field-value">
                            <a href="tel:${data.phone}" style="color: #DC143C; text-decoration: none; font-weight: bold;">${data.phone}</a>
                        </div>
                    </div>

                    ${data.email ? `
                    <div class="field-group">
                        <div class="field-label">📧 Email Address</div>
                        <div class="field-value">
                            <a href="mailto:${data.email}" style="color: #DC143C; text-decoration: none;">${data.email}</a>
                        </div>
                    </div>
                    ` : ''}

                    <div class="field-group">
                        <div class="field-label">📍 Service Address</div>
                        <div class="field-value">
                            <a href="https://maps.google.com/?q=${encodeURIComponent(data.address)}" style="color: #DC143C; text-decoration: none;" target="_blank">
                                ${data.address}
                            </a>
                        </div>
                    </div>

                    <div class="field-group">
                        <div class="field-label">🔧 Service Type</div>
                        <div class="field-value" style="font-weight: bold; color: #DC143C;">${data.service_type}</div>
                    </div>

                    ${data.notes ? `
                    <div class="field-group">
                        <div class="field-label">📝 Additional Notes</div>
                        <div class="field-value">${data.notes}</div>
                    </div>
                    ` : ''}

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="tel:${data.phone}" class="cta-button">📞 Call Customer</a>
                        <a href="https://maps.google.com/?q=${encodeURIComponent(data.address)}" class="cta-button" target="_blank">🗺️ View Location</a>
                    </div>

                    <div class="session-info">
                        <h3>📊 Session Information</h3>
                        <div class="session-grid">
                            <div class="session-item">
                                <span class="session-label">Timestamp:</span><br>
                                ${new Date(data.timestamp).toLocaleString()}
                            </div>
                            <div class="session-item">
                                <span class="session-label">Page:</span><br>
                                <a href="${data.page_url}" style="color: #DC143C;">${data.page_title}</a>
                            </div>
                            <div class="session-item">
                                <span class="session-label">Referrer:</span><br>
                                ${data.referrer || 'Direct'}
                            </div>
                            <div class="session-item">
                                <span class="session-label">Location:</span><br>
                                ${data.timezone}
                            </div>
                            <div class="session-item">
                                <span class="session-label">Device:</span><br>
                                ${data.screen_resolution}
                            </div>
                            <div class="session-item">
                                <span class="session-label">Browser:</span><br>
                                ${data.language}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <strong>I Locksmith</strong><br>
                    Professional Locksmith Services<br>
                    📞 (574) 318-7797 | 📧 ilocksmithoffice@gmail.com<br>
                    🌐 ilocksmithindiana.com
                </div>
            </div>
        </body>
        </html>
        `;
    }

    setSubmitButtonState(button, state) {
        if (!button) return;

        const originalText = button.dataset.originalText || button.innerHTML;
        button.dataset.originalText = originalText;

        switch (state) {
            case 'loading':
                button.disabled = true;
                button.innerHTML = '<span class="material-icons animate-spin mr-2">sync</span>Submitting...';
                break;
            case 'success':
                button.innerHTML = '<span class="material-icons mr-2">check_circle</span>Submitted!';
                break;
            case 'error':
                button.disabled = false;
                button.innerHTML = originalText;
                break;
            default:
                button.disabled = false;
                button.innerHTML = originalText;
        }
    }

    showFormError(form, message) {
        // Remove existing error
        const existingError = form.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }

        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4';
        errorDiv.setAttribute('role', 'alert');
        errorDiv.innerHTML = `
            <div class="flex items-start">
                <span class="material-icons text-red-500 mr-2 mt-0.5">error</span>
                <div>
                    <p class="font-semibold">Error</p>
                    <p>${message}</p>
                </div>
            </div>
        `;

        // Insert at top of form
        form.insertBefore(errorDiv, form.firstChild);

        // Scroll to error
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }
}

// Initialize form handler
const locksmithFormHandler = new LocksmithFormHandler();