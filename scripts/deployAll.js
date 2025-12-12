const hre = require("hardhat");
const { deployMockERC20 } = require("./deployMockERC20");
const { deployMarketplace } = require("./deployMarketplace");
const { deployEscrow } = require("./deployEscrow");

/**
 * @notice Deploy all contracts in the correct order
 * @dev 
 * Deployment order:
 * 1. MockERC20 (token) - no dependencies
 * 2. Marketplace (from VoucherMarketplace.sol) - no dependencies
 * 3. Escrow - requires token and marketplace addresses
 * 4. Link Marketplace to Escrow (done automatically in deployEscrow)
 * 
 * @param {object} options - Deployment options
 * @param {string} options.tokenName - ERC20 token name (default: "MNEE Token")
 * @param {string} options.tokenSymbol - ERC20 token symbol (default: "MNEE")
 * @param {string} options.tokenSupply - Initial token supply in wei (default: "1000000000000000000000000" = 1M tokens)
 * @param {boolean} options.useMockMarketplace - Use MockMarketplace instead of VoucherMarketplace (default: false)
 * @returns {Promise<object>} Object with all deployed addresses
 */
async function deployAll(options = {}) {
  const {
    tokenName = "MNEE Token",
    tokenSymbol = "MNEE",
    tokenSupply = "1000000000000000000000000", // 1M tokens with 18 decimals
    useMockMarketplace = false,
  } = options;

  console.log("\n" + "=".repeat(60));
  console.log("🚀 DEPLOYING ALL CONTRACTS");
  console.log("=".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log(`Token: ${tokenName} (${tokenSymbol})`);
  console.log(`Supply: ${hre.ethers.formatEther(tokenSupply)} ${tokenSymbol}`);
    console.log(`Marketplace: ${useMockMarketplace ? "MockMarketplace (testing)" : "Marketplace (production)"}`);
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log(`\nDeployer: ${deployer.address}`);
  console.log(`Balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH\n`);

  const deployedAddresses = {};

  try {
    // Step 1: Deploy MockERC20
    console.log("\n" + "-".repeat(60));
    console.log("STEP 1: Deploying MockERC20");
    console.log("-".repeat(60));
    const tokenAddress = await deployMockERC20(tokenName, tokenSymbol, tokenSupply);
    deployedAddresses.token = tokenAddress;

    // Step 2: Deploy Marketplace
    console.log("\n" + "-".repeat(60));
    console.log("STEP 2: Deploying Marketplace");
    console.log("-".repeat(60));
    const marketplaceAddress = await deployMarketplace(useMockMarketplace, null);
    deployedAddresses.marketplace = marketplaceAddress;

    // Step 3: Deploy Escrow
    console.log("\n" + "-".repeat(60));
    console.log("STEP 3: Deploying Escrow");
    console.log("-".repeat(60));
    const escrowAddress = await deployEscrow(tokenAddress, marketplaceAddress);
    deployedAddresses.escrow = escrowAddress;

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log("\n📋 Deployed Addresses:");
    console.log(`   Token (${tokenSymbol}):     ${tokenAddress}`);
    console.log(`   Marketplace:                ${marketplaceAddress}`);
    console.log(`   Escrow:                     ${escrowAddress}`);
    console.log("\n📝 Save these addresses for your frontend/config!");

    // Network-specific info
    if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
      console.log("\n💡 Local deployment tips:");
      console.log("   - These addresses are valid only for this local network");
      console.log("   - Restarting Hardhat node will require redeployment");
    } else {
      console.log(`\n🌐 Network: ${hre.network.name}`);
      console.log("   - Verify contracts on block explorer if needed");
    }

    return deployedAddresses;
  } catch (error) {
    console.error("\n" + "=".repeat(60));
    console.error("❌ DEPLOYMENT FAILED");
    console.error("=".repeat(60));
    console.error(error);
    throw error;
  }
}

// If running directly
if (require.main === module) {
  deployAll()
    .then((addresses) => {
      console.log("\n✨ Deployment complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = { deployAll };

