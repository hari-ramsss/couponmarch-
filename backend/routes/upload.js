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
        console.log(`📄 File details:`, {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            bufferLength: file.buffer?.length
        });

        // Validate image
        console.log('🔍 Validating image...');
        const validation = await imageProcessingService.validateImage(file.buffer);
        if (!validation.isValid) {
            console.log('❌ Image validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                error: 'Invalid image',
                details: validation.errors
            });
        }
        console.log('✅ Image validation passed');

        // Process image (optimize and create thumbnail)
        console.log('🖼️ Processing image...');
        const processedImages = await imageProcessingService.processImage(file.buffer, {
            createThumbnail: true,
            createBlurred: false, // Logo doesn't need blurring
            optimize: true
        });
        console.log('✅ Image processing completed');

        // Upload original to IPFS
        console.log('📤 Uploading original to IPFS...');
        const originalUpload = await ipfsService.uploadFile(processedImages.images.original, {
            name: `logo-${uploadId}`,
            type: 'voucher-logo',
            originalName: file.originalname,
            customData: {
                uploadId,
                category: 'logo'
            }
        });
        console.log('✅ Original uploaded to IPFS:', originalUpload.ipfsHash);

        // Upload thumbnail to IPFS
        console.log('📤 Uploading thumbnail to IPFS...');
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
        console.error('❌ Logo upload error:', error);
        console.error('❌ Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Failed to upload logo',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
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

/**
 * POST /api/upload/voucher-metadata
 * Upload complete voucher listing metadata to IPFS
 * This includes all voucher details, images, and validation data
 */
router.post('/voucher-metadata', async (req, res) => {
    try {
        const { voucherData } = req.body;

        if (!voucherData || typeof voucherData !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Invalid voucher data',
                message: 'Voucher data must be a valid JSON object'
            });
        }

        // Validate required fields
        const requiredFields = ['title', 'type', 'code', 'price'];
        const missingFields = requiredFields.filter(field => !voucherData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                message: `Required fields: ${missingFields.join(', ')}`
            });
        }

        // Generate partial pattern if not provided
        let partialPattern = voucherData.partialPattern;
        if (!partialPattern && voucherData.code) {
            const code = voucherData.code;
            const codeLength = code.length;
            if (codeLength <= 6) {
                partialPattern = code; // Show full code if short
            } else {
                partialPattern = `${code.slice(0, 2)}${'*'.repeat(Math.max(0, codeLength - 6))}${code.slice(-4)}`;
            }
        }

        // Create comprehensive voucher metadata
        const voucherMetadata = {
            // Basic Information
            title: voucherData.title,
            type: voucherData.type,
            brand: voucherData.brand || '',
            description: voucherData.description || '',

            // Voucher Details
            code: voucherData.code, // Full code (will be encrypted/hashed in production)
            partialPattern: partialPattern || '',
            value: parseFloat(voucherData.value) || 0,
            discountPercentage: parseFloat(voucherData.discountPercentage) || 0,

            // Pricing & Expiry
            price: voucherData.price,
            currency: voucherData.currency || 'MNEE',
            expiryDate: voucherData.expiryDate || null,
            expiryTimestamp: voucherData.expiryTimestamp || 0,

            // Terms & Conditions
            terms: voucherData.terms || '',
            usageInstructions: voucherData.usageInstructions || '',
            restrictions: voucherData.restrictions || '',

            // Images (IPFS hashes)
            images: {
                logo: {
                    original: voucherData.logoOriginal || '',
                    thumbnail: voucherData.logoThumbnail || ''
                },
                voucher: {
                    original: voucherData.voucherOriginal || '', // Full resolution (for buyers)
                    blurred: voucherData.voucherBlurred || '',   // Blurred (for marketplace)
                    thumbnail: voucherData.voucherThumbnail || ''
                }
            },

            // Seller Information
            seller: {
                address: voucherData.sellerAddress || '',
                reputation: parseInt(voucherData.sellerReputation) || 0,
                totalSales: parseInt(voucherData.sellerTotalSales) || 0
            },

            // Validation & Security
            validation: {
                aiInitialProof: voucherData.aiInitialProof || '',
                validationScore: parseInt(voucherData.validationScore) || 0,
                validationStatus: voucherData.validationStatus || 'pending',
                validatedAt: voucherData.validatedAt || null
            },

            // Blockchain Integration
            blockchain: {
                network: voucherData.network || 'sepolia',
                listingId: voucherData.listingId || null,
                contractAddress: voucherData.contractAddress || '',
                transactionHash: voucherData.transactionHash || ''
            },

            // Platform Metadata
            platform: {
                name: 'CouponMarche',
                version: '1.0',
                uploadedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                category: voucherData.category || 'General',
                tags: Array.isArray(voucherData.tags) ? voucherData.tags : [],
                featured: Boolean(voucherData.featured)
            },

            // Analytics & Tracking
            analytics: {
                views: 0,
                favorites: 0,
                inquiries: 0,
                createdAt: new Date().toISOString()
            }
        };

        // Upload comprehensive metadata to IPFS
        const metadataUpload = await ipfsService.uploadJSON(voucherMetadata, {
            name: `voucher-metadata-${voucherData.title?.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
            customData: {
                type: 'voucher-listing-metadata',
                version: '1.0',
                voucherType: voucherData.type,
                brand: voucherData.brand,
                seller: voucherData.sellerAddress,
                price: voucherData.price,
                category: voucherData.category || 'General'
            }
        });

        console.log(`✅ Voucher metadata uploaded successfully: ${metadataUpload.ipfsHash}`);

        res.json({
            success: true,
            data: {
                ipfsHash: metadataUpload.ipfsHash,
                gatewayUrl: metadataUpload.gatewayUrl,
                size: metadataUpload.pinSize,
                metadata: voucherMetadata,
                summary: {
                    title: voucherMetadata.title,
                    type: voucherMetadata.type,
                    price: voucherMetadata.price,
                    hasImages: !!(voucherMetadata.images.logo.original || voucherMetadata.images.voucher.original),
                    validationStatus: voucherMetadata.validation.validationStatus
                }
            }
        });

    } catch (error) {
        console.error('Voucher metadata upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload voucher metadata',
            message: error.message
        });
    }
});

module.exports = router;