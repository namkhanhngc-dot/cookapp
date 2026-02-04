import { NextResponse } from 'next/server';
const db = require('@/lib/db');

/**
 * API: Tìm công thức từ nguyên liệu (Simple matching - không dùng AI)
 * POST /api/ai/pantry-search-simple
 */
export async function POST(request) {
    try {
        const { ingredients, limit = 10 } = await request.json();

        // Validate input
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return NextResponse.json(
                { error: 'Vui lòng cung cấp danh sách nguyên liệu' },
                { status: 400 }
            );
        }

        // Lấy tất cả recipes published
        const recipesResult = await db.query(
            `SELECT 
                r.id,
                r.title,
                r.description,
                r.thumbnail_url,
                r.image_url,
                r.difficulty,
                r.total_time,
                r.servings
            FROM recipes r
            WHERE r.status = 'published'
            ORDER BY r.views DESC
            LIMIT 50`
        );

        const recipes = recipesResult.rows;

        if (recipes.length === 0) {
            return NextResponse.json({
                success: true,
                matches: [],
                debug: 'No published recipes found'
            });
        }

        // Lấy ingredients cho mỗi recipe
        const recipesWithIngredients = await Promise.all(
            recipes.map(async (recipe) => {
                const ingredientsResult = await db.query(
                    `SELECT name, quantity, unit
                     FROM recipe_ingredients
                     WHERE recipe_id = $1
                     ORDER BY order_index`,
                    [recipe.id]
                );

                return {
                    ...recipe,
                    ingredients: ingredientsResult.rows
                };
            })
        );

        console.log('=== PANTRY SEARCH DEBUG ===');
        console.log('User ingredients:', ingredients);
        console.log('Total recipes:', recipesWithIngredients.length);
        console.log('First recipe:', JSON.stringify(recipesWithIngredients[0], null, 2));

        // Simple matching logic (case-insensitive, partial match)
        const matches = recipesWithIngredients.map(recipe => {
            const recipeIngredientNames = recipe.ingredients.map(ing =>
                ing.name.toLowerCase().trim()
            );

            const userIngredientsLower = ingredients.map(ing => ing.toLowerCase().trim());

            // Count matched ingredients
            const matched = [];
            const missing = [];

            recipeIngredientNames.forEach(recipeIng => {
                // Tách thành từng từ để match tốt hơn
                const recipeWords = recipeIng.split(/\s+/);

                const found = userIngredientsLower.some(userIng => {
                    const userWords = userIng.split(/\s+/);

                    // Check nếu bất kỳ từ nào trong user input match với recipe ingredient
                    // Ví dụ: "thịt bò" sẽ match với "bò"
                    return userWords.some(userWord =>
                        recipeWords.some(recipeWord =>
                            recipeWord.includes(userWord) || userWord.includes(recipeWord)
                        )
                    );
                });

                if (found) {
                    matched.push(recipeIng);
                } else {
                    missing.push(recipeIng);
                }
            });

            const matchPercentage = recipeIngredientNames.length > 0
                ? Math.round((matched.length / recipeIngredientNames.length) * 100)
                : 0;

            return {
                ...recipe,
                match_percentage: matchPercentage,
                matched_ingredients: matched,
                missing_ingredients: missing,
                explanation: `Công thức có ${matched.length}/${recipeIngredientNames.length} nguyên liệu bạn có`,
                thumbnail: recipe.thumbnail_url || recipe.image_url
            };
        })
            .filter(match => match.match_percentage > 0) // Only show recipes with at least 1 match
            .sort((a, b) => b.match_percentage - a.match_percentage)
            .slice(0, limit);

        console.log('Matches found:', matches.length);

        return NextResponse.json({
            success: true,
            matches,
            total_recipes_checked: recipesWithIngredients.length,
            debug: {
                user_ingredients: ingredients,
                recipes_checked: recipesWithIngredients.length,
                matches_found: matches.length
            }
        });

    } catch (error) {
        console.error('Pantry Search Error:', error);
        return NextResponse.json(
            { error: error.message || 'Lỗi không xác định', stack: error.stack },
            { status: 500 }
        );
    }
}
