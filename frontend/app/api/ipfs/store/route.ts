import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MAPPINGS_FILE = path.join(process.cwd(), 'data', 'ipfs-mappings.json');

/**
 * Store IPFS hash mapping for a listing
 * POST /api/ipfs/store
 */
export async function POST(request: NextRequest) {
    try {
        const { listingId, ipfsHash } = await request.json();

        if (!listingId || !ipfsHash) {
            return NextResponse.json(
                { success: false, error: 'Missing listingId or ipfsHash' },
                { status: 400 }
            );
        }

        // Ensure data directory exists
        const dataDir = path.dirname(MAPPINGS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Read existing mappings
        let mappings: Record<string, string> = {};
        if (fs.existsSync(MAPPINGS_FILE)) {
            const content = fs.readFileSync(MAPPINGS_FILE, 'utf8');
            mappings = JSON.parse(content || '{}');
        }

        // Add new mapping
        mappings[listingId.toString()] = ipfsHash;

        // Write back to file
        fs.writeFileSync(MAPPINGS_FILE, JSON.stringify(mappings, null, 2));

        console.log(`✅ Stored IPFS mapping: Listing ${listingId} → ${ipfsHash}`);

        return NextResponse.json({
            success: true,
            data: {
                listingId,
                ipfsHash,
            },
        });
    } catch (error: any) {
        console.error('Error storing IPFS mapping:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to store IPFS mapping', message: error.message },
            { status: 500 }
        );
    }
}

/**
 * Get all stored IPFS mappings
 * GET /api/ipfs/store
 */
export async function GET() {
    try {
        if (!fs.existsSync(MAPPINGS_FILE)) {
            return NextResponse.json({
                success: true,
                data: {},
            });
        }

        const content = fs.readFileSync(MAPPINGS_FILE, 'utf8');
        const mappings = JSON.parse(content || '{}');

        return NextResponse.json({
            success: true,
            data: mappings,
        });
    } catch (error: any) {
        console.error('Error getting IPFS mappings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get IPFS mappings', message: error.message },
            { status: 500 }
        );
    }
}
