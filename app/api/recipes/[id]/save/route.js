import { NextResponse } from 'next/server';
const RecipeModel = require('@/lib/models/recipe');
const AuthLib = require('@/lib/auth');
const db = require('@/lib/db');

export async function POST(request, { params }) {
    try {
        const currentUser = await AuthLib.getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const recipeId = parseInt(id);

        // Check if already saved
        const existing = await db.query(
            `SELECT * FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2`,
            [currentUser.id, recipeId]
        );

        let saved;
        if (existing.rows.length > 0) {
            // Unsave
            await RecipeModel.unsave(currentUser.id, recipeId);
            saved = false;
        } else {
            // Save
            await RecipeModel.save(currentUser.id, recipeId);
            saved = true;
        }

        return NextResponse.json({ saved });
    } catch (error) {
        console.error('Toggle save error:', error);
        return NextResponse.json(
            { error: 'Failed to toggle save' },
            { status: 500 }
        );
    }
}
