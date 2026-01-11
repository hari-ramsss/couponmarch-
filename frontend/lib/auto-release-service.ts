/**
 * Auto-Release Service
 * 
 * This service listens for BuyerConfirmed events on the Escrow contract
 * and automatically releases payments to sellers using the admin wallet.
 * 
 * Environment Variables Required:
 * - ADMIN_PRIVATE_KEY: Private key of the admin wallet (the one that deployed the contract)
 * - NEXT_PUBLIC_RPC_URL: Sepolia RPC URL (e.g., from Alchemy or Infura)
 */

import { ethers, Contract, Wallet, JsonRpcProvider } from 'ethers';
import { ESCROW_ADDRESS, ESCROW_ABI, MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from './contracts';

// Extended Escrow ABI for event listening
const ESCROW_ABI_EXTENDED = [
    ...ESCROW_ABI,
    'event BuyerConfirmed(uint256 indexed id)',
    'event Released(uint256 indexed id, address indexed seller, uint256 amount)',
];

let provider: JsonRpcProvider | null = null;
let adminWallet: Wallet | null = null;
let escrowContract: Contract | null = null;
let isListening = false;

/**
 * Initialize the auto-release service
 */
export async function initAutoReleaseService(): Promise<{ success: boolean; message: string }> {
    try {
        const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

        if (!adminPrivateKey) {
            return {
                success: false,
                message: 'ADMIN_PRIVATE_KEY environment variable not set'
            };
        }

        if (!rpcUrl) {
            return {
                success: false,
                message: 'NEXT_PUBLIC_RPC_URL environment variable not set'
            };
        }

        // Create provider
        provider = new JsonRpcProvider(rpcUrl);

        // Create admin wallet
        adminWallet = new Wallet(adminPrivateKey, provider);
        console.log(`🔑 Auto-release service initialized with admin: ${adminWallet.address}`);

        // Verify admin is correct
        const escrowReadonly = new Contract(ESCROW_ADDRESS, ESCROW_ABI_EXTENDED, provider);
        const contractAdmin = await escrowReadonly.admin();

        if (contractAdmin.toLowerCase() !== adminWallet.address.toLowerCase()) {
            return {
                success: false,
                message: `Wallet ${adminWallet.address} is not the contract admin. Admin is: ${contractAdmin}`
            };
        }

        // Create escrow contract instance with admin signer
        escrowContract = new Contract(ESCROW_ADDRESS, ESCROW_ABI_EXTENDED, adminWallet);

        return {
            success: true,
            message: `Auto-release service initialized. Admin: ${adminWallet.address}`
        };
    } catch (error: any) {
        console.error('Failed to initialize auto-release service:', error);
        return {
            success: false,
            message: error.message || 'Failed to initialize service'
        };
    }
}

/**
 * Start listening for BuyerConfirmed events
 */
export async function startEventListener(): Promise<{ success: boolean; message: string }> {
    if (isListening) {
        return { success: true, message: 'Event listener already running' };
    }

    if (!escrowContract || !provider) {
        const initResult = await initAutoReleaseService();
        if (!initResult.success) {
            return initResult;
        }
    }

    try {
        console.log('🎧 Starting to listen for BuyerConfirmed events...');

        // Listen for BuyerConfirmed events
        escrowContract!.on('BuyerConfirmed', async (listingId: bigint) => {
            console.log(`\n📦 BuyerConfirmed event received for listing #${listingId}`);
            await handleBuyerConfirmed(listingId);
        });

        isListening = true;
        console.log('✅ Event listener started successfully');
        console.log(`📍 Listening on Escrow contract: ${ESCROW_ADDRESS}`);

        return { success: true, message: 'Event listener started' };
    } catch (error: any) {
        console.error('Failed to start event listener:', error);
        return { success: false, message: error.message || 'Failed to start listener' };
    }
}

/**
 * Stop listening for events
 */
export async function stopEventListener(): Promise<{ success: boolean; message: string }> {
    if (!isListening) {
        return { success: true, message: 'Event listener not running' };
    }

    try {
        escrowContract?.removeAllListeners('BuyerConfirmed');
        isListening = false;
        console.log('🛑 Event listener stopped');
        return { success: true, message: 'Event listener stopped' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Handle BuyerConfirmed event by releasing payment
 */
async function handleBuyerConfirmed(listingId: bigint): Promise<void> {
    try {
        console.log(`💰 Attempting to release payment for listing #${listingId}...`);

        // Get listing details to verify status
        const marketplaceContract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider!);
        const listing = await marketplaceContract.getListing(listingId);
        const status = listing[7]; // status is at index 7

        // Status 4 = BUYER_CONFIRMED
        if (status !== 4n) {
            console.log(`⚠️ Listing #${listingId} is not in BUYER_CONFIRMED status (current: ${status}). Skipping.`);
            return;
        }

        // Release payment
        const tx = await escrowContract!.releasePayment(listingId);
        console.log(`📤 Release transaction sent: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log(`✅ Payment released for listing #${listingId}!`);
        console.log(`   Transaction: ${receipt.hash}`);
        console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

    } catch (error: any) {
        console.error(`❌ Failed to release payment for listing #${listingId}:`, error.message);

        // Check if it's a revert error
        if (error.reason) {
            console.error(`   Revert reason: ${error.reason}`);
        }
    }
}

/**
 * Manually release payment for a specific listing (for recovery/admin purposes)
 */
export async function manualReleasePayment(listingId: number | string): Promise<{ success: boolean; message: string; txHash?: string }> {
    if (!escrowContract) {
        const initResult = await initAutoReleaseService();
        if (!initResult.success) {
            return { success: false, message: initResult.message };
        }
    }

    try {
        console.log(`🔧 Manual release requested for listing #${listingId}`);

        const tx = await escrowContract!.releasePayment(listingId);
        console.log(`📤 Transaction sent: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(`✅ Payment released successfully!`);

        return {
            success: true,
            message: `Payment released for listing #${listingId}`,
            txHash: receipt.hash
        };
    } catch (error: any) {
        console.error(`❌ Manual release failed:`, error);
        return {
            success: false,
            message: error.reason || error.message || 'Release failed'
        };
    }
}

/**
 * Check if event listener is running
 */
export function isServiceRunning(): boolean {
    return isListening;
}

/**
 * Get service status
 */
export function getServiceStatus(): {
    isRunning: boolean;
    adminAddress: string | null;
    escrowAddress: string;
} {
    return {
        isRunning: isListening,
        adminAddress: adminWallet?.address || null,
        escrowAddress: ESCROW_ADDRESS
    };
}

/**
 * Process any pending confirmed vouchers (for catching up after restart)
 */
export async function processPendingConfirmations(): Promise<{ processed: number; errors: number }> {
    if (!escrowContract || !provider) {
        const initResult = await initAutoReleaseService();
        if (!initResult.success) {
            return { processed: 0, errors: 0 };
        }
    }

    let processed = 0;
    let errors = 0;

    try {
        const marketplaceContract = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider!);
        const nextId = await marketplaceContract.nextId();

        console.log(`🔍 Scanning ${nextId} listings for pending confirmations...`);

        for (let i = 1n; i < nextId; i++) {
            try {
                const listing = await marketplaceContract.getListing(i);
                const status = listing[7];

                // Status 4 = BUYER_CONFIRMED
                if (status === 4n) {
                    console.log(`📦 Found confirmed listing #${i}, releasing payment...`);
                    await handleBuyerConfirmed(i);
                    processed++;
                }
            } catch (e) {
                // Skip if listing doesn't exist or error
            }
        }

        console.log(`✅ Processed ${processed} pending confirmations`);
        return { processed, errors };
    } catch (error: any) {
        console.error('Error processing pending confirmations:', error);
        return { processed, errors: errors + 1 };
    }
}
