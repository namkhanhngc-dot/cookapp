import { NextResponse } from 'next/server';
const UserModel = require('@/lib/models/user');
const RecipeModel = require('@/lib/models/recipe');
const AuthLib = require('@/lib/auth');

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const currentUser = await AuthLib.getCurrentUser();

        // Get user profile with stats
        const user = await UserModel.getProfile(parseInt(id), currentUser?.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get user's recipes
        const recipes = await RecipeModel.search({
            userId: parseInt(id),
            limit: 12
        });

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                displayName: user.display_name,
                bio: user.bio,
                avatarUrl: user.avatar_url,
                createdAt: user.created_at,
                recipeCount: user.recipe_count,
                followerCount: user.follower_count,
                followingCount: user.following_count
            },
            recipes,
            isFollowing: user.is_following
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        return NextResponse.json(
            { error: 'Failed to get user profile' },
            { status: 500 }
        );
    }
}
