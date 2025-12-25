const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
    constructor() {
        // Pinata API configuration
        this.pinataApiUrl = 'https://api.pinata.cloud';
        this.pinataGateway = 'https://gateway.pinata.cloud/ipfs';

        // JWT token from environment
        this.jwt = process.env.PINATA_JWT;

        if (!this.jwt || this.jwt === 'your_pinata_jwt_token_here') {
            console.error('❌ PINATA_JWT environment variable is not configured');
            console.error('📋 Setup steps:');
            console.error('   1. Go to https://app.pinata.cloud/keys');
            console.error('   2. Create a new API key');
            console.error('   3. Copy the JWT token');
            console.error('   4. Add to backend/.env: PINATA_JWT=your_jwt_token');
            console.error('   5. Restart the server');

            // In development, allow server to start but mark as disabled
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️  Running in development mode without valid Pinata JWT');
                console.warn('⚠️  IPFS uploads will fail until JWT is configured');
                this.jwt = null;
                this.disabled = true;
            } else {
                throw new Error('PINATA_JWT environment variable is required in production');
            }
        }

        // Configure axios instance with default headers (if JWT is available)
        if (this.jwt && !this.disabled) {
            this.axiosInstance = axios.create({
                baseURL: this.pinataApiUrl,
                headers: {
                    'Authorization': `Bearer ${this.jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            this.testConnection();
        } else {
            console.warn('⚠️  IPFS service disabled - no valid JWT token');
        }
    }

    async testConnection() {
        try {
            const response = await this.axiosInstance.get('/data/testAuthentication');
            if (response.data.message === 'Congratulations! You are communicating with the Pinata API!') {
                console.log('✅ IPFS (Pinata REST API) connection successful');
            }
        } catch (error) {
            console.error('❌ IPFS (Pinata REST API) connection failed:', error.response?.data || error.message);
        }
    }

    /**
     * Check if IPFS service is available
     * @returns {boolean} True if service is available
     */
    isAvailable() {
        return !this.disabled && this.jwt && this.axiosInstance;
    }

    /**
     * Throw error if service is not available
     */
    checkAvailability() {
        if (!this.isAvailable()) {
            throw new Error('IPFS service is not available. Please configure PINATA_JWT in .env file.');
        }
    }

    /**
     * Upload file buffer to IPFS using Pinata REST API
     * @param {Buffer} fileBuffer - File buffer
     * @param {Object} metadata - File metadata
     * @returns {Promise<Object>} IPFS upload result
     */
    async uploadFile(fileBuffer, metadata = {}) {
        try {
            this.checkAvailability();

            // Create FormData for file upload
            const formData = new FormData();

            // Add file buffer
            formData.append('file', fileBuffer, {
                filename: metadata.originalName || `file-${Date.now()}`,
                contentType: this.getContentType(metadata.originalName)
            });

            // Prepare pinata metadata
            const pinataMetadata = {
                name: metadata.name || `voucher-${Date.now()}`,
                keyvalues: {
                    type: metadata.type || 'voucher-image',
                    uploadedAt: new Date().toISOString(),
                    originalName: metadata.originalName || 'unknown',
                    size: fileBuffer.length.toString(),
                    ...metadata.customData
                }
            };

            // Add metadata to form
            formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

            // Pinata options
            const pinataOptions = {
                cidVersion: 0
            };
            formData.append('pinataOptions', JSON.stringify(pinataOptions));

            // Upload to Pinata
            const response = await axios.post(`${this.pinataApiUrl}/pinning/pinFileToIPFS`, formData, {
                headers: {
                    'Authorization': `Bearer ${this.jwt}`,
                    ...formData.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            });

            const result = response.data;

            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp,
                gatewayUrl: `${this.pinataGateway}/${result.IpfsHash}`,
                metadata: pinataMetadata
            };

        } catch (error) {
            console.error('IPFS upload error:', error.response?.data || error.message);
            throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Upload JSON metadata to IPFS using Pinata REST API
     * @param {Object} jsonData - JSON data to upload
     * @param {Object} metadata - Metadata for the JSON file
     * @returns {Promise<Object>} IPFS upload result
     */
    async uploadJSON(jsonData, metadata = {}) {
        try {
            this.checkAvailability();

            // Prepare pinata metadata
            const pinataMetadata = {
                name: metadata.name || `metadata-${Date.now()}`,
                keyvalues: {
                    type: 'json-metadata',
                    uploadedAt: new Date().toISOString(),
                    dataType: 'voucher-metadata',
                    ...metadata.customData
                }
            };

            // Pinata options
            const pinataOptions = {
                cidVersion: 0
            };

            // Prepare request body
            const requestBody = {
                pinataContent: jsonData,
                pinataMetadata: pinataMetadata,
                pinataOptions: pinataOptions
            };

            // Upload JSON to Pinata
            const response = await this.axiosInstance.post('/pinning/pinJSONToIPFS', requestBody);
            const result = response.data;

            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp,
                gatewayUrl: `${this.pinataGateway}/${result.IpfsHash}`,
                metadata: pinataMetadata
            };

        } catch (error) {
            console.error('IPFS JSON upload error:', error.response?.data || error.message);
            throw new Error(`Failed to upload JSON to IPFS: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get file from IPFS
     * @param {string} ipfsHash - IPFS hash
     * @returns {Promise<string>} Gateway URL
     */
    async getFile(ipfsHash) {
        try {
            // Validate IPFS hash format
            if (!ipfsHash || typeof ipfsHash !== 'string') {
                throw new Error('Invalid IPFS hash');
            }

            // Basic IPFS hash validation (starts with Qm or baf)
            if (!ipfsHash.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{56})$/)) {
                throw new Error('Invalid IPFS hash format');
            }

            return `${this.pinataGateway}/${ipfsHash}`;
        } catch (error) {
            console.error('IPFS get file error:', error);
            throw new Error(`Failed to get file from IPFS: ${error.message}`);
        }
    }

    /**
     * Unpin file from IPFS using Pinata REST API
     * @param {string} ipfsHash - IPFS hash to unpin
     * @returns {Promise<Object>} Unpin result
     */
    async unpinFile(ipfsHash) {
        try {
            this.checkAvailability();

            await this.axiosInstance.delete(`/pinning/unpin/${ipfsHash}`);

            return {
                success: true,
                message: `File ${ipfsHash} unpinned successfully`
            };
        } catch (error) {
            console.error('IPFS unpin error:', error.response?.data || error.message);
            throw new Error(`Failed to unpin file from IPFS: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * List pinned files using Pinata REST API
     * @param {Object} filters - Filters for listing files
     * @returns {Promise<Object>} List of pinned files
     */
    async listFiles(filters = {}) {
        try {
            this.checkAvailability();

            // Build query parameters
            const params = {
                status: filters.status || 'pinned',
                pageLimit: Math.min(filters.pageLimit || 10, 1000),
                pageOffset: filters.pageOffset || 0
            };

            // Add metadata filters if provided
            if (filters.metadata) {
                params.metadata = JSON.stringify(filters.metadata);
            }

            const response = await this.axiosInstance.get('/data/pinList', { params });
            const result = response.data;

            return {
                success: true,
                files: result.rows || [],
                count: result.count || 0
            };
        } catch (error) {
            console.error('IPFS list files error:', error.response?.data || error.message);
            throw new Error(`Failed to list files from IPFS: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Get content type based on file extension
     * @param {string} filename - File name
     * @returns {string} Content type
     */
    getContentType(filename) {
        if (!filename) return 'application/octet-stream';

        const ext = filename.toLowerCase().split('.').pop();
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'json': 'application/json',
            'txt': 'text/plain'
        };

        return contentTypes[ext] || 'application/octet-stream';
    }

    /**
     * Get pin status for a specific IPFS hash
     * @param {string} ipfsHash - IPFS hash to check
     * @returns {Promise<Object>} Pin status
     */
    async getPinStatus(ipfsHash) {
        try {
            this.checkAvailability();

            const response = await this.axiosInstance.get('/data/pinList', {
                params: {
                    hashContains: ipfsHash,
                    status: 'pinned'
                }
            });

            const result = response.data;
            const pin = result.rows.find(row => row.ipfs_pin_hash === ipfsHash);

            return {
                success: true,
                isPinned: !!pin,
                pinData: pin || null
            };
        } catch (error) {
            console.error('IPFS pin status error:', error.response?.data || error.message);
            throw new Error(`Failed to get pin status: ${error.response?.data?.error || error.message}`);
        }
    }

    /**
     * Update metadata for a pinned file
     * @param {string} ipfsHash - IPFS hash
     * @param {Object} newMetadata - New metadata
     * @returns {Promise<Object>} Update result
     */
    async updateMetadata(ipfsHash, newMetadata) {
        try {
            this.checkAvailability();

            const requestBody = {
                ipfsPinHash: ipfsHash,
                name: newMetadata.name,
                keyvalues: newMetadata.keyvalues || {}
            };

            const response = await this.axiosInstance.put('/pinning/hashMetadata', requestBody);

            return {
                success: true,
                message: 'Metadata updated successfully',
                data: response.data
            };
        } catch (error) {
            console.error('IPFS metadata update error:', error.response?.data || error.message);
            throw new Error(`Failed to update metadata: ${error.response?.data?.error || error.message}`);
        }
    }
}

module.exports = new IPFSService();