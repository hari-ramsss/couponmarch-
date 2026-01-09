// Test IPFS (Pinata) Connection
// Run with: node test-ipfs-connection.js

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_URL = 'https://api.pinata.cloud';

async function testPinataConnection() {
    console.log('\n🔍 Testing Pinata IPFS Connection...\n');

    // Check if JWT is configured
    if (!PINATA_JWT || PINATA_JWT === 'your_pinata_jwt_token_here') {
        console.log('❌ PINATA_JWT not configured in .env.local');
        console.log('📋 Please add your Pinata JWT token to .env.local');
        return false;
    }

    console.log('✅ PINATA_JWT found in environment');
    console.log(`📝 JWT: ${PINATA_JWT.substring(0, 20)}...`);

    try {
        // Test authentication
        console.log('\n🔐 Testing authentication...');
        const response = await axios.get(`${PINATA_API_URL}/data/testAuthentication`, {
            headers: {
                Authorization: `Bearer ${PINATA_JWT}`,
            },
        });

        if (response.data.message === 'Congratulations! You are communicating with the Pinata API!') {
            console.log('✅ Authentication successful!');
            console.log('✅ IPFS connection is working!');
            return true;
        } else {
            console.log('⚠️ Unexpected response:', response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Connection failed!');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
        return false;
    }
}

async function testUploadEndpoint() {
    console.log('\n🔍 Testing Upload API Endpoint...\n');

    try {
        const response = await axios.get('http://localhost:3000/api/health');
        console.log('✅ API server is running');
        console.log('Response:', response.data);
        return true;
    } catch (error) {
        console.log('❌ API server not responding');
        console.log('Make sure to run: npm run dev');
        return false;
    }
}

async function runTests() {
    console.log('🚀 IPFS Connection Test\n');
    console.log('='.repeat(50));

    const pinataOk = await testPinataConnection();
    const apiOk = await testUploadEndpoint();

    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Test Results:\n');
    console.log(`Pinata IPFS: ${pinataOk ? '✅ Connected' : '❌ Failed'}`);
    console.log(`API Server: ${apiOk ? '✅ Running' : '❌ Not Running'}`);

    if (pinataOk && apiOk) {
        console.log('\n🎉 All systems operational!');
        console.log('✅ You can now upload vouchers on /sell page');
    } else {
        console.log('\n⚠️ Some issues detected. Please fix them before uploading.');
    }

    console.log('\n');
}

runTests();
