import { NextResponse } from 'next/server';
const AuthLib = require('@/lib/auth');
const UserModel = require('@/lib/models/user');

export async function GET() {
    try {
        const currentUser = await AuthLib.getCurrentUser();

        if (!currentUser) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Get full user details
        const user = await UserModel.findById(currentUser.id);
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.display_name,
                bio: user.bio,
                avatarUrl: user.avatar_url,
                role: user.role  // Add role for admin check
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Failed to get user' },
            { status: 500 }
        );
    }
}
