const sharp = require('sharp');

class ImageProcessingService {
    constructor() {
        this.maxWidth = 1200;
        this.maxHeight = 1200;
        this.thumbnailSize = 300;
        this.quality = 85;
    }

    /**
     * Process and optimize image
     * @param {Buffer} imageBuffer - Original image buffer
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Processed images
     */
    async processImage(imageBuffer, options = {}) {
        try {
            const {
                createThumbnail = true,
                createBlurred = true,
                optimize = true
            } = options;

            const results = {};

            // Get image metadata
            const metadata = await sharp(imageBuffer).metadata();

            // Original optimized image
            if (optimize) {
                results.original = await this.optimizeImage(imageBuffer);
            } else {
                results.original = imageBuffer;
            }

            // Create thumbnail
            if (createThumbnail) {
                results.thumbnail = await this.createThumbnail(imageBuffer);
            }

            // Create blurred version (for marketplace preview)
            if (createBlurred) {
                results.blurred = await this.createBlurredImage(imageBuffer);
            }

            return {
                success: true,
                images: results,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    format: metadata.format,
                    size: imageBuffer.length
                }
            };
        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error(`Failed to process image: ${error.message}`);
        }
    }

    /**
     * Optimize image (resize and compress)
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<Buffer>} Optimized image buffer
     */
    async optimizeImage(imageBuffer) {
        try {
            return await sharp(imageBuffer)
                .resize(this.maxWidth, this.maxHeight, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({
                    quality: this.quality,
                    progressive: true
                })
                .toBuffer();
        } catch (error) {
            throw new Error(`Failed to optimize image: ${error.message}`);
        }
    }

    /**
     * Create thumbnail
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<Buffer>} Thumbnail buffer
     */
    async createThumbnail(imageBuffer) {
        try {
            return await sharp(imageBuffer)
                .resize(this.thumbnailSize, this.thumbnailSize, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({
                    quality: 80,
                    progressive: true
                })
                .toBuffer();
        } catch (error) {
            throw new Error(`Failed to create thumbnail: ${error.message}`);
        }
    }

    /**
     * Create blurred version for marketplace preview
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<Buffer>} Blurred image buffer
     */
    async createBlurredImage(imageBuffer) {
        try {
            return await sharp(imageBuffer)
                .resize(600, 600, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .blur(10) // Heavy blur for security
                .jpeg({
                    quality: 70,
                    progressive: true
                })
                .toBuffer();
        } catch (error) {
            throw new Error(`Failed to create blurred image: ${error.message}`);
        }
    }

    /**
     * Validate image file
     * @param {Buffer} imageBuffer - Image buffer
     * @returns {Promise<Object>} Validation result
     */
    async validateImage(imageBuffer) {
        try {
            const metadata = await sharp(imageBuffer).metadata();

            const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            const minWidth = 100;
            const minHeight = 100;

            const validation = {
                isValid: true,
                errors: []
            };

            // Check format
            if (!validFormats.includes(metadata.format)) {
                validation.isValid = false;
                validation.errors.push(`Invalid format: ${metadata.format}. Allowed: ${validFormats.join(', ')}`);
            }

            // Check size
            if (imageBuffer.length > maxSize) {
                validation.isValid = false;
                validation.errors.push(`File too large: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB. Max: 10MB`);
            }

            // Check dimensions
            if (metadata.width < minWidth || metadata.height < minHeight) {
                validation.isValid = false;
                validation.errors.push(`Image too small: ${metadata.width}x${metadata.height}. Min: ${minWidth}x${minHeight}`);
            }

            return validation;
        } catch (error) {
            return {
                isValid: false,
                errors: [`Failed to validate image: ${error.message}`]
            };
        }
    }
}

module.exports = new ImageProcessingService();