// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/*
 * Marketplace.sol
 *
 * Stores voucher listing metadata and lifecycle state.
 * Payment/escrow logic should be implemented in a separate Escrow contract.
 *
 * - Sellers create listings with metadataHash (IPFS/Arweave CID hash)
 * - Contract stores light-weight info only (no full coupon on-chain)
 * - A trusted escrow contract can mark listings as SOLD/LOCKED when buyer pays
 * - Owner can set escrow contract address
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Marketplace is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _nextId;

    enum Status {
        NONE,
        LISTED,
        LOCKED, // buyer paid and escrow locked funds (Escrow sets this)
        REVEALED, // buyer has access (frontend/back-end reveals coupon)
        BUYER_CONFIRMED,
        BUYER_DISPUTED,
        AWAITING_ADMIN,
        RELEASED,
        REFUNDED,
        CANCELLED
    }

    struct Listing {
        uint256 id;
        address seller;
        bytes32 metadataHash; // keccak256(ipfsCid) or direct bytes32 CID hash
        string partialCodePattern; // e.g. "XXXX-1234-XX" or small string
        uint256 price; // price in smallest MNEE units (follow ERC20 decimals)
        uint256 value; // face value of coupon (optional)
        uint256 expiryTimestamp; // unix timestamp of voucher expiry
        Status status;
        address buyer; // set when locked
        uint256 createdAt;
        bytes32 aiInitialProofHash; // off-chain AI initial verification proof (hash)
    }

    // escrow contract authorized to lock funds and mark listings as LOCKED/RELEASED/REFUNDED
    address public escrowContract;

    mapping(uint256 => Listing) private listings;

    // Events
    event ListingCreated(
        uint256 indexed id,
        address indexed seller,
        uint256 price,
        uint256 expiryTimestamp,
        bytes32 metadataHash
    );
    event ListingCancelled(uint256 indexed id, address indexed seller);
    event ListingPriceUpdated(
        uint256 indexed id,
        uint256 oldPrice,
        uint256 newPrice
    );
    event ListingLocked(
        uint256 indexed id,
        address indexed buyer,
        uint256 lockedAt
    );
    event ListingRevealed(uint256 indexed id, address indexed buyer);
    event ListingBuyerConfirmed(uint256 indexed id, address indexed buyer);
    event ListingBuyerDisputed(
        uint256 indexed id,
        address indexed buyer,
        string evidenceCID
    );
    event ListingReleased(uint256 indexed id, address indexed seller);
    event ListingRefunded(uint256 indexed id, address indexed buyer);
    event EscrowContractUpdated(
        address indexed oldAddress,
        address indexed newAddress
    );

    modifier onlySeller(uint256 id) {
        require(
            listings[id].seller == msg.sender,
            "Marketplace: caller not seller"
        );
        _;
    }

    modifier onlyEscrow() {
        require(
            msg.sender == escrowContract,
            "Marketplace: caller is not escrow"
        );
        _;
    }

    constructor() {
        _nextId.increment(); // start ids at 1
    }

    /* ========== OWNER / ADMIN ========== */

    /// @notice Set or update the address of the escrow contract (trusted)
    function setEscrowContract(address _escrow) external onlyOwner {
        require(_escrow != address(0), "Marketplace: zero address");
        address old = escrowContract;
        escrowContract = _escrow;
        emit EscrowContractUpdated(old, _escrow);
    }

    /* ========== CREATE / VIEW LISTINGS ========== */

    /// @notice Create a new listing. metadataHash should be keccak256(IPFS_CID) or stored as bytes32
    function createListing(
        bytes32 metadataHash,
        string calldata partialCodePattern,
        uint256 price,
        uint256 value,
        uint256 expiryTimestamp,
        bytes32 aiInitialProofHash
    ) external returns (uint256) {
        require(price > 0, "Marketplace: price must be >0");
        require(
            expiryTimestamp == 0 || expiryTimestamp > block.timestamp,
            "Marketplace: expiry must be in future"
        );

        uint256 id = _nextId.current();
        _nextId.increment();

        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            metadataHash: metadataHash,
            partialCodePattern: partialCodePattern,
            price: price,
            value: value,
            expiryTimestamp: expiryTimestamp,
            status: Status.LISTED,
            buyer: address(0),
            createdAt: block.timestamp,
            aiInitialProofHash: aiInitialProofHash
        });

        emit ListingCreated(
            id,
            msg.sender,
            price,
            expiryTimestamp,
            metadataHash
        );
        return id;
    }

    /// @notice Get listing basic details (lightweight view)
    function getListing(
        uint256 id
    )
        public
        view
        returns (
            uint256 listingId,
            address seller,
            bytes32 metadataHash,
            string memory partialPattern,
            uint256 price,
            uint256 value,
            uint256 expiryTimestamp,
            Status status,
            address buyer,
            uint256 createdAt,
            bytes32 aiInitialProof
        )
    {
        Listing storage L = listings[id];
        return (
            L.id,
            L.seller,
            L.metadataHash,
            L.partialCodePattern,
            L.price,
            L.value,
            L.expiryTimestamp,
            L.status,
            L.buyer,
            L.createdAt,
            L.aiInitialProofHash
        );
    }

    /* ========== SELLER ACTIONS ========== */

    /// @notice Seller may cancel a listing only if it is still LISTED (not locked)
    function cancelListing(uint256 id) external onlySeller(id) {
        Listing storage L = listings[id];
        require(L.status == Status.LISTED, "Marketplace: cannot cancel");
        L.status = Status.CANCELLED;
        emit ListingCancelled(id, msg.sender);
    }

    /// @notice Seller can update the price if still listed
    function updateListingPrice(
        uint256 id,
        uint256 newPrice
    ) external onlySeller(id) {
        Listing storage L = listings[id];
        require(L.status == Status.LISTED, "Marketplace: cannot update price");
        require(newPrice > 0, "Marketplace: price must be >0");
        uint256 old = L.price;
        L.price = newPrice;
        emit ListingPriceUpdated(id, old, newPrice);
    }

    /// @notice Seller can update the aiInitialProofHash (e.g., re-run AI before listing)
    function updateAIInitialProof(
        uint256 id,
        bytes32 newProofHash
    ) external onlySeller(id) {
        Listing storage L = listings[id];
        require(L.status == Status.LISTED, "Marketplace: cannot update proof");
        L.aiInitialProofHash = newProofHash;
    }

    /* ========== ESCROW-TRIGGERED ACTIONS (only Escrow contract) ========== */

    /// @notice Called by escrow contract when buyer locks payment. Marks listing locked and records buyer.
    function markAsLocked(uint256 id, address buyer) external onlyEscrow {
        Listing storage L = listings[id];
        require(
            L.status == Status.LISTED,
            "Marketplace: not available to lock"
        );
        require(
            L.expiryTimestamp == 0 || L.expiryTimestamp > block.timestamp,
            "Marketplace: voucher expired"
        );
        require(buyer != address(0), "Marketplace: invalid buyer address");
        L.buyer = buyer;
        L.status = Status.LOCKED;
        emit ListingLocked(id, buyer, block.timestamp);
    }

    /// @notice Optional: mark as revealed (buyer received full coupon) — escrow/back-end may call
    function markAsRevealed(uint256 id) external onlyEscrow {
        Listing storage L = listings[id];
        require(L.status == Status.LOCKED, "Marketplace: not locked");
        L.status = Status.REVEALED;
        emit ListingRevealed(id, L.buyer);
    }

    /// @notice Called by escrow when buyer confirms success. Marks final confirmation.
    function markBuyerConfirmed(uint256 id) external onlyEscrow {
        Listing storage L = listings[id];
        require(
            L.status == Status.REVEALED,
            "Marketplace: must be revealed first"
        );
        L.status = Status.BUYER_CONFIRMED;
        emit ListingBuyerConfirmed(id, L.buyer);
    }

    /// @notice Called by escrow to set dispute status and record evidence CID (off-chain)
    function markBuyerDisputed(
        uint256 id,
        string calldata evidenceCID
    ) external onlyEscrow {
        Listing storage L = listings[id];
        require(
            L.status == Status.REVEALED,
            "Marketplace: must be revealed to dispute"
        );
        L.status = Status.BUYER_DISPUTED;
        emit ListingBuyerDisputed(id, L.buyer, evidenceCID);
    }

    /// @notice Called by escrow when release executed (allows direct release from REVEALED for auto-release)
    function markReleased(uint256 id) external onlyEscrow {
        Listing storage L = listings[id];
        require(
            L.status == Status.REVEALED ||
                L.status == Status.BUYER_CONFIRMED ||
                L.status == Status.AWAITING_ADMIN,
            "Marketplace: invalid state for release"
        );
        L.status = Status.RELEASED;
        emit ListingReleased(id, L.seller);
    }

    /// @notice Called by escrow when refund executed
    function markRefunded(uint256 id) external onlyEscrow {
        Listing storage L = listings[id];
        require(
            L.status == Status.BUYER_DISPUTED ||
                L.status == Status.AWAITING_ADMIN ||
                L.status == Status.LOCKED,
            "Marketplace: invalid state for refund"
        );
        L.status = Status.REFUNDED;
        emit ListingRefunded(id, L.buyer);
    }

    /* ========== HELPERS ========== */

    /// @notice Return current next id (useful off-chain)
    function nextId() external view returns (uint256) {
        return _nextId.current();
    }

    /// @notice Check whether listing is still active (LISTED)
    function isActive(uint256 id) public view returns (bool) {
        return listings[id].status == Status.LISTED;
    }
}
