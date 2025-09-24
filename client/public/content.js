console.log('🔥 Opal Auction Tracker Extension loaded!');

// Initialize the tracker URL from localStorage or use default
let trackerUrl = localStorage.getItem('opalTrackerUrl') || 
  (window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://facebook-group-auction-tracker-app.onrender.com');

// Function to validate a host is allowed
function isValidHost(url) {
  const allowedHosts = [
    'facebook.com',
    'www.facebook.com',
    'localhost',
    'facebook-group-auction-tracker-app.onrender.com'
  ];
  try {
    const hostname = new URL(url).hostname;
    return allowedHosts.some(host => hostname.includes(host));
  } catch (e) {
    return false;
  }
}

// Validate current host
if (!isValidHost(window.location.href)) {
  console.log('❌ Host not supported:', window.location.hostname);
  throw new Error('Host not supported');
}

console.log('✅ Host validation passed:', window.location.hostname);
console.log('🌐 Using tracker URL:', trackerUrl);

// Initialize extension
async function initializeExtension() {
  try {
    // Test connection to tracker
    const response = await fetch(`${trackerUrl}/api/health`);
    if (!response.ok) throw new Error('Tracker health check failed');
    
    console.log('✅ Connected to tracker successfully');
    
    // If we're on Facebook, start monitoring
    if (window.location.hostname.includes('facebook.com')) {
      console.log('📊 Starting Facebook monitoring...');
      // Your Facebook monitoring code will go here
    }
    
  } catch (error) {
    console.error('❌ Extension initialization failed:', error);
  }
}

// Start the extension
initializeExtension();