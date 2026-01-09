import { NextRequest, NextResponse } from 'next/server';

const PINATA_GATEWAY = 'https://gateway.pinata.cloud/ipfs';

export async function GET(
    request: NextRequest,
    { params }: { params: { hash: string } }
) {
    try {
        const { hash } = params;

        if (!hash) {
            return NextResponse.json(
                { success: false, error: 'IPFS hash is required' },
                { status: 400 }
            );
        }

        // Validate IPFS hash format (basic check)
        if (!hash.match(/^(Qm[1-9A-HJ-NP-Za-km-z]{44}|baf[a-z0-9]{56})$/)) {
            return NextResponse.json(
                { success: false, error: 'Invalid IPFS hash format' },
                { status: 400 }
            );
        }

        const gatewayUrl = `${PINATA_GATEWAY}/${hash}`;

        return NextResponse.json({
            success: true,
            data: {
                ipfsHash: hash,
                gatewayUrl: gatewayUrl,
            },
        });
    } catch (error: any) {
        console.error('IPFS get file error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to get file from IPFS',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
