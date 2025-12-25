# CouponMarche Backend API

Backend service for CouponMarche voucher marketplace with IPFS storage integration.

> **🚀 New**: Now uses **Pinata REST API with JWT authentication** instead of the Pinata SDK for better reliability and performance. See `PINATA_REST_API.md` for migration details.

## Features

- 📁 **File Upload & Processing**: Image optimization, thumbnails, blurring
- 🌐 **IPFS Storage**: Decentralized storage via Pinata
- 🔒 **Security**: File validation, rate limiting, CORS protection
- 🖼️ **Image Processing**: Sharp-based image optimization and manipulation
- 📊 **Metadata Management**: JSON metadata storage on IPFS

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `PINATA_JWT` - Your Pinata JWT token (recommended)

Optional (legacy):
- `PINATA_API_KEY` - Your Pinata API key (deprecated)
- `PINATA_SECRET_API_KEY` - Your Pinata secret key (deprecated)

### 3. Get Pinata JWT Token

1. Sign up at [Pinata.cloud](https://pinata.cloud)
2. Go to [API Keys section](https://app.pinata.cloud/keys)
3. Create new API key
4. **Copy the JWT token** (not the API key/secret)
5. Add JWT to your `.env` file

**Note**: The new implementation uses JWT authentication via REST API instead of the Pinata SDK for better reliability.

### 4. Start Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

## API Endpoints

### File Upload

#### Upload Voucher Logo
```http
POST /api/upload/voucher-logo
Content-Type: multipart/form-data

{
  "logo": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "original": {
      "ipfsHash": "QmXXX...",
      "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXXX...",
      "size": 1234567
    },
    "thumbnail": {
      "ipfsHash": "QmYYY...",
      "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmYYY...",
      "size": 123456
    },
    "metadata": {
      "width": 1200,
      "height": 800,
      "format": "jpeg",
      "size": 1234567
    }
  }
}
```

#### Upload Voucher Image
```http
POST /api/upload/voucher-image
Content-Type: multipart/form-data

{
  "voucherImage": <file>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadId": "uuid",
    "original": {
      "ipfsHash": "QmXXX...",
      "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXXX..."
    },
    "blurred": {
      "ipfsHash": "QmYYY...",
      "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmYYY..."
    },
    "thumbnail": {
      "ipfsHash": "QmZZZ...",
      "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmZZZ..."
    }
  }
}
```

#### Upload Metadata
```http
POST /api/upload/metadata
Content-Type: application/json

{
  "metadata": {
    "title": "Amazon Gift Card",
    "description": "₹500 Amazon Gift Card",
    "category": "Gift Card",
    "brand": "Amazon",
    "value": 500,
    "expiryDate": "2024-12-31"
  }
}
```

### IPFS Management

#### Get File by Hash
```http
GET /api/ipfs/{ipfsHash}
```

#### List Files
```http
GET /api/ipfs/list/files?type=voucher-image&limit=50&offset=0
```

#### Delete File
```http
DELETE /api/ipfs/{ipfsHash}
```

### Health Check
```http
GET /health
```

## File Processing

### Image Processing Features

1. **Optimization**: Resize and compress images
2. **Thumbnails**: Generate 300x300 thumbnails
3. **Blurring**: Create blurred versions for marketplace preview
4. **Validation**: Check file type, size, and dimensions

### Supported Formats

- JPEG/JPG
- PNG
- WebP
- GIF

### File Size Limits

- Images: 10MB maximum
- Metadata: 1MB maximum

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **File Validation**: Type, size, and format checking
- **CORS Protection**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Sanitization**: Multer configuration

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Development

### Project Structure

```
backend/
├── app.js                 # Main application
├── routes/
│   ├── upload.js         # File upload routes
│   └── ipfs.js           # IPFS management routes
├── services/
│   ├── ipfs.js           # IPFS service
│   └── imageProcessing.js # Image processing service
├── middleware/
│   ├── fileValidation.js # File upload middleware
│   └── errorHandler.js   # Error handling
└── utils/
    └── constants.js      # Application constants
```

### Adding New Features

1. **New Route**: Add to `routes/` directory
2. **New Service**: Add to `services/` directory
3. **New Middleware**: Add to `middleware/` directory
4. **Update Constants**: Modify `utils/constants.js`

### Testing

```bash
# Test Pinata REST API implementation
node test-pinata-rest.js

# Test file upload
curl -X POST http://localhost:5000/api/upload/voucher-logo \
  -F "logo=@test-image.jpg"
```

## Production Deployment

### Environment Variables

Set these in production:

```bash
NODE_ENV=production
PORT=5000
PINATA_JWT=your_production_jwt_token
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Considerations

1. **Authentication**: Add JWT middleware for protected routes
2. **Rate Limiting**: Adjust limits based on usage
3. **File Scanning**: Add virus scanning for uploads
4. **Monitoring**: Add logging and monitoring
5. **Backup**: Regular IPFS pin backups

### Scaling

- Use Redis for rate limiting in multi-instance setup
- Implement queue system for heavy image processing
- Add CDN for faster file delivery
- Monitor IPFS pin costs and usage

## Troubleshooting

### Common Issues

1. **IPFS Upload Fails**
   - Check Pinata JWT token in `.env`
   - Verify JWT token is valid and not expired
   - Check network connectivity
   - Run `node test-pinata-rest.js` to diagnose

2. **File Too Large**
   - Increase `MAX_FILE_SIZE` in `.env`
   - Update multer limits in middleware

3. **Image Processing Fails**
   - Ensure Sharp is properly installed
   - Check image format support
   - Verify file is not corrupted

### Logs

Check console output for detailed error messages and upload tracking.

## License

MIT License - see LICENSE file for details.