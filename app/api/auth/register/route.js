import { NextResponse } from 'next/server';
const UserModel = require('@/lib/models/user');
const AuthLib = require('@/lib/auth');
const { validateEmail, validateUsername, validatePassword } = require('@/lib/utils/validation');

export async function POST(request) {
    try {
        const { username, email, password, displayName } = await request.json();

        // Validate inputs
        if (!validateUsername(username)) {
            return NextResponse.json(
                { error: 'Username must be 3-20 alphanumeric characters' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        if (!validatePassword(password)) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Create user
        const user = await UserModel.create({
            username,
            email,
            password,
            displayName: displayName || username
        });

        // Generate token
        const token = AuthLib.generateToken(user);
        await AuthLib.setAuthCookie(token);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.display_name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: error.message || 'Registration failed' },
            { status: 400 }
        );
    }
}
