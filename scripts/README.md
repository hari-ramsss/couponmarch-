# Deployment Scripts Documentation

This directory contains Hardhat deployment scripts for the Coupon March contracts.

## 📁 Scripts Overview

- **`deployMockERC20.js`** - Deploys the MockERC20 token contract
- **`deployMarketplace.js`** - Deploys the VoucherMarketplace contract (production)
- **`deployEscrow.js`** - Deploys the Escrow contract (requires token and marketplace addresses)
- **`deployAll.js`** - Deploys all contracts in the correct order with automatic linking

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Sepolia Testnet
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

**⚠️ WARNING:** Never commit your `.env` file or private keys to version control!

### 3. Deploy Contracts

#### Deploy All Contracts (Recommended)

```bash
# Deploy to localhost
npm run deploy:all

# Deploy to Sepolia testnet
npm run deploy:all:sepolia
```

Or using Hardhat directly:

```bash
# Localhost
npx hardhat run scripts/deployAll.js --network localhost

# Sepolia
npx hardhat run scripts/deployAll.js --network sepolia
```

#### Deploy Individual Contracts

If you need to deploy contracts separately (e.g., reusing existing addresses):

```bash
# 1. Deploy Token
npx hardhat run scripts/deployMockERC20.js --network localhost

# 2. Deploy Marketplace
npx hardhat run scripts/deployMarketplace.js --network localhost

# 3. Deploy Escrow (requires token and marketplace addresses)
npx hardhat run scripts/deployEscrow.js --network localhost <TOKEN_ADDRESS> <MARKETPLACE_ADDRESS>
```

## 📋 Deployment Order

The contracts have dependencies that must be respected:

1. **MockERC20** - No dependencies
2. **VoucherMarketplace** - No dependencies
3. **Escrow** - Requires:
   - ERC20 token address
   - Marketplace address
4. **Link Marketplace ↔ Escrow** - Automatically done by `deployEscrow.js`

## 🎯 Contract Selection

### Marketplace Contract

The scripts deploy **VoucherMarketplace** (production) by default, not MockMarketplace.

**Why VoucherMarketplace?**
- Full production contract with proper access controls (Ownable)
- Comprehensive state management
- Escrow integration
- Event emissions for frontend integration

**MockMarketplace** is only for unit testing and should not be deployed to production networks.

## 🔧 Configuration

### Network Configuration

Networks are configured in `hardhat.config.js`:

- **localhost** - Local Hardhat node (http://127.0.0.1:8545)
- **sepolia** - Sepolia testnet (requires Alchemy RPC URL and private key)

### Custom Token Parameters

You can customize token deployment in `deployAll.js`:

```javascript
const addresses = await deployAll({
  tokenName: "My Token",
  tokenSymbol: "MTK",
  tokenSupply: "1000000000000000000000000", // 1M tokens (18 decimals)
});
```

## 📝 Output

All scripts provide detailed console output including:
- Network information
- Deployer address and balance
- Deployed contract addresses
- Verification of contract state
- Link status between contracts

Example output:
```
✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY
📋 Deployed Addresses:
   Token (MNEE):     0x1234...
   Marketplace:      0x5678...
   Escrow:           0x9abc...
```

## 🔗 Contract Linking

The `deployEscrow.js` script automatically:
1. Verifies that token and marketplace contracts exist
2. Deploys Escrow with the provided addresses
3. Links Marketplace to Escrow by calling `setEscrowContract()`
4. Verifies the link was successful

If auto-linking fails (e.g., different owner), you'll need to manually call:
```solidity
marketplace.setEscrowContract(escrowAddress);
```

## 🧪 Testing Deployment

### Localhost Testing

1. Start a local Hardhat node:
   ```bash
   npx hardhat node
   ```

2. In another terminal, deploy:
   ```bash
   npx hardhat run scripts/deployAll.js --network localhost
   ```

3. Use the deployed addresses in your frontend or tests

### Sepolia Testing

1. Ensure your `.env` file has valid Sepolia credentials
2. Fund your deployer account with Sepolia ETH (from a faucet)
3. Deploy:
   ```bash
   npx hardhat run scripts/deployAll.js --network sepolia
   ```

## 🛠️ Troubleshooting

### "Invalid token address" or "Invalid marketplace address"
- Ensure addresses are valid Ethereum addresses (0x...)
- Verify contracts are deployed on the target network

### "No contract found at address"
- The contract may not be deployed yet
- Check you're using the correct network
- Verify the address is correct

### "Marketplace owner is different"
- The Marketplace owner must call `setEscrowContract()` manually
- Or deploy with the Marketplace owner account

### Insufficient funds
- Ensure your deployer account has enough ETH for gas
- For Sepolia, use a faucet to get test ETH

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethereum Sepolia Faucet](https://sepoliafaucet.com/)

