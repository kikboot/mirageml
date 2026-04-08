window.API_BASE_URL = (() => {
    if (window.API_URL) return window.API_URL;
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
        return 'http://localhost:3001';
    }
    return 'https://mirageml.onrender.com';
})();

window.API_CONFIG = { baseUrl: window.API_BASE_URL };
window.API_URL = window.API_BASE_URL;

function getApiUrl(path) {
    return `${API_BASE_URL}${path}`;
}

if (typeof window.originalFetch === 'undefined') {
    window.originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        if (typeof url === 'string') {
            url = url.replace(/https?:\/\/localhost:3001/g, window.API_BASE_URL);
        }
        return window.originalFetch.call(this, url, options);
    };
}