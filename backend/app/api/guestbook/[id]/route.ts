import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestBook from '@/models/GuestBook';
// Dynamic import for auth to avoid build issues if auth lib is edge-runtime specific or complicated
// But here usually standard import works. Let's try dynamic like blogs/route.ts for consistency.

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { verifyToken } = await import('@/lib/auth');
        const auth = verifyToken(request.cookies.get('admin_token')?.value || '');
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // We only allow updating 'active' status usually. But let's allow general update if needed.
        const updated = await GuestBook.findByIdAndUpdate(id, body, { new: true });

        if (!updated) {
            return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating guestbook entry:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { verifyToken } = await import('@/lib/auth');
        const auth = verifyToken(request.cookies.get('admin_token')?.value || '');
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const deleted = await GuestBook.findByIdAndDelete(id);

        if (!deleted) {
            return NextResponse.json({ success: false, error: 'Entry not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: { _id: id } });
    } catch (error) {
        console.error('Error deleting guestbook entry:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
