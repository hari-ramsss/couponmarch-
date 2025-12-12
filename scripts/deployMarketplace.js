const hre = require("hardhat");

/**
 * @notice Deploy Marketplace contract
 * @dev 
 * CHOICE: We deploy VoucherMarketplace (production) instead of MockMarketplace (testing only)
 * 
 * REASONING:
 * - VoucherMarketplace is the full production contract with proper access controls (Ownable)
 * - It has comprehensive state management and escrow integration
 * - MockMarketplace is a simplified version for unit testing only
 * - For production deployments, always use VoucherMarketplace
 * 
 * If you need MockMarketplace for testing, use it in your test files directly.
 * 
 * @param {boolean} useMock - If true, deploy MockMarketplace (for testing). Default: false (deploy VoucherMarketplace)
 * @param {object} mockParams - Required if useMock=true: {seller, buyer, price, value, expiry, pattern, metadataHash, aiInitialProof}
 * @returns {Promise<string>} Deployed contract address
 */
async function deployMarketplace(useMock = false, mockParams = null) {
  console.log("\n=== Deploying Marketplace ===");
  console.log(`Network: ${hre.network.name}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);

  let marketplace;
  let address;

  if (useMock) {
    // Deploy MockMarketplace (for testing only)
    if (!mockParams) {
      throw new Error("MockMarketplace requires mockParams: {seller, buyer, price, value, expiry, pattern, metadataHash, aiInitialProof}");
    }

    console.log("\n⚠️  WARNING: Deploying MockMarketplace (testing only)");
    const MockMarketplace = await hre.ethers.getContractFactory("MockMarketplace");
    marketplace = await MockMarketplace.deploy(
      mockParams.seller,
      mockParams.buyer,
      mockParams.price,
      mockParams.value,
      mockParams.expiry,
      mockParams.pattern,
      mockParams.metadataHash,
      mockParams.aiInitialProof
    );
    await marketplace.waitForDeployment();
    address = await marketplace.getAddress();
    console.log(`\n✅ MockMarketplace deployed to: ${address}`);
  } else {
    // Deploy Marketplace (production) - contract name is "Marketplace" in VoucherMarketplace.sol
    console.log("\n📦 Deploying Marketplace (production contract from VoucherMarketplace.sol)");
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();
    address = await marketplace.getAddress();
    console.log(`\n✅ Marketplace deployed to: ${address}`);
    
    // Get owner address
    const owner = await marketplace.owner();
    console.log(`   Owner: ${owner}`);
  }

  return address;
}

// If running directly
if (require.main === module) {
  deployMarketplace()
    .then((address) => {
      console.log(`\n📝 Save this address for Escrow deployment: ${address}`);
      console.log(`\n⚠️  Remember to call setEscrowContract() on Marketplace after deploying Escrow!`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployMarketplace };

