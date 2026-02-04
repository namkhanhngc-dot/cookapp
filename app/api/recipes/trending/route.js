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
                u.display_name
            FROM recipes r
            JOIN users u ON r.user_id = u.id
            WHERE r.status = 'published'
            ORDER BY r.views DESC, r.created_at DESC
            LIMIT 12`
        );

        // Add badges based on performance
        const recipes = result.rows.map(recipe => {
            const badges = [];

            if (recipe.views > 100) badges.push('trending');

            return {
                ...recipe,
                badges,
                author: recipe.display_name || recipe.username,
                thumbnail: recipe.thumbnail_url || recipe.image_url,
                like_count: 0,
                avg_rating: 0,
                rating_count: 0
            };
        });

        console.log('Trending recipes found:', recipes.length);
        console.log('Recipes:', recipes);

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
