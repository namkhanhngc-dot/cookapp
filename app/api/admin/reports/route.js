import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// GET reports
export async function GET(request) {
    try {
        await AuthLib.requireAdmin();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'pending';

        const result = await pool.query(`
            SELECT r.id, r.reason, r.description, r.status, r.created_at,
                   r.recipe_id, rec.title as recipe_title,
                   u.username as reporter_username
            FROM reports r
            LEFT JOIN users u ON r.reporter_id = u.id
            LEFT JOIN recipes rec ON r.recipe_id = rec.id
            WHERE r.status = $1
            ORDER BY r.created_at DESC
        `, [status]);

        return NextResponse.json({ reports: result.rows });
    } catch (error) {
        console.error('Get reports error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch reports' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
