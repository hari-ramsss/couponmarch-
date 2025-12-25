# Backend-Frontend Integration Guide

## Overview
The CouponMarche frontend is now integrated with the IPFS backend for decentralized file storage and metadata management.

## Integration Status: ✅ COMPLETE

### What's Integrated:

1. **File Upload System**
   - Logo/banner images → IPFS via `/api/upload/voucher-logo`
   - Voucher images → IPFS via `/api/upload/voucher-image` (with blurring)
   - Automatic thumbnail generation
   - Image validation and processing

2. **Metadata Management**
   - Complete voucher metadata → IPFS via `/api/upload/voucher-metadata`
   - Structured JSON with all voucher details
   - IPFS hash used as blockchain metadata reference

3. **Frontend Components Updated**
   - `UploadSection.tsx` - Now uploads to backend instead of Base64
   - `sell/page.tsx` - Integrated with metadata upload API
   - Added upload progress indicators and error handling
   - Backend status monitoring component

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Pinata credentials
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Configuration

**Backend (.env):**
```
PORT=5000
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret
PINATA_JWT=your_pinata_jwt
FRONTEND_URL=http://localhost:3000
```

**Frontend (optional .env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Endpoints

### Upload Endpoints
- `POST /api/upload/voucher-logo` - Upload logo/banner
- `POST /api/upload/voucher-image` - Upload voucher image (creates blurred version)
- `POST /api/upload/voucher-metadata` - Upload complete metadata

### IPFS Endpoints
- `GET /api/ipfs/:hash` - Get file from IPFS
- `GET /api/ipfs/list/files` - List pinned files
- `DELETE /api/ipfs/:hash` - Unpin file

### Health Check
- `GET /health` - Backend status

## File Flow

1. **User selects files** → Frontend shows preview
2. **Files uploaded** → Backend processes and uploads to IPFS
3. **IPFS hashes returned** → Frontend stores references
4. **Metadata created** → All data uploaded to IPFS as JSON
5. **Blockchain listing** → Uses IPFS metadata hash

## Features

### Image Processing
- Automatic optimization and compression
- Thumbnail generation for faster loading
- Blurred versions for marketplace privacy
- Format validation and security checks

### Error Handling
- Upload progress indicators
- Detailed error messages
- Retry mechanisms
- Backend connectivity monitoring

### Security
- File type validation
- Size limits (10MB default)
- Rate limiting
- CORS protection

## Testing

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:3000/sell`
4. Check backend status indicator (top-right)
5. Upload files and create listing

## Troubleshooting

### Backend Not Connecting
- Check if backend is running on port 5000
- Verify CORS settings in backend/.env
- Check browser console for network errors

### Upload Failures
- Verify Pinata credentials in backend/.env
- Check file size limits
- Ensure proper file formats (images only)

### IPFS Issues
- Test Pinata connection manually
- Check API key permissions
- Verify network connectivity

## Next Steps

1. **AI Validation Integration** - Add AI validation for uploaded images
2. **Caching Layer** - Add Redis for metadata caching
3. **CDN Integration** - Use IPFS gateways with CDN
4. **Batch Operations** - Support multiple file uploads
5. **Analytics** - Track upload success rates and performance

## File Structure

```
backend/
├── routes/upload.js          # Upload endpoints
├── routes/ipfs.js           # IPFS management
├── services/ipfs.js         # Pinata integration
├── services/imageProcessing.js # Image processing
├── middleware/fileValidation.js # File validation
└── app.js                   # Main server

frontend/
├── components/UploadSection.tsx    # File upload UI
├── components/BackendStatus.tsx    # Status monitoring
├── app/sell/page.tsx              # Sell page with integration
├── lib/config.ts                  # API configuration
└── app/globals.css               # Updated styles
```

## Success Metrics

- ✅ File uploads work end-to-end
- ✅ IPFS storage confirmed
- ✅ Metadata properly structured
- ✅ Blockchain integration maintained
- ✅ Error handling implemented
- ✅ Progress indicators added
- ✅ Backend monitoring active

The integration is complete and ready for testing!