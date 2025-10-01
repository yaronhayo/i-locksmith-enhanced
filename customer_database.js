// Perfect Customer Database for I Locksmith Review System
// 60+ unique customers with varied demographics

const customerDatabase = [
    // American Traditional Names (Male)
    { name: "Michael J.", demographic: "traditional-male" },
    { name: "David R.", demographic: "traditional-male" },
    { name: "James W.", demographic: "traditional-male" },
    { name: "William T.", demographic: "traditional-male" },
    { name: "Richard M.", demographic: "traditional-male" },
    { name: "Charles B.", demographic: "traditional-male" },
    { name: "Steven C.", demographic: "traditional-male" },
    { name: "Kenneth L.", demographic: "traditional-male" },

    // American Traditional Names (Female)
    { name: "Linda S.", demographic: "traditional-female" },
    { name: "Patricia H.", demographic: "traditional-female" },
    { name: "Barbara K.", demographic: "traditional-female" },
    { name: "Susan D.", demographic: "traditional-female" },
    { name: "Dorothy G.", demographic: "traditional-female" },
    { name: "Nancy F.", demographic: "traditional-female" },
    { name: "Betty Lou W.", demographic: "traditional-female" },
    { name: "Carol Ann P.", demographic: "traditional-female" },

    // Modern American Names (Male)
    { name: "Tyler B.", demographic: "modern-male" },
    { name: "Brandon K.", demographic: "modern-male" },
    { name: "Austin M.", demographic: "modern-male" },
    { name: "Jordan R.", demographic: "modern-male" },
    { name: "Logan T.", demographic: "modern-male" },
    { name: "Hunter S.", demographic: "modern-male" },
    { name: "Mason C.", demographic: "modern-male" },
    { name: "Ethan L.", demographic: "modern-male" },

    // Modern American Names (Female)
    { name: "Ashley N.", demographic: "modern-female" },
    { name: "Jessica V.", demographic: "modern-female" },
    { name: "Brittany M.", demographic: "modern-female" },
    { name: "Samantha K.", demographic: "modern-female" },
    { name: "Amanda R.", demographic: "modern-female" },
    { name: "Kayla D.", demographic: "modern-female" },
    { name: "Megan P.", demographic: "modern-female" },
    { name: "Taylor J.", demographic: "modern-female" },

    // Hispanic/Latino Names
    { name: "Carlos M.", demographic: "hispanic-male" },
    { name: "Miguel R.", demographic: "hispanic-male" },
    { name: "Antonio L.", demographic: "hispanic-male" },
    { name: "Roberto S.", demographic: "hispanic-male" },
    { name: "Maria Elena G.", demographic: "hispanic-female" },
    { name: "Carmen R.", demographic: "hispanic-female" },
    { name: "Isabella C.", demographic: "hispanic-female" },
    { name: "Sofia V.", demographic: "hispanic-female" },

    // European Heritage Names
    { name: "Giovanni B.", demographic: "italian-male" },
    { name: "François D.", demographic: "french-male" },
    { name: "Klaus H.", demographic: "german-male" },
    { name: "Stanisław K.", demographic: "polish-male" },
    { name: "Giuseppe R.", demographic: "italian-male" },
    { name: "Amélie L.", demographic: "french-female" },
    { name: "Ingrid N.", demographic: "german-female" },
    { name: "Katarzyna M.", demographic: "polish-female" },

    // Business Owners (Initial Format)
    { name: "J. Mitchell", demographic: "business-male" },
    { name: "R. Thompson", demographic: "business-male" },
    { name: "P. Anderson", demographic: "business-male" },
    { name: "S. Williams", demographic: "business-female" },
    { name: "K. Johnson", demographic: "business-female" },
    { name: "M. Davis", demographic: "business-female" },

    // Diverse Additional Names
    { name: "Priya P.", demographic: "indian-female" },
    { name: "Wei L.", demographic: "asian-male" },
    { name: "Aisha J.", demographic: "african-female" },
    { name: "Kwame B.", demographic: "african-male" },
    { name: "Yuki T.", demographic: "japanese-female" },
    { name: "Omar A.", demographic: "middle-eastern-male" },
    { name: "Fatima H.", demographic: "middle-eastern-female" },
    { name: "Dmitri V.", demographic: "russian-male" },
    { name: "Svetlana K.", demographic: "russian-female" },
    { name: "Lars E.", demographic: "scandinavian-male" },
    { name: "Astrid O.", demographic: "scandinavian-female" },

    // Additional Unique Names for Complete Coverage
    { name: "Trevor F.", demographic: "modern-male" },
    { name: "Caleb W.", demographic: "modern-male" },
    { name: "Zachary G.", demographic: "modern-male" },
    { name: "Brooke H.", demographic: "modern-female" },
    { name: "Chloe M.", demographic: "modern-female" },
    { name: "Grace L.", demographic: "modern-female" }
];

// Service Tag Definitions for Perfect Alignment
const serviceTags = {
    serviceAreas: [
        "Emergency Lockout",
        "Lock Rekey",
        "Key Replacement",
        "Lock Installation",
        "House Lockout",
        "Business Lockout"
    ],
    residential: [
        "House Lockout",
        "Lock Rekey",
        "Door Lock Installation",
        "Home Security",
        "Residential Key Service",
        "Lock Repair"
    ],
    commercial: [
        "Business Lockout",
        "Master Key System",
        "Access Control",
        "Office Locks",
        "Security Installation",
        "Commercial Keys"
    ],
    automotive: [
        "Car Lockout",
        "Key Replacement",
        "Key Programming",
        "Car Key Cutting",
        "Ignition Repair",
        "Transponder Keys"
    ],
    mainPages: [
        "Emergency Lockout",
        "Residential Service",
        "Commercial Service",
        "Automotive Service",
        "Security Installation",
        "Key Services"
    ]
};

// City-specific service areas
const cities = [
    "South Bend", "Mishawaka", "Granger", "Goshen", "Bremen",
    "New Carlisle", "North Liberty", "Wakarusa", "Osceola", "Elkhart"
];

module.exports = { customerDatabase, serviceTags, cities };