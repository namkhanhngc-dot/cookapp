import { NextResponse } from 'next/server';
const BannerModel = require('@/lib/models/banner');
const AuthLib = require('@/lib/auth');

// GET - Fetch active banners (public)
export async function GET() {
    try {
        const banners = await BannerModel.getActiveBanners();

        return NextResponse.json({
            success: true,
            banners
        });
    } catch (error) {
        console.error('Fetch banners error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch banners' },
            { status: 500 }
        );
    }
}

// POST - Create new banner (admin only)
export async function POST(request) {
    try {
        const currentUser = await AuthLib.getCurrentUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const data = await request.json();
        const { title, subtitle, cta_text, cta_link, image_url, image_public_id, display_order } = data;

        if (!title || !image_url) {
            return NextResponse.json(
                { error: 'Title and image URL are required' },
                { status: 400 }
            );
        }

        const banner = await BannerModel.create({
            title,
            subtitle,
            cta_text,
            cta_link,
            image_url,
            image_public_id,
            created_by: currentUser.id,
            display_order: display_order || 0
        });

        return NextResponse.json({
            success: true,
            banner
        });
    } catch (error) {
        console.error('Create banner error:', error);
        return NextResponse.json(
            { error: 'Failed to create banner' },
            { status: 500 }
        );
    }
}
