import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestBook from '@/models/GuestBook';
import mongoose from 'mongoose';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

// DELETE - Soft delete user's own entry (preserves audit trail)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();

        const { id } = await params;
        const body = await request.json();
        const { providerId, provider, userName, userEmail } = body;

        if (!providerId || !provider) {
            return NextResponse.json(
                { success: false, error: 'Missing provider information' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid entry ID format' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Find the entry and verify ownership
        const entry = await GuestBook.findById(id);

        if (!entry) {
            return NextResponse.json(
                { success: false, error: 'Entry not found' },
                { status: 404, headers: corsHeaders }
            );
        }

        // Verify the user owns this entry
        if (entry.providerId !== providerId || entry.provider !== provider) {
            return NextResponse.json(
                { success: false, error: 'You can only delete your own entries' },
                { status: 403, headers: corsHeaders }
            );
        }

        // Soft delete - mark as deleted instead of removing
        await GuestBook.findByIdAndUpdate(id, {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: 'user',
            deletedByName: userName || entry.userName,
            deletedByEmail: userEmail || entry.userEmail,
            active: false, // Also deactivate it
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Entry deleted successfully',
                deletedAt: new Date().toISOString(),
            },
            { headers: corsHeaders }
        );
    } catch (error) {
        console.error('Error deleting guestbook entry:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete entry' },
            { status: 500, headers: corsHeaders }
        );
    }
}
