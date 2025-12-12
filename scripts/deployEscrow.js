const hre = require("hardhat");

/**
 * @notice Deploy Escrow contract
 * @dev Escrow requires addresses of ERC20 token and Marketplace contract
 * @param {string} mneeTokenAddress - Address of the ERC20 token contract (MockERC20 or production token)
 * @param {string} marketplaceAddress - Address of the Marketplace contract (VoucherMarketplace)
 * @returns {Promise<string>} Deployed contract address
 */
async function deployEscrow(mneeTokenAddress, marketplaceAddress) {
  console.log("\n=== Deploying Escrow ===");
  console.log(`Network: ${hre.network.name}`);

  // Validate addresses
  if (!mneeTokenAddress || !hre.ethers.isAddress(mneeTokenAddress)) {
    throw new Error("Invalid mneeTokenAddress provided");
  }
  if (!marketplaceAddress || !hre.ethers.isAddress(marketplaceAddress)) {
    throw new Error("Invalid marketplaceAddress provided");
  }

  console.log(`ERC20 Token Address: ${mneeTokenAddress}`);
  console.log(`Marketplace Address: ${marketplaceAddress}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);

  // Verify contracts exist
  try {
    const tokenCode = await hre.ethers.provider.getCode(mneeTokenAddress);
    if (tokenCode === "0x") {
      throw new Error(`No contract found at token address: ${mneeTokenAddress}`);
    }
    console.log("✅ Token contract verified");

    const marketplaceCode = await hre.ethers.provider.getCode(marketplaceAddress);
    if (marketplaceCode === "0x") {
      throw new Error(`No contract found at marketplace address: ${marketplaceAddress}`);
    }
    console.log("✅ Marketplace contract verified");
  } catch (error) {
    console.error("❌ Contract verification failed:", error.message);
    throw error;
  }

  // Deploy Escrow - contract name is "Escrow" in VoucherEscrow.sol
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(mneeTokenAddress, marketplaceAddress);

  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log(`\n✅ Escrow deployed to: ${address}`);
  console.log(`   Admin: ${deployer.address}`);

  // Verify deployment
  const admin = await escrow.admin();
  const token = await escrow.mneeToken();
  const marketplace = await escrow.marketplace();
  
  console.log(`   Verified Admin: ${admin}`);
  console.log(`   Verified Token: ${token}`);
  console.log(`   Verified Marketplace: ${marketplace}`);

  // Link Marketplace to Escrow (if Marketplace is VoucherMarketplace)
  try {
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplaceContract = Marketplace.attach(marketplaceAddress);
    const owner = await marketplaceContract.owner();
    
    if (owner.toLowerCase() === deployer.address.toLowerCase()) {
      console.log("\n🔗 Linking Marketplace to Escrow...");
      const tx = await marketplaceContract.setEscrowContract(address);
      await tx.wait();
      console.log(`✅ Marketplace.setEscrowContract(${address}) called`);
      
      // Verify link
      const escrowContract = await marketplaceContract.escrowContract();
      if (escrowContract.toLowerCase() === address.toLowerCase()) {
        console.log("✅ Marketplace ↔ Escrow link verified");
      }
    } else {
      console.log(`\n⚠️  Warning: Marketplace owner is ${owner}, not deployer.`);
      console.log(`   Please call setEscrowContract(${address}) manually on Marketplace.`);
    }
  } catch (error) {
    console.log(`\n⚠️  Could not auto-link Marketplace (may be MockMarketplace or different owner): ${error.message}`);
    console.log(`   Please call setEscrowContract(${address}) manually on Marketplace if needed.`);
  }

  return address;
}

// If running directly
if (require.main === module) {
  // Get addresses from command line or environment
  const mneeTokenAddress = process.argv[2];
  const marketplaceAddress = process.argv[3];

  if (!mneeTokenAddress || !marketplaceAddress) {
    console.error("\n❌ Usage: npx hardhat run scripts/deployEscrow.js --network <network> <mneeTokenAddress> <marketplaceAddress>");
    console.error("   Example: npx hardhat run scripts/deployEscrow.js --network localhost 0x123... 0x456...");
    process.exit(1);
  }

  deployEscrow(mneeTokenAddress, marketplaceAddress)
    .then((address) => {
      console.log(`\n📝 Escrow deployment complete: ${address}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployEscrow };

