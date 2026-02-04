import { NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/gemini';
import { pantrySearchPrompt } from '@/lib/ai/prompts';
const db = require('@/lib/db');

/**
 * API: Tìm công thức từ nguyên liệu có sẵn (Pantry AI)
 * POST /api/ai/pantry-search
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
                matches: []
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

        // Tạo prompt cho AI
        const prompt = pantrySearchPrompt(ingredients, recipesWithIngredients);

        console.log('Pantry Search - Ingredients:', ingredients);
        console.log('Pantry Search - Recipes count:', recipesWithIngredients.length);

        // Gọi Gemini AI
        const aiResponse = await generateText(prompt);

        // Parse JSON response
        let matches;
        try {
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                matches = parsed.matches || [];
            } else {
                throw new Error('Cannot extract JSON from AI response');
            }
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            return NextResponse.json(
                { error: 'Lỗi xử lý kết quả từ AI' },
                { status: 500 }
            );
        }

        // Enrich matches với recipe data
        const enrichedMatches = matches
            .map(match => {
                const recipe = recipesWithIngredients.find(r => r.id === match.recipe_id);
                if (!recipe) return null;

                return {
                    ...recipe,
                    match_percentage: match.match_percentage,
                    matched_ingredients: match.matched_ingredients,
                    missing_ingredients: match.missing_ingredients,
                    explanation: match.explanation,
                    thumbnail: recipe.thumbnail_url || recipe.image_url
                };
            })
            .filter(Boolean)
            .slice(0, limit);

        return NextResponse.json({
            success: true,
            matches: enrichedMatches,
            total_recipes_checked: recipesWithIngredients.length
        });

    } catch (error) {
        console.error('Pantry Search Error:', error);
        return NextResponse.json(
            { error: error.message || 'Lỗi không xác định' },
            { status: 500 }
        );
    }
}
