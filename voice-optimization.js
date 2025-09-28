/**
 * Voice AI Assistant Optimization for I Locksmith
 * Optimizes content for Siri, Alexa, Google Assistant, and other voice AI tools
 * This script enhances voice search visibility and content speakability
 */

// Voice Search Optimization Configuration
const voiceOptimization = {
    // Common voice search queries related to locksmith services
    voiceQueries: [
        "find a locksmith near me",
        "emergency locksmith south bend",
        "car lockout service",
        "house lockout help",
        "24 hour locksmith",
        "locksmith phone number",
        "best locksmith in south bend",
        "commercial locksmith services",
        "key replacement service",
        "locked out of car help"
    ],

    // Business information optimized for voice assistants
    businessInfo: {
        name: "I Locksmith",
        fullName: "I Locksmith South Bend",
        phone: "574-318-7797",
        phoneSpeakable: "five seven four, three one eight, seven seven nine seven",
        address: "South Bend, Indiana",
        hours: "24 hours a day, 7 days a week",
        services: [
            "emergency locksmith",
            "car lockout service",
            "house lockout service",
            "business lockout service",
            "key replacement",
            "lock repair",
            "lock installation"
        ]
    }
};

// Enhanced SpeechSynthesis API integration for testing
if ('speechSynthesis' in window) {
    const speakableElements = document.querySelectorAll('.voice-speakable, [data-speakable="true"]');

    speakableElements.forEach(element => {
        // Add voice-friendly formatting
        element.setAttribute('role', 'text');
        element.setAttribute('aria-live', 'polite');

        // Clean up text for voice assistants
        const originalText = element.textContent;
        const cleanText = originalText
            .replace(/•/g, ',') // Replace bullets with commas
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();

        element.setAttribute('data-voice-text', cleanText);
    });
}

// Voice Search structured data injection
function injectVoiceOptimizedStructuredData() {
    const voiceStructuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "speakable": {
            "@type": "SpeakableSpecification",
            "cssSelector": [".voice-speakable", "[data-speakable='true']"]
        },
        "mainEntity": {
            "@type": "LocalBusiness",
            "@id": "https://i-locksmith.com/#localbusiness",
            "name": voiceOptimization.businessInfo.name,
            "alternateName": voiceOptimization.businessInfo.fullName,
            "url": "https://i-locksmith.com",
            "telephone": voiceOptimization.businessInfo.phone,
            "description": "Professional 24/7 emergency locksmith services in South Bend, Indiana for car lockouts, house lockouts, business lockouts, key replacement, and lock repair",
            "areaServed": {
                "@type": "City",
                "name": "South Bend",
                "containedInPlace": {
                    "@type": "State",
                    "name": "Indiana"
                }
            },
            "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Locksmith Services",
                "itemListElement": voiceOptimization.businessInfo.services.map(service => ({
                    "@type": "Offer",
                    "itemOffered": {
                        "@type": "Service",
                        "name": service
                    }
                }))
            }
        },
        "potentialAction": [
            {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://i-locksmith.com/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            },
            {
                "@type": "CallAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "tel:" + voiceOptimization.businessInfo.phone
                }
            }
        ]
    };

    // Inject voice-optimized structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(voiceStructuredData);
    document.head.appendChild(script);
}

// Voice Assistant Action optimization
function optimizeForVoiceActions() {
    // Add voice-friendly meta tags
    const metaVoiceEnabled = document.createElement('meta');
    metaVoiceEnabled.name = 'voice-assistant-enabled';
    metaVoiceEnabled.content = 'true';
    document.head.appendChild(metaVoiceEnabled);

    // Add Apple Siri optimization
    const metaSiri = document.createElement('meta');
    metaSiri.name = 'apple-itunes-app';
    metaSiri.content = 'app-id=locksmith-services';
    document.head.appendChild(metaSiri);

    // Add Google Assistant optimization
    const linkActionGoogle = document.createElement('link');
    linkActionGoogle.rel = 'alternate';
    linkActionGoogle.type = 'application/json+ld';
    linkActionGoogle.href = 'data:application/json,' + encodeURIComponent(JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Action",
        "name": "Call I Locksmith",
        "object": {
            "@type": "LocalBusiness",
            "name": "I Locksmith",
            "telephone": voiceOptimization.businessInfo.phone
        }
    }));
    document.head.appendChild(linkActionGoogle);
}

// Voice search query optimization
function addVoiceSearchKeywords() {
    // Add voice search meta keywords
    const metaVoiceKeywords = document.createElement('meta');
    metaVoiceKeywords.name = 'voice-search-keywords';
    metaVoiceKeywords.content = voiceOptimization.voiceQueries.join(', ');
    document.head.appendChild(metaVoiceKeywords);

    // Add conversational search patterns
    const conversationalQueries = [
        "Hey Siri, find a locksmith near me",
        "Ok Google, call an emergency locksmith",
        "Alexa, find locksmith services in South Bend",
        "Hey Google, I'm locked out of my car",
        "Siri, call I Locksmith",
        "Google, what's the phone number for I Locksmith"
    ];

    const metaConversational = document.createElement('meta');
    metaConversational.name = 'conversational-queries';
    metaConversational.content = conversationalQueries.join(' | ');
    document.head.appendChild(metaConversational);
}

// Initialize voice optimization when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎤 Initializing Voice AI Assistant Optimization...');

    try {
        injectVoiceOptimizedStructuredData();
        optimizeForVoiceActions();
        addVoiceSearchKeywords();

        // Add voice-friendly page title for screen readers and voice assistants
        const pageTitle = document.title;
        const voiceFriendlyTitle = pageTitle
            .replace(/\|/g, ',')
            .replace(/&/g, 'and')
            .replace(/\s+/g, ' ')
            .trim();

        document.querySelector('h1')?.setAttribute('data-voice-title', voiceFriendlyTitle);

        console.log('✅ Voice AI optimization completed successfully');
    } catch (error) {
        console.error('❌ Voice optimization error:', error);
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = voiceOptimization;
}

// Global voice optimization object
window.voiceOptimization = voiceOptimization;