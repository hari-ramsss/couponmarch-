import { ethers, BrowserProvider } from 'ethers';
import { getMarketplaceContract } from './contracts-instance';

/**
 * IPFS hash mapping for listings
 * Maps listingId to original IPFS hash
 */
interface IPFSHashMapping {
    listingId: number;
    metadataHash: string; // bytes32 from blockchain
    originalIPFSHash: string; // original IPFS hash
    blockNumber: number;
    transactionHash: string;
    timestamp: number;
}

/**
 * Cache for IPFS hash mappings
 */
const ipfsHashCache = new Map<number, string>();

/**
 * Get IPFS hash for a listing by listening to blockchain events
 */
export async function getIPFSHashForListing(
    provider: BrowserProvider,
    listingId: number
): Promise<string | null> {
    try {
        // Check cache first
        if (ipfsHashCache.has(listingId)) {
            return ipfsHashCache.get(listingId) || null;
        }

        // Get the marketplace contract
        const contract = getMarketplaceContract(provider);

        // Listen for ListingCreated events for this specific listing
        const filter = contract.filters.ListingCreated(listingId);

        // Query past events
        const events = await contract.queryFilter(filter, 0, 'latest');

        if (events.length > 0) {
            const event = events[0];

            // The event should contain the original IPFS hash
            // Note: We need to modify the smart contract to emit the original IPFS hash
            // For now, we'll use a workaround with transaction data

            const tx = await provider.getTransaction(event.transactionHash);
            if (tx && tx.data) {
                // Parse transaction data to extract IPFS hash
                // This is a temporary solution until we modify the contract
                const ipfsHash = await extractIPFSHashFromTransaction(tx.data);

                if (ipfsHash) {
                    ipfsHashCache.set(listingId, ipfsHash);
                    return ipfsHash;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting IPFS hash for listing:', error);
        return null;
    }
}

/**
 * Extract IPFS hash from transaction data (temporary solution)
 */
async function extractIPFSHashFromTransaction(txData: string): Promise<string | null> {
    try {
        // This is a workaround - in production, the contract should emit the original IPFS hash
        // For now, we'll return null and use a different approach
        return null;
    } catch (error) {
        return null;
    }
}

/**
 * Alternative approach: Store IPFS hashes in localStorage during creation
 */
export function storeIPFSHashMapping(listingId: number, ipfsHash: string): void {
    try {
        const mappings = getStoredIPFSMappings();
        mappings[listingId] = ipfsHash;
        localStorage.setItem('ipfs_hash_mappings', JSON.stringify(mappings));

        // Also update cache
        ipfsHashCache.set(listingId, ipfsHash);
    } catch (error) {
        console.error('Error storing IPFS hash mapping:', error);
    }
}

/**
 * Get stored IPFS hash mappings from localStorage
 */
export function getStoredIPFSMappings(): Record<number, string> {
    try {
        const stored = localStorage.getItem('ipfs_hash_mappings');
        return stored ? JSON.parse(stored) : {};
    } catch (error) {
        console.error('Error getting stored IPFS mappings:', error);
        return {};
    }
}

/**
 * Get IPFS hash from localStorage
 */
export function getStoredIPFSHash(listingId: number): string | null {
    try {
        const mappings = getStoredIPFSMappings();
        return mappings[listingId] || null;
    } catch (error) {
        console.error('Error getting stored IPFS hash:', error);
        return null;
    }
}

/**
 * Comprehensive IPFS hash resolver
 * Tries multiple methods to find the original IPFS hash
 */
export async function resolveIPFSHash(
    provider: BrowserProvider,
    listingId: number
): Promise<string | null> {
    // Method 1: Check cache
    if (ipfsHashCache.has(listingId)) {
        return ipfsHashCache.get(listingId) || null;
    }

    // Method 2: Check localStorage
    const storedHash = getStoredIPFSHash(listingId);
    if (storedHash) {
        ipfsHashCache.set(listingId, storedHash);
        return storedHash;
    }

    // Method 3: Try to get from blockchain events
    const eventHash = await getIPFSHashForListing(provider, listingId);
    if (eventHash) {
        return eventHash;
    }

    // Method 4: Use a backend API to resolve (if implemented)
    try {
        const response = await fetch(`/api/ipfs/resolve/${listingId}`);
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.ipfsHash) {
                ipfsHashCache.set(listingId, result.ipfsHash);
                return result.ipfsHash;
            }
        }
    } catch (error) {
        // Backend API not available, continue
    }

    console.warn(`Could not resolve IPFS hash for listing ${listingId}`);
    return null;
}

/**
 * Batch resolve IPFS hashes for multiple listings
 */
export async function batchResolveIPFSHashes(
    provider: BrowserProvider,
    listingIds: number[]
): Promise<Record<number, string | null>> {
    const results: Record<number, string | null> = {};

    // Process in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < listingIds.length; i += batchSize) {
        const batch = listingIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (listingId) => {
            const hash = await resolveIPFSHash(provider, listingId);
            return { listingId, hash };
        });

        const batchResults = await Promise.all(batchPromises);

        batchResults.forEach(({ listingId, hash }) => {
            results[listingId] = hash;
        });
    }

    return results;
}

/**
 * Clear all IPFS hash caches
 */
export function clearIPFSHashCache(): void {
    ipfsHashCache.clear();
    try {
        localStorage.removeItem('ipfs_hash_mappings');
    } catch (error) {
        console.error('Error clearing localStorage:', error);
    }
}