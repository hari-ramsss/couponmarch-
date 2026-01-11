import { NextRequest, NextResponse } from 'next/server';
import {
    initAutoReleaseService,
    startEventListener,
    stopEventListener,
    getServiceStatus,
    manualReleasePayment,
    processPendingConfirmations,
    isServiceRunning
} from '@/lib/auto-release-service';

/**
 * Auto-Release Service Management API
 * 
 * GET - Get service status
 * POST - Control the service (start, stop, release, process-pending)
 */

export async function GET() {
    try {
        const status = getServiceStatus();
        return NextResponse.json({
            success: true,
            data: status
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, listingId } = body;

        let result;

        switch (action) {
            case 'init':
                result = await initAutoReleaseService();
                break;

            case 'start':
                result = await startEventListener();
                break;

            case 'stop':
                result = await stopEventListener();
                break;

            case 'release':
                if (!listingId) {
                    return NextResponse.json({
                        success: false,
                        error: 'listingId is required for release action'
                    }, { status: 400 });
                }
                result = await manualReleasePayment(listingId);
                break;

            case 'process-pending':
                result = await processPendingConfirmations();
                return NextResponse.json({
                    success: true,
                    data: result
                });

            case 'status':
                return NextResponse.json({
                    success: true,
                    data: getServiceStatus()
                });

            default:
                return NextResponse.json({
                    success: false,
                    error: `Unknown action: ${action}. Valid actions: init, start, stop, release, process-pending, status`
                }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Auto-release API error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
