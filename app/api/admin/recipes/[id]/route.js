import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// DELETE recipe (admin)
export async function DELETE(request, { params }) {
    try {
        await AuthLib.requireAdmin();

        const { id } = params;

        // Delete recipe (cascade will delete related data)
        const result = await pool.query(
            'DELETE FROM recipes WHERE id = $1 RETURNING id, title',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Deleted recipe: ${result.rows[0].title}`
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete recipe' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
