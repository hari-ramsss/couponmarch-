const hre = require("hardhat");

async function main(amount, to) {
  const token = await hre.ethers.getContractAt(
    "MockERC20",
    "0x58cc5202F8aeC0B29003882a5921CC08db29bAC4"
  );

  const tx = await token.transfer(
    to,
    hre.ethers.parseUnits(amount.toString(), await token.decimals())
  );

  await tx.wait();

  console.log("Transfer successful:", tx.hash);
}

const amount = 0 //Replace with the amount of MNEE to transfer
const to = "0x0000000000000000000000000000000000000000" //Replace with the address to transfer the MNEE to

main(amount, to).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
