# Blockchain Integration Guide

This document explains how to connect the frontend to your deployed smart contracts.

## Prerequisites

- MetaMask browser extension installed
- Contracts deployed to Sepolia testnet (or your target network)
- Contract addresses from deployment

## Setup Instructions

### 1. Configure Contract Addresses

Open `frontend/lib/contracts.ts` and replace the placeholder addresses with your deployed contract addresses:

```typescript
export const MOCK_ERC20_ADDRESS = '0xYourMockERC20Address';
export const MARKETPLACE_ADDRESS = '0xYourMarketplaceAddress';
export const ESCROW_ADDRESS = '0xYourEscrowAddress';
```

### 2. Network Configuration

The app is configured for Sepolia testnet by default. To change the network, update `NETWORK_CONFIG` in `frontend/lib/contracts.ts`.

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
cd frontend
npm install
```

## How It Works

### Wallet Connection

- Click "Connect Wallet" button in the header
- MetaMask will prompt for connection
- If not on Sepolia, the app will prompt to switch networks
- Wallet state is managed globally via `WalletContext`

### MNEE Token (MockERC20)

- All payments use MNEE tokens (MockERC20 contract)
- Gas fees are still paid in ETH
- The app displays your MNEE balance in the header
- Before buying, users must approve the Escrow contract to spend MNEE

### Creating Listings

1. Navigate to `/sell` page
2. Fill in voucher details:
   - Voucher code (required) - will be partially masked for security
   - Price in MNEE (required)
   - Other optional fields
3. Connect wallet if not already connected
4. Click "List Voucher for Sale"
5. Confirm transaction in MetaMask
6. Listing will appear on marketplace after confirmation

### Buying Listings

1. Browse listings on `/marketplace` page
2. Click "View / Buy" on any listing
3. On listing detail page:
   - If not approved: Click "Approve MNEE" first
   - Then click "Lock Payment & Buy"
4. Confirm transactions in MetaMask
5. After payment is locked, seller reveals voucher
6. Buyer can then:
   - Confirm voucher is valid (releases payment to seller)
   - Dispute voucher (if invalid, admin can refund)

### Escrow Flow

The escrow follows this lifecycle:

1. **LISTED** - Listing is available for purchase
2. **LOCKED** - Buyer has locked payment in escrow
3. **REVEALED** - Seller has revealed the voucher to buyer
4. **BUYER_CONFIRMED** - Buyer confirmed voucher is valid (payment can be released)
5. **BUYER_DISPUTED** - Buyer disputed voucher (admin can refund)
6. **RELEASED** - Payment released to seller
7. **REFUNDED** - Payment refunded to buyer

## Contract Interaction Functions

### Marketplace Contract

- `createListing()` - Create a new listing
- `getListing(id)` - Get listing details
- `getActiveListings()` - Get all active listings
- `cancelListing(id)` - Cancel a listing (seller only)

### Escrow Contract

- `lockPayment(id)` - Lock payment for a listing (buyer)
- `revealVoucher(id)` - Reveal voucher to buyer (seller)
- `confirmVoucher(id)` - Confirm voucher is valid (buyer)
- `disputeVoucher(id, evidenceCID)` - Dispute voucher (buyer)
- `releasePayment(id)` - Release payment to seller (admin)
- `refundPayment(id)` - Refund payment to buyer (admin)

### MockERC20 Contract

- `approve(spender, amount)` - Approve escrow to spend tokens
- `balanceOf(address)` - Get token balance
- `allowance(owner, spender)` - Get allowance amount

## File Structure

```
frontend/
├── lib/
│   ├── contracts.ts              # Contract addresses and ABIs
│   ├── contracts-instance.ts     # Contract instance utilities
│   ├── wallet.ts                  # Wallet connection utilities
│   └── marketplace.ts             # Marketplace interaction utilities
├── contexts/
│   └── WalletContext.tsx          # Global wallet state management
├── app/
│   ├── marketplace/
│   │   ├── page.tsx              # Marketplace listings page
│   │   └── [id]/
│   │       └── page.tsx          # Listing detail & buy page
│   └── sell/
│       └── page.tsx              # Create listing page
└── components/
    ├── Header.tsx                 # Header with wallet connection
    ├── PriceSection.tsx           # Price input & wallet status
    └── ListingCard.tsx            # Listing card component
```

## Important Notes

1. **Contract Addresses**: Always verify contract addresses are correct before using in production
2. **Network**: Ensure you're on the correct network (Sepolia for testing)
3. **Gas Fees**: Users need ETH for gas, even though payments are in MNEE
4. **Approvals**: Users must approve MNEE spending before buying
5. **Error Handling**: The app shows transaction status and errors to users
6. **Real-time Updates**: Listings refresh automatically every 10-30 seconds

## Troubleshooting

### "MetaMask is not installed"
- Install MetaMask browser extension
- Refresh the page

### "Failed to switch to Sepolia network"
- Manually add Sepolia network in MetaMask
- Network details are in `NETWORK_CONFIG`

### "Insufficient MNEE balance"
- Get test MNEE tokens (you may need to mint them from MockERC20 contract)
- Check balance in header

### "Contract address is zero"
- Update contract addresses in `frontend/lib/contracts.ts`
- Ensure contracts are deployed

### "Transaction failed"
- Check you have enough ETH for gas
- Verify contract addresses are correct
- Check contract state (e.g., listing status, expiry)

## Development

To run the development server:

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`

## Production Deployment

Before deploying to production:

1. Update contract addresses to production addresses
2. Update network configuration if needed
3. Test all flows thoroughly
4. Consider adding error monitoring (e.g., Sentry)
5. Optimize contract ABI imports (use full ABIs from artifacts if needed)

