import { NextResponse } from 'next/server';
const pool = require('@/lib/db');
const AuthLib = require('@/lib/auth');

export async function GET() {
    try {
        // Verify admin access
        await AuthLib.requireAdmin();

        // Get statistics
        const [usersResult, recipesResult, categoriesResult, reportsResult] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM users'),
            pool.query('SELECT COUNT(*) as count FROM recipes WHERE status = $1', ['published']),
            pool.query('SELECT COUNT(*) as count FROM categories'),
            pool.query('SELECT COUNT(*) as count FROM reports WHERE status = $1', ['pending'])
        ]);

        // Get recent recipes
        const recentRecipes = await pool.query(`
            SELECT r.id, r.title, r.created_at, u.username
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.status = 'published'
            ORDER BY r.created_at DESC
            LIMIT 5
        `);

        const stats = {
            totalUsers: parseInt(usersResult.rows[0].count),
            totalRecipes: parseInt(recipesResult.rows[0].count),
            totalCategories: parseInt(categoriesResult.rows[0].count),
            pendingReports: parseInt(reportsResult.rows[0].count),
            recentRecipes: recentRecipes.rows
        };

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Admin stats error:', error);

        if (error.message === 'Authentication required' || error.message === 'Admin access required') {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
