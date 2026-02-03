import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

// GET all recipes (admin)
export async function GET(request) {
    try {
        await AuthLib.requireAdmin();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = `
            SELECT r.id, r.title, r.status, r.views, r.created_at,
                   u.username,
                   COUNT(DISTINCT l.user_id) as likes_count
            FROM recipes r
            LEFT JOIN users u ON r.user_id = u.id
            LEFT JOIN likes l ON r.id = l.recipe_id
        `;

        const params = [];
        if (status && status !== 'all') {
            query += ` WHERE r.status = $1`;
            params.push(status);
        }

        query += `
            GROUP BY r.id, u.username
            ORDER BY r.created_at DESC
        `;

        const result = await pool.query(query, params);

        return NextResponse.json({ recipes: result.rows });
    } catch (error) {
        console.error('Get recipes error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch recipes' },
            { status: error.message === 'Admin access required' ? 403 : 500 }
        );
    }
}
