const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        files: 5 // Max 5 files per request
    }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const singleUpload = upload.single(fieldName);

        singleUpload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File too large',
                        message: `Maximum file size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        error: 'Too many files',
                        message: 'Maximum 5 files allowed per request'
                    });
                }
                return res.status(400).json({
                    error: 'Upload error',
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    error: 'File validation error',
                    message: err.message
                });
            }

            // Add unique ID to request for tracking
            req.uploadId = uuidv4();
            next();
        });
    };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5) => {
    return (req, res, next) => {
        const multipleUpload = upload.array(fieldName, maxCount);

        multipleUpload(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        error: 'File too large',
                        message: `Maximum file size is ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        error: 'Too many files',
                        message: `Maximum ${maxCount} files allowed`
                    });
                }
                return res.status(400).json({
                    error: 'Upload error',
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    error: 'File validation error',
                    message: err.message
                });
            }

            // Add unique ID to request for tracking
            req.uploadId = uuidv4();
            next();
        });
    };
};

// Validation middleware for required files
const requireFile = (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No file uploaded',
            message: 'Please select a file to upload'
        });
    }
    next();
};

// Validation middleware for required files (multiple)
const requireFiles = (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            error: 'No files uploaded',
            message: 'Please select at least one file to upload'
        });
    }
    next();
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    requireFile,
    requireFiles
};