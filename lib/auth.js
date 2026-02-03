const jwt = require('jsonwebtoken');
const { cookies } = require('next/headers');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const TOKEN_NAME = 'auth_token';

const AuthLib = {
    // Generate JWT token
    generateToken: (user) => {
        return jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
    },

    // Verify JWT token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    },

    // Get current user from request
    getCurrentUser: async () => {
        try {
            const cookieStore = await cookies();
            const token = cookieStore.get(TOKEN_NAME);

            if (!token) return null;

            const decoded = AuthLib.verifyToken(token.value);
            return decoded;
        } catch (error) {
            return null;
        }
    },

    // Set auth cookie
    setAuthCookie: async (token) => {
        const cookieStore = await cookies();
        cookieStore.set(TOKEN_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/'
        });
    },

    // Clear auth cookie
    clearAuthCookie: async () => {
        const cookieStore = await cookies();
        cookieStore.delete(TOKEN_NAME);
    },

    // Require authentication middleware
    requireAuth: async () => {
        const user = await AuthLib.getCurrentUser();
        if (!user) {
            throw new Error('Authentication required');
        }
        return user;
    },

    // Check if user is admin
    isAdmin: (user) => {
        return user && user.role === 'admin';
    },

    // Require admin role
    requireAdmin: async () => {
        const user = await AuthLib.getCurrentUser();
        if (!user) {
            throw new Error('Authentication required');
        }
        if (!AuthLib.isAdmin(user)) {
            throw new Error('Admin access required');
        }
        return user;
    }
};

module.exports = AuthLib;
