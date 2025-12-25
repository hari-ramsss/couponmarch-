# Pinata REST API Implementation Guide

## Overview

This implementation uses **Pinata REST API with JWT authentication** instead of the Pinata SDK. This approach provides better reliability, more control, and avoids SDK-related issues.

## Key Changes from SDK to REST API

### Before (SDK):
```javascript
const pinataSDK = require('pinata-sdk');
const pinata = new pinataSDK(apiKey, secretKey);
await pinata.pinFileToIPFS(buffer, options);
```

### After (REST API):
```javascript
const axios = require('axios');
const FormData = require('form-data');

const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: { 'Authorization': `Bearer ${jwt}` }
});
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install axios form-data
npm uninstall @pinata/sdk  # Remove old SDK
```

### 2. Get Pinata JWT Token
1. Go to [Pinata Dashboard](https://app.pinata.cloud/keys)
2. Create a new API key
3. Copy the **JWT token** (not the API key/secret)
4. Add to your `.env` file:

```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Environment Configuration

**Required:**
```env
PINATA_JWT=your_jwt_token_here
```

**Optional (legacy - no longer needed):**
```env
# These are no longer required with JWT approach
# PINATA_API_KEY=your_api_key
# PINATA_SECRET_API_KEY=your_secret_key
```

## API Endpoints Used

### 1. Authentication Test
```
GET https://api.pinata.cloud/data/testAuthentication
Headers: Authorization: Bearer {JWT}
```

### 2. File Upload
```
POST https://api.pinata.cloud/pinning/pinFileToIPFS
Headers: Authorization: Bearer {JWT}
Body: FormData with file, metadata, and options
```

### 3. JSON Upload
```
POST https://api.pinata.cloud/pinning/pinJSONToIPFS
Headers: Authorization: Bearer {JWT}, Content-Type: application/json
Body: { pinataContent, pinataMetadata, pinataOptions }
```

### 4. List Files
```
GET https://api.pinata.cloud/data/pinList
Headers: Authorization: Bearer {JWT}
Query: status, pageLimit, pageOffset, metadata filters
```

### 5. Unpin File
```
DELETE https://api.pinata.cloud/pinning/unpin/{hash}
Headers: Authorization: Bearer {JWT}
```

### 6. Update Metadata
```
PUT https://api.pinata.cloud/pinning/hashMetadata
Headers: Authorization: Bearer {JWT}, Content-Type: application/json
Body: { ipfsPinHash, name, keyvalues }
```

## New Features Added

### 1. Enhanced Error Handling
```javascript
catch (error) {
    console.error('IPFS upload error:', error.response?.data || error.message);
    throw new Error(`Failed to upload to IPFS: ${error.response?.data?.error || error.message}`);
}
```

### 2. Content Type Detection
```javascript
getContentType(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    const contentTypes = {
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'json': 'application/json'
    };
    return contentTypes[ext] || 'application/octet-stream';
}
```

### 3. IPFS Hash Validation
```javascript
if (!ipfsHash.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{56})$/)) {
    throw new Error('Invalid IPFS hash format');
}
```

### 4. Pin Status Checking
```javascript
async getPinStatus(ipfsHash) {
    const response = await this.axiosInstance.get('/data/pinList', {
        params: { hashContains: ipfsHash, status: 'pinned' }
    });
    return { isPinned: !!response.data.rows.find(row => row.ipfs_pin_hash === ipfsHash) };
}
```

### 5. Metadata Updates
```javascript
async updateMetadata(ipfsHash, newMetadata) {
    const response = await this.axiosInstance.put('/pinning/hashMetadata', {
        ipfsPinHash: ipfsHash,
        name: newMetadata.name,
        keyvalues: newMetadata.keyvalues
    });
    return response.data;
}
```

## Testing

### Run Test Script
```bash
cd backend
node test-pinata-rest.js
```

### Expected Output
```
🧪 Testing Pinata REST API Implementation

1️⃣ Testing Authentication...
✅ IPFS (Pinata REST API) connection successful
✅ Authentication test completed

2️⃣ Testing JSON Upload...
✅ JSON Upload Result:
   IPFS Hash: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   Gateway URL: https://gateway.pinata.cloud/ipfs/QmXXX...
   Pin Size: 245 bytes

3️⃣ Testing File Buffer Upload...
✅ File Upload Result:
   IPFS Hash: QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   Gateway URL: https://gateway.pinata.cloud/ipfs/QmYYY...
   Pin Size: 52 bytes

🎉 All tests completed successfully!
```

## Troubleshooting

### Common Issues

#### 1. JWT Token Invalid
```
Error: Request failed with status code 401
```
**Solution:** Check your JWT token in `.env` file and ensure it's valid.

#### 2. File Upload Fails
```
Error: Request failed with status code 413
```
**Solution:** File too large. Check Pinata plan limits.

#### 3. Network Issues
```
Error: ECONNREFUSED
```
**Solution:** Check internet connection and Pinata service status.

### Debug Mode
Add debug logging:
```javascript
// In ipfs.js constructor
this.axiosInstance.interceptors.request.use(request => {
    console.log('🔍 Pinata API Request:', request.method.toUpperCase(), request.url);
    return request;
});
```

## Performance Improvements

### 1. Connection Reuse
- Uses axios instance with persistent connections
- Reduces connection overhead

### 2. Better Error Messages
- Detailed error responses from Pinata API
- Specific error codes and messages

### 3. Metadata Validation
- Client-side validation before upload
- Reduces failed upload attempts

## Security Features

### 1. JWT-Only Authentication
- No API keys in code
- Secure token-based auth

### 2. Input Validation
- File type validation
- IPFS hash format validation
- Metadata structure validation

### 3. Rate Limiting Awareness
- Respects Pinata rate limits
- Proper error handling for rate limit exceeded

## Migration Checklist

- [x] Replace `@pinata/sdk` with `axios` and `form-data`
- [x] Update authentication to use JWT
- [x] Rewrite all IPFS service methods
- [x] Add enhanced error handling
- [x] Add new features (pin status, metadata updates)
- [x] Create comprehensive test suite
- [x] Update environment configuration
- [x] Document API changes

## Next Steps

1. **Test in Production**: Deploy and test with real files
2. **Monitor Performance**: Track upload success rates
3. **Add Caching**: Implement Redis for metadata caching
4. **Batch Operations**: Add support for bulk uploads
5. **Analytics**: Track usage patterns and optimize

The REST API implementation is more robust, maintainable, and provides better error handling than the SDK approach.