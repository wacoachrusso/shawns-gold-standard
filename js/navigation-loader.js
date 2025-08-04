// Navigation loader - ensures consistent navigation across all pages
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Add the navbar-fixes CSS to the document head
        const navbarCSS = document.createElement('link');
        navbarCSS.rel = 'stylesheet';
        navbarCSS.href = '/styles/navbar-fixes.css';
        document.head.appendChild(navbarCSS);
        
        // Add tablet-fixes CSS to the document head
        const tabletCSS = document.createElement('link');
        tabletCSS.rel = 'stylesheet';
        tabletCSS.href = '/styles/tablet-fixes.css';
        document.head.appendChild(tabletCSS);
        
        // Load the cache control script
        const cacheScript = document.createElement('script');
        cacheScript.src = '/js/cache-control.js';
        document.head.appendChild(cacheScript);
        
        // Find the header element that needs to be replaced
        const existingHeader = document.querySelector('header');
        
        if (existingHeader) {
            // Fetch the navigation template
            const response = await fetch('/includes/navigation.html');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch navigation template: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Replace the existing header with the standardized navigation
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = html;
            
            // Extract the header element and its contents
            const newHeader = tempContainer.querySelector('header');
            const newHeaderScript = tempContainer.querySelector('script');
            
            // Replace the existing header with the new one
            existingHeader.parentNode.replaceChild(newHeader, existingHeader);
            
            // Execute the script for active page highlighting
            const scriptElement = document.createElement('script');
            scriptElement.textContent = newHeaderScript.textContent;
            document.body.appendChild(scriptElement);
            
            // Load the hamburger menu functionality
            const hamburgerScript = document.createElement('script');
            hamburgerScript.src = '/js/hamburger-menu.js';
            document.body.appendChild(hamburgerScript);
            
            console.log('Navigation loaded successfully');
        } else {
            console.error('Could not find header element to replace');
        }
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
});
