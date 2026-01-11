/**
 * Auto-Release Initialization Script
 * 
 * This script should be called when the server starts to begin
 * listening for BuyerConfirmed events automatically.
 * 
 * For Next.js, you can call this from instrumentation.ts or
 * manually trigger via the API endpoint.
 */

import { initAutoReleaseService, startEventListener, processPendingConfirmations } from './auto-release-service';

let initialized = false;

/**
 * Initialize and start the auto-release service
 * Call this once when the server starts
 */
export async function initializeAutoRelease(): Promise<void> {
    if (initialized) {
        console.log('⚠️ Auto-release service already initialized');
        return;
    }

    console.log('🚀 Starting Auto-Release Service...');
    console.log('='.repeat(50));

    // Step 1: Initialize the service
    const initResult = await initAutoReleaseService();
    if (!initResult.success) {
        console.error('❌ Failed to initialize auto-release service:', initResult.message);
        console.log('⚠️ Auto-release service will not run. Payments will need to be released manually.');
        return;
    }
    console.log('✅', initResult.message);

    // Step 2: Process any pending confirmations from before restart
    console.log('\n📋 Checking for pending confirmations...');
    const pendingResult = await processPendingConfirmations();
    console.log(`   Processed: ${pendingResult.processed}, Errors: ${pendingResult.errors}`);

    // Step 3: Start the event listener
    console.log('\n🎧 Starting event listener...');
    const listenerResult = await startEventListener();
    if (!listenerResult.success) {
        console.error('❌ Failed to start event listener:', listenerResult.message);
        return;
    }
    console.log('✅', listenerResult.message);

    console.log('='.repeat(50));
    console.log('🎉 Auto-Release Service is now running!');
    console.log('   Payments will be automatically released when buyers confirm vouchers.');
    console.log('');

    initialized = true;
}

/**
 * Check if service has been initialized
 */
export function isAutoReleaseInitialized(): boolean {
    return initialized;
}
