// File type constants
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
];

const ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'text/plain',
    'application/json'
];

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
    IMAGE: 10 * 1024 * 1024, // 10MB
    DOCUMENT: 5 * 1024 * 1024, // 5MB
    JSON: 1 * 1024 * 1024 // 1MB
};

// Image processing constants
const IMAGE_PROCESSING = {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    THUMBNAIL_SIZE: 300,
    QUALITY: 85,
    BLUR_RADIUS: 10
};

// IPFS constants
const IPFS_CONFIG = {
    GATEWAY_URL: 'https://gateway.pinata.cloud/ipfs/',
    PIN_EXPIRY_DAYS: 365, // 1 year
    MAX_PIN_SIZE: 100 * 1024 * 1024 // 100MB
};

// API response messages
const MESSAGES = {
    SUCCESS: {
        FILE_UPLOADED: 'File uploaded successfully',
        METADATA_UPLOADED: 'Metadata uploaded successfully',
        FILE_DELETED: 'File deleted successfully',
        BATCH_UPLOAD_COMPLETE: 'Batch upload completed'
    },
    ERROR: {
        FILE_TOO_LARGE: 'File size exceeds maximum limit',
        INVALID_FILE_TYPE: 'Invalid file type',
        NO_FILE_PROVIDED: 'No file provided',
        UPLOAD_FAILED: 'File upload failed',
        IPFS_ERROR: 'IPFS service error',
        VALIDATION_ERROR: 'File validation failed',
        PROCESSING_ERROR: 'File processing failed'
    }
};

// Voucher categories
const VOUCHER_CATEGORIES = [
    'Gift Card',
    'Discount Coupon',
    'Store Credit',
    'Travel Voucher',
    'Food & Dining',
    'Fashion & Apparel',
    'Electronics',
    'Entertainment',
    'Health & Beauty',
    'Home & Garden',
    'Sports & Fitness',
    'Education',
    'Other'
];

// Listing status
const LISTING_STATUS = {
    DRAFT: 'draft',
    PENDING_VALIDATION: 'pending_validation',
    ACTIVE: 'active',
    SOLD: 'sold',
    EXPIRED: 'expired',
    CANCELLED: 'cancelled',
    DISPUTED: 'disputed'
};

// AI validation status
const AI_VALIDATION_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    MANUAL_REVIEW: 'manual_review'
};

module.exports = {
    ALLOWED_IMAGE_TYPES,
    ALLOWED_DOCUMENT_TYPES,
    FILE_SIZE_LIMITS,
    IMAGE_PROCESSING,
    IPFS_CONFIG,
    MESSAGES,
    VOUCHER_CATEGORIES,
    LISTING_STATUS,
    AI_VALIDATION_STATUS
};