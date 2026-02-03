import { NextResponse } from 'next/server';
const InteractionModel = require('@/lib/models/interaction');
const AuthLib = require('@/lib/auth');

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
        const result = await InteractionModel.toggleLike(currentUser.id, parseInt(id));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Toggle like error:', error);
        return NextResponse.json(
            { error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}
