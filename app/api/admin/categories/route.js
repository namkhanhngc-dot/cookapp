import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// POST - Create category
export async function POST(request) {
    try {
        await AuthLib.requireAdmin();

        const { name, type, icon } = await request.json();

        if (!name || !type) {
            return NextResponse.json(
                { error: 'Name and type required' },
                { status: 400 }
            );
        }

        const result = await pool.query(
            'INSERT INTO categories (name, type, icon) VALUES ($1, $2, $3) RETURNING *',
            [name, type, icon || '🍳']
        );

        return NextResponse.json({
            success: true,
            category: result.rows[0]
        });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create category' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
