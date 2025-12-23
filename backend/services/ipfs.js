const pinataSDK = require('pinata-sdk');
const fs = require('fs');
const path = require('path');

class IPFSService {
    constructor() {
        this.pinata = new pinataSDK(
            process.env.PINATA_API_KEY,
            process.env.PINATA_SECRET_API_KEY
        );
        this.testConnection();
    }

    async testConnection() {
        try {
            await this.pinata.testAuthentication();
            console.log('✅ IPFS (Pinata) connection successful');
        } catch (error) {
            console.error('❌ IPFS (Pinata) connection failed:', error.message);
        }
    }

    /**
     * Upload file buffer to IPFS
     * @param {Buffer} fileBuffer - File buffer
     * @param {Object} metadata - File metadata
     * @returns {Promise<Object>} IPFS upload result
     */
    async uploadFile(fileBuffer, metadata = {}) {
        try {
            const options = {
                pinataMetadata: {
                    name: metadata.name || `voucher-${Date.now()}`,
                    keyvalues: {
                        type: metadata.type || 'voucher-image',
                        uploadedAt: new Date().toISOString(),
                        originalName: metadata.originalName || 'unknown',
                        size: fileBuffer.length.toString(),
                        ...metadata.customData
                    }
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            const result = await this.pinata.pinFileToIPFS(fileBuffer, options);

            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp,
                gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
                metadata: options.pinataMetadata
            };
        } catch (error) {
            console.error('IPFS upload error:', error);
            throw new Error(`Failed to upload to IPFS: ${error.message}`);
        }
    }

    /**
     * Upload JSON metadata to IPFS
     * @param {Object} jsonData - JSON data to upload
     * @param {Object} metadata - Metadata for the JSON file
     * @returns {Promise<Object>} IPFS upload result
     */
    async uploadJSON(jsonData, metadata = {}) {
        try {
            const options = {
                pinataMetadata: {
                    name: metadata.name || `metadata-${Date.now()}`,
                    keyvalues: {
                        type: 'json-metadata',
                        uploadedAt: new Date().toISOString(),
                        ...metadata.customData
                    }
                },
                pinataOptions: {
                    cidVersion: 0
                }
            };

            const result = await this.pinata.pinJSONToIPFS(jsonData, options);

            return {
                success: true,
                ipfsHash: result.IpfsHash,
                pinSize: result.PinSize,
                timestamp: result.Timestamp,
                gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
                metadata: options.pinataMetadata
            };
        } catch (error) {
            console.error('IPFS JSON upload error:', error);
            throw new Error(`Failed to upload JSON to IPFS: ${error.message}`);
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

            return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        } catch (error) {
            console.error('IPFS get file error:', error);
            throw new Error(`Failed to get file from IPFS: ${error.message}`);
        }
    }

    /**
     * Unpin file from IPFS (delete)
     * @param {string} ipfsHash - IPFS hash to unpin
     * @returns {Promise<Object>} Unpin result
     */
    async unpinFile(ipfsHash) {
        try {
            await this.pinata.unpin(ipfsHash);
            return {
                success: true,
                message: `File ${ipfsHash} unpinned successfully`
            };
        } catch (error) {
            console.error('IPFS unpin error:', error);
            throw new Error(`Failed to unpin file from IPFS: ${error.message}`);
        }
    }

    /**
     * List pinned files
     * @param {Object} filters - Filters for listing files
     * @returns {Promise<Array>} List of pinned files
     */
    async listFiles(filters = {}) {
        try {
            const result = await this.pinata.pinList(filters);
            return {
                success: true,
                files: result.rows,
                count: result.count
            };
        } catch (error) {
            console.error('IPFS list files error:', error);
            throw new Error(`Failed to list files from IPFS: ${error.message}`);
        }
    }
}

module.exports = new IPFSService();