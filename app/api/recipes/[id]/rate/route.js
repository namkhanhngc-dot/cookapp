import { NextResponse } from 'next/server';
const InteractionModel = require('@/lib/models/interaction');
const AuthLib = require('@/lib/auth');
const { validateRating } = require('@/lib/utils/validation');

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
        const { rating } = await request.json();

        if (!validateRating(rating)) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const result = await InteractionModel.rateRecipe(currentUser.id, parseInt(id), rating);

        return NextResponse.json({
            success: true,
            avgRating: result.avg_rating,
            count: result.count
        });
    } catch (error) {
        console.error('Rate recipe error:', error);
        return NextResponse.json(
            { error: 'Failed to rate recipe' },
            { status: 500 }
        );
    }
}
