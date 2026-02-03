import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// PATCH - Update report status
export async function PATCH(request, { params }) {
    try {
        await AuthLib.requireAdmin();

        const { id } = params;
        const { status } = await request.json();

        const result = await pool.query(
            'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            report: result.rows[0]
        });
    } catch (error) {
        console.error('Update report error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update report' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
