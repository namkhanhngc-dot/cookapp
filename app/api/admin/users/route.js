import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// GET all users
export async function GET() {
    try {
        await AuthLib.requireAdmin();

        const result = await pool.query(`
            SELECT id, username, email, display_name, role, created_at, avatar_url
            FROM users
            ORDER BY created_at DESC
        `);

        return NextResponse.json({ users: result.rows });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch users' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
