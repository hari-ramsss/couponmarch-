// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IMarketplace {
    function markAsLocked(uint256 id, address buyer) external;
    function markAsRevealed(uint256 id) external;
    function markBuyerConfirmed(uint256 id) external;
    function markBuyerDisputed(
        uint256 id,
        string calldata evidenceCID
    ) external;
    function markReleased(uint256 id) external;
    function markRefunded(uint256 id) external;
    function getListing(
        uint256 id
    )
        external
        view
        returns (
            uint256 listingId,
            address seller,
            bytes32 metadataHash,
            string memory partialPattern,
            uint256 price,
            uint256 value,
            uint256 expiryTimestamp,
            uint8 status,
            address buyer,
            uint256 createdAt,
            bytes32 aiInitialProof
        );
}

contract Escrow is ReentrancyGuard {
    IERC20 public mneeToken;
    address public admin;
    IMarketplace public marketplace;

    // Escrow-specific data (minimal)
    struct EscrowData {
        uint256 lockedAmount;
        uint256 lockTimestamp;
        string disputeEvidenceCID;
    }

    mapping(uint256 => EscrowData) public escrowData;

    constructor(address _mneeToken, address _marketplace) {
        require(_mneeToken != address(0), "Invalid token address");
        require(_marketplace != address(0), "Invalid marketplace address");
        mneeToken = IERC20(_mneeToken);
        marketplace = IMarketplace(_marketplace);
        admin = msg.sender;
    }

    // ------------------ EVENTS ------------------

    event Locked(uint256 indexed id, address indexed buyer, uint256 amount);
    event Revealed(uint256 indexed id);
    event BuyerConfirmed(uint256 indexed id);
    event BuyerDisputed(uint256 indexed id, string evidenceCID);
    event EscalatedToAdmin(uint256 indexed id, address indexed escalator);
    event Released(uint256 indexed id, address indexed seller, uint256 amount);
    event Refunded(uint256 indexed id, address indexed buyer, uint256 amount);
    event AdminUpdated(address indexed oldAdmin, address indexed newAdmin);

    // ------------------ MODIFIERS ------------------

    modifier onlySeller(uint256 id) {
        (, address seller, , , , , , , , , ) = marketplace.getListing(id);
        require(msg.sender == seller, "Not seller");
        _;
    }

    modifier onlyBuyer(uint256 id) {
        (, , , , , , , , address buyer, , ) = marketplace.getListing(id);
        require(msg.sender == buyer, "Not buyer");
        require(buyer != address(0), "No buyer set");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    // ------------------ ADMIN MANAGEMENT ------------------

    function updateAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminUpdated(oldAdmin, newAdmin);
    }

    // ------------------ LOCK PAYMENT ------------------

    function lockPayment(uint256 id) external nonReentrant {
        (
            ,
            address seller,
            ,
            ,
            uint256 price,
            ,
            uint256 expiryTimestamp,
            uint8 status,
            address buyer,
            ,

        ) = marketplace.getListing(id);

        require(status == 1, "Not LISTED"); // Status.LISTED = 1
        require(msg.sender != seller, "Seller can't buy own voucher");
        require(buyer == address(0), "Already locked");
        require(
            expiryTimestamp == 0 || block.timestamp < expiryTimestamp,
            "Voucher expired"
        );

        // Transfer payment to escrow
        require(
            mneeToken.transferFrom(msg.sender, address(this), price),
            "Payment failed"
        );

        // Store escrow data
        escrowData[id] = EscrowData({
            lockedAmount: price,
            lockTimestamp: block.timestamp,
            disputeEvidenceCID: ""
        });

        // Update marketplace state
        marketplace.markAsLocked(id, msg.sender);

        emit Locked(id, msg.sender, price);

        revealVoucher(id);
    }

    // ------------------ CONTRACT REVEALS VOUCHER (CHANGED) ------------------

    function revealVoucher(uint256 id) private {
        (, , , , , , , uint8 status, , , ) = marketplace.getListing(id);
        require(status == 2, "Not LOCKED"); // Status.LOCKED = 2

        marketplace.markAsRevealed(id);

        emit Revealed(id);
    }

    // ------------------ BUYER ACKNOWLEDGES VALID VOUCHER ------------------

    function confirmVoucher(uint256 id) external onlyBuyer(id) {
        (, , , , , , , uint8 status, , , ) = marketplace.getListing(id);
        require(status == 3, "Must be REVEALED"); // Status.REVEALED = 3

        marketplace.markBuyerConfirmed(id);

        emit BuyerConfirmed(id);
    }

    // ------------------ BUYER CLAIMS VOUCHER IS INVALID ------------------

    function disputeVoucher(
        uint256 id,
        string calldata evidenceCID
    ) external onlyBuyer(id) {
        (, , , , , , , uint8 status, , , ) = marketplace.getListing(id);
        require(status == 3, "Must be REVEALED"); // Status.REVEALED = 3
        require(bytes(evidenceCID).length > 0, "Evidence required");

        // Store evidence
        escrowData[id].disputeEvidenceCID = evidenceCID;

        marketplace.markBuyerDisputed(id, evidenceCID);

        emit BuyerDisputed(id, evidenceCID);
    }

    // ------------------ ADMIN INTERVENTION ------------------

    function escalateToAdmin(uint256 id) external {
        (
            ,
            address seller,
            ,
            ,
            ,
            ,
            ,
            uint8 status,
            address buyer,
            ,

        ) = marketplace.getListing(id);
        require(status == 5, "Not disputed"); // Status.BUYER_DISPUTED = 5

        // Only buyer, seller, or admin can escalate
        require(
            msg.sender == buyer || msg.sender == seller || msg.sender == admin,
            "Not authorized to escalate"
        );

        emit EscalatedToAdmin(id, msg.sender);
    }

    function releasePayment(uint256 id) external onlyAdmin nonReentrant {
        (, address seller, , , , , , uint8 status, , , ) = marketplace
            .getListing(id);

        // Can release from BUYER_CONFIRMED or AWAITING_ADMIN
        require(status == 4 || status == 6, "Not releasable"); // Status.BUYER_CONFIRMED = 4, Status.AWAITING_ADMIN = 6

        uint256 amount = escrowData[id].lockedAmount;
        require(amount > 0, "No funds locked");

        // Clear escrow data
        escrowData[id].lockedAmount = 0;

        // Update marketplace state
        marketplace.markReleased(id);

        // Transfer to seller
        require(mneeToken.transfer(seller, amount), "Transfer failed");

        emit Released(id, seller, amount);
    }

    function refundPayment(uint256 id) external onlyAdmin nonReentrant {
        (, , , , , , , uint8 status, address buyer, , ) = marketplace
            .getListing(id);

        // Can refund from BUYER_DISPUTED, AWAITING_ADMIN, or LOCKED
        require(status == 5 || status == 6 || status == 2, "Not refundable"); // Status.BUYER_DISPUTED = 5, Status.AWAITING_ADMIN = 6, Status.LOCKED = 2

        uint256 amount = escrowData[id].lockedAmount;
        require(amount > 0, "No funds locked");
        require(buyer != address(0), "No buyer");

        // Clear escrow data
        escrowData[id].lockedAmount = 0;

        // Update marketplace state
        marketplace.markRefunded(id);

        // Transfer to buyer
        require(mneeToken.transfer(buyer, amount), "Refund failed");

        emit Refunded(id, buyer, amount);
    }

    // ------------------ VIEW FUNCTIONS ------------------

    function getEscrowData(
        uint256 id
    )
        external
        view
        returns (
            uint256 lockedAmount,
            uint256 lockTimestamp,
            string memory disputeEvidenceCID
        )
    {
        EscrowData memory data = escrowData[id];
        return (data.lockedAmount, data.lockTimestamp, data.disputeEvidenceCID);
    }
}
