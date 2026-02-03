import { NextResponse } from 'next/server';
const RecipeModel = require('@/lib/models/recipe');
const AuthLib = require('@/lib/auth');

// GET - Get recipe by ID
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const currentUser = await AuthLib.getCurrentUser();

        const recipe = await RecipeModel.findById(parseInt(id), currentUser?.id);

        if (!recipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ recipe });
    } catch (error) {
        console.error('Get recipe error:', error);
        return NextResponse.json(
            { error: 'Failed to get recipe' },
            { status: 500 }
        );
    }
}

// PUT - Update recipe
export async function PUT(request, { params }) {
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

        // Check if recipe exists and user has permission
        const existingRecipe = await RecipeModel.findById(recipeId);
        if (!existingRecipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            );
        }

        // Authorization check: only author or admin can edit
        if (existingRecipe.user_id !== currentUser.id && currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: You do not have permission to edit this recipe' },
                { status: 403 }
            );
        }

        const data = await request.json();

        // Update recipe
        const updatedRecipe = await RecipeModel.update(recipeId, data, currentUser.id);

        return NextResponse.json({
            success: true,
            recipe: updatedRecipe
        });

    } catch (error) {
        console.error('Update recipe error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update recipe' },
            { status: 500 }
        );
    }
}

// DELETE - Delete recipe
export async function DELETE(request, { params }) {
    try {
        const currentUser = await AuthLib.getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = await params;
        await RecipeModel.delete(parseInt(id), currentUser.id);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete recipe error:', error);
        return NextResponse.json(
            { error: 'Failed to delete recipe' },
            { status: 500 }
        );
    }
}
