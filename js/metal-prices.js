// Live Precious Metal Price Widget
document.addEventListener('DOMContentLoaded', function() {
    // Check if the metal prices container exists on the page
    const metalPricesContainer = document.getElementById('metal-prices-container');
    if (!metalPricesContainer) return;
    
    // Function to format currency
    function formatCurrency(number) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(number);
    }
    
    // Function to show a loading state
    function showLoading() {
        metalPricesContainer.innerHTML = `
            <div class="metal-prices-header">
                <h3>Live Precious Metal Prices</h3>
                <span class="update-time">Loading latest prices...</span>
            </div>
            <div class="metal-prices-loading">
                <div class="spinner"></div>
            </div>
        `;
    }
    
    // Function to update the display with new prices
    function updatePricesDisplay(data) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const dateString = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        metalPricesContainer.innerHTML = `
            <div class="metal-prices-header">
                <h3>Live Precious Metal Prices</h3>
                <span class="update-time">Last updated: ${timeString} - ${dateString}</span>
            </div>
            <div class="metal-prices-grid">
                <div class="metal-price gold">
                    <div class="metal-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="metal-info">
                        <span class="metal-name">Gold</span>
                        <span class="price">${formatCurrency(data.gold)} USD/oz</span>
                    </div>
                </div>
                <div class="metal-price silver">
                    <div class="metal-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="metal-info">
                        <span class="metal-name">Silver</span>
                        <span class="price">${formatCurrency(data.silver)} USD/oz</span>
                    </div>
                </div>
                <div class="metal-price platinum">
                    <div class="metal-icon">
                        <i class="fas fa-coins"></i>
                    </div>
                    <div class="metal-info">
                        <span class="metal-name">Platinum</span>
                        <span class="price">${formatCurrency(data.platinum)} USD/oz</span>
                    </div>
                </div>
                <div class="metal-price diamonds">
                    <div class="metal-icon">
                        <i class="fas fa-gem"></i>
                    </div>
                    <div class="metal-info">
                        <span class="metal-name">Diamonds</span>
                        <span class="price">Market Value Varies</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Function to fetch prices from an API
    async function fetchPrices() {
        showLoading();
        
        try {
            // Since we don't want to expose API keys in client-side code,
            // we'll use a free public API or simulate prices for demonstration
            // In production, you'd use a server-side API call or a reliable provider with proper authentication
            
            // For demonstration, using a basic free API or simulated data
            // const response = await fetch('https://api.metals.dev/v1/latest');
            // const data = await response.json();
            
            // Simulated data for demonstration
            // In production, replace with actual API call
            const simulatedData = {
                gold: 2157.30 + (Math.random() * 10 - 5),    // ~$2157/oz with some variation
                silver: 27.35 + (Math.random() * 0.5 - 0.25), // ~$27/oz with some variation
                platinum: 938.80 + (Math.random() * 5 - 2.5)  // ~$938/oz with some variation
            };
            
            updatePricesDisplay(simulatedData);
            
            // Update prices every 5 minutes
            setTimeout(fetchPrices, 5 * 60 * 1000);
            
        } catch (error) {
            console.error('Error fetching metal prices:', error);
            metalPricesContainer.innerHTML = `
                <div class="metal-prices-header">
                    <h3>Precious Metal Prices</h3>
                    <span class="update-time">Could not load latest prices</span>
                </div>
                <div class="metal-prices-error">
                    <p>Please call us for the most current pricing.</p>
                </div>
            `;
        }
    }
    
    // Initial fetch
    fetchPrices();
});
