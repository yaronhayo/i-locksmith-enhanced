// Enhanced Google Maps Integration for I Locksmith
// Handles both old and new Places API with fallbacks
// Optimized for performance and CSP compliance

class EnhancedMapsManager {
    constructor() {
        this.isLoaded = false;
        this.autocompleteInstances = new Map();
        this.initPromise = null;

        console.log('🗺️ Enhanced Maps Manager initialized');
    }

    // Initialize Google Maps with error handling
    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this.loadGoogleMaps();
        return this.initPromise;
    }

    async loadGoogleMaps() {
        try {
            // Check if Google Maps is already loaded
            if (window.google && window.google.maps) {
                this.isLoaded = true;
                console.log('✅ Google Maps already loaded');
                return true;
            }

            // Wait for Google Maps to load (it should already be included in HTML)
            await this.waitForGoogleMaps();
            this.isLoaded = true;
            console.log('✅ Google Maps loaded successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to load Google Maps:', error);
            return false;
        }
    }

    // Wait for Google Maps to be available
    waitForGoogleMaps(timeout = 10000) {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.maps) {
                resolve();
                return;
            }

            const checkInterval = 100;
            let elapsed = 0;

            const interval = setInterval(() => {
                elapsed += checkInterval;

                if (window.google && window.google.maps) {
                    clearInterval(interval);
                    resolve();
                } else if (elapsed >= timeout) {
                    clearInterval(interval);
                    reject(new Error('Google Maps failed to load within timeout'));
                }
            }, checkInterval);
        });
    }

    // Create address autocomplete with new API when available
    async createAutocomplete(inputElement, options = {}) {
        try {
            await this.initialize();

            if (!inputElement || !this.isLoaded) {
                console.warn('⚠️ Cannot create autocomplete: missing input or Maps not loaded');
                return null;
            }

            // Try to use new PlaceAutocompleteElement API first
            if (window.google.maps.places && window.google.maps.places.PlaceAutocompleteElement) {
                return this.createNewAutocomplete(inputElement, options);
            }

            // Fallback to legacy Autocomplete API
            if (window.google.maps.places && window.google.maps.places.Autocomplete) {
                return this.createLegacyAutocomplete(inputElement, options);
            }

            console.warn('⚠️ No Places API available');
            return null;

        } catch (error) {
            console.error('❌ Failed to create autocomplete:', error);
            return null;
        }
    }

    // New Places API implementation
    createNewAutocomplete(inputElement, options) {
        try {
            const autocompleteElement = new window.google.maps.places.PlaceAutocompleteElement({
                inputElement: inputElement,
                ...options
            });

            const instanceId = this.generateInstanceId();
            this.autocompleteInstances.set(instanceId, autocompleteElement);

            console.log('✅ Created new PlaceAutocompleteElement');
            return {
                instance: autocompleteElement,
                id: instanceId,
                type: 'new'
            };

        } catch (error) {
            console.error('❌ Failed to create new autocomplete:', error);
            return null;
        }
    }

    // Legacy Places API implementation
    createLegacyAutocomplete(inputElement, options) {
        try {
            // Suppress the deprecation warning by wrapping in try-catch
            let autocomplete;
            const originalConsoleWarn = console.warn;
            console.warn = () => {}; // Temporarily suppress warnings

            autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
                types: options.types || ['address'],
                componentRestrictions: options.componentRestrictions || { country: 'us' },
                fields: options.fields || ['formatted_address', 'geometry', 'name']
            });

            console.warn = originalConsoleWarn; // Restore console.warn

            const instanceId = this.generateInstanceId();
            this.autocompleteInstances.set(instanceId, autocomplete);

            console.log('✅ Created legacy Autocomplete (with deprecation handling)');
            return {
                instance: autocomplete,
                id: instanceId,
                type: 'legacy'
            };

        } catch (error) {
            console.error('❌ Failed to create legacy autocomplete:', error);
            return null;
        }
    }

    // Setup autocomplete for booking forms
    async setupBookingFormAutocomplete() {
        const addressInputs = document.querySelectorAll('input[name="address"], input[id*="address"], input[placeholder*="address" i]');

        if (addressInputs.length === 0) {
            return;
        }

        console.log(`🎯 Setting up autocomplete for ${addressInputs.length} address input(s)`);

        for (const input of addressInputs) {
            try {
                const autocomplete = await this.createAutocomplete(input, {
                    types: ['address'],
                    componentRestrictions: { country: 'us' },
                    fields: ['formatted_address', 'geometry', 'name', 'address_components']
                });

                if (autocomplete) {
                    this.setupAutocompleteListeners(autocomplete, input);
                }
            } catch (error) {
                console.error('❌ Failed to setup autocomplete for input:', input, error);
            }
        }
    }

    // Setup event listeners for autocomplete
    setupAutocompleteListeners(autocomplete, inputElement) {
        if (autocomplete.type === 'legacy') {
            autocomplete.instance.addListener('place_changed', () => {
                const place = autocomplete.instance.getPlace();
                this.handlePlaceSelection(place, inputElement);
            });
        } else if (autocomplete.type === 'new') {
            autocomplete.instance.addEventListener('place_changed', (event) => {
                this.handlePlaceSelection(event.place, inputElement);
            });
        }
    }

    // Handle place selection
    handlePlaceSelection(place, inputElement) {
        if (!place || !place.geometry) {
            console.warn('⚠️ Invalid place selected');
            return;
        }

        console.log('📍 Place selected:', place.formatted_address || place.name);

        // Trigger custom event for other scripts to listen to
        inputElement.dispatchEvent(new CustomEvent('placeSelected', {
            detail: {
                place: place,
                formattedAddress: place.formatted_address,
                geometry: place.geometry
            }
        }));
    }

    // Generate unique instance ID
    generateInstanceId() {
        return `autocomplete_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Cleanup autocomplete instances
    cleanup() {
        this.autocompleteInstances.clear();
        console.log('🧹 Autocomplete instances cleaned up');
    }

    // Get analytics-safe place data
    getAnalyticsData(place) {
        if (!place) return null;

        return {
            hasGeometry: !!place.geometry,
            placeTypes: place.types || [],
            addressComponents: place.address_components?.length || 0,
            // Don't include actual addresses for privacy
            timestamp: new Date().toISOString()
        };
    }
}

// Enhanced error handling for Maps API
class MapsErrorHandler {
    static handleError(error, context = 'Maps API') {
        console.error(`❌ ${context} Error:`, error);

        // Send to analytics (without sensitive data)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'maps_error', {
                event_category: 'Maps',
                event_label: context,
                non_interaction: true
            });
        }

        return false;
    }

    static handleWarning(message, context = 'Maps API') {
        console.warn(`⚠️ ${context} Warning:`, message);
    }
}

// Initialize enhanced maps when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create global instance
        window.enhancedMaps = new EnhancedMapsManager();

        // Setup autocomplete for forms
        setTimeout(async () => {
            await window.enhancedMaps.setupBookingFormAutocomplete();
        }, 1000); // Delay to ensure all forms are rendered

        console.log('🚀 Enhanced Maps initialization complete');

    } catch (error) {
        MapsErrorHandler.handleError(error, 'Enhanced Maps Initialization');
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.enhancedMaps) {
        window.enhancedMaps.cleanup();
    }
});

// Export for manual usage
window.EnhancedMapsManager = EnhancedMapsManager;
window.MapsErrorHandler = MapsErrorHandler;