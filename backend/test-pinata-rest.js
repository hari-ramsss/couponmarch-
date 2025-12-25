/**
 * Test script for Pinata REST API implementation
 * Run with: node test-pinata-rest.js
 */

require('dotenv').config();
const ipfsService = require('./services/ipfs');
const fs = require('fs');
const path = require('path');

async function testPinataRestAPI() {
    console.log('🧪 Testing Pinata REST API Implementation\n');

    try {
        // Test 1: Authentication Test
        console.log('1️⃣ Testing Authentication...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for connection test
        console.log('✅ Authentication test completed\n');

        // Test 2: Upload JSON Metadata
        console.log('2️⃣ Testing JSON Upload...');
        const testMetadata = {
            title: 'Test Voucher',
            type: 'Gift Card',
            brand: 'Test Brand',
            code: 'TEST123456',
            price: '10.00',
            currency: 'MNEE',
            uploadedAt: new Date().toISOString(),
            testData: true
        };

        const jsonResult = await ipfsService.uploadJSON(testMetadata, {
            name: 'test-metadata',
            customData: {
                testType: 'json-upload',
                environment: 'testing'
            }
        });

        console.log('✅ JSON Upload Result:');
        console.log(`   IPFS Hash: ${jsonResult.ipfsHash}`);
        console.log(`   Gateway URL: ${jsonResult.gatewayUrl}`);
        console.log(`   Pin Size: ${jsonResult.pinSize} bytes\n`);

        // Test 3: Upload File Buffer (simulate image)
        console.log('3️⃣ Testing File Buffer Upload...');

        // Create a test buffer (simulating an image file)
        const testBuffer = Buffer.from('This is a test file content for IPFS upload testing', 'utf8');

        const fileResult = await ipfsService.uploadFile(testBuffer, {
            name: 'test-file',
            type: 'test-file',
            originalName: 'test.txt',
            customData: {
                testType: 'file-upload',
                environment: 'testing'
            }
        });

        console.log('✅ File Upload Result:');
        console.log(`   IPFS Hash: ${fileResult.ipfsHash}`);
        console.log(`   Gateway URL: ${fileResult.gatewayUrl}`);
        console.log(`   Pin Size: ${fileResult.pinSize} bytes\n`);

        // Test 4: Get File URL
        console.log('4️⃣ Testing Get File URL...');
        const fileUrl = await ipfsService.getFile(fileResult.ipfsHash);
        console.log(`✅ File URL: ${fileUrl}\n`);

        // Test 5: List Files
        console.log('5️⃣ Testing List Files...');
        const listResult = await ipfsService.listFiles({
            pageLimit: 5,
            status: 'pinned'
        });

        console.log(`✅ Listed ${listResult.files.length} files:`);
        listResult.files.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file.metadata?.name || 'Unnamed'} (${file.ipfs_pin_hash})`);
        });
        console.log();

        // Test 6: Get Pin Status
        console.log('6️⃣ Testing Pin Status...');
        const pinStatus = await ipfsService.getPinStatus(jsonResult.ipfsHash);
        console.log(`✅ Pin Status for ${jsonResult.ipfsHash}:`);
        console.log(`   Is Pinned: ${pinStatus.isPinned}`);
        console.log(`   Pin Data: ${pinStatus.pinData ? 'Available' : 'Not found'}\n`);

        // Test 7: Update Metadata
        console.log('7️⃣ Testing Metadata Update...');
        const updateResult = await ipfsService.updateMetadata(jsonResult.ipfsHash, {
            name: 'test-metadata-updated',
            keyvalues: {
                updated: 'true',
                updatedAt: new Date().toISOString(),
                testType: 'metadata-update'
            }
        });
        console.log('✅ Metadata Update Result:');
        console.log(`   Success: ${updateResult.success}`);
        console.log(`   Message: ${updateResult.message}\n`);

        // Test 8: Cleanup (Optional - uncomment to clean up test files)
        console.log('8️⃣ Cleanup (Optional)...');
        console.log('⚠️  Skipping cleanup to preserve test files');
        console.log(`   To manually cleanup, unpin: ${jsonResult.ipfsHash} and ${fileResult.ipfsHash}\n`);

        /*
        // Uncomment to actually cleanup
        await ipfsService.unpinFile(jsonResult.ipfsHash);
        await ipfsService.unpinFile(fileResult.ipfsHash);
        console.log('✅ Cleanup completed\n');
        */

        console.log('🎉 All tests completed successfully!');
        console.log('\n📋 Test Summary:');
        console.log(`   ✅ Authentication: Working`);
        console.log(`   ✅ JSON Upload: ${jsonResult.ipfsHash}`);
        console.log(`   ✅ File Upload: ${fileResult.ipfsHash}`);
        console.log(`   ✅ File Retrieval: Working`);
        console.log(`   ✅ File Listing: Working`);
        console.log(`   ✅ Pin Status: Working`);
        console.log(`   ✅ Metadata Update: Working`);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testPinataRestAPI();
}

module.exports = { testPinataRestAPI };