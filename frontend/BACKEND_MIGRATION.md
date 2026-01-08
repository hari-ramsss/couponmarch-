# Backend Migration to Next.js API Routes

## Overview
The backend has been successfully migrated from a separate Express.js server into the Next.js frontend project as API routes. This simplifies deployment and reduces infrastructure complexity.

## What Changed

### Before (Separate Backend)
```
backend/
├── app.js (Express server)
├── routes/
│   ├── upload.js
│   └── ipfs.js
├── services/
│   ├── ipfs.js
│   └── imageProcessing.js
└── middleware/
```

### After (Integrated API Routes)
```
frontend/
├── app/api/
│   ├── health/route.ts
│   └── upload/
│       ├── voucher-logo/route.ts
│       ├── voucher-image/route.ts
│       └── voucher-metadata/route.ts
└── lib/
    └── ipfs-service.ts
```

## API Endpoints

All API endpoints are now available at `/api/*`:

### Health Check
- **GET** `/api/health`
- Returns service status and timestamp

### Upload Endpoints

#### Upload Voucher Logo
- **POST** `/api/upload/voucher-logo`
- **Body**: FormData with `logo` file
- **Returns**: IPFS hashes for original and thumbnail

#### Upload Voucher Image
- **POST** `/api/upload/voucher-image`
- **Body**: FormData with `voucherImage` file
- **Returns**: IPFS hashes for original, blurred, and thumbnail

#### Upload Voucher Metadata
- **POST** `/api/upload/voucher-metadata`
- **Body**: JSON with `voucherData` object
- **Returns**: IPFS hash for complete metadata

## Environment Variables

Add to `frontend/.env.local`:

```env
# IPFS Configuration (Pinata)
PINATA_JWT=your_pinata_jwt_token_here

# API URL (for client-side calls)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Installation

1. Install new dependencies:
```bash
cd frontend
npm install
```

New dependencies added:
- `axios` - HTTP client for Pinata API
- `sharp` - Image processing
- `form-data` - FormData handling

2. Configure environment variables in `frontend/.env.local`

3. Start the development server:
```bash
npm run dev
```

## Usage in Components

### Client-Side Upload Example

```typescript
// Upload logo
const formData = new FormData();
formData.append('logo', logoFile);

const response = await fetch('/api/upload/voucher-logo', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('IPFS Hash:', result.data.original.ipfsHash);
```

### Upload Metadata Example

```typescript
const response = await fetch('/api/upload/voucher-metadata', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    voucherData: {
      title: 'Amazon Gift Card',
      type: 'gift-card',
      code: 'AMAZON-123-XYZ',
      price: '100',
      // ... other fields
    },
  }),
});

const result = await response.json();
console.log('Metadata IPFS Hash:', result.data.ipfsHash);
```

## Features

### Image Processing
- Automatic optimization and resizing
- Thumbnail generation
- Blur effect for marketplace preview
- Format validation

### IPFS Integration
- Direct upload to Pinata
- Automatic metadata tagging
- Gateway URL generation
- Error handling

### Security
- File type validation
- File size limits (10MB max)
- Image dimension validation
- Buffer-based processing (no disk writes)

## Migration Benefits

1. **Simplified Deployment**: Single application to deploy
2. **Reduced Latency**: No network hop between frontend and backend
3. **Shared Dependencies**: Reuse types and utilities
4. **Better DX**: Single codebase, unified tooling
5. **Cost Savings**: One server instead of two

## Old Backend

The old backend folder (`backend/`) can now be archived or removed. All functionality has been migrated to Next.js API routes.

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Upload logo (requires file)
curl -X POST http://localhost:3000/api/upload/voucher-logo \
  -F "logo=@/path/to/image.jpg"
```

## Troubleshooting

### IPFS Upload Fails
- Check `PINATA_JWT` is set in `.env.local`
- Verify JWT token is valid at https://app.pinata.cloud/keys
- Check file size is under 10MB

### Image Processing Errors
- Ensure `sharp` is installed correctly
- Check image format is supported (JPEG, PNG, WebP, GIF)
- Verify image dimensions meet minimum requirements (100x100)

### API Route Not Found
- Ensure Next.js dev server is running
- Check file structure matches: `app/api/[route]/route.ts`
- Restart dev server after adding new routes

## Next Steps

1. Update `UploadSection.tsx` to use new API routes
2. Update `sell/page.tsx` to handle IPFS uploads
3. Test complete voucher listing flow
4. Remove old backend folder after verification
