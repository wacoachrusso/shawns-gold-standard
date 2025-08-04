// This script dynamically adds a version query parameter to CSS and JS files
// It forces browsers to load the newest version of the files when they change

document.addEventListener('DOMContentLoaded', function() {
    // Current timestamp to use as version parameter
    const version = new Date().getTime();
    
    // Update CSS link tags with version parameter
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    cssLinks.forEach(link => {
        if (link.href.indexOf('?') === -1) {
            link.href = link.href + '?v=' + version;
        } else {
            link.href = link.href + '&v=' + version;
        }
    });
    
    // Update JS script tags with version parameter
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        if (script.src.indexOf('?') === -1) {
            script.src = script.src + '?v=' + version;
        } else {
            script.src = script.src + '&v=' + version;
        }
    });
    
    // Add meta tags to prevent caching
    const meta1 = document.createElement('meta');
    meta1.httpEquiv = 'Cache-Control';
    meta1.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(meta1);
    
    const meta2 = document.createElement('meta');
    meta2.httpEquiv = 'Pragma';
    meta2.content = 'no-cache';
    document.head.appendChild(meta2);
    
    const meta3 = document.createElement('meta');
    meta3.httpEquiv = 'Expires';
    meta3.content = '0';
    document.head.appendChild(meta3);
    
    console.log('Cache control implemented. Resources versioned with: ' + version);
});
