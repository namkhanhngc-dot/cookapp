import { NextResponse } from 'next/server';
const AuthLib = require('@/lib/auth');
const UserModel = require('@/lib/models/user');

export async function GET() {
    try {
        const currentUser = await AuthLib.getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Not logged in', jwtPayload: null });
        }

        // Get full user from DB
        const dbUser = await UserModel.findById(currentUser.id);

        return NextResponse.json({
            jwtPayload: currentUser,  // What's in the JWT token
            dbUser: dbUser ? {
                id: dbUser.id,
                username: dbUser.username,
                email: dbUser.email,
                role: dbUser.role
            } : null
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
