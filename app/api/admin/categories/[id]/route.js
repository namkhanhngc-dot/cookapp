import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// PATCH - Update category
export async function PATCH(request, { params }) {
    try {
        await AuthLib.requireAdmin();

        const { id } = params;
        const { name, type, icon } = await request.json();

        const result = await pool.query(
            'UPDATE categories SET name = $1, type = $2, icon = $3 WHERE id = $4 RETURNING *',
            [name, type, icon, id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Update category error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update category' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}

// DELETE - Delete category
export async function DELETE(request, { params }) {
    try {
        await AuthLib.requireAdmin();

        const { id } = params;

        const result = await pool.query(
            'DELETE FROM categories WHERE id = $1 RETURNING name',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Deleted category: ${result.rows[0].name}`
        });
    } catch (error) {
        console.error('Delete category error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete category' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
