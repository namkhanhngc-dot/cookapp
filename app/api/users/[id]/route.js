import { NextResponse } from 'next/server';
const UserModel = require('@/lib/models/user');
const RecipeModel = require('@/lib/models/recipe');
const AuthLib = require('@/lib/auth');

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const currentUser = await AuthLib.getCurrentUser();

        const user = await UserModel.findById(parseInt(id));
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user stats
        const stats = await UserModel.getStats(parseInt(id));

        // Get user's recipes
        const recipes = await RecipeModel.search({
            userId: parseInt(id),
            limit: 12
        });

        // Check if current user follows this user
        let isFollowing = false;
        if (currentUser && currentUser.id !== parseInt(id)) {
            isFollowing = await UserModel.isFollowing(currentUser.id, parseInt(id));
        }

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                displayName: user.display_name,
                bio: user.bio,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at,
                ...stats
            },
            recipes,
            isFollowing
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return NextResponse.json(
            { error: 'Failed to get user profile' },
            { status: 500 }
        );
    }
}
