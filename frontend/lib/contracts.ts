/**
 * Contract Addresses Configuration
 * 
 * IMPORTANT: Replace these placeholder addresses with your actual deployed contract addresses
 * after deploying to Sepolia testnet (or your target network).
 * 
 * To get the addresses:
 * 1. Deploy contracts using Hardhat/Ignition scripts
 * 2. Copy the deployed addresses from the deployment output
 * 3. Paste them below
 */

// Sepolia Testnet Chain ID
export const SEPOLIA_CHAIN_ID = 11155111;

// Network configuration
export const NETWORK_CONFIG = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`, // Hex format for MetaMask
  chainName: 'Sepolia',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: [process.env.NEXT_PUBLIC_RPC_URL],
  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
};

// Contract ABIs - These will be generated from your compiled contracts
// For now, we'll define minimal interfaces needed for interaction

// MockERC20 ABI (minimal interface)
export const MOCK_ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
] as const;

// VoucherMarketplace ABI (minimal interface)
export const MARKETPLACE_ABI = [
  'function createListing(bytes32 metadataHash, string calldata partialCodePattern, uint256 price, uint256 value, uint256 expiryTimestamp, bytes32 aiInitialProofHash) external returns (uint256)',
  'function getListing(uint256 id) public view returns (uint256 listingId, address seller, bytes32 metadataHash, string memory partialPattern, uint256 price, uint256 value, uint256 expiryTimestamp, uint8 status, address buyer, uint256 createdAt, bytes32 aiInitialProof)',
  'function nextId() external view returns (uint256)',
  'function isActive(uint256 id) public view returns (bool)',
  'function cancelListing(uint256 id) external',
  'function updateListingPrice(uint256 id, uint256 newPrice) external',
  'function setEscrowContract(address _escrow) external',
  'event ListingCreated(uint256 indexed id, address indexed seller, uint256 price, uint256 expiryTimestamp, bytes32 metadataHash)',
  'event ListingLocked(uint256 indexed id, address indexed buyer, uint256 lockedAt)',
  'event ListingRevealed(uint256 indexed id, address indexed buyer)',
  'event ListingBuyerConfirmed(uint256 indexed id, address indexed buyer)',
  'event ListingBuyerDisputed(uint256 indexed id, address indexed buyer, string evidenceCID)',
  'event ListingReleased(uint256 indexed id, address indexed seller)',
  'event ListingRefunded(uint256 indexed id, address indexed buyer)',
] as const;

// VoucherEscrow ABI (minimal interface)
export const ESCROW_ABI = [
  'function lockPayment(uint256 id) external',
  //'function revealVoucher(uint256 id) external',
  'function confirmVoucher(uint256 id) external',
  'function disputeVoucher(uint256 id, string calldata evidenceCID) external',
  'function escalateToAdmin(uint256 id) external',
  'function releasePayment(uint256 id) external',
  'function refundPayment(uint256 id) external',
  'function getEscrowData(uint256 id) external view returns (uint256 lockedAmount, uint256 lockTimestamp, string memory disputeEvidenceCID)',
  'function mneeToken() external view returns (address)',
  'function marketplace() external view returns (address)',
  'function admin() external view returns (address)',
  'event Locked(uint256 indexed id, address indexed buyer, uint256 amount)',
  'event Revealed(uint256 indexed id)',
  'event BuyerConfirmed(uint256 indexed id)',
  'event BuyerDisputed(uint256 indexed id, string evidenceCID)',
  'event Released(uint256 indexed id, address indexed seller, uint256 amount)',
  'event Refunded(uint256 indexed id, address indexed buyer, uint256 amount)',
] as const;

/**
 * CONTRACT ADDRESSES - REPLACE THESE WITH YOUR DEPLOYED ADDRESSES
 * 
 * Example format:
 * export const MOCK_ERC20_ADDRESS = '0x1234567890123456789012345678901234567890';
 */
export const MOCK_ERC20_ADDRESS = '0x58cc5202F8aeC0B29003882a5921CC08db29bAC4'; // TODO: Replace with deployed MockERC20 address
export const MARKETPLACE_ADDRESS = '0xB8a08eeb833CE7173D65B3eC537F5d3a8C0164e8'; // TODO: Replace with deployed VoucherMarketplace address
export const ESCROW_ADDRESS = '0x3D8373564d5503cA61c4A104a8Ee1a8E8C506F87'; // TODO: Replace with deployed VoucherEscrow address

// Old Contracts 
// export const MOCK_ERC20_ADDRESS = '0x2d8E8f15a61f2820e6d493Cd144D28ffFb9E0D31'; // TODO: Replace with deployed MockERC20 address
// export const MARKETPLACE_ADDRESS = '0x60f1389c58b05F2E201D28121738f9B5249e8D00'; // TODO: Replace with deployed VoucherMarketplace address
// export const ESCROW_ADDRESS = '0x32568bCD40f93D54465156923262fACd137D233F'; // TODO: Replace with deployed VoucherEscrow address

// New Contracts 
// Deployed Addresses:
//    Token (MNEE):     0x58cc5202F8aeC0B29003882a5921CC08db29bAC4
//    Marketplace:                0xB8a08eeb833CE7173D65B3eC537F5d3a8C0164e8
//    Escrow:                     0x3D8373564d5503cA61c4A104a8Ee1a8E8C506F87

// Marketplace Status enum (matches contract)
export enum ListingStatus {
  NONE = 0,
  LISTED = 1,
  LOCKED = 2,
  REVEALED = 3,
  BUYER_CONFIRMED = 4,
  BUYER_DISPUTED = 5,
  AWAITING_ADMIN = 6,
  RELEASED = 7,
  REFUNDED = 8,
  CANCELLED = 9,
}

export const STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.NONE]: 'None',
  [ListingStatus.LISTED]: 'Listed',
  [ListingStatus.LOCKED]: 'Locked',
  [ListingStatus.REVEALED]: 'Revealed',
  [ListingStatus.BUYER_CONFIRMED]: 'Confirmed',
  [ListingStatus.BUYER_DISPUTED]: 'Disputed',
  [ListingStatus.AWAITING_ADMIN]: 'Awaiting Admin',
  [ListingStatus.RELEASED]: 'Released',
  [ListingStatus.REFUNDED]: 'Refunded',
  [ListingStatus.CANCELLED]: 'Cancelled',
};

