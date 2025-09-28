// Optimized Analytics Manager for I Locksmith
// Handles GTM, GA4, and other tracking with CSP compliance and error handling

class OptimizedAnalytics {
    constructor() {
        this.isInitialized = false;
        this.dataLayer = window.dataLayer || [];
        this.gtagLoaded = false;
        this.gtmLoaded = false;
        this.failedScripts = new Set();
        this.retryAttempts = new Map();
        this.maxRetries = 3;

        console.log('📊 Optimized Analytics Manager initialized');
    }

    // Initialize all analytics services
    async initialize() {
        if (this.isInitialized) {
            return;
        }

        try {
            // Initialize data layer first
            this.initializeDataLayer();

            // Load analytics scripts with error handling
            await Promise.allSettled([
                this.loadGoogleTagManager(),
                this.loadGoogleAnalytics(),
                this.loadMicrosoftClarity(),
                this.setupCallTracking()
            ]);

            this.isInitialized = true;
            console.log('✅ Analytics initialization complete');

        } catch (error) {
            console.error('❌ Analytics initialization failed:', error);
        }
    }

    // Initialize Google Tag Manager data layer
    initializeDataLayer() {
        window.dataLayer = window.dataLayer || [];
        this.dataLayer = window.dataLayer;

        // GTM data layer function
        window.gtag = window.gtag || function() {
            this.dataLayer.push(arguments);
        };

        // Set initial timestamp
        this.gtag('js', new Date());
        console.log('📊 Data layer initialized');
    }

    // Load Google Tag Manager with error handling
    async loadGoogleTagManager() {
        try {
            const gtmId = 'GTM-TDFV4QVJ'; // Your GTM ID

            // Check if already loaded
            if (this.gtmLoaded) {
                return true;
            }

            // Create GTM script with error handling
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

            script.onload = () => {
                this.gtmLoaded = true;
                console.log('✅ Google Tag Manager loaded');
                this.trackEvent('gtm_loaded', { method: 'success' });
            };

            script.onerror = (error) => {
                console.warn('⚠️ GTM failed to load:', error);
                this.handleScriptError('gtm', script);
            };

            document.head.appendChild(script);

            // Add GTM noscript fallback
            this.addGTMNoScript(gtmId);

            return true;

        } catch (error) {
            console.error('❌ GTM initialization failed:', error);
            return false;
        }
    }

    // Load Google Analytics 4 with error handling
    async loadGoogleAnalytics() {
        try {
            const ga4Id = 'G-XXXXXXXXXX'; // Replace with your GA4 ID

            // Check if already loaded
            if (this.gtagLoaded) {
                return true;
            }

            // Load gtag script
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;

            script.onload = () => {
                this.gtagLoaded = true;
                this.gtag('config', ga4Id, {
                    page_title: document.title,
                    page_location: window.location.href
                });
                console.log('✅ Google Analytics 4 loaded');
            };

            script.onerror = (error) => {
                console.warn('⚠️ GA4 failed to load:', error);
                this.handleScriptError('ga4', script);
            };

            document.head.appendChild(script);

            return true;

        } catch (error) {
            console.error('❌ GA4 initialization failed:', error);
            return false;
        }
    }

