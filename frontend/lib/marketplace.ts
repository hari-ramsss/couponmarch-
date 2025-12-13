import { Contract, BrowserProvider } from 'ethers';
import { getMarketplaceContract } from './contracts-instance';
import { ListingStatus, STATUS_LABELS } from './contracts';

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
 * Fetch a single listing by ID
 */
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
 * Fetch active (LISTED) listings only
 */
export async function getActiveListings(
  provider: BrowserProvider
): Promise<ListingData[]> {
  const allListings = await getAllListings(provider);
  return allListings.filter(
    (listing) => listing.status === ListingStatus.LISTED
  );
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
  if (listing.expiryTimestamp === 0n) {
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

