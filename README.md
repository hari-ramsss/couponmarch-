# 🏪 COUPONmarché 

> A decentralized marketplace for buying and selling vouchers, coupons, and gift cards with zero fraud using AI-powered validation and blockchain-powered escrow.

Built for the **MNEE Stablecoin Hackathon**, powered by the **MNEE ERC-20** token.

---

## 🚧 Problem

Consumers often accumulate vouchers and gift cards they never use. But existing resale platforms suffer from:

- ❌ **High fraud risk**
- ❌ **Manual verification**
- ❌ **No secure payment protection**
- ❌ **Seller scams** (invalid/used vouchers)
- ❌ **Buyer scams** (redeems voucher but refuses to pay)

**There is no trustless, automated, secure way to convert unused vouchers into money.**

---

## 💡 Our Solution

Users lose thousands in fake voucher scams. We solve this with:

### Key Features:
- ✨ **AI-based coupon authenticity checks**
- 🔗 **Ethereum smart contracts** for safe escrow
- 💰 **MNEE ERC20 token** for trustless payments
- 🎭 **Fraud-proof dispute resolution**
- 🔒 **Escrow-powered transactions**

### How It Works:
1. Buyer payment is locked in escrow when they purchase a voucher
2. Funds are auto-released only after verification succeeds
3. AI validates both listing and dispute evidence
4. Admin has final say in edge cases

---

## 🌟 Core Features

### 🔐 Secure Listing Creation
1. Seller uploads coupon details + image
2. AI checks expiry, authenticity, code pattern, metadata
3. Generates an **AI Validation Proof Hash**
4. Valid listings go on-chain
5. Image is blurred on frontend for protection

### 🛒 Safe Buying
1. Buyer pays using MNEE tokens
2. Funds go to **Escrow Smart Contract**, not seller
3. Buyer gets full code + unblurred image

### 🔍 7-Hour Verification Window
Buyer must confirm:
- ✔ **Coupon worked** → seller gets paid
- ✖ **Coupon failed** → buyer disputes and uploads proof

### 🤖 AI-Powered Dispute Resolution
When buyer disputes:
1. AI analyzes failure screenshot
2. Detects tampering
3. OCR reads rejection message
4. Generates a **Final Proof Hash**
5. Admin uses this to make the final call

### 🔗 Smart Contract Escrow
Supports:
- Locking payments
- Releasing to seller
- Refunding buyer
- Admin override
- Full transparency

---

## 🧱 Project Architecture

```
frontend/ (Next.js)
│
backend/ (Node.js / Python)
│
├── AI Validation Engine
│   ├─ OCR (Tesseract / Vision API)
│   ├─ Forgery Detection (Error Level Analysis / CV)
│   ├─ Metadata Extraction
│   ├─ Validity Scoring
│   └─ Proof Hash Generator
│
├── Storage Layer
│   ├─ IPFS (Pinata / Web3Storage)
│   └─ Encrypted Images
│
└── Blockchain Layer
    ├─ Marketplace.sol
    ├─ Escrow.sol
    ├─ MNEE Token (ERC20)
    └─ Hardhat scripts & tests
```

---

## 📝 DApp Flow (Simplified)

```
SELLER → Upload Coupon
       → Backend AI verifies (OCR + Authenticity)
       → IPFS upload (Blurred + Original)
       → Smart Contract stores listing

BUYER → View listings (blurred / partial code)
      → Pay with MNEE → Escrow locks funds
      → Gets full access

BUYER → Redeems voucher
      → Confirms or Disputes

DISPUTE → AI verifies screenshot
        → Admin decides
        → Escrow releases or refunds
```

---

## 🔗 Smart Contracts

### 📌 Marketplace.sol

**Handles:**
- Create voucher listing
- Locking step initialization
- Reveal step by seller
- Buyer confirm / dispute
- Admin intervention
- Final payout state changes

**Key Security Features:**
- Enforced state transitions
- Expiry validation
- Price validation
- Buyer address checks
- Metadata hash verification

