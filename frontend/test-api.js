// Simple test script to verify API routes are working
// Run with: node test-api.js (after starting dev server)

const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testHealthEndpoint() {
    console.log('\n🔍 Testing Health Endpoint...');
    try {
        const response = await axios.get(`${API_URL}/health`);
        console.log('✅ Health check passed:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting API Tests...');
    console.log('📍 API URL:', API_URL);
    console.log('⚠️  Make sure Next.js dev server is running (npm run dev)');

    await testHealthEndpoint();

    console.log('\n✨ Tests completed!');
    console.log('\n📝 To test file uploads:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Go to http://localhost:3000/sell');
    console.log('   3. Upload images and create a listing');
}

runTests();
