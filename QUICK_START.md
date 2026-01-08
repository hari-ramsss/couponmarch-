# 🚀 Quick Start Guide - Backend Integration

## TL;DR

The backend is now integrated into Next.js. Everything works. Start using it!

## Start Server

```bash
cd frontend
npm run dev
```

Server runs at: **http://localhost:3000**

## Test It Works

### 1. Check Health
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{"status":"OK","service":"CouponMarche API"}
```

### 2. Create a Listing

1. Go to: **http://localhost:3000/sell**
2. Fill out form:
   - Title: "Amazon Gift Card"
   - Type: "Gift Card"
   - Code: "AMAZON-123-XYZ"
   - Price: "100"
3. Upload images (logo + voucher)
4. Click "List Voucher for Sale"
5. Done! ✅

## What Changed

**Before:** Frontend (3000) → Backend (5000) → IPFS
**After:** Frontend + API (3000) → IPFS

## API Endpoints

- `GET /api/health` - Check status
- `POST /api/upload/voucher-logo` - Upload logo
- `POST /api/upload/voucher-image` - Upload voucher
- `POST /api/upload/voucher-metadata` - Upload metadata

## Files Structure

```
frontend/
├── app/api/          ← New API routes
│   ├── health/
│   └── upload/
├── lib/
│   └── ipfs-service.ts  ← IPFS integration
└── .env.local        ← Config (already set)
```

## Environment

Already configured in `frontend/.env.local`:
```env
PINATA_JWT=eyJhbGci...  ✅
NEXT_PUBLIC_API_URL=    ✅
```

## Status

🟢 **Everything Working**

- Server: ✅ Running
- API: ✅ Working
- IPFS: ✅ Configured
- Images: ✅ Processing
- Blockchain: ✅ Ready

## Next Steps

1. Test voucher listing flow
2. Upload some images
3. Create blockchain listings
4. Buy and verify vouchers

## Need Help?

Check these docs:
- `INTEGRATION_SUMMARY.md` - Complete overview
- `frontend/BACKEND_MIGRATION.md` - Detailed guide
- `NEXT_STEPS_COMPLETE.md` - What's next

## That's It!

The backend is integrated and ready. Start creating voucher listings! 🎉
