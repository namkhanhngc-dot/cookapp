import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit')) || 12;

        const result = await db.query(
            `SELECT 
                r.id,
                r.title,
                r.description,
                r.thumbnail_url,
                r.image_url,
                r.prep_time,
                r.cook_time,
                r.total_time,
                r.servings,
                r.difficulty,
                r.created_at,
                r.views,
                u.username,
                u.display_name
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.status = 'published'
            ORDER BY r.created_at DESC
            LIMIT $1`,
            [limit]
        );

        const recipes = result.rows.map(recipe => ({
            ...recipe,
            author: recipe.display_name || recipe.username,
            thumbnail: recipe.thumbnail_url || recipe.image_url,
            like_count: 0,
            avg_rating: 0,
            rating_count: 0
        }));

        console.log('Recent recipes found:', recipes.length);

        return NextResponse.json({
            success: true,
            recipes
        });
    } catch (error) {
        console.error('Error fetching recent recipes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch recent recipes' },
            { status: 500 }
        );
    }
}
