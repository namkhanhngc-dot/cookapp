import { NextResponse } from 'next/server';
import { generateStructuredOutput } from '@/lib/ai/gemini';
import { recipeGeneratorPrompt, recipeGeneratorSchema } from '@/lib/ai/prompts';

/**
 * API: Tạo công thức từ AI
 * POST /api/ai/generate-recipe
 */
export async function POST(request) {
    try {
        const { prompt, servings = 2, dietary_preferences = [] } = await request.json();

        // Validate input
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json(
                { error: 'Vui lòng nhập mô tả món ăn' },
                { status: 400 }
            );
        }

        if (prompt.length > 500) {
            return NextResponse.json(
                { error: 'Mô tả quá dài (tối đa 500 ký tự)' },
                { status: 400 }
            );
        }

        console.log('AI Recipe Generator - Prompt:', prompt);
        console.log('Servings:', servings, 'Dietary:', dietary_preferences);

        // Tạo prompt đầy đủ
        const fullPrompt = recipeGeneratorPrompt(prompt, servings);

        // Gọi Gemini AI với structured output
        const recipe = await generateStructuredOutput(fullPrompt, recipeGeneratorSchema);

        console.log('Generated recipe:', recipe.title);

        // Validate output
        if (!recipe.title || !recipe.ingredients || !recipe.steps) {
            throw new Error('AI không tạo được công thức hợp lệ');
        }

        // Transform to match CookApp format
        const formattedRecipe = {
            title: recipe.title,
            description: recipe.description || '',
            servings: recipe.servings || servings,
            prep_time: Math.ceil(recipe.total_time_minutes * 0.3), // Estimate 30% prep
            cook_time: Math.ceil(recipe.total_time_minutes * 0.7), // 70% cook
            total_time: recipe.total_time_minutes,
            difficulty: recipe.difficulty || 'medium',
            ingredients: recipe.ingredients.map((ing, idx) => ({
                name: ing.name,
                quantity: ing.amount,
                unit: ing.unit,
                order_index: idx
            })),
            instructions: recipe.steps.map((step, idx) => ({
                step_number: idx + 1,
                instruction: step.step,
                duration: step.estimated_minutes
            })),
            ai_generated: true,
            ai_model: 'gemini-3-flash-preview'
        };

        return NextResponse.json({
            success: true,
            recipe: formattedRecipe
        });

    } catch (error) {
        console.error('Recipe Generator Error:', error);
        return NextResponse.json(
            { error: error.message || 'Không thể tạo công thức' },
            { status: 500 }
        );
    }
}
