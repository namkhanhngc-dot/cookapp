import { NextResponse } from 'next/server';
const BannerModel = require('@/lib/models/banner');
const AuthLib = require('@/lib/auth');

// PUT - Update banner (admin only)
export async function PUT(request, { params }) {
    try {
        const currentUser = await AuthLib.getCurrentUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const data = await request.json();

        // Check if banner exists
        const existing = await BannerModel.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Banner not found' },
                { status: 404 }
            );
        }

        const { title, subtitle, cta_text, cta_link, image_url, image_public_id, display_order, is_active } = data;

        // If toggling active status
        if (typeof is_active === 'boolean') {
            const banner = await BannerModel.setActive(id, is_active);
            return NextResponse.json({
                success: true,
                banner
            });
        }

        // Otherwise update fields
        if (!title || !image_url) {
            return NextResponse.json(
                { error: 'Title and image URL are required' },
                { status: 400 }
            );
        }

        const banner = await BannerModel.update(id, {
            title,
            subtitle,
            cta_text,
            cta_link,
            image_url,
            image_public_id,
            display_order
        });

        return NextResponse.json({
            success: true,
            banner
        });
    } catch (error) {
        console.error('Update banner error:', error);
        return NextResponse.json(
            { error: 'Failed to update banner' },
            { status: 500 }
        );
    }
}

// DELETE - Delete banner (admin only)
export async function DELETE(request, { params }) {
    try {
        const currentUser = await AuthLib.getCurrentUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await params;

        // Check if banner exists
        const existing = await BannerModel.findById(id);
        if (!existing) {
            return NextResponse.json(
                { error: 'Banner not found' },
                { status: 404 }
            );
        }

        await BannerModel.delete(id);

        return NextResponse.json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        console.error('Delete banner error:', error);
        return NextResponse.json(
            { error: 'Failed to delete banner' },
            { status: 500 }
        );
    }
}
