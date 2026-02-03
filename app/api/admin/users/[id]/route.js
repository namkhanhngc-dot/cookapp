import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// PATCH - Update user (role, ban status, etc.)
export async function PATCH(request, { params }) {
    try {
        await AuthLib.requireAdmin();

        const { id } = params;
        const body = await request.json();
        const { role, banned_at, ban_reason } = body;

        // Build update query dynamically
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (role) {
            updates.push(`role = $${paramCount++}`);
            values.push(role);
        }

        if (banned_at !== undefined) {
            updates.push(`banned_at = $${paramCount++}`);
            values.push(banned_at);
        }

        if (ban_reason !== undefined) {
            updates.push(`ban_reason = $${paramCount++}`);
            values.push(ban_reason);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No updates provided' },
                { status: 400 }
            );
        }

        values.push(id);
        const query = `
            UPDATE users 
            SET ${updates.join(', ')}, updated_at = NOW()
            WHERE id = $${paramCount}
            RETURNING id, username, email, role
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update user' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
