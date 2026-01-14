import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MAPPINGS_FILE = path.join(process.cwd(), 'data', 'ipfs-mappings.json');

/**
 * Resolve IPFS hash for a listing ID
 * This endpoint retrieves the stored IPFS hash mapping
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const listingId = parseInt(id);

        if (isNaN(listingId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid listing ID' },
                { status: 400 }
            );
        }

        // Read mappings from file
        if (!fs.existsSync(MAPPINGS_FILE)) {
            return NextResponse.json({
                success: false,
                error: 'No IPFS mappings found',
            }, { status: 404 });
        }

        const content = fs.readFileSync(MAPPINGS_FILE, 'utf8');
        const mappings = JSON.parse(content || '{}');
        const ipfsHash = mappings[listingId.toString()];

        if (!ipfsHash) {
            return NextResponse.json({
                success: false,
                error: `No IPFS hash found for listing ${listingId}`,
            }, { status: 404 });
        }

        console.log(`✅ Resolved IPFS hash for listing ${listingId}: ${ipfsHash}`);

        return NextResponse.json({
            success: true,
            ipfsHash,
            listingId,
        });

    } catch (error: any) {
        console.error('IPFS resolve error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to resolve IPFS hash',
                message: error.message,
            },
            { status: 500 }
        );
    }
}
