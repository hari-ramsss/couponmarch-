/**
 * Next.js Instrumentation
 * 
 * This file is automatically executed when the Next.js server starts.
 * We use it to initialize the auto-release service.
 */

export async function register() {
    // Only run on the server
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        console.log('\n🔧 Next.js Instrumentation: Server starting...\n');

        // Check if we should enable auto-release
        if (process.env.ADMIN_PRIVATE_KEY && process.env.NEXT_PUBLIC_RPC_URL) {
            console.log('📦 Auto-Release Service: Environment variables found, initializing...');

            // Dynamic import to avoid issues
            const { initializeAutoRelease } = await import('./lib/auto-release-init');
            await initializeAutoRelease();
        } else {
            console.log('⚠️ Auto-Release Service: Disabled (ADMIN_PRIVATE_KEY or NEXT_PUBLIC_RPC_URL not set)');
            console.log('   To enable, add these to your .env.local:');
            console.log('   - ADMIN_PRIVATE_KEY=your_admin_wallet_private_key');
            console.log('   - NEXT_PUBLIC_RPC_URL=your_sepolia_rpc_url\n');
        }
    }
}
