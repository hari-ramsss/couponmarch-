import { NextRequest, NextResponse } from 'next/server';
import { uploadToIPFS, validateImage, processImage } from '@/lib/ipfs-service';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('logo') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate image
        const validation = await validateImage(buffer);
        if (!validation.isValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid image', details: validation.errors },
                { status: 400 }
            );
        }

        // Process image
        const processedImages = await processImage(buffer, {
            createThumbnail: true,
            createBlurred: false,
            optimize: true,
        });

        // Upload to IPFS
        const uploadId = Date.now().toString();
        const originalUpload = await uploadToIPFS(processedImages.images.original, {
            name: `logo-${uploadId}`,
            type: 'voucher-logo',
            originalName: file.name,
        });

        if (!processedImages.images.thumbnail) {
            throw new Error('Failed to create thumbnail image');
        }
        const thumbnailUpload = await uploadToIPFS(processedImages.images.thumbnail, {
            name: `logo-thumb-${uploadId}`,
            type: 'voucher-logo-thumbnail',
            originalName: `thumb_${file.name}`,
        });

        return NextResponse.json({
            success: true,
            data: {
                uploadId,
                original: {
                    ipfsHash: originalUpload.ipfsHash,
                    gatewayUrl: originalUpload.gatewayUrl,
                    size: originalUpload.pinSize,
                },
                thumbnail: {
                    ipfsHash: thumbnailUpload.ipfsHash,
                    gatewayUrl: thumbnailUpload.gatewayUrl,
                    size: thumbnailUpload.pinSize,
                },
                metadata: processedImages.metadata,
            },
        });
    } catch (error: any) {
        console.error('Logo upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload logo', message: error.message },
            { status: 500 }
        );
    }
}
