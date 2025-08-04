// Hamburger menu functionality
(function() {
    // Execute immediately rather than waiting for DOMContentLoaded
    function initHamburger() {
        // Ensure all necessary elements exist
        const hamburgerBtn = document.getElementById('hamburger-menu');
        const navLinks = document.getElementById('nav-links');
        
        if (!hamburgerBtn || !navLinks) {
            // If elements aren't found, try again in a moment
            console.log('Hamburger elements not found, retrying...');
            setTimeout(initHamburger, 100); 
            return;
        }
        
        console.log('Hamburger menu initialized');
        
        // Toggle mobile menu when hamburger is clicked
        hamburgerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            navLinks.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
            console.log('Hamburger clicked, menu toggled');
        });
        
        // Close menu when a nav link is clicked
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLinks.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                e.target !== hamburgerBtn && 
                !hamburgerBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            }
        });
    }
    
    // Try to initialize immediately
    initHamburger();
    
    // Also try when DOM is fully loaded as a backup
    document.addEventListener('DOMContentLoaded', initHamburger);
})();
