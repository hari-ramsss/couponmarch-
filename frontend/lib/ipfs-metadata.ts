// Removed unused imports - ethers and config imports not needed

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
export function bytes32ToIpfsHash(originalIpfsHash?: string): string | null {
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
            console.log('⚠️ No IPFS hash provided for metadata fetch');
            return null;
        }

        console.log(`📥 Fetching metadata from IPFS: ${ipfsHash}`);

        // Direct fetch from Pinata gateway (skip backend route for now)
        const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        console.log(`📡 Gateway URL: ${gatewayUrl}`);

        const metadataResponse = await fetch(gatewayUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!metadataResponse.ok) {
            console.warn(`⚠️ Failed to fetch metadata: ${metadataResponse.status} for hash ${ipfsHash}`);
            return null;
        }

        const metadata: VoucherMetadata = await metadataResponse.json();
        console.log(`✅ Metadata fetched successfully:`, metadata.title);
        return metadata;

    } catch (error) {
        console.warn('Error fetching metadata from IPFS:', error);
        // Return null instead of throwing to allow graceful degradation
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

    console.log(`🔄 Enhancing listing ${listing.id} with IPFS hash: ${ipfsHash || 'none'}`);

    // Fetch metadata from IPFS if hash is available
    let metadata: VoucherMetadata | null = null;
    if (ipfsHash) {
        metadata = await fetchMetadataFromIPFS(ipfsHash);
        if (metadata) {
            console.log(`📦 Metadata for listing ${listing.id}:`, {
                title: metadata.title,
                brand: metadata.brand,
                logoOriginal: metadata.images?.logo?.original,
                logoThumbnail: metadata.images?.logo?.thumbnail,
                voucherOriginal: metadata.images?.voucher?.original,
                voucherBlurred: metadata.images?.voucher?.blurred,
            });
        }
    }

    // Format price
    const { formatTokenAmount } = await import('./contracts-instance');
    const formattedPrice = await formatTokenAmount(provider, listing.price);

    // Check if expired
    const isExpired = listing.expiryTimestamp > BigInt(0) &&
        BigInt(Math.floor(Date.now() / 1000)) >= listing.expiryTimestamp;

    // Check if verified
    const isVerified = listing.aiInitialProof !== "0x0000000000000000000000000000000000000000000000000000000000000000";

    // Get logo URL with fallback chain: thumbnail -> original -> empty
    const logoHash = metadata?.images?.logo?.thumbnail || metadata?.images?.logo?.original || '';
    const logoUrl = logoHash ? getIPFSImageUrl(logoHash) : '';

    // Get preview image URL with fallback chain: blurred -> thumbnail -> original -> empty
    const previewHash = metadata?.images?.voucher?.blurred ||
        metadata?.images?.voucher?.thumbnail ||
        metadata?.images?.voucher?.original || '';
    const previewImageUrl = previewHash ? getIPFSImageUrl(previewHash) : '';

    console.log(`🖼️ Listing ${listing.id} URLs:`, { logoUrl, previewImageUrl });

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
        logoUrl,
        previewImageUrl,
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