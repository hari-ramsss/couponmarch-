const hre = require("hardhat");
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MockERC20Module", (m) => {
  const name = m.getParameter("name", "Mock MNEE");
  const symbol = m.getParameter("symbol", "mMNEE");
  const initialSupply = m.getParameter("initialSupply", hre.ethers.parseUnits("1000000", 18));

  const Token = m.contract("MockERC20", [name, symbol, initialSupply]);

  return { token: Token };
});
