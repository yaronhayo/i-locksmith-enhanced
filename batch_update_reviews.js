const fs = require('fs');
const path = require('path');

// City files to update
const cityFiles = {
    'goshen': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-goshen-indiana.html',
    'bremen': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-bremen-indiana.html',
    'new_carlisle': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-new-carlisle-indiana.html',
    'north_liberty': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-north-liberty-indiana.html',
    'wakarusa': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-wakarusa-indiana.html',
    'osceola': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-osceola-indiana.html',
    'elkhart': '/Users/yaronhayo/Desktop/I Locksmith 2025/i-locksmith/service-areas/locksmith-elkhart-indiana.html'
};

function processFile(cityKey, filePath) {
    try {
        // Read the review file
        const reviewFile = `${cityKey}_perfect_reviews.json`;
        const reviewData = JSON.parse(fs.readFileSync(reviewFile, 'utf8'));

        // Read the HTML file
        const htmlContent = fs.readFileSync(filePath, 'utf8');

        // Check if the file already has review schema
        if (htmlContent.includes('Customer Reviews Schema')) {
            console.log(`${cityKey}: File already has review schema, skipping.`);
            return;
        }

        // Create the review schema section
        const cityName = cityKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const reviewSchema = `
    <!-- Customer Reviews Schema for ${cityName} -->
    <script type="application/ld+json">
    ${JSON.stringify(reviewData, null, 8)}
    </script>`;

        // Insert before </head>
        const updatedContent = htmlContent.replace('</head>', `${reviewSchema}\n</head>`);

        // Write the updated file
        fs.writeFileSync(filePath, updatedContent);
        console.log(`${cityKey}: Successfully added review schema`);

    } catch (error) {
        console.error(`${cityKey}: Error -`, error.message);
    }
}

// Process all files
for (const [cityKey, filePath] of Object.entries(cityFiles)) {
    processFile(cityKey, filePath);
}

console.log('Batch update completed!');