    // Load Microsoft Clarity with error handling
    async loadMicrosoftClarity() {
        try {
            const clarityId = 'YOUR_CLARITY_ID'; // Replace with your Clarity ID

            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.clarity.ms/tag/${clarityId}`;

            script.onload = () => {
                console.log('✅ Microsoft Clarity loaded');
            };

            script.onerror = (error) => {
                console.warn('⚠️ Clarity failed to load:', error);
                this.handleScriptError('clarity', script);
            };

            document.head.appendChild(script);

            return true;

        } catch (error) {
            console.error('❌ Clarity initialization failed:', error);
            return false;
        }
    }

    // Setup call tracking with error handling
    async setupCallTracking() {
        try {
            // Phone number click tracking
            this.trackPhoneClicks();

            // Form submission tracking
            this.trackFormSubmissions();

            console.log('✅ Call tracking setup complete');
            return true;

        } catch (error) {
            console.error('❌ Call tracking setup failed:', error);
            return false;
        }
    }

    // Track phone number clicks
    trackPhoneClicks() {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

        phoneLinks.forEach(link => {
            link.addEventListener('click', () => {
                const phoneNumber = link.href.replace('tel:', '');

                this.trackEvent('phone_click', {
                    phone_number: phoneNumber,
                    event_category: 'Contact',
                    event_label: 'Phone Call'
                });

                console.log('📞 Phone click tracked:', phoneNumber);
            });
        });
    }

    // Track form submissions
    trackFormSubmissions() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', (event) => {
                const formData = new FormData(form);
                const formType = form.id || form.className || 'unknown';

                this.trackEvent('form_submit', {
                    form_type: formType,
                    event_category: 'Lead Generation',
                    event_label: 'Form Submission'
                });

                console.log('📝 Form submission tracked:', formType);
            });
        });
    }

    // Add GTM noscript fallback
    addGTMNoScript(gtmId) {
        const noscript = document.createElement('noscript');
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
        iframe.height = '0';
        iframe.width = '0';
        iframe.style.display = 'none';
        iframe.style.visibility = 'hidden';

        noscript.appendChild(iframe);
        document.body.insertBefore(noscript, document.body.firstChild);
    }

    // Handle script loading errors
    handleScriptError(scriptType, scriptElement) {
        this.failedScripts.add(scriptType);

        const retryCount = this.retryAttempts.get(scriptType) || 0;

        if (retryCount < this.maxRetries) {
            console.log(`🔄 Retrying ${scriptType} load (attempt ${retryCount + 1})`);
            this.retryAttempts.set(scriptType, retryCount + 1);

            // Retry after delay
            setTimeout(() => {
                this.retryScriptLoad(scriptType);
            }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
            console.error(`❌ ${scriptType} failed to load after ${this.maxRetries} attempts`);
        }
    }

    // Retry script loading
    retryScriptLoad(scriptType) {
        switch (scriptType) {
            case 'gtm':
                this.loadGoogleTagManager();
                break;
            case 'ga4':
                this.loadGoogleAnalytics();
                break;
            case 'clarity':
                this.loadMicrosoftClarity();
                break;
        }
    }

    // Track custom events
    trackEvent(eventName, parameters = {}) {
        try {
            // Send to GTM/GA4
            if (this.gtagLoaded && window.gtag) {
                window.gtag('event', eventName, parameters);
            }

            // Send to data layer
            this.dataLayer.push({
                event: eventName,
                ...parameters,
                timestamp: new Date().toISOString()
            });

            console.log('📊 Event tracked:', eventName, parameters);

        } catch (error) {
            console.error('❌ Event tracking failed:', error);
        }
    }

    // Track page views
    trackPageView(pageTitle = document.title, pageLocation = window.location.href) {
        this.trackEvent('page_view', {
            page_title: pageTitle,
            page_location: pageLocation,
            page_referrer: document.referrer
        });
    }

    // Track conversions
    trackConversion(conversionType, value = null, currency = 'USD') {
        this.trackEvent('conversion', {
            conversion_type: conversionType,
            value: value,
            currency: currency
        });
    }

    // Get consent status (for GDPR/CCPA compliance)
    getConsentStatus() {
        const cookieConsent = localStorage.getItem('cookieConsent');
        return cookieConsent === 'accepted';
    }

    // Update consent settings
    updateConsent(granted) {
        if (window.gtag) {
            window.gtag('consent', 'update', {
                'analytics_storage': granted ? 'granted' : 'denied',
                'ad_storage': granted ? 'granted' : 'denied'
            });
        }

        console.log('🍪 Consent updated:', granted ? 'granted' : 'denied');
    }
}

// Performance monitoring
class PerformanceMonitor {
    static trackWebVitals() {
        // Track Core Web Vitals when available
        if ('web-vitals' in window) {
            import('https://unpkg.com/web-vitals@3/dist/web-vitals.js')
                .then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                    onCLS(PerformanceMonitor.sendToAnalytics);
                    onFID(PerformanceMonitor.sendToAnalytics);
                    onFCP(PerformanceMonitor.sendToAnalytics);
                    onLCP(PerformanceMonitor.sendToAnalytics);
                    onTTFB(PerformanceMonitor.sendToAnalytics);
                })
                .catch(error => {
                    console.warn('⚠️ Web Vitals library failed to load:', error);
                });
        }
    }

    static sendToAnalytics(metric) {
        if (window.optimizedAnalytics) {
            window.optimizedAnalytics.trackEvent('web_vital', {
                metric_name: metric.name,
                metric_value: metric.value,
                metric_rating: metric.rating
            });
        }
    }
}

// Initialize optimized analytics
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.optimizedAnalytics = new OptimizedAnalytics();

        // Initialize analytics with consent check
        const hasConsent = window.optimizedAnalytics.getConsentStatus();
        if (hasConsent) {
            await window.optimizedAnalytics.initialize();
        }

        // Track page view
        window.optimizedAnalytics.trackPageView();

        // Setup performance monitoring
        PerformanceMonitor.trackWebVitals();

        console.log('🚀 Optimized analytics ready');

    } catch (error) {
        console.error('❌ Analytics initialization failed:', error);
    }
});

// Handle consent changes
document.addEventListener('cookieConsentChanged', (event) => {
    if (window.optimizedAnalytics) {
        window.optimizedAnalytics.updateConsent(event.detail.granted);
    }
});

// Export for manual usage
window.OptimizedAnalytics = OptimizedAnalytics;
window.PerformanceMonitor = PerformanceMonitor;