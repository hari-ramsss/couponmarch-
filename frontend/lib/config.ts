// API Configuration
export const API_CONFIG = {
    // Backend API base URL (now integrated into Next.js)
    BASE_URL: '', // process.env.NEXT_PUBLIC_API_URL || '', suka lol

    // API endpoints (now Next.js API routes)
    ENDPOINTS: {
        UPLOAD_LOGO: '/api/upload/voucher-logo',
        UPLOAD_VOUCHER_IMAGE: '/api/upload/voucher-image',
        UPLOAD_METADATA: '/api/upload/voucher-metadata',
        IPFS_GET: '/api/ipfs',
        HEALTH: '/api/health'
    }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
    // If BASE_URL is empty, use relative paths (same domain)
    if (!API_CONFIG.BASE_URL) {
        return endpoint;
    }
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
    try {

        let response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Backend health check failed:', error);
        return false;
    }
};