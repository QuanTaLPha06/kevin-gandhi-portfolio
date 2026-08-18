import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestBook from '@/models/GuestBook';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Fetch pending entries for a specific user (by providerId)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const providerId = searchParams.get('providerId');
        const provider = searchParams.get('provider');

        if (!providerId || !provider) {
            return NextResponse.json(
                { success: false, error: 'Missing providerId or provider' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Fetch user's pending entries (active: false, not deleted)
        const pendingEntries = await GuestBook.find({
            providerId,
            provider,
            active: false,
            isDeleted: { $ne: true }
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return NextResponse.json({
            success: true,
            data: pendingEntries,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching user pending entries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch entries' },
            { status: 500, headers: corsHeaders }
        );
    }
}
