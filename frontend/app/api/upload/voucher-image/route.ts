import { NextRequest, NextResponse } from 'next/server';
import { uploadToIPFS, validateImage, processImage } from '@/lib/ipfs-service';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('voucherImage') as File;

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

        // Process image (with blur for marketplace)
        const processedImages = await processImage(buffer, {
            createThumbnail: true,
            createBlurred: true,
            optimize: true,
        });

        // Upload to IPFS
        const uploadId = Date.now().toString();
        const originalUpload = await uploadToIPFS(processedImages.images.original, {
            name: `voucher-${uploadId}`,
            type: 'voucher-image-original',
            originalName: file.name,
        });

        const blurredUpload = await uploadToIPFS(processedImages.images.blurred!, {
            name: `voucher-blurred-${uploadId}`,
            type: 'voucher-image-blurred',
            originalName: `blurred_${file.name}`,
        });

        const thumbnailUpload = await uploadToIPFS(processedImages.images.thumbnail!, {
            name: `voucher-thumb-${uploadId}`,
            type: 'voucher-image-thumbnail',
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
                blurred: {
                    ipfsHash: blurredUpload.ipfsHash,
                    gatewayUrl: blurredUpload.gatewayUrl,
                    size: blurredUpload.pinSize,
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
        console.error('Voucher image upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload voucher image', message: error.message },
            { status: 500 }
        );
    }
}
