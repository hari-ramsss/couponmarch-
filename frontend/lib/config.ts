// API Configuration
export const API_CONFIG = {
    // Backend API base URL
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',

    // API endpoints
    ENDPOINTS: {
        UPLOAD_LOGO: '/api/upload/voucher-logo',
        UPLOAD_VOUCHER_IMAGE: '/api/upload/voucher-image',
        UPLOAD_METADATA: '/api/upload/voucher-metadata',
        IPFS_GET: '/api/ipfs',
        HEALTH: '/health'
    }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if backend is available
export const checkBackendHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
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