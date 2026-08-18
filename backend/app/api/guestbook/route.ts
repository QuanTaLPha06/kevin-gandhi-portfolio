import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestBook from '@/models/GuestBook';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Fetch all active guest book entries (public)
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Only fetch active entries that are NOT deleted
        const entries = await GuestBook.find({ active: true, isDeleted: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return NextResponse.json({
            success: true,
            data: entries,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching guest book entries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch entries' },
            { status: 500, headers: corsHeaders }
        );
    }
}

// POST - Create new guest book entry (requires user data from OAuth)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { message, userName, userEmail, userImage, provider, providerId } = body;

        // Validation
        if (!message || !userName || !userEmail || !provider || !providerId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400, headers: corsHeaders }
            );
        }

        if (message.length > 500) {
            return NextResponse.json(
                { success: false, error: 'Message cannot exceed 500 characters' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check for spam - limit 3 messages per user per day
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentCount = await GuestBook.countDocuments({
            providerId,
            provider,
            createdAt: { $gte: oneDayAgo },
        });

        if (recentCount >= 3) {
            return NextResponse.json(
                { success: false, error: 'You can only post 3 times per day' },
                { status: 429, headers: corsHeaders }
            );
        }

        // Create entry
        const entry = await GuestBook.create({
            message: message.trim(),
            userName,
            userEmail,
            userImage: userImage || '',
            provider,
            providerId,
            active: false,
        });

        return NextResponse.json({
            success: true,
            data: entry,
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Error creating guest book entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create entry' },
            { status: 500, headers: corsHeaders }
        );
    }
}
