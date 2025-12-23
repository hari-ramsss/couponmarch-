const express = require('express');
const router = express.Router();
const ipfsService = require('../services/ipfs');

/**
 * GET /api/ipfs/:hash
 * Get file URL from IPFS hash
 */
router.get('/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        if (!hash) {
            return res.status(400).json({
                success: false,
                error: 'IPFS hash is required'
            });
        }

        const gatewayUrl = await ipfsService.getFile(hash);

        res.json({
            success: true,
            data: {
                ipfsHash: hash,
                gatewayUrl: gatewayUrl
            }
        });

    } catch (error) {
        console.error('IPFS get file error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get file from IPFS',
            message: error.message
        });
    }
});

/**
 * GET /api/ipfs/list/files
 * List all pinned files (admin only - add auth middleware in production)
 */
router.get('/list/files', async (req, res) => {
    try {
        const { type, limit = 50, offset = 0 } = req.query;

        const filters = {
            status: 'pinned',
            pageLimit: Math.min(parseInt(limit), 100), // Max 100 items
            pageOffset: parseInt(offset)
        };

        // Filter by type if provided
        if (type) {
            filters.metadata = {
                keyvalues: {
                    type: {
                        value: type,
                        op: 'eq'
                    }
                }
            };
        }

        const result = await ipfsService.listFiles(filters);

        res.json({
            success: true,
            data: {
                files: result.files,
                count: result.count,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: result.files.length === parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('IPFS list files error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list files from IPFS',
            message: error.message
        });
    }
});

/**
 * DELETE /api/ipfs/:hash
 * Unpin file from IPFS (admin only - add auth middleware in production)
 */
router.delete('/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        if (!hash) {
            return res.status(400).json({
                success: false,
                error: 'IPFS hash is required'
            });
        }

        const result = await ipfsService.unpinFile(hash);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('IPFS unpin error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to unpin file from IPFS',
            message: error.message
        });
    }
});

/**
 * POST /api/ipfs/batch-upload
 * Upload multiple files at once
 */
router.post('/batch-upload', async (req, res) => {
    try {
        const { files } = req.body;

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Files array is required'
            });
        }

        const uploadPromises = files.map(async (fileData, index) => {
            try {
                // Assuming fileData contains base64 encoded file
                const buffer = Buffer.from(fileData.data, 'base64');

                return await ipfsService.uploadFile(buffer, {
                    name: fileData.name || `batch-file-${index}`,
                    type: fileData.type || 'batch-upload',
                    originalName: fileData.originalName || `file-${index}`,
                    customData: {
                        batchIndex: index,
                        batchId: req.body.batchId || Date.now().toString()
                    }
                });
            } catch (error) {
                return {
                    success: false,
                    error: error.message,
                    index
                };
            }
        });

        const results = await Promise.all(uploadPromises);

        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);

        res.json({
            success: true,
            data: {
                successful: successful.length,
                failed: failed.length,
                results: results
            }
        });

    } catch (error) {
        console.error('Batch upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to batch upload files',
            message: error.message
        });
    }
});

module.exports = router;