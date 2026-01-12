# CouponMarch Frontend (Next.js)

A Next.js 13+ app for the CouponMarch marketplace — a web frontend that integrates with Next.js API routes for IPFS uploads and with on-chain smart contracts (VoucherMarketplace, VoucherEscrow) for listing, buying, and escrow workflows.

---

## 🔍 Overview

This repository contains the frontend application (Next.js App Router) powering the marketplace UI, file uploads to IPFS (Pinata), image processing, and client-side contract interactions (via ethers). API routes under `app/api/*` provide the server-side upload and verification endpoints.

Key capabilities:
- Upload voucher images, logos, and metadata to IPFS (Pinata) with image processing (thumbnails, blur, resize) 🔧
- Store metadata CID for vouchers and serve via IPFS gateway 🌐
- Interact with smart contracts (marketplace & escrow) using `ethers` and the built-in `lib/contracts.ts` config ⚖️
- Health check and helper API routes under `app/api/*`

---

## 🚀 Quickstart

Prerequisites:
- Node.js (v18+ recommended)
- npm, pnpm or yarn
- (Optional) Hardhat/Local node for local blockchain testing

Install and run locally:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

---

## ⚙️ Environment Variables

Create `frontend/.env.local` and add the values you need. Common variables used by the app:

```env
# IPFS / Pinata
PINATA_JWT=your_pinata_jwt_token_here

# Client -> Next API base
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# RPC endpoint for the chain you connect to (e.g. local Hardhat or Sepolia)
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

After deploying contracts for a real or local network, update contract addresses in `lib/contracts.ts` (see the top of the file). The project uses those constants for on-chain calls.

---

## 🧪 Local Blockchain / Contracts

To test smart contract flows locally:

1. Start a Hardhat node from the repository root (not the frontend folder):

```bash
# from repo root
npx hardhat node
```

2. Deploy contracts (scripts available in the `scripts/` folder):

```bash
node scripts/deployMockERC20.js
# or
node scripts/deployAll.js
```

3. Copy deployed addresses into `frontend/lib/contracts.ts` and set `NEXT_PUBLIC_RPC_URL` to `http://localhost:8545`.

---

## 📁 API Routes (Server-side)

Implemented under `app/api` (see `BACKEND_MIGRATION.md`):
- `GET /api/health` — health check
- `POST /api/upload/voucher-logo` — upload logo image (returns IPFS hashes)
- `POST /api/upload/voucher-image` — upload voucher image (returns multiple sizes/CIDs)
- `POST /api/upload/voucher-metadata` — publish voucher metadata to IPFS (returns CID)

These routes wrap Pinata uploads and internal image processing (uses `sharp`).

---

## 🛠 Important Files & Locations

- `app/` — Next.js app routes and pages
- `app/api/*` — Server-side API routes for upload & verification
- `lib/ipfs-service.ts` — helpers for uploading to Pinata
- `lib/contracts.ts` — network config, ABIs and contract addresses (replace with your deployed addresses)
- `components/` — React components used across the app

---

## ✅ Testing & Linting

- Lint: `npm run lint`
- There are integration tests for core contracts in the repo root (see `test/`), and the frontend includes utility tests and API route checks under `frontend/test-*` (where applicable).

---

## 📦 Deployment

- The frontend is a standard Next.js app and can be deployed on Vercel or any Node host that supports Next.js.
- Ensure `PINATA_JWT` and runtime env vars are set in your deployment environment.
- When deploying to production, point `NEXT_PUBLIC_API_URL` to the production domain and update contract addresses to the network you deployed to (e.g., Sepolia or mainnet).

---

## 🔧 Troubleshooting

- IPFS uploads failing: verify `PINATA_JWT` and API limits on Pinata. See `BACKEND_MIGRATION.md` for diagnostics.
- Contract calls failing: make sure `NEXT_PUBLIC_RPC_URL` is correct and `lib/contracts.ts` has the correct addresses.
- Image processing errors: ensure `sharp` is installed (platform-specific build) and image files are supported.

---

## Contributing

- Add features or bugfixes as PRs to the `frontend/` folder and include changelog notes.
- When touching contract integrations, prefer tests and document address changes.

---

## License

See the repository root for license information.


Enjoy building! ⚡

