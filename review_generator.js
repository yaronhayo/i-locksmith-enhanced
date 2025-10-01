// Perfect Review Generator for I Locksmith
// Ensures unique, contextually accurate reviews with perfect service tag alignment

const { customerDatabase, serviceTags, cities } = require('./customer_database.js');

// Review content templates organized by service type
const reviewTemplates = {
    "Emergency Lockout": {
        templates: [
            "Got locked out during an emergency and these professionals arrived within minutes. Quick, efficient service with fair pricing.",
            "Called for emergency lockout assistance and was impressed by how fast they responded. Professional team that handled everything smoothly.",
            "Emergency locksmith service that actually delivers on their promise of fast response. Highly professional and reasonably priced.",
            "Found myself locked out late at night and they came right away. Courteous, professional, and got me back inside quickly.",
            "Excellent emergency response when I was locked out. The technician was skilled, friendly, and resolved the issue immediately."
        ]
    },
    "Lock Rekey": {
        templates: [
            "Needed all my locks rekeyed after moving into a new home. Professional service with attention to detail and fair pricing.",
            "Had my locks rekeyed for security reasons. The technician was knowledgeable, efficient, and explained the entire process.",
            "Excellent lock rekeying service. They completed the work quickly and tested every lock to ensure perfect operation.",
            "Professional lock rekey service that gave me peace of mind. Quality workmanship and reasonable rates.",
            "Rekeyed multiple locks and provided excellent service throughout. The new keys work perfectly and the price was fair."
        ]
    },
    "Key Replacement": {
        templates: [
            "Lost my keys and needed quick replacement service. They created new keys on-site and everything works perfectly.",
            "Professional key replacement service with same-day availability. The new keys are high quality and work flawlessly.",
            "Needed replacement keys made and was impressed by the quality and speed of service. Highly recommend.",
            "Fast and reliable key replacement. The technician was professional and the new keys work better than the originals.",
            "Excellent key cutting service. They had the right blanks and created perfect working keys in minutes."
        ]
    },
    "Lock Installation": {
        templates: [
            "Professional lock installation service that enhanced my home security. Quality hardware and expert installation.",
            "Had new locks installed and was impressed by the quality of work. Professional installation with attention to detail.",
            "Excellent lock installation service. They recommended the right locks for my needs and installed them perfectly.",
            "Quality lock installation with professional service throughout. The new locks work smoothly and look great.",
            "Professional installation of new locks with expert advice on the best options for my security needs."
        ]
    },
    "House Lockout": {
        templates: [
            "Locked out of my house and they responded quickly to get me back inside. Professional service with no damage to my door.",
            "Called for house lockout assistance and received prompt, professional service. Fair pricing and quick resolution.",
            "Excellent residential lockout service. The technician was skilled and got me back into my home safely and quickly.",
            "Professional house lockout service with fast response time. They handled everything efficiently and courteously.",
            "Got locked out and needed immediate help. They arrived quickly and resolved the issue without any problems."
        ]
    },
    "Business Lockout": {
        templates: [
            "Locked out of my business and needed immediate access. Professional commercial service with quick response time.",
            "Excellent business lockout service that minimized downtime. Professional technicians who understand commercial needs.",
            "Called for commercial lockout assistance and received fast, professional service. They got us back to business quickly.",
            "Professional business locksmith service. They handled our commercial lockout efficiently and securely.",
            "Reliable commercial lockout service with technicians who understand business urgency. Quick and professional."
        ]
    },
    "Car Lockout": {
        templates: [
            "Locked my keys in the car and they came right away to help. Professional automotive service with no damage.",
            "Excellent car lockout service with fast response time. They got me back on the road quickly and safely.",
            "Professional automotive locksmith who handled my car lockout efficiently. Fair pricing and quality service.",
            "Called for car lockout help and received prompt, professional service. They opened my car safely and quickly.",
            "Reliable automotive locksmith service. They resolved my car lockout professionally and at a fair price."
        ]
    },
    "Key Programming": {
        templates: [
            "Needed a new car key programmed and they handled it perfectly. Professional automotive service with quality results.",
            "Excellent key programming service for my vehicle. They had the right equipment and expertise to get it done.",
            "Professional car key programming with same-day service. The new key works flawlessly and pricing was fair.",
            "Had my car key programmed professionally. Quick service with quality results and competitive pricing.",
            "Reliable automotive key programming service. They programmed my new key perfectly and tested it thoroughly."
        ]
    },
    "Master Key System": {
        templates: [
            "Installed a master key system for my business and was impressed by their professional approach and quality work.",
            "Excellent master key system installation. They designed a system that perfectly fits our business security needs.",
            "Professional master key service that enhanced our business security. Quality workmanship and fair pricing.",
            "Had a master key system installed and the service was outstanding. Professional installation with expert advice.",
            "Reliable commercial locksmith who installed our master key system efficiently and professionally."
        ]
    },
    "Access Control": {
        templates: [
            "Professional access control system installation that improved our business security significantly. Quality service throughout.",
            "Excellent access control service with modern technology and professional installation. Highly recommend for businesses.",
            "Had an access control system installed and was impressed by the quality of work and professional service.",
            "Professional access control installation with ongoing support. They delivered exactly what our business needed.",
            "Quality access control system with expert installation. Professional service that enhanced our business security."
        ]
    }
};

// Generate contextual review content
function generateReviewContent(serviceTag, city, isServiceArea = false) {
    const templates = reviewTemplates[serviceTag];
    if (!templates) {
        return `Professional ${serviceTag.toLowerCase()} service with excellent results. Quick response and fair pricing.`;
    }

    const baseTemplate = templates.templates[Math.floor(Math.random() * templates.templates.length)];

    // Add city context for service area pages
    if (isServiceArea && city) {
        const cityContext = ` Great local service in ${city}.`;
        return baseTemplate + cityContext;
    }

    return baseTemplate;
}

// Generate perfect review JSON for service area pages
function generateServiceAreaReviews(city) {
    const serviceTagsForArea = serviceTags.serviceAreas;
    const usedCustomers = new Set();
    const reviews = [];

    // Get 6 unique customers for this city
    const availableCustomers = customerDatabase.filter(customer => !usedCustomers.has(customer.name));

    for (let i = 0; i < 6 && i < serviceTagsForArea.length; i++) {
        const customer = availableCustomers[Math.floor(Math.random() * availableCustomers.length)];
        usedCustomers.add(customer.name);

        const serviceTag = serviceTagsForArea[i];
        const reviewContent = generateReviewContent(serviceTag, city, true);

        reviews.push({
            "@context": "https://schema.org",
            "@type": "Review",
            "@id": `https://ilocksmithindiana.com/service-areas/locksmith-${city.toLowerCase().replace(' ', '-')}-indiana#review-${customer.name.toLowerCase().replace(/[^a-z]/g, '-')}`,
            "itemReviewed": {
                "@type": "LocalBusiness",
                "name": `I Locksmith - ${city}`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": city,
                    "addressRegion": "IN"
                }
            },
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
            },
            "author": {
                "@type": "Person",
                "name": customer.name
            },
            "datePublished": `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
            "reviewBody": reviewContent,
            "publisher": {
                "@type": "Organization",
                "name": "I Locksmith"
            }
        });

        // Remove used customer from available pool
        const customerIndex = availableCustomers.findIndex(c => c.name === customer.name);
        if (customerIndex > -1) {
            availableCustomers.splice(customerIndex, 1);
        }
    }

    return reviews;
}

module.exports = { generateServiceAreaReviews, generateReviewContent, reviewTemplates };