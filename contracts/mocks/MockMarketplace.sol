// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockMarketplace {
    address public seller;
    address public buyer;
    uint256 public price;
    uint256 public value;
    uint256 public expiry;
    string public pattern;
    bytes32 public metadataHash;
    bytes32 public aiInitialProof;
    uint8 public status; // 0=NONE, 1=LISTED, 2=LOCKED, 3=REVEALED, 4=BUYER_CONFIRMED, 5=BUYER_DISPUTED, 6=AWAITING_ADMIN, 7=RELEASED, 8=REFUNDED

    constructor(
        address _seller,
        address, // _buyer parameter ignored - will be set when locked
        uint256 _price,
        uint256 _value,
        uint256 _expiry,
        string memory _pattern,
        bytes32 _metadataHash,
        bytes32 _aiInitialProof
    ) {
        seller = _seller;
        buyer = address(0); // Start with no buyer
        price = _price;
        value = _value;
        expiry = _expiry;
        pattern = _pattern;
        metadataHash = _metadataHash;
        aiInitialProof = _aiInitialProof;
        status = 1; // Start as LISTED
    }

    function getListing(
        uint256 id
    )
        external
        view
        returns (
            uint256 listingId,
            address _seller,
            bytes32 _metadataHash,
            string memory partialPattern,
            uint256 _price,
            uint256 _value,
            uint256 expiryTimestamp,
            uint8 _status,
            address _buyer,
            uint256 createdAt,
            bytes32 aiInitialProofHash
        )
    {
        return (
            id,
            seller,
            metadataHash,
            pattern,
            price,
            value,
            expiry,
            status,
            buyer,
            block.timestamp,
            aiInitialProof
        );
    }

    // Escrow calls these to update state
    function markAsLocked(uint256, address _buyer) external {
        buyer = _buyer;
        status = 2; // LOCKED
    }

    function markAsRevealed(uint256) external {
        status = 3; // REVEALED
    }

    function markBuyerConfirmed(uint256) external {
        status = 4; // BUYER_CONFIRMED
    }

    function markBuyerDisputed(uint256, string calldata) external {
        status = 5; // BUYER_DISPUTED
    }

    function markReleased(uint256) external {
        status = 7; // RELEASED
    }

    function markRefunded(uint256) external {
        status = 8; // REFUNDED
    }
}
