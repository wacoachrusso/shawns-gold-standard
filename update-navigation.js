// Script to add navigation loader to all HTML pages
const fs = require('fs');
const path = require('path');

// Pages directory
const pagesDir = path.join(__dirname, 'pages');

// Get all HTML files in the pages directory
const htmlFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.html'));

// Process each HTML file
htmlFiles.forEach(file => {
    if (file !== 'quote.html') { // Already processed quote.html
        const filePath = path.join(pagesDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if the navigation loader is already added
        if (!content.includes('/js/navigation-loader.js')) {
            // Add navigation loader before the closing head tag
            content = content.replace(
                '</head>',
                '    \n    <!-- Navigation loader script -->\n    <script src="/js/navigation-loader.js"></script>\n</head>'
            );
            
            // Write the updated content back to the file
            fs.writeFileSync(filePath, content);
            console.log(`Added navigation loader to ${file}`);
        } else {
            console.log(`Navigation loader already exists in ${file}`);
        }
    }
});

console.log('Navigation loader added to all HTML pages');
