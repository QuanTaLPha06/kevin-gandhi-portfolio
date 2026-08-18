import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GuestBook from '@/models/GuestBook';

export async function GET(request: NextRequest) {
    try {
        const { verifyToken } = await import('@/lib/auth');
        const auth = verifyToken(request.cookies.get('admin_token')?.value || '');
        if (!auth) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Support pagination/search if needed, but simple list is fine for first version
        const entries = await GuestBook.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: { items: entries, total: entries.length } });
    } catch (error) {
        console.error('Error fetching admin guestbook entries:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