**Events:**
- `ListingCreated`
- `ListingLocked`
- `ListingRevealed`
- `ListingBuyerConfirmed`
- `ListingBuyerDisputed`
- `ListingReleased`
- `ListingRefunded`

### 📌 Escrow.sol

**Handles:**
- Payment locking
- Admin review
- Secure release or refund
- Final settlement

**Security Features:**
- `ReentrancyGuard` protection
- Token transfer validation
- Strict state control
- `onlyBuyer` / `onlySeller` / `onlyAdmin` modifiers

---

## 🧪 Testing (Hardhat)

**Tests cover:**
- ✅ Creating a listing
- ✅ Locking funds in escrow
- ✅ Seller reveal
- ✅ Buyer confirm
- ✅ Buyer dispute
- ✅ Admin settlement
- ✅ Refunding
- ✅ Rejecting invalid state transitions

**Run tests:**
```bash
npx hardhat test
```

**Run specific test:**
```bash
npx hardhat test test/escrow.test.js
npx hardhat test test/MarketPlace.test.js
```

---

## 🧠 AI Validation Engine

### 1️⃣ Initial Listing Validation
- Extracts expiry date
- OCR of coupon text
- Detects tampering (Image Error Level Analysis)
- Validity score (0–100)
- **AI Initial Proof Hash** stored on-chain

### 2️⃣ Dispute Validation
- OCR failure screenshot
- Compare metadata
- Detect fake evidence
- **Final Proof Hash** sent to admin

---

## 🎨 Frontend (Next.js + Wagmi)

**Includes:**
- 🔌 Wallet connection
- 📝 Create Listing form
- 🤖 AI validation progress UI
- 🛒 Marketplace page
- 🎫 Voucher reveal page
- ⏱️ Verification countdown (7 hours)
- 🚨 Dispute submission UI
- 👨‍💼 Admin panel

---

## 🗂️ Project Folder Structure

```
root/
├── contracts/
│   ├── VoucherMarketplace.sol
│   ├── VoucherEscrow.sol
│   └── mocks/
│       ├── MockMarketplace.sol
│       └── MockERC20.sol
│
├── test/
│   ├── MarketPlace.test.js
│   └── escrow.test.js
│
├── scripts/
│   └── deploy.js
│
├── backend/
│   ├── app.js (API)
│   ├── ai/
│   │   ├── ocr.js
│   │   ├── tampering.js
│   │   └── validityScore.js
│   └── storage/
│       └── ipfs.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   └── hooks/
│
└── README.md
```

---

## 🚀 Deployment Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npx hardhat compile
```

### 3. Run Tests
```bash
npx hardhat test
```

### 4. Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 5. Update Frontend ENV
```env
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_ADDRESS=0x...
NEXT_PUBLIC_MNEE_ADDRESS=0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF
```

### 6. Start Backend
```bash
cd backend
npm run dev
```

### 7. Start Frontend
```bash
cd frontend
npm run dev
```

---

## 📜 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## 📧 Contact

For questions or support, reach out via the hackathon platform or open an issue on GitHub.

---

## 🏆 Hackathon Submission

**Built with ❤️ for the MNEE Stablecoin Hackathon**

### Why MNEE?
- Stable value for predictable pricing
- Fast, low-cost transactions
- Perfect for micropayments (voucher resale)
- Built-in trust through blockchain transparency

---

## 🔮 Future Enhancements

- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] NFT-based voucher ownership
- [ ] Reputation system for sellers
- [ ] Automated price suggestions using AI
- [ ] Mobile app (React Native)
- [ ] Integration with major voucher providers
- [ ] Batch listing support
- [ ] Advanced analytics dashboard

---

## 🛡️ Security Considerations

- ✅ ReentrancyGuard on all payment functions
- ✅ State machine validation
- ✅ Access control modifiers
- ✅ Expiry checks before locking
- ✅ Zero-address validation
- ✅ Price validation (must be > 0)
- ✅ Escrow-only state transitions
- ✅ Event logging for transparency

---

**Built with ❤️ for the MNEE Stablecoin Hackathon**