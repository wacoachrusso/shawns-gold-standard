// Improved Hamburger Menu functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Hamburger menu fix loaded');
    
    // Get the hamburger menu button and nav links
    const hamburger = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');
    
    if (hamburger && navLinks) {
        console.log('Hamburger and nav elements found');
        
        // Function to toggle the menu
        function toggleMenu() {
            console.log('Toggling menu');
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        }
        
        // Add click event to hamburger menu
        hamburger.addEventListener('click', toggleMenu);
        
        // Close menu when clicking elsewhere
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navLinks.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
        
        // Close menu when clicking on a link (for mobile)
        const navLinkItems = navLinks.querySelectorAll('a');
        navLinkItems.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 992 && navLinks.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    } else {
        console.error('Hamburger menu or nav links not found');
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        }
    });
});
