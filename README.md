# 🏪 CouponMarché

> A decentralized marketplace for buying and selling vouchers, coupons, and gift cards with **zero fraud** using AI-powered validation and blockchain-powered escrow.

**Built for the MNEE Stablecoin Hackathon** | Powered by **MNEE ERC-20** Token

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-61DAFB)

---

## 🎯 Quick Start for Judges

> **Want to try the app immediately?** Follow these 5 simple steps:

### Prerequisites
- [Node.js 18+](https://nodejs.org/) installed
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH ([Get free ETH here](https://sepoliafaucet.com/))

### Step 1: Clone & Install
```bash
git clone https://github.com/yourusername/couponmarche.git
cd couponmarche

# Install smart contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Step 2: Configure Environment
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PINATA_JWT=your_pinata_jwt_token
```

> 💡 **Get API Keys:**
> - Alchemy: https://dashboard.alchemy.com (free tier available)
> - Pinata: https://app.pinata.cloud/keys (free tier available)

### Step 3: Run the Application
```bash
cd frontend
npm run dev
```
Open **http://localhost:3000** in your browser.

### Step 4: Connect MetaMask
1. Click "Connect Wallet" in the header
2. Switch to **Sepolia Testnet** (app will prompt you)
3. Get test MNEE tokens (see below)

### Step 5: Try the Demo Flow
1. **List a Voucher**: Go to `/sell`, fill in details, upload an image
2. **Browse Marketplace**: Go to `/marketplace`, see your listing
3. **Buy a Voucher** (use a different wallet): Click "Buy Now" on any listing
4. **Confirm Purchase**: Go to `/My-purchases`, confirm the voucher works
5. **Check My Listings**: Go to `/my-listings` to see your sold vouchers

---

## 📺 Demo Walkthrough

### Seller Flow
1. Navigate to **Sell** page
2. Fill voucher details (title, type, brand, code, price)
3. Upload voucher image
4. Click "List Voucher for Sale"
5. Confirm transaction in MetaMask
6. Your voucher appears in marketplace (image is blurred for others)

### Buyer Flow
1. Browse **Marketplace**
2. Click "Buy Now" on a voucher
3. Approve MNEE spend (first-time only)
4. Confirm payment transaction
5. Voucher code & full image revealed
6. Test the voucher, then confirm it works
7. Payment auto-releases to seller

### Dispute Flow (if voucher doesn't work)
1. Click "Report Issue" instead of confirming
2. Provide evidence (IPFS CID of screenshot)
3. Admin reviews and decides refund/release

---

## 🚧 Problem We Solve

| Problem | How We Solve It |
|---------|-----------------|
| ❌ Fake vouchers sold | ✅ AI validates voucher image before listing |
| ❌ Seller gets payment, voucher doesn't work | ✅ Escrow holds funds until buyer confirms |
| ❌ Buyer uses voucher, refuses to pay | ✅ Payment locked BEFORE revealing voucher |
| ❌ No recourse for disputes | ✅ Admin dispute resolution with evidence |
| ❌ Voucher code visible before purchase | ✅ Image blurred, code partially masked |

---

## 💡 Key Features

| Feature | Implementation |
|---------|----------------|
| ✨ **AI Verification** | Image analysis validates voucher authenticity |
| 🔗 **Blockchain Escrow** | Smart contract holds funds securely |
| 💰 **MNEE Payments** | Stablecoin for predictable pricing |
| 🔒 **Secure Images** | Sharp.js blurs images until purchase |
| ⚡ **Auto-Release** | Funds auto-release when buyer confirms |
| 📦 **IPFS Storage** | Decentralized metadata via Pinata |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.7 | React framework with App Router |
| React | 19.2.0 | UI component library |
| TypeScript | ^5 | Type-safe JavaScript |
| Tailwind CSS | ^4 | Utility-first styling |
| Ethers.js | ^6.16.0 | Blockchain interactions |
| Sharp | ^0.32.6 | Image processing |

### Blockchain
| Technology | Purpose |
|------------|---------|
| Solidity ^0.8.20 | Smart contract language |
| Hardhat ^2.27.1 | Development & testing |
| OpenZeppelin ^4.9.3 | Audited contract libraries |
| Sepolia Testnet | Test network deployment |

### Storage
| Service | Purpose |
|---------|---------|
| IPFS (Pinata) | Decentralized file storage |

---

## 📜 Smart Contracts

### Deployed Addresses (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| MNEE Token | `0xC43765C9bD7F1fae094c173b8a61C072a0fd9755` |
| Marketplace | `0x9a4C9b8b9fEd8F21eC075bFA9d1cF49046c3d4B3` |
| Escrow | `0x07795A0BE1088Ea08fa6043524eeF6AB03c0408e` |

### VoucherMarketplace.sol
Manages voucher listings with 10 lifecycle states:
- `LISTED` → `LOCKED` → `REVEALED` → `RELEASED`
- Supports cancel, disputes, and admin intervention

### VoucherEscrow.sol
Secure payment handling:
- `lockPayment()` - Locks buyer payment, auto-reveals voucher
- `confirmVoucher()` - Auto-releases funds to seller
- `disputeVoucher()` - Initiates dispute with evidence
- `refundPayment()` - Admin refunds buyer

---

## 🏗️ Project Structure

```
couponmarche/
├── contracts/                    # Solidity smart contracts
│   ├── VoucherMarketplace.sol   # Listing management
│   ├── VoucherEscrow.sol        # Payment escrow
│   └── mocks/MockERC20.sol      # Test MNEE token
│
├── frontend/                     # Next.js 16 application
│   ├── app/
│   │   ├── page.tsx             # Home
│   │   ├── marketplace/         # Browse vouchers
│   │   ├── sell/                # List vouchers
│   │   ├── my-listings/         # Seller dashboard
│   │   ├── My-purchases/        # Buyer dashboard
│   │   └── api/                 # Backend APIs
│   ├── components/              # React components
│   ├── lib/                     # Utilities & contract calls
│   └── contexts/                # React contexts
│
├── scripts/                     # Deployment scripts
├── test/                        # Hardhat tests
└── hardhat.config.js
```

---

## � Third-Party APIs & SDKs

| Service | Purpose | License |
|---------|---------|---------|
| [Pinata](https://pinata.cloud) | IPFS pinning | MIT |
| [Alchemy](https://alchemy.com) | Ethereum RPC | ToS |
| [OpenZeppelin](https://openzeppelin.com) | Smart contracts | MIT |
| [Ethers.js](https://ethers.org) | Web3 library | MIT |
| [Sharp](https://sharp.pixelplumbing.com) | Image processing | Apache-2.0 |
| [MetaMask](https://metamask.io) | Wallet | ConsenSys ToS |

---

## 🧪 Testing

### Run Smart Contract Tests
```bash
npx hardhat test
```

### Run Specific Test
```bash
npx hardhat test test/escrow.test.js
npx hardhat test test/MarketPlace.test.js
```

### Test Coverage
- ✅ Listing creation & cancellation
- ✅ Payment locking & escrow
- ✅ Auto-reveal on payment
- ✅ Buyer confirmation & auto-release
- ✅ Dispute flow
- ✅ Admin refund/release
- ✅ Access control validation

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|----------------|
| Reentrancy Protection | OpenZeppelin `ReentrancyGuard` |
| Access Control | `onlyBuyer`, `onlySeller`, `onlyAdmin`, `onlyEscrow` |
| State Machine | Enforced transition validation |
| Input Validation | Zero-address, price > 0, expiry checks |
| Image Privacy | Blurred until purchase confirmed |
| Code Privacy | Partial pattern shown publicly |

---

## 🔧 Environment Variables

### Root (`/.env`)
```env
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=deployer_wallet_private_key
```

### Frontend (`/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PINATA_JWT=your_pinata_jwt_token
```

---

## 🚀 Deployment

### Deploy All Contracts
```bash
npm run deploy:all:sepolia
```

### Individual Deployments
```bash
npm run deploy:token        # MockERC20
npm run deploy:marketplace  # Marketplace
npm run deploy:escrow       # Escrow
```

### Update Frontend Addresses
After deployment, update addresses in `frontend/lib/contracts.ts`

---

## 🏆 Why MNEE?

| Benefit | For CouponMarché |
|---------|------------------|
| 💵 Stable Value | Predictable voucher pricing |
| ⚡ Low Fees | Micropayments viable |
| 🔒 Transparency | On-chain escrow visible |
| � Accessibility | No bank account needed |

---

## 🔮 Future Roadmap

- [ ] Multi-chain (Polygon, Arbitrum)
- [ ] NFT-based voucher ownership
- [ ] Seller reputation system
- [ ] AI price suggestions
- [ ] Mobile app (React Native)
- [ ] Batch listings
- [ ] Analytics dashboard

---

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

## 📧 Contact

Questions? Open an issue or reach out via the hackathon platform.

---

**Made with ❤️ for the MNEE Stablecoin Hackathon**
