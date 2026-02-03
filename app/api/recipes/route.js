import { NextResponse } from 'next/server';
const RecipeModel = require('@/lib/models/recipe');
const AuthLib = require('@/lib/auth');

// GET - List/search recipes
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const params = {
            q: searchParams.get('q') || '',
            category: searchParams.get('category') || '',
            difficulty: searchParams.get('difficulty'),
            maxTime: searchParams.get('maxTime') ? parseInt(searchParams.get('maxTime')) : null,
            dietary: searchParams.get('dietary') || '',
            userId: searchParams.get('userId') ? parseInt(searchParams.get('userId')) : null,
            limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 20,
            offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')) : 0
        };

        console.log('GET /api/recipes with params:', params);

        const recipes = await RecipeModel.search(params);

        return NextResponse.json({ recipes });
    } catch (error) {
        console.error('Search recipes error:', error);
        return NextResponse.json(
            { error: 'Failed to search recipes: ' + error.message },
            { status: 500 }
        );
    }
}

// POST - Create new recipe
export async function POST(request) {
    try {
        // Get current user from cookies
        const currentUser = await AuthLib.getCurrentUser();
        if (!currentUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate required fields
        if (!body.title || body.title.length < 3) {
            return NextResponse.json(
                { error: 'Title must be at least 3 characters' },
                { status: 400 }
            );
        }

        // Create recipe with RecipeModel.create
        const recipe = await RecipeModel.create(body, currentUser.id);

        return NextResponse.json({
            success: true,
            recipe
        }, { status: 201 });

    } catch (error) {
        console.error('Create recipe error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create recipe' },
            { status: 500 }
        );
    }
}
