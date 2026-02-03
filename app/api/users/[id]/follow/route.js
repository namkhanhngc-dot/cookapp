import { NextResponse } from 'next/server';
const UserModel = require('@/lib/models/user');
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
        const result = await UserModel.toggleFollow(currentUser.id, parseInt(id));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Toggle follow error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to toggle follow' },
            { status: 500 }
        );
    }
}
