import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
    try {
        // Check if table exists and get all data
        const result = await db.query('SELECT * FROM site_banners ORDER BY created_at DESC');

        return NextResponse.json({
            success: true,
            count: result.rows.length,
            banners: result.rows
        });
    } catch (error) {
        console.error('Debug query error:', error);
        return NextResponse.json(
            {
                error: error.message,
                stack: error.stack
            },
            { status: 500 }
        );
    }
}
