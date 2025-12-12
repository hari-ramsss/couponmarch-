const hre = require("hardhat");

/**
 * @notice Deploy MockERC20 token contract
 * @dev This is a mock ERC20 token for testing purposes
 * @param {string} name - Token name (e.g., "Mock Token")
 * @param {string} symbol - Token symbol (e.g., "MOCK")
 * @param {string} supply - Initial supply in wei/smallest unit (e.g., "1000000000000000000000000" for 1M tokens with 18 decimals)
 * @returns {Promise<string>} Deployed contract address
 */
async function deployMockERC20(name = "Mock Token", symbol = "MOCK", supply = "1000000000000000000000000") {
  console.log("\n=== Deploying MockERC20 ===");
  console.log(`Network: ${hre.network.name}`);
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Initial Supply: ${supply}`);

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);
  console.log(`Account balance: ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);

  // Deploy MockERC20
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20.deploy(name, symbol, supply);

  await mockERC20.waitForDeployment();
  const address = await mockERC20.getAddress();

  console.log(`\n✅ MockERC20 deployed to: ${address}`);
  console.log(`   Name: ${name}`);
  console.log(`   Symbol: ${symbol}`);
  console.log(`   Supply: ${supply} (${hre.ethers.formatEther(supply)} tokens)`);

  // Verify deployment
  const totalSupply = await mockERC20.totalSupply();
  console.log(`   Verified Total Supply: ${totalSupply.toString()}`);

  return address;
}

// If running directly
if (require.main === module) {
  deployMockERC20()
    .then((address) => {
      console.log(`\n📝 Save this address for Escrow deployment: ${address}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployMockERC20 };

