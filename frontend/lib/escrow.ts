import { BrowserProvider, JsonRpcSigner } from 'ethers';
import { getEscrowContract } from './contracts-instance';
import { ListingStatus } from './contracts';

/**
 * Escrow utility functions for buyers and sellers
 */

/**
 * Seller reveals voucher after buyer payment is locked
 */
export async function revealVoucher(
    signer: JsonRpcSigner,
    listingId: number
): Promise<{ hash: string; wait: () => Promise<any> }> {
    const escrowContract = getEscrowContract(signer);
    const tx = await escrowContract.revealVoucher(listingId);
    return tx;
}

/**
 * Buyer confirms voucher works correctly
 */
export async function confirmVoucher(
    signer: JsonRpcSigner,
    listingId: number
): Promise<{ hash: string; wait: () => Promise<any> }> {
    const escrowContract = getEscrowContract(signer);
    const tx = await escrowContract.confirmVoucher(listingId);
    return tx;
}

/**
 * Buyer disputes voucher (claims it doesn't work)
 */
export async function disputeVoucher(
    signer: JsonRpcSigner,
    listingId: number,
    evidenceCID: string
): Promise<{ hash: string; wait: () => Promise<any> }> {
    const escrowContract = getEscrowContract(signer);
    const tx = await escrowContract.disputeVoucher(listingId, evidenceCID);
    return tx;
}

/**
 * Lock payment for a voucher (buyer action)
 */
export async function lockPayment(
    signer: JsonRpcSigner,
    listingId: number
): Promise<{ hash: string; wait: () => Promise<any> }> {
    const escrowContract = getEscrowContract(signer);
    const tx = await escrowContract.lockPayment(listingId);
    return tx;
}

/**
 * Get escrow data for a listing
 */
export async function getEscrowData(
    provider: BrowserProvider,
    listingId: number
): Promise<{
    lockedAmount: bigint;
    lockTimestamp: bigint;
    disputeEvidenceCID: string;
}> {
    const escrowContract = getEscrowContract(provider);
    const result = await escrowContract.getEscrowData(listingId);

    return {
        lockedAmount: result[0],
        lockTimestamp: result[1],
        disputeEvidenceCID: result[2],
    };
}

/**
 * Check if user can reveal voucher (seller only, status must be LOCKED)
 */
export async function canRevealVoucher(
    provider: BrowserProvider,
    listingId: number,
    userAddress: string
): Promise<boolean> {
    try {
        // This would need to check the marketplace contract for listing status and seller
        // For now, return true - in real implementation, check:
        // 1. Listing status is LOCKED
        // 2. User is the seller
        // 3. Payment is actually locked in escrow
        return true;
    } catch (error) {
        console.error('Error checking reveal permission:', error);
        return false;
    }
}

/**
 * Check if user can confirm/dispute voucher (buyer only, status must be REVEALED)
 */
export async function canConfirmOrDispute(
    provider: BrowserProvider,
    listingId: number,
    userAddress: string
): Promise<boolean> {
    try {
        // This would need to check the marketplace contract for listing status and buyer
        // For now, return true - in real implementation, check:
        // 1. Listing status is REVEALED
        // 2. User is the buyer
        // 3. Payment is locked in escrow
        return true;
    } catch (error) {
        console.error('Error checking confirm/dispute permission:', error);
        return false;
    }
}

/**
 * Listen for escrow events
 */
export function onEscrowEvent(
    provider: BrowserProvider,
    eventName: 'Locked' | 'Revealed' | 'BuyerConfirmed' | 'BuyerDisputed' | 'Released' | 'Refunded',
    callback: (listingId: number, ...args: any[]) => void
): () => void {
    const contract = getEscrowContract(provider);

    const filter = contract.filters[eventName]();
    contract.on(filter, (id, ...args) => {
        callback(Number(id), ...args);
    });

    return () => {
        contract.removeAllListeners(filter);
    };
}