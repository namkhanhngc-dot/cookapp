const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Save uploaded file to Cloudinary
async function saveUpload(file, type = 'recipes') {
    try {
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Check file size
        if (buffer.length > MAX_FILE_SIZE) {
            throw new Error('File size exceeds 10MB limit');
        }

        // Upload to Cloudinary
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `cookapp/${type}`,
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );
            uploadStream.end(buffer);
        });
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

// Delete uploaded file from Cloudinary
async function deleteUpload(url) {
    if (!url || !url.includes('cloudinary.com')) return;

    try {
        // Extract public_id from URL
        const parts = url.split('/');
        const filename = parts[parts.length - 1].split('.')[0];
        const folder = parts.slice(-3, -1).join('/');
        const publicId = `${folder}/${filename}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Delete error:', error);
    }
}

module.exports = {
    saveUpload,
    deleteUpload
};
