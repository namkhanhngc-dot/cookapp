import { NextResponse } from 'next/server';
const RecipeModel = require('@/lib/models/recipe');

export async function GET(request) {
    try {
        // Get categories
        const categories = await RecipeModel.getCategories();

        // Group categories by type
        const grouped = {
            dish_type: [],
            method: [],
            diet: [],
            allergy: []
        };

        categories.forEach(cat => {
            if (grouped[cat.type]) {
                grouped[cat.type].push(cat);
            }
        });

        return NextResponse.json({
            categories,
            grouped
        });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json(
            { error: 'Failed to get categories' },
            { status: 500 }
        );
    }
}
