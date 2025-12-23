const express = require('express');
const router = express.Router();
const { uploadSingle, requireFile } = require('../middleware/fileValidation');
const ipfsService = require('../services/ipfs');
const imageProcessingService = require('../services/imageProcessing');

/**
 * POST /api/upload/voucher-logo
 * Upload voucher logo/banner image
 */
router.post('/voucher-logo', uploadSingle('logo'), requireFile, async (req, res) => {
    try {
        const { file } = req;
        const { uploadId } = req;

        console.log(`📤 Processing logo upload: ${uploadId}`);

        // Validate image
        const validation = await imageProcessingService.validateImage(file.buffer);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid image',
                details: validation.errors
            });
        }

        // Process image (optimize and create thumbnail)
        const processedImages = await imageProcessingService.processImage(file.buffer, {
            createThumbnail: true,
            createBlurred: false, // Logo doesn't need blurring
            optimize: true
        });

        // Upload original to IPFS
        const originalUpload = await ipfsService.uploadFile(processedImages.images.original, {
            name: `logo-${uploadId}`,
            type: 'voucher-logo',
            originalName: file.originalname,
            customData: {
                uploadId,
                category: 'logo'
            }
        });

        // Upload thumbnail to IPFS
        const thumbnailUpload = await ipfsService.uploadFile(processedImages.images.thumbnail, {
            name: `logo-thumb-${uploadId}`,
            type: 'voucher-logo-thumbnail',
            originalName: `thumb_${file.originalname}`,
            customData: {
                uploadId,
                category: 'logo-thumbnail'
            }
        });

        console.log(`✅ Logo uploaded successfully: ${originalUpload.ipfsHash}`);

        res.json({
            success: true,
            data: {
                uploadId,
                original: {
                    ipfsHash: originalUpload.ipfsHash,
                    gatewayUrl: originalUpload.gatewayUrl,
                    size: originalUpload.pinSize
                },
                thumbnail: {
                    ipfsHash: thumbnailUpload.ipfsHash,
                    gatewayUrl: thumbnailUpload.gatewayUrl,
                    size: thumbnailUpload.pinSize
                },
                metadata: processedImages.metadata
            }
        });

    } catch (error) {
        console.error('Logo upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload logo',
            message: error.message
        });
    }
});

/**
 * POST /api/upload/voucher-image
 * Upload actual voucher image (will be blurred for marketplace)
 */
router.post('/voucher-image', uploadSingle('voucherImage'), requireFile, async (req, res) => {
    try {
        const { file } = req;
        const { uploadId } = req;

        console.log(`📤 Processing voucher image upload: ${uploadId}`);

        // Validate image
        const validation = await imageProcessingService.validateImage(file.buffer);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                error: 'Invalid image',
                details: validation.errors
            });
        }

        // Process image (optimize, create thumbnail, and blur for marketplace)
        const processedImages = await imageProcessingService.processImage(file.buffer, {
            createThumbnail: true,
            createBlurred: true, // Create blurred version for marketplace
            optimize: true
        });

        // Upload original (full resolution) to IPFS
        const originalUpload = await ipfsService.uploadFile(processedImages.images.original, {
            name: `voucher-${uploadId}`,
            type: 'voucher-image-original',
            originalName: file.originalname,
            customData: {
                uploadId,
                category: 'voucher-original'
            }
        });

        // Upload blurred version to IPFS (for marketplace display)
        const blurredUpload = await ipfsService.uploadFile(processedImages.images.blurred, {
            name: `voucher-blurred-${uploadId}`,
            type: 'voucher-image-blurred',
            originalName: `blurred_${file.originalname}`,
            customData: {
                uploadId,
                category: 'voucher-blurred'
            }
        });

        // Upload thumbnail to IPFS
        const thumbnailUpload = await ipfsService.uploadFile(processedImages.images.thumbnail, {
            name: `voucher-thumb-${uploadId}`,
            type: 'voucher-image-thumbnail',
            originalName: `thumb_${file.originalname}`,
            customData: {
                uploadId,
                category: 'voucher-thumbnail'
            }
        });

        console.log(`✅ Voucher image uploaded successfully: ${originalUpload.ipfsHash}`);

        res.json({
            success: true,
            data: {
                uploadId,
                original: {
                    ipfsHash: originalUpload.ipfsHash,
                    gatewayUrl: originalUpload.gatewayUrl,
                    size: originalUpload.pinSize
                },
                blurred: {
                    ipfsHash: blurredUpload.ipfsHash,
                    gatewayUrl: blurredUpload.gatewayUrl,
                    size: blurredUpload.pinSize
                },
                thumbnail: {
                    ipfsHash: thumbnailUpload.ipfsHash,
                    gatewayUrl: thumbnailUpload.gatewayUrl,
                    size: thumbnailUpload.pinSize
                },
                metadata: processedImages.metadata
            }
        });

    } catch (error) {
        console.error('Voucher image upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload voucher image',
            message: error.message
        });
    }
});

/**
 * POST /api/upload/metadata
 * Upload listing metadata as JSON to IPFS
 */
router.post('/metadata', async (req, res) => {
    try {
        const { metadata } = req.body;

        if (!metadata || typeof metadata !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid metadata',
                message: 'Metadata must be a valid JSON object'
            });
        }

        // Add timestamp and validation info
        const enrichedMetadata = {
            ...metadata,
            uploadedAt: new Date().toISOString(),
            version: '1.0',
            platform: 'CouponMarche'
        };

        // Upload metadata to IPFS
        const metadataUpload = await ipfsService.uploadJSON(enrichedMetadata, {
            name: `metadata-${Date.now()}`,
            customData: {
                type: 'listing-metadata',
                version: '1.0'
            }
        });

        console.log(`✅ Metadata uploaded successfully: ${metadataUpload.ipfsHash}`);

        res.json({
            success: true,
            data: {
                ipfsHash: metadataUpload.ipfsHash,
                gatewayUrl: metadataUpload.gatewayUrl,
                size: metadataUpload.pinSize,
                metadata: enrichedMetadata
            }
        });

    } catch (error) {
        console.error('Metadata upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload metadata',
            message: error.message
        });
    }
});

module.exports = router;