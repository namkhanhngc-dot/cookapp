import { NextResponse } from 'next/server';
const BannerModel = require('@/lib/models/banner');
const AuthLib = require('@/lib/auth');

// GET - Get all banners (admin only)
export async function GET() {
    try {
        const currentUser = await AuthLib.getCurrentUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const banners = await BannerModel.getAllBanners();

        return NextResponse.json({
            success: true,
            banners
        });
    } catch (error) {
        console.error('Fetch all banners error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}
