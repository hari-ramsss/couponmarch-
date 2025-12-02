const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoucherMarketplace", function () {

  let marketplace, seller, buyer;

  beforeEach(async () => {
    [seller, buyer] = await ethers.getSigners();
    const Marketplace = await ethers.getContractFactory("VoucherMarketplace");
    marketplace = await Marketplace.deploy();
    await marketplace.waitForDeployment();
  });

  it("Should allow seller to list voucher", async function () {
    await marketplace.connect(seller).listVoucher(
      1000,
      "image_hash",
      "hash_of_code",
      "Redeem at outlet"
    );

    const voucher = await marketplace.vouchers(0);

    expect(voucher.price).to.equal(1000);
    expect(voucher.seller).to.equal(seller.address);
    expect(voucher.status).to.equal(0); // Status.Listed
  });

  it("Should not allow price of zero", async function () {
    await expect(
      marketplace.connect(seller).listVoucher(
        0,
        "img",
        "code",
        "instructions"
      )
    ).to.be.revertedWith("Price must be > 0");
  });
});
