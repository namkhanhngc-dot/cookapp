import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
    try {
        const [recipesResult, usersResult] = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM recipes WHERE status = $1', ['published']),
            db.query('SELECT COUNT(*) as count FROM users')
        ]);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayRecipesResult = await db.query(
            'SELECT COUNT(*) as count FROM recipes WHERE created_at >= $1',
            [todayStart]
        );

        return NextResponse.json({
            success: true,
            total_recipes: parseInt(recipesResult.rows[0].count),
            total_users: parseInt(usersResult.rows[0].count),
            recipes_today: parseInt(todayRecipesResult.rows[0].count)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
