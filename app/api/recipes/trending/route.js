import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
    try {
        // Get trending recipes from the last 7 days
        // Sorted by views and ratings
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
                u.display_name,
                COALESCE(COUNT(DISTINCT l.id), 0)::int as like_count,
                COALESCE(AVG(rat.rating), 0)::numeric(3,2) as avg_rating,
                COALESCE(COUNT(DISTINCT rat.id), 0)::int as rating_count
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            LEFT JOIN likes l ON r.id = l.recipe_id
            LEFT JOIN ratings rat ON r.id = rat.recipe_id
            WHERE r.status = 'published'
            AND r.created_at > NOW() - INTERVAL '30 days'
            GROUP BY r.id, u.username, u.display_name
            ORDER BY r.views DESC, like_count DESC, avg_rating DESC
            LIMIT 12`
        );

        // Add badges based on performance
        const recipes = result.rows.map(recipe => {
            const badges = [];

            if (recipe.views > 100) badges.push('trending');
            if (recipe.like_count > 20) badges.push('popular');
            if (recipe.rating_count > 10 && recipe.avg_rating >= 4.5) badges.push('highly-rated');

            return {
                ...recipe,
                badges,
                author: recipe.display_name || recipe.username,
                thumbnail: recipe.thumbnail_url || recipe.image_url
            };
        });

        return NextResponse.json({
            success: true,
            recipes
        });
    } catch (error) {
        console.error('Error fetching trending recipes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trending recipes' },
            { status: 500 }
        );
    }
}
