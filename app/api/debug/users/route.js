import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
    try {
        const result = await db.query(`
            SELECT id, username, email, role, created_at 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT 10
        `);

        return NextResponse.json({
            users: result.rows
        });
    } catch (error) {
        console.error('Query error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
