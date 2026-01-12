const hre = require("hardhat");
const { deployMarketplace } = require("./deployMarketplace");
const { deployEscrow } = require("./deployEscrow");

// Real MNEE token on Ethereum Mainnet
const REAL_MNEE_MAINNET = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";

/**
 * @notice Deploy Marketplace + Escrow on Ethereum Mainnet using real MNEE token
 * @dev Does NOT deploy MockERC20
 *
 * Deployment order:
 * 1. Marketplace
 * 2. Escrow (needs token + marketplace)
 *
 * @param {object} options
 * @param {string} options.tokenAddress - ERC20 token address (defaults to REAL_MNEE_MAINNET)
 * @param {boolean} options.useMockMarketplace - if you have a mock marketplace option (default false)
 * @returns {Promise<object>} deployed addresses
 */
async function deployAllMainnet(options = {}) {
  const {
    tokenAddress = REAL_MNEE_MAINNET,
    useMockMarketplace = false,
  } = options;

  if (hre.network.name !== "mainnet") {
    throw new Error(
      `This script is for MAINNET only. Current network: ${hre.network.name}`
    );
  }

  console.log("\n" + "=".repeat(60));
  console.log("🚀 MAINNET DEPLOYMENT (USING REAL MNEE TOKEN)");
  console.log("=".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log(`MNEE Token: ${tokenAddress}`);
  console.log(
    `Marketplace: ${useMockMarketplace ? "MockMarketplace" : "Marketplace (production)"}`
  );
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // (Optional) basic sanity check that tokenAddress is a contract
  const code = await hre.ethers.provider.getCode(tokenAddress);
  if (code === "0x") {
    throw new Error(`tokenAddress is not a contract: ${tokenAddress}`);
  }

  const deployedAddresses = {};
  try {
    // Step 1: Deploy Marketplace
    console.log("\n" + "-".repeat(60));
    console.log("STEP 1: Deploying Marketplace");
    console.log("-".repeat(60));
    const marketplaceAddress = await deployMarketplace(useMockMarketplace, null);
    deployedAddresses.marketplace = marketplaceAddress;

    // Step 2: Deploy Escrow with REAL MNEE token + Marketplace
    console.log("\n" + "-".repeat(60));
    console.log("STEP 2: Deploying Escrow (Real MNEE)");
    console.log("-".repeat(60));
    const escrowAddress = await deployEscrow(tokenAddress, marketplaceAddress);
    deployedAddresses.escrow = escrowAddress;

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ MAINNET DEPLOYMENT SUCCESS");
    console.log("=".repeat(60));
    console.log("\n📋 Deployed Addresses:");
    console.log(`   Token (MNEE):               ${tokenAddress}`);
    console.log(`   Marketplace:                ${marketplaceAddress}`);
    console.log(`   Escrow:                     ${escrowAddress}`);
    console.log("\n📝 Save these addresses for your frontend/config!");

    return deployedAddresses;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ MAINNET DEPLOYMENT FAILED");
    console.error("=".repeat(60));
    console.error(error);
    throw error;
  }
}

// If running directly
if (require.main === module) {
  deployAllMainnet()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { deployAllMainnet };
