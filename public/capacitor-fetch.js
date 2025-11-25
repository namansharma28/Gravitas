// Patch fetch for Capacitor to handle API calls
(function() {
  console.log('Capacitor fetch script loaded');
  console.log('Window.Capacitor exists:', !!window.Capacitor);
  
  if (window.Capacitor) {
    const originalFetch = window.fetch;
    // Determine the base URL based on the current location
    const currentHost = window.location.origin;
    const API_BASE_URL = currentHost;
    
    window.fetch = function(input, init) {
      console.log('Fetch called with:', input);
      
      // If it's a relative URL starting with /api/, prepend the base URL
      if (typeof input === 'string' && input.startsWith('/api/')) {
        const newUrl = API_BASE_URL + input;
        console.log('Redirecting API call from', input, 'to', newUrl);
        input = newUrl;
      }
      
      return originalFetch(input, init);
    };
    
    // Prevent links from opening in external browser
    // This keeps OAuth flow within the app
    document.addEventListener('click', function(e) {
      const target = e.target.closest('a');
      if (target && target.href) {
        const url = new URL(target.href, window.location.href);
        
        // If it's a same-origin link or OAuth callback, keep it in the app
        if (url.origin === window.location.origin || 
            url.pathname.includes('/api/auth/')) {
          e.preventDefault();
          window.location.href = target.href;
          console.log('Keeping navigation in app:', target.href);
        }
      }
    }, true);
    
    console.log('✅ Capacitor fetch interceptor initialized with base URL:', API_BASE_URL);
    console.log('✅ OAuth link handler initialized');
  } else {
    console.log('Not running in Capacitor, fetch interceptor not needed');
  }
})();
