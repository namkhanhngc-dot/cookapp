// Test Cloudinary upload
// Run: node scripts/test-cloudinary.js

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testCloudinary() {
    console.log('☁️  Testing Cloudinary connection...\n');

    // Check credentials
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        console.error('❌ Cloudinary credentials missing in .env.local');
        console.log('💡 Please add:');
        console.log('  CLOUDINARY_CLOUD_NAME=your-cloud-name');
        console.log('  CLOUDINARY_API_KEY=your-api-key');
        console.log('  CLOUDINARY_API_SECRET=your-api-secret');
        process.exit(1);
    }

    // Configure Cloudinary
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET
    });

    try {
        // Test 1: Ping API
        console.log('🔍 Testing Cloudinary API...');
        const pingResult = await cloudinary.api.ping();
        console.log('✅ Cloudinary API is reachable\n');

        // Test 2: Create a test image buffer
        console.log('📤 Testing image upload...');

        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );

        // Upload test image
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'cookapp/test',
                    public_id: `test-${Date.now()}`,
                    transformation: [
                        { width: 100, height: 100, crop: 'limit' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(testImageBuffer);
        });

        console.log('✅ Upload successful!');
        console.log(`\n📸 Image URL: ${uploadResult.secure_url}`);
        console.log(`📁 Public ID: ${uploadResult.public_id}`);
        console.log(`📊 Size: ${uploadResult.bytes} bytes`);

        // Test 3: Delete test image
        console.log('\n🗑️  Cleaning up test image...');
        await cloudinary.uploader.destroy(uploadResult.public_id);
        console.log('✅ Test image deleted');

        console.log('\n🎉 Cloudinary is configured correctly!');
        console.log('\n💡 Next steps:');
        console.log('  1. Your images will be uploaded to folders:');
        console.log('     - cookapp/recipes (recipe images)');
        console.log('     - cookapp/avatars (user avatars)');
        console.log('     - cookapp/cooksnaps (cooking results)');
        console.log('  2. Images will auto-optimize for best performance');
        console.log('  3. Free tier: 25GB storage, 25GB bandwidth/month');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('\n💡 Troubleshooting:');
        console.log('  1. Verify Cloud name is correct');
        console.log('  2. Check API Key and Secret');
        console.log('  3. Ensure credentials are from https://cloudinary.com/console');
        process.exit(1);
    }
}

testCloudinary();
