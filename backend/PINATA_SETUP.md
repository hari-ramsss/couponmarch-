# Pinata JWT Setup Guide

## Quick Setup

### 1. Create Pinata Account
1. Go to [Pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Verify your email

### 2. Generate JWT Token
1. Log into your Pinata dashboard
2. Go to [API Keys](https://app.pinata.cloud/keys)
3. Click **"New Key"**
4. Configure permissions:
   - ✅ **Admin** (recommended for full access)
   - Or select specific permissions:
     - ✅ `pinFileToIPFS`
     - ✅ `pinJSONToIPFS`
     - ✅ `unpin`
     - ✅ `userPinList`
5. Give it a name (e.g., "CouponMarche Backend")
6. Click **"Create Key"**
7. **Copy the JWT token** (long string starting with `eyJ...`)

### 3. Configure Backend
1. Open `backend/.env` file
2. Replace the JWT token:
   ```env
   PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_actual_jwt_token_here...
   ```
3. Save the file
4. Restart your backend server

### 4. Test Connection
```bash
cd backend
npm run test:pinata
```

## JWT Token Format

A valid Pinata JWT token looks like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjZTYyNzA0Yy0wNDM5LTQ5MDItYTFjMS1mMmQ3YWZjOTg1ZDUiLCJlbWFpbCI6ImhhcmlyYW1zYXRoeWEyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9.eyJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI4MGJiNTdmYzdjNzdmYzQ1MjI3YyIsInNjb3BlZEtleVNlY3JldCI6ImU1ZThlNTE2NzJmNWQ4NTk0ZGNlZWY0NzJlMTVmODkyNGY2MGJiNjg4NGQ4YzUyZjQ3OWRlYTZmYmExMzBmMmMiLCJleHAiOjE3OTgxNjQ2NTJ9.nJmaYxR6NQCkbCjAtdTJcogGZajZPNwOUkCsxn4to4E
```

**Key characteristics:**
- Starts with `eyJ`
- Contains three parts separated by dots (`.`)
- Very long string (500+ characters)
- No spaces or line breaks

## Troubleshooting

### Common Issues

#### 1. "Token is malformed"
```
Error: token contains an invalid number of segments
```
**Solution:** 
- Make sure you copied the complete JWT token
- Check for extra spaces or line breaks
- Ensure the token has three parts separated by dots

#### 2. "Invalid credentials"
```
Error: INVALID_CREDENTIALS
```
**Solution:**
- Generate a new JWT token from Pinata dashboard
- Make sure the token has proper permissions
- Check if the token has expired

#### 3. "Service not available"
```
Error: IPFS service is not available
```
**Solution:**
- Check if `PINATA_JWT` is set in `.env` file
- Restart the backend server after updating `.env`
- Run the test script to verify connection

### Development Mode

If you don't have a Pinata JWT token yet, the backend will start in development mode with warnings:

```
⚠️  Running in development mode without valid Pinata JWT
⚠️  IPFS uploads will fail until JWT is configured
```

This allows you to:
- Start the backend server
- Test other functionality
- Set up the JWT token later

### Testing Your Setup

1. **Quick Test:**
   ```bash
   cd backend
   node -e "console.log('JWT:', process.env.PINATA_JWT ? 'Configured' : 'Missing')"
   ```

2. **Full Test:**
   ```bash
   cd backend
   npm run test:pinata
   ```

3. **Expected Success Output:**
   ```
   ✅ IPFS (Pinata REST API) connection successful
   ✅ JSON Upload Result: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ✅ File Upload Result: QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   🎉 All tests completed successfully!
   ```

## Free Tier Limits

Pinata free tier includes:
- **1 GB** of storage
- **100,000** requests per month
- **1 GB** bandwidth per month

This is sufficient for development and testing. For production, consider upgrading to a paid plan.

## Security Notes

- **Never commit JWT tokens to git**
- Keep your `.env` file in `.gitignore`
- Regenerate tokens if compromised
- Use different tokens for development and production
- Set appropriate permissions (don't use Admin if not needed)

## Next Steps

After setting up Pinata JWT:
1. Test the connection: `npm run test:pinata`
2. Start the backend: `npm start`
3. Test file uploads from the frontend
4. Monitor usage in Pinata dashboard