'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ images = [], onChange, maxFiles = 5, maxSize = 5242880 }) {
    const [uploading, setUploading] = useState(false);

    const onDrop = async (acceptedFiles) => {
        console.log('🎯 onDrop called! Accepted files:', acceptedFiles.length, acceptedFiles);
        console.log('🖼️ Current images:', images.length, 'Max:', maxFiles);

        if (images.length + acceptedFiles.length > maxFiles) {
            alert(`Chỉ được upload tối đa ${maxFiles} ảnh!`);
            return;
        }

        if (acceptedFiles.length === 0) {
            console.warn('⚠️ No files accepted!');
            return;
        }

        setUploading(true);

        try {
            const uploadPromises = acceptedFiles.map(async (file) => {
                console.log('📤 Uploading file:', file.name, file.size);

                // Create FormData for Cloudinary upload
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cookapp_recipes');

                console.log('☁️ Cloudinary config:', {
                    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                    uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
                });

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                console.log('📥 Response status:', response.status, response.ok);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Cloudinary error response:', errorText);
                    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                console.log('✅ Cloudinary response:', data);

                return {
                    url: data.secure_url,
                    publicId: data.public_id,
                    width: data.width,
                    height: data.height,
                    format: data.format,
                    size: data.bytes
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);
            console.log('✅ All uploads completed:', uploadedImages);
            onChange([...images, ...uploadedImages]);
        } catch (error) {
            console.error('❌ Upload error:', error);
            alert(`❌ Lỗi upload ảnh: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const onDropRejected = (fileRejections) => {
        console.error('❌ Files REJECTED:', fileRejections);
        fileRejections.forEach(rejection => {
            console.error('File:', rejection.file.name, 'Size:', rejection.file.size);
            rejection.errors.forEach(err => {
                console.error(`  Error: ${err.code} - ${err.message}`);
            });
        });

        const msg = fileRejections.map(r =>
            `${r.file.name}: ${r.errors.map(e => e.message).join(', ')}`
        ).join('\n');
        alert(`❌ File bị từ chối:\n${msg}`);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxSize: maxSize, // Use prop value
        multiple: true
    });

    const removeImage = (index) => {
        onChange(images.filter((_, i) => i !== index));
    };

    const setAsThumbnail = (index) => {
        const newImages = images.map((img, i) => ({
            ...img,
            isThumbnail: i === index
        }));
        onChange(newImages);
    };

    return (
        <div className={styles.imageUpload}>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${uploading ? styles.uploading : ''}`}
            >
                <input {...getInputProps()} />
                {uploading ? (
                    <div className={styles.uploadingState}>
                        <div className="spinner"></div>
                        <p>Đang upload...</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.dropzoneIcon}>📸</div>
                        <p className={styles.dropzoneText}>
                            {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo thả ảnh hoặc click để chọn'}
                        </p>
                        <p className={styles.dropzoneHint}>
                            Tối đa {maxFiles} ảnh, mỗi ảnh &lt; 5MB
                        </p>
                    </>
                )}
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className={styles.imageGrid}>
                    {images.map((image, index) => (
                        <div key={index} className={styles.imageItem}>
                            <img src={image.url} alt={`Upload ${index + 1}`} />

                            {/* Thumbnail badge */}
                            {image.isThumbnail && (
                                <div className={styles.thumbnailBadge}>⭐ Thumbnail</div>
                            )}

                            {/* Actions overlay */}
                            <div className={styles.imageActions}>
                                {!image.isThumbnail && (
                                    <button
                                        type="button"
                                        onClick={() => setAsThumbnail(index)}
                                        className={styles.actionBtn}
                                        title="Set as thumbnail"
                                    >
                                        ⭐
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    title="Remove"
                                >
                                    🗑️
                                </button>
                            </div>

                            {/* Image info */}
                            <div className={styles.imageInfo}>
                                {image.size ? Math.round(image.size / 1024) : '?'}KB
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info message */}
            {images.length > 0 && (
                <p className={styles.imageCount}>
                    {images.length}/{maxFiles} ảnh •
                    {images.some(img => img.isThumbnail) ? ' Đã chọn thumbnail' : ' Chưa chọn thumbnail'}
                </p>
            )}
        </div>
    );
}
