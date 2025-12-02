const { expect } = require("chai");
const { ethers } = require("hardhat");

// Mock marketplace: returns listings in correct structure
async function deployMockMarketplace(seller, buyer, overrides = {}) {
  const Mock = await ethers.getContractFactory("MockMarketplace");
  const mock = await Mock.deploy(
    seller.address,
    buyer.address,
    overrides.price || ethers.parseEther("1"),
    overrides.value || 1000,
    overrides.expiry || (Math.floor(Date.now() / 1000) + 3600), // +1 hour expiry
    overrides.partialPattern || "XXXX-ABCD",
    overrides.metadataHash || ethers.hexlify(ethers.randomBytes(32)),
    overrides.aiInitialProof || ethers.hexlify(ethers.randomBytes(32))
  );
  return mock;
}

describe("Escrow.sol", function () {
  let escrow, token, marketplace;
  let owner, seller, buyer, admin;

  beforeEach(async () => {
    [owner, seller, buyer, admin] = await ethers.getSigners();

    // Deploy ERC20 mock
    const Token = await ethers.getContractFactory("MockERC20");
    token = await Token.deploy("MNEE", "MNEE", ethers.parseEther("1000000"));

    // Give buyer > enough balance
    await token.transfer(buyer.address, ethers.parseEther("100"));

    // Deploy Mock marketplace
    marketplace = await deployMockMarketplace(seller, buyer);

    // Deploy escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(await token.getAddress(), await marketplace.getAddress());

    // Buyer approves escrow
    await token.connect(buyer).approve(await escrow.getAddress(), ethers.parseEther("100"));
  });

  // ---------------------------------------
  //  TEST: Locking Payment
  // ---------------------------------------
  it("Should lock payment successfully", async () => {
    await escrow.connect(buyer).lockPayment(1);

    const escrowData = await escrow.getEscrowData(1);
    expect(escrowData.lockedAmount).to.equal(ethers.parseEther("1"));

    const listing = await marketplace.getListing(1);
    expect(listing[8]).to.equal(buyer.address); // buyer address
    expect(listing[7]).to.equal(2); // LOCKED status
  });

  it("Should fail locking if expired", async () => {
    const expiredMarketplace = await deployMockMarketplace(
      seller,
      buyer,
      { expiry: Math.floor(Date.now() / 1000) - 10 }
    );
    const Escrow2 = await ethers.getContractFactory("Escrow");
    const escrow2 = await Escrow2.deploy(await token.getAddress(), await expiredMarketplace.getAddress());

    await token.connect(buyer).approve(await escrow2.getAddress(), ethers.parseEther("100"));

    await expect(
      escrow2.connect(buyer).lockPayment(1)
    ).to.be.revertedWith("Voucher expired");
  });

  it("Should fail if seller tries to buy own voucher", async () => {
    await expect(
      escrow.connect(seller).lockPayment(1)
    ).to.be.revertedWith("Seller can't buy own voucher");
  });

  // ---------------------------------------
  // SELLER REVEALS
  // ---------------------------------------
  it("Seller can reveal only after lock", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);

    const listing = await marketplace.getListing(1);
    expect(listing[7]).to.equal(3); // REVEALED status
  });

  it("Should fail reveal if not locked", async () => {
    await expect(
      escrow.connect(seller).revealVoucher(1)
    ).to.be.revertedWith("Not LOCKED");
  });

  // ---------------------------------------
  // BUYER CONFIRM
  // ---------------------------------------
  it("Buyer confirm only after reveal", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).confirmVoucher(1);

    const listing = await marketplace.getListing(1);
    expect(listing[7]).to.equal(4); // BUYER_CONFIRMED status
  });

  it("Should fail confirm if not revealed", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await expect(
      escrow.connect(buyer).confirmVoucher(1)
    ).to.be.revertedWith("Must be REVEALED");
  });

  // ---------------------------------------
  // DISPUTE
  // ---------------------------------------
  it("Buyer can dispute after reveal", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).disputeVoucher(1, "ipfs://evidence-hash");

    const listing = await marketplace.getListing(1);
    expect(listing[7]).to.equal(5); // BUYER_DISPUTED status

    const escrowData = await escrow.getEscrowData(1);
    expect(escrowData.disputeEvidenceCID).to.equal("ipfs://evidence-hash");
  });

  // ---------------------------------------
  // ADMIN RELEASE
  // ---------------------------------------
  it("Admin can release funds after confirm", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).confirmVoucher(1);

    await escrow.connect(owner).releasePayment(1);

    const sellerBal = await token.balanceOf(seller.address);
    expect(sellerBal).to.equal(ethers.parseEther("1"));

    const listing = await marketplace.getListing(1);
    expect(listing[7]).to.equal(7); // RELEASED status
  });

  // ---------------------------------------
  // ADMIN REFUND
  // ---------------------------------------
  it("Admin can refund in LOCKED state", async () => {
    await escrow.connect(buyer).lockPayment(1);

    await escrow.connect(owner).refundPayment(1);

    const buyerBal = await token.balanceOf(buyer.address);
    expect(buyerBal).to.equal(ethers.parseEther("100")); // full refund

    const listing = await marketplace.getListing(1);
    expect(listing[7]).to.equal(8); // REFUNDED status
  });

  it("Admin can refund after dispute", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).disputeVoucher(1, "ipfs://evidence");

    await escrow.connect(owner).refundPayment(1);

    const buyerBal = await token.balanceOf(buyer.address);
    expect(buyerBal).to.equal(ethers.parseEther("100"));
  });

  // ---------------------------------------
  // ADMIN MANAGEMENT
  // ---------------------------------------
  it("Admin can update admin address", async () => {
    await escrow.connect(owner).updateAdmin(admin.address);

    const newAdmin = await escrow.admin();
    expect(newAdmin).to.equal(admin.address);
  });

  it("Non-admin cannot update admin", async () => {
    await expect(
      escrow.connect(buyer).updateAdmin(admin.address)
    ).to.be.revertedWith("Not admin");
  });

  // ---------------------------------------
  // ESCALATION
  // ---------------------------------------
  it("Buyer can escalate dispute to admin", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).disputeVoucher(1, "ipfs://evidence");

    await expect(
      escrow.connect(buyer).escalateToAdmin(1)
    ).to.emit(escrow, "EscalatedToAdmin");
  });

  it("Seller can escalate dispute to admin", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).disputeVoucher(1, "ipfs://evidence");

    await expect(
      escrow.connect(seller).escalateToAdmin(1)
    ).to.emit(escrow, "EscalatedToAdmin");
  });

  it("Random user cannot escalate", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);
    await escrow.connect(buyer).disputeVoucher(1, "ipfs://evidence");

    await expect(
      escrow.connect(admin).escalateToAdmin(1)
    ).to.be.revertedWith("Not authorized to escalate");
  });

  // ---------------------------------------
  // EDGE CASES
  // ---------------------------------------
  it("Cannot dispute without evidence", async () => {
    await escrow.connect(buyer).lockPayment(1);
    await escrow.connect(seller).revealVoucher(1);

    await expect(
      escrow.connect(buyer).disputeVoucher(1, "")
    ).to.be.revertedWith("Evidence required");
  });

  it("Cannot lock payment twice", async () => {
    await escrow.connect(buyer).lockPayment(1);

    await expect(
      escrow.connect(buyer).lockPayment(1)
    ).to.be.revertedWith("Not LISTED");
  });

});
