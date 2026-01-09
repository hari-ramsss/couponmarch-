import { NextRequest, NextResponse } from 'next/server';
import { verifyVoucherImage } from '@/lib/ai-verification';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const voucherImage = formData.get('voucherImage') as File;
        const code = formData.get('code') as string;
        const brand = formData.get('brand') as string;
        const type = formData.get('type') as string;

        if (!voucherImage) {
            return NextResponse.json(
                { success: false, error: 'No voucher image provided' },
                { status: 400 }
            );
        }

        if (!code) {
            return NextResponse.json(
                { success: false, error: 'Voucher code is required for verification' },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const bytes = await voucherImage.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Verify with AI
        const result = await verifyVoucherImage(buffer, {
            code,
            brand,
            type,
        });

        return NextResponse.json({
            success: true,
            data: {
                isValid: result.isValid,
                confidence: result.confidence,
                score: result.score,
                findings: result.findings,
                extractedData: result.extractedData,
                issues: result.issues,
                recommendation: result.isValid
                    ? 'Voucher appears authentic and can be listed'
                    : 'Voucher verification failed. Please review and try again.',
            },
        });
    } catch (error: any) {
        console.error('Voucher verification error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to verify voucher',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
