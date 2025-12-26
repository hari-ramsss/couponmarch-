import { Contract, BrowserProvider } from 'ethers';
import { getMarketplaceContract } from './contracts-instance';
import { ListingStatus, STATUS_LABELS } from './contracts';
import { enhanceListingWithMetadata, EnhancedListingData } from './ipfs-metadata';
import { resolveIPFSHash, batchResolveIPFSHashes } from './ipfs-resolver';

/**
 * Marketplace listing data structure
 */
export interface ListingData {
  id: number;
  seller: string;
  metadataHash: string;
  partialPattern: string;
  price: bigint;
  value: bigint;
  expiryTimestamp: bigint;
  status: ListingStatus;
  buyer: string;
  createdAt: bigint;
  aiInitialProof: string;
}

/**
 * Fetch a single listing by ID with IPFS metadata
 */
export async function getEnhancedListing(
  provider: BrowserProvider,
  listingId: number
): Promise<EnhancedListingData | null> {
  try {
    // Get basic listing data from blockchain
    const listing = await getListing(provider, listingId);
    if (!listing) {
      return null;
    }

    // Resolve IPFS hash for metadata
    const ipfsHash = await resolveIPFSHash(provider, listingId);

    // Enhance with IPFS metadata
    const enhancedListing = await enhanceListingWithMetadata(listing, provider, ipfsHash || undefined);

    return enhancedListing;
  } catch (error) {
    console.error(`Error fetching enhanced listing ${listingId}:`, error);
    return null;
  }
}
export async function getListing(
  provider: BrowserProvider,
  listingId: number
): Promise<ListingData | null> {
  try {
    const contract = getMarketplaceContract(provider);
    const result = await contract.getListing(listingId);

    return {
      id: Number(result[0]),
      seller: result[1],
      metadataHash: result[2],
      partialPattern: result[3],
      price: result[4],
      value: result[5],
      expiryTimestamp: result[6],
      status: Number(result[7]) as ListingStatus, // casting to numver but data from contract comes as bigInt
      buyer: result[8],
      createdAt: result[9],
      aiInitialProof: result[10],
    };
  } catch (error) {
    console.error(`Error fetching listing ${listingId}:`, error);
    return null;
  }
}

/**
 * Fetch all active listings
 * Note: This is a simple implementation that checks listings sequentially.
 * For production, you might want to use events or indexer.
 */
export async function getAllListings(
  provider: BrowserProvider
): Promise<ListingData[]> {
  console.log("getAllListings called");
  try {
    const contract = getMarketplaceContract(provider);
    const nextId = await contract.nextId();
    const listings: ListingData[] = [];

    // Fetch all listings up to nextId
    for (let i = 1; i < Number(nextId); i++) {
      try {
        const listing = await getListing(provider, i);
        if (listing && listing.status !== ListingStatus.NONE) {
          listings.push(listing);
        }
      } catch (error) {
        // Listing doesn't exist or error fetching, skip
        continue;
      }
    }

    console.log("listings fetched: ", listings);

    return listings;
  } catch (error) {
    console.error('Error fetching all listings:', error);
    return [];
  }
}

/**
 * Fetch all active listings with IPFS metadata
 */
export async function getEnhancedActiveListings(
  provider: BrowserProvider
): Promise<EnhancedListingData[]> {
  try {
    console.log("getEnhancedActiveListings called");

    // Get basic listings from blockchain
    const basicListings = await getActiveListings(provider);

    if (basicListings.length === 0) {
      return [];
    }

    // Batch resolve IPFS hashes
    const listingIds = basicListings.map(listing => listing.id);
    const ipfsHashes = await batchResolveIPFSHashes(provider, listingIds);

    // Enhance all listings with metadata
    const enhancedListings = await Promise.all(
      basicListings.map(async (listing) => {
        const ipfsHash = ipfsHashes[listing.id];
        return await enhanceListingWithMetadata(listing, provider, ipfsHash || undefined);
      })
    );

    console.log("Enhanced listings fetched:", enhancedListings);
    return enhancedListings;
  } catch (error) {
    console.error('Error fetching enhanced active listings:', error);
    return [];
  }
}

/**
 * Get status label for a listing
 */
export function getStatusLabel(status: ListingStatus): string {
  return STATUS_LABELS[status] || 'Unknown';
}

/**
 * Check if listing is expired
 */
export function isListingExpired(listing: ListingData): boolean {
  if (listing.expiryTimestamp === BigInt(0)) {
    return false; // No expiry
  }
  return BigInt(Math.floor(Date.now() / 1000)) >= listing.expiryTimestamp;
}

/**
 * Format price for display
 */
export async function formatPrice(
  provider: BrowserProvider,
  price: bigint
): Promise<string> {
  const { formatTokenAmount } = await import('./contracts-instance');
  return formatTokenAmount(provider, price);
}

/**
 * Listen for new listing events
 */
export function onListingCreated(
  provider: BrowserProvider,
  callback: (listingId: number, seller: string, price: bigint) => void
): () => void {
  const contract = getMarketplaceContract(provider);

  const filter = contract.filters.ListingCreated();
  contract.on(filter, (id, seller, price, ...args) => {
    callback(Number(id), seller, price);
  });

  return () => {
    contract.removeAllListeners(filter);
  };
}


/**
 * Fetch active (LISTED) listings only (basic version)
 */
export async function getActiveListings(
  provider: BrowserProvider
): Promise<ListingData[]> {
  const allListings = await getAllListings(provider);
  return allListings.filter(
    (listing) => listing.status === ListingStatus.LISTED
  );
}