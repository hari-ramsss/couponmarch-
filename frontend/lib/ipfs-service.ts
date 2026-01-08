import axios from 'axios';
import sharp from 'sharp';

// IPFS Service Configuration
const PINATA_JWT = process.env.PINATA_JWT || '';
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

// Image Processing Configuration
const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const THUMBNAIL_SIZE = 300;
const QUALITY = 85;

// Check if IPFS service is available
export function isIPFSAvailable(): boolean {
    return !!PINATA_JWT && PINATA_JWT !== 'your_pinata_jwt_token_here';
}

// Validate image
export async function validateImage(buffer: Buffer): Promise<{ isValid: boolean; errors: string[] }> {
    try {
        const metadata = await sharp(buffer).metadata();
        const validFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const minWidth = 100;
        const minHeight = 100;

        const validation = {
            isValid: true,
            errors: [] as string[],
        };

        if (!metadata.format || !validFormats.includes(metadata.format)) {
            validation.isValid = false;
            validation.errors.push(`Invalid format. Allowed: ${validFormats.join(', ')}`);
        }

        if (buffer.length > maxSize) {
            validation.isValid = false;
            validation.errors.push(`File too large: ${(buffer.length / 1024 / 1024).toFixed(2)}MB. Max: 10MB`);
        }

        if (metadata.width && metadata.height && (metadata.width < minWidth || metadata.height < minHeight)) {
            validation.isValid = false;
            validation.errors.push(`Image too small: ${metadata.width}x${metadata.height}. Min: ${minWidth}x${minHeight}`);
        }

        return validation;
    } catch (error: any) {
        return {
            isValid: false,
            errors: [`Failed to validate image: ${error.message}`],
        };
    }
}

// Process image
export async function processImage(
    buffer: Buffer,
    options: { createThumbnail?: boolean; createBlurred?: boolean; optimize?: boolean } = {}
): Promise<{
    images: { original: Buffer; thumbnail?: Buffer; blurred?: Buffer };
    metadata: { width?: number; height?: number; format?: string; size: number };
}> {
    const { createThumbnail = true, createBlurred = true, optimize = true } = options;

    const metadata = await sharp(buffer).metadata();
    const results: any = {};

    // Optimize original
    if (optimize) {
        results.original = await sharp(buffer)
            .resize(MAX_WIDTH, MAX_HEIGHT, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: QUALITY, progressive: true })
            .toBuffer();
    } else {
        results.original = buffer;
    }

    // Create thumbnail
    if (createThumbnail) {
        results.thumbnail = await sharp(buffer)
            .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
    }

    // Create blurred version
    if (createBlurred) {
        results.blurred = await sharp(buffer)
            .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
            .blur(10)
            .jpeg({ quality: 70, progressive: true })
            .toBuffer();
    }

    return {
        images: results,
        metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: buffer.length,
        },
    };
}

// Upload file to IPFS
export async function uploadToIPFS(
    buffer: Buffer,
    metadata: { name?: string; type?: string; originalName?: string; customData?: any } = {}
): Promise<{ ipfsHash: string; gatewayUrl: string; pinSize: number }> {
    if (!isIPFSAvailable()) {
        throw new Error('IPFS service not configured. Please set PINATA_JWT in environment variables.');
    }

    const FormData = require('form-data');
    const formData = new FormData();

    formData.append('file', buffer, {
        filename: metadata.originalName || `file-${Date.now()}`,
    });

    const pinataMetadata = {
        name: metadata.name || `voucher-${Date.now()}`,
        keyvalues: {
            type: metadata.type || 'voucher-image',
            uploadedAt: new Date().toISOString(),
            originalName: metadata.originalName || 'unknown',
            size: buffer.length.toString(),
            ...metadata.customData,
        },
    };

    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

    const response = await axios.post(`${PINATA_API_URL}/pinning/pinFileToIPFS`, formData, {
        headers: {
            Authorization: `Bearer ${PINATA_JWT}`,
            ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });

    return {
        ipfsHash: response.data.IpfsHash,
        gatewayUrl: `${PINATA_GATEWAY}/${response.data.IpfsHash}`,
        pinSize: response.data.PinSize,
    };
}

// Upload JSON to IPFS
export async function uploadJSONToIPFS(
    jsonData: any,
    metadata: { name?: string; type?: string; customData?: any } = {}
): Promise<{ ipfsHash: string; gatewayUrl: string; pinSize: number }> {
    if (!isIPFSAvailable()) {
        throw new Error('IPFS service not configured. Please set PINATA_JWT in environment variables.');
    }

    const pinataMetadata = {
        name: metadata.name || `metadata-${Date.now()}`,
        keyvalues: {
            type: metadata.type || 'json-metadata',
            uploadedAt: new Date().toISOString(),
            dataType: 'voucher-metadata',
            ...metadata.customData,
        },
    };

    const response = await axios.post(
        `${PINATA_API_URL}/pinning/pinJSONToIPFS`,
        {
            pinataContent: jsonData,
            pinataMetadata,
            pinataOptions: { cidVersion: 0 },
        },
        {
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
                'Content-Type': 'application/json',
            },
        }
    );

    return {
        ipfsHash: response.data.IpfsHash,
        gatewayUrl: `${PINATA_GATEWAY}/${response.data.IpfsHash}`,
        pinSize: response.data.PinSize,
    };
}

// Get file URL from IPFS hash
export function getIPFSUrl(ipfsHash: string): string {
    return `${PINATA_GATEWAY}/${ipfsHash}`;
}
