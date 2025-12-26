import { ethers } from 'ethers';
import { API_CONFIG, buildApiUrl } from './config';

/**
 * Voucher metadata structure from IPFS
 */
export interface VoucherMetadata {
    // Basic Information
    title: string;
    type: string;
    brand: string;
    description: string;

    // Voucher Details
    code: string; // Full code (encrypted/hashed in production)
    partialPattern: string;
    value: number;
    discountPercentage: number;

    // Pricing & Expiry
    price: string;
    currency: string;
    expiryDate: string | null;
    expiryTimestamp: number;

    // Terms & Conditions
    terms: string;
    usageInstructions: string;
    restrictions: string;

    // Images (IPFS hashes)
    images: {
        logo: {
            original: string;
            thumbnail: string;
        };
        voucher: {
            original: string; // Full resolution (for buyers)
            blurred: string;  // Blurred (for marketplace)
            thumbnail: string;
        };
    };

    // Seller Information
    seller: {
        address: string;
        reputation: number;
        totalSales: number;
    };

    // Validation & Security
    validation: {
        aiInitialProof: string;
        validationScore: number;
        validationStatus: string;
        validatedAt: string | null;
    };

    // Blockchain Integration
    blockchain: {
        network: string;
        listingId: number | null;
        contractAddress: string;
        transactionHash: string;
    };

    // Platform Metadata
    platform: {
        name: string;
        version: string;
        uploadedAt: string;
        lastUpdated: string;
        category: string;
        tags: string[];
        featured: boolean;
    };

    // Analytics & Tracking
    analytics: {
        views: number;
        favorites: number;
        inquiries: number;
        createdAt: string;
    };
}

/**
 * Convert bytes32 hash back to original IPFS hash
 * This reverses the process done in the smart contract
 */
export function bytes32ToIpfsHash(bytes32Hash: string, originalIpfsHash?: string): string | null {
    // In our implementation, we used keccak256(ipfsHash) to create bytes32
    // We can't reverse keccak256, so we need to store the mapping or use events

    // For now, we'll need to get the original IPFS hash from blockchain events
    // or store it separately. This is a limitation of the current approach.

    // TODO: Implement event listening or alternative storage method
    console.warn('bytes32ToIpfsHash: Cannot reverse keccak256. Need to implement event listening.');
    return originalIpfsHash || null;
}

/**
 * Fetch metadata from IPFS using the backend
 */
export async function fetchMetadataFromIPFS(ipfsHash: string): Promise<VoucherMetadata | null> {
    try {
        if (!ipfsHash || ipfsHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
            return null;
        }

        // Use backend IPFS endpoint to fetch metadata
        const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.IPFS_GET}/${ipfsHash}`));

        if (!response.ok) {
            throw new Error(`Failed to fetch metadata: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Failed to fetch metadata from IPFS');
        }

        // Fetch the actual JSON content from the gateway URL
        const metadataResponse = await fetch(result.data.gatewayUrl);

        if (!metadataResponse.ok) {
            throw new Error(`Failed to fetch metadata content: ${metadataResponse.status}`);
        }

        const metadata: VoucherMetadata = await metadataResponse.json();
        return metadata;

    } catch (error) {
        console.error('Error fetching metadata from IPFS:', error);
        return null;
    }
}

/**
 * Get IPFS gateway URL for an image hash
 */
export function getIPFSImageUrl(ipfsHash: string): string {
    if (!ipfsHash) return '';
    return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}

/**
 * Enhanced listing data with IPFS metadata
 */
export interface EnhancedListingData {
    // Original blockchain data
    id: number;
    seller: string;
    metadataHash: string;
    partialPattern: string;
    price: bigint;
    value: bigint;
    expiryTimestamp: bigint;
    status: number;
    buyer: string;
    createdAt: bigint;
    aiInitialProof: string;

    // Enhanced data from IPFS
    metadata?: VoucherMetadata;

    // Computed display properties
    title: string;
    description: string;
    brand: string;
    category: string;
    logoUrl: string;
    previewImageUrl: string; // Blurred image for marketplace
    tags: string[];
    formattedPrice: string;
    isExpired: boolean;
    isVerified: boolean;
}

/**
 * Enhance blockchain listing data with IPFS metadata
 */
export async function enhanceListingWithMetadata(
    listing: any,
    provider: any,
    ipfsHash?: string
): Promise<EnhancedListingData> {

    // Fetch metadata from IPFS if hash is available
    let metadata: VoucherMetadata | null = null;
    if (ipfsHash) {
        metadata = await fetchMetadataFromIPFS(ipfsHash);
    }

    // Format price
    const { formatTokenAmount } = await import('./contracts-instance');
    const formattedPrice = await formatTokenAmount(provider, listing.price);

    // Check if expired
    const isExpired = listing.expiryTimestamp > 0n &&
        BigInt(Math.floor(Date.now() / 1000)) >= listing.expiryTimestamp;

    // Check if verified
    const isVerified = listing.aiInitialProof !== "0x0000000000000000000000000000000000000000000000000000000000000000";

    return {
        // Original blockchain data
        ...listing,

        // Enhanced metadata
        metadata,

        // Display properties (use metadata if available, fallback to blockchain data)
        title: metadata?.title || `Voucher #${listing.id}`,
        description: metadata?.description || `Partial code: ${listing.partialPattern || 'N/A'}`,
        brand: metadata?.brand || 'Unknown Brand',
        category: metadata?.platform?.category || 'General',
        logoUrl: metadata?.images?.logo?.thumbnail ?
            getIPFSImageUrl(metadata.images.logo.thumbnail) : '',
        previewImageUrl: metadata?.images?.voucher?.blurred ?
            getIPFSImageUrl(metadata.images.voucher.blurred) : '',
        tags: metadata?.platform?.tags || [],
        formattedPrice: `${formattedPrice} MNEE`,
        isExpired,
        isVerified
    };
}

/**
 * Cache for IPFS metadata to avoid repeated fetches
 */
const metadataCache = new Map<string, VoucherMetadata>();

/**
 * Fetch metadata with caching
 */
export async function fetchMetadataWithCache(ipfsHash: string): Promise<VoucherMetadata | null> {
    if (metadataCache.has(ipfsHash)) {
        return metadataCache.get(ipfsHash) || null;
    }

    const metadata = await fetchMetadataFromIPFS(ipfsHash);
    if (metadata) {
        metadataCache.set(ipfsHash, metadata);
    }

    return metadata;
}

/**
 * Clear metadata cache (useful for testing or memory management)
 */
export function clearMetadataCache(): void {
    metadataCache.clear();
}