import { NextResponse } from 'next/server';
const pool = require('@/lib/db');

export async function GET() {
    try {
        const result = await pool.query(`
            SELECT id, name, type, icon, description
            FROM dietary_tags
            ORDER BY type, name
        `);

        return NextResponse.json({ tags: result.rows });
    } catch (error) {
        console.error('Get dietary tags error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dietary tags' },
            { status: 500 }
        );
    }
}
