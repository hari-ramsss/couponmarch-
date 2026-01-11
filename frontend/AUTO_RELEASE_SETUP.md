# Auto-Release Service Setup

This service automatically releases payments to sellers when buyers confirm that vouchers are working.

## How It Works

1. **Buyer confirms voucher** → Calls `confirmVoucher()` on the Escrow contract
2. **Event emitted** → `BuyerConfirmed` event is emitted on-chain
3. **Service detects event** → The auto-release service listens for this event
4. **Payment released** → Service automatically calls `releasePayment()` as admin
5. **Seller receives funds** → MNEE tokens are transferred to the seller

## Setup Instructions

### 1. Get Your Admin Private Key

The admin is the wallet that deployed the VoucherEscrow contract. You need the **private key** of this wallet.

⚠️ **IMPORTANT**: Keep your private key secure! Never commit it to version control.

### 2. Add Environment Variables

Add these to your `.env.local` file:

```env
# Admin wallet private key (the wallet that deployed the Escrow contract)
ADMIN_PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Sepolia RPC URL (from Alchemy, Infura, or similar)
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key
```

### 3. Restart the Server

The service will automatically start when the Next.js server starts:

```bash
npm run dev
```

You should see in the console:
```
🚀 Starting Auto-Release Service...
==================================================
✅ Auto-release service initialized. Admin: 0x...
📋 Checking for pending confirmations...
🎧 Starting event listener...
✅ Event listener started
==================================================
🎉 Auto-Release Service is now running!
```

## Manual API Control

You can also control the service via the API:

### Check Status
```bash
GET /api/admin/auto-release
```

### Start/Stop Service
```bash
POST /api/admin/auto-release
Body: { "action": "start" }  # or "stop"
```

### Manual Release Payment
```bash
POST /api/admin/auto-release
Body: { "action": "release", "listingId": 123 }
```

### Process All Pending Confirmations
```bash
POST /api/admin/auto-release
Body: { "action": "process-pending" }
```

## Troubleshooting

### "ADMIN_PRIVATE_KEY environment variable not set"
- Make sure you added `ADMIN_PRIVATE_KEY` to `.env.local`
- Restart the server after adding environment variables

### "Wallet is not the contract admin"
- The private key you provided is not the wallet that deployed the Escrow contract
- Use the correct admin wallet's private key

### "Not releasable"
- The listing status is not `BUYER_CONFIRMED` (status 4)
- The buyer hasn't confirmed the voucher yet

## Security Notes

1. **Never expose your admin private key** - Keep it in `.env.local` only
2. **Restrict API access in production** - Add authentication to `/api/admin/*` routes
3. **Monitor gas costs** - The admin wallet needs ETH for gas fees
4. **Consider rate limiting** - Prevent API abuse in production
