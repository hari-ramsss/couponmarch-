const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace", function () {
  let marketplace, seller, buyer, escrow, deployer;

  beforeEach(async () => {
    [deployer, seller, buyer, escrow] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();

    // Set escrow contract for testing escrow-only functions
    await marketplace.connect(deployer).setEscrowContract(escrow.address);
  });

  it("should allow seller to create a listing", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await expect(
      marketplace.connect(seller).createListing(
        metadataHash,
        "XXXX-1234-XX",
        ethers.parseEther("5"),
        ethers.parseEther("10"),
        expiry,
        aiProofHash
      )
    ).to.emit(marketplace, "ListingCreated");

    const listing = await marketplace.getListing(1);
    expect(listing.seller).to.equal(seller.address);
    expect(listing.price).to.equal(ethers.parseEther("5"));
    expect(listing.status).to.equal(1); // LISTED
  });

  it("should reject listing if expiry already passed", async () => {
    const expiredDate = Math.floor(Date.now() / 1000) - 50;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await expect(
      marketplace.connect(seller).createListing(
        metadataHash,
        "XXXX-1234-XX",
        ethers.parseEther("5"),
        ethers.parseEther("10"),
        expiredDate,
        aiProofHash
      )
    ).to.be.revertedWith("Marketplace: expiry must be in future");
  });

  it("only seller should update price", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(buyer).updateListingPrice(1, ethers.parseEther("7"))
    ).to.be.revertedWith("Marketplace: caller not seller");
  });

  it("should not allow price to be set to zero", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(seller).updateListingPrice(1, 0)
    ).to.be.revertedWith("Marketplace: price must be >0");
  });

  it("should allow seller to update price", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(seller).updateListingPrice(1, ethers.parseEther("6"))
    ).to.emit(marketplace, "ListingPriceUpdated");

    const listing = await marketplace.getListing(1);
    expect(listing.price).to.equal(ethers.parseEther("6"));
  });

  it("should allow seller to cancel listing", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(seller).cancelListing(1)
    ).to.emit(marketplace, "ListingCancelled");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(9); // CANCELLED
  });

  it("should not allow non-seller to cancel", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(buyer).cancelListing(1)
    ).to.be.revertedWith("Marketplace: caller not seller");
  });

  it("should allow escrow to lock listing", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(escrow).markAsLocked(1, buyer.address)
    ).to.emit(marketplace, "ListingLocked");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(2); // LOCKED
    expect(listing.buyer).to.equal(buyer.address);
  });

  it("should not allow non-escrow to lock listing", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await expect(
      marketplace.connect(buyer).markAsLocked(1, buyer.address)
    ).to.be.revertedWith("Marketplace: caller is not escrow");
  });

  it("should allow escrow to reveal voucher", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await marketplace.connect(escrow).markAsLocked(1, buyer.address);

    await expect(
      marketplace.connect(escrow).markAsRevealed(1)
    ).to.emit(marketplace, "ListingRevealed");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(3); // REVEALED
  });

  it("should allow escrow to mark buyer confirmed", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await marketplace.connect(escrow).markAsLocked(1, buyer.address);
    await marketplace.connect(escrow).markAsRevealed(1);

    await expect(
      marketplace.connect(escrow).markBuyerConfirmed(1)
    ).to.emit(marketplace, "ListingBuyerConfirmed");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(4); // BUYER_CONFIRMED
  });

  it("should allow escrow to mark buyer disputed", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await marketplace.connect(escrow).markAsLocked(1, buyer.address);
    await marketplace.connect(escrow).markAsRevealed(1);

    await expect(
      marketplace.connect(escrow).markBuyerDisputed(1, "ipfs://evidence")
    ).to.emit(marketplace, "ListingBuyerDisputed");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(5); // BUYER_DISPUTED
  });

  it("should allow escrow to release payment", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await marketplace.connect(escrow).markAsLocked(1, buyer.address);
    await marketplace.connect(escrow).markAsRevealed(1);
    await marketplace.connect(escrow).markBuyerConfirmed(1);

    await expect(
      marketplace.connect(escrow).markReleased(1)
    ).to.emit(marketplace, "ListingReleased");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(7); // RELEASED
  });

  it("should allow escrow to refund payment", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await marketplace.connect(escrow).markAsLocked(1, buyer.address);

    await expect(
      marketplace.connect(escrow).markRefunded(1)
    ).to.emit(marketplace, "ListingRefunded");

    const listing = await marketplace.getListing(1);
    expect(listing.status).to.equal(8); // REFUNDED
  });

  it("should check if listing is active", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    expect(await marketplace.isActive(1)).to.be.true;

    await marketplace.connect(escrow).markAsLocked(1, buyer.address);

    expect(await marketplace.isActive(1)).to.be.false;
  });

  it("should update AI proof hash", async () => {
    const expiry = Math.floor(Date.now() / 1000) + 5000;
    const metadataHash = ethers.keccak256(ethers.toUtf8Bytes("ipfs://hash"));
    const aiProofHash = ethers.keccak256(ethers.toUtf8Bytes("ai-proof"));
    const newProofHash = ethers.keccak256(ethers.toUtf8Bytes("new-ai-proof"));

    await marketplace.connect(seller).createListing(
      metadataHash,
      "XXXX-1234-XX",
      ethers.parseEther("5"),
      ethers.parseEther("10"),
      expiry,
      aiProofHash
    );

    await marketplace.connect(seller).updateAIInitialProof(1, newProofHash);

    const listing = await marketplace.getListing(1);
    expect(listing.aiInitialProof).to.equal(newProofHash);
  });

  it("should set escrow contract address", async () => {
    const newEscrow = buyer.address;

    await expect(
      marketplace.connect(deployer).setEscrowContract(newEscrow)
    ).to.emit(marketplace, "EscrowContractUpdated");

    expect(await marketplace.escrowContract()).to.equal(newEscrow);
  });

  it("should not allow non-owner to set escrow", async () => {
    await expect(
      marketplace.connect(seller).setEscrowContract(buyer.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

});
