import { NextRequest, NextResponse } from 'next/server';
import { uploadJSONToIPFS } from '@/lib/ipfs-service';

export async function POST(request: NextRequest) {
    try {
        const { voucherData } = await request.json();

        if (!voucherData || typeof voucherData !== 'object') {
            return NextResponse.json(
                { success: false, error: 'Invalid voucher data' },
                { status: 400 }
            );
        }

        // Validate required fields
        const requiredFields = ['title', 'type', 'code', 'price'];
        const missingFields = requiredFields.filter(field => !voucherData[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields', message: `Required: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Generate partial pattern
        let partialPattern = voucherData.partialPattern;
        if (!partialPattern && voucherData.code) {
            const code = voucherData.code;
            const codeLength = code.length;
            if (codeLength <= 6) {
                partialPattern = code;
            } else {
                partialPattern = `${code.slice(0, 2)}${'*'.repeat(Math.max(0, codeLength - 6))}${code.slice(-4)}`;
            }
        }

        // Create comprehensive metadata
        const voucherMetadata = {
            title: voucherData.title,
            type: voucherData.type,
            brand: voucherData.brand || '',
            description: voucherData.description || '',
            code: voucherData.code,
            partialPattern: partialPattern || '',
            value: parseFloat(voucherData.value) || 0,
            discountPercentage: parseFloat(voucherData.discountPercentage) || 0,
            price: voucherData.price,
            currency: voucherData.currency || 'MNEE',
            expiryDate: voucherData.expiryDate || null,
            expiryTimestamp: voucherData.expiryTimestamp || 0,
            terms: voucherData.terms || '',
            usageInstructions: voucherData.usageInstructions || '',
            restrictions: voucherData.restrictions || '',
            images: {
                logo: {
                    original: voucherData.logoOriginal || '',
                    thumbnail: voucherData.logoThumbnail || '',
                },
                voucher: {
                    original: voucherData.voucherOriginal || '',
                    blurred: voucherData.voucherBlurred || '',
                    thumbnail: voucherData.voucherThumbnail || '',
                },
            },
            seller: {
                address: voucherData.sellerAddress || '',
                reputation: parseInt(voucherData.sellerReputation) || 0,
                totalSales: parseInt(voucherData.sellerTotalSales) || 0,
            },
            validation: {
                aiInitialProof: voucherData.aiInitialProof || '',
                validationScore: parseInt(voucherData.validationScore) || 0,
                validationStatus: voucherData.validationStatus || 'pending',
                validatedAt: voucherData.validatedAt || null,
            },
            blockchain: {
                network: voucherData.network || 'sepolia',
                listingId: voucherData.listingId || null,
                contractAddress: voucherData.contractAddress || '',
                transactionHash: voucherData.transactionHash || '',
            },
            platform: {
                name: 'CouponMarche',
                version: '1.0',
                uploadedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                category: voucherData.category || 'General',
                tags: Array.isArray(voucherData.tags) ? voucherData.tags : [],
                featured: Boolean(voucherData.featured),
            },
            analytics: {
                views: 0,
                favorites: 0,
                inquiries: 0,
                createdAt: new Date().toISOString(),
            },
        };

        // Upload to IPFS
        const metadataUpload = await uploadJSONToIPFS(voucherMetadata, {
            name: `voucher-metadata-${voucherData.title?.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
            type: 'voucher-listing-metadata',
        });

        return NextResponse.json({
            success: true,
            data: {
                ipfsHash: metadataUpload.ipfsHash,
                gatewayUrl: metadataUpload.gatewayUrl,
                size: metadataUpload.pinSize,
                metadata: voucherMetadata,
                summary: {
                    title: voucherMetadata.title,
                    type: voucherMetadata.type,
                    price: voucherMetadata.price,
                    hasImages: !!(voucherMetadata.images.logo.original || voucherMetadata.images.voucher.original),
                    validationStatus: voucherMetadata.validation.validationStatus,
                },
            },
        });
    } catch (error: any) {
        console.error('Voucher metadata upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload voucher metadata', message: error.message },
            { status: 500 }
        );
    }
}
