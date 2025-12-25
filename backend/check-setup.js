#!/usr/bin/env node

/**
 * Check backend setup status
 * Run with: node check-setup.js
 */

require('dotenv').config();

console.log('🔍 Checking Backend Setup Status\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set'}`);
console.log(`   PINATA_JWT: ${process.env.PINATA_JWT ?
    (process.env.PINATA_JWT === 'your_pinata_jwt_token_here' ? '❌ Placeholder (needs real token)' : '✅ Configured') :
    '❌ Not set'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set'}\n`);

// Check dependencies
console.log('📦 Dependencies:');
try {
    require('axios');
    console.log('   axios: ✅ Installed');
} catch (e) {
    console.log('   axios: ❌ Missing');
}

try {
    require('form-data');
    console.log('   form-data: ✅ Installed');
} catch (e) {
    console.log('   form-data: ❌ Missing');
}

try {
    require('express');
    console.log('   express: ✅ Installed');
} catch (e) {
    console.log('   express: ❌ Missing');
}

console.log();

// Check IPFS service
console.log('🌐 IPFS Service:');
try {
    const ipfsService = require('./services/ipfs.js');
    if (ipfsService.isAvailable()) {
        console.log('   Status: ✅ Available and configured');
    } else {
        console.log('   Status: ⚠️  Available but not configured (development mode)');
    }
} catch (error) {
    console.log('   Status: ❌ Error loading service');
    console.log(`   Error: ${error.message}`);
}

console.log();

// Setup recommendations
console.log('🚀 Setup Status:');
const hasValidJWT = process.env.PINATA_JWT && process.env.PINATA_JWT !== 'your_pinata_jwt_token_here';

if (hasValidJWT) {
    console.log('✅ Backend is ready for production use');
    console.log('   Next: Start server with "npm start"');
} else {
    console.log('⚠️  Backend is in development mode');
    console.log('   To enable IPFS uploads:');
    console.log('   1. Get JWT token from https://app.pinata.cloud/keys');
    console.log('   2. Update PINATA_JWT in .env file');
    console.log('   3. Restart server');
    console.log('   4. Run "npm run test:pinata" to verify');
}

console.log('\n📚 Documentation:');
console.log('   - Setup guide: PINATA_SETUP.md');
console.log('   - API docs: PINATA_REST_API.md');
console.log('   - General info: README.md');