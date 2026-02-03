import { NextResponse } from 'next/server';
const InteractionModel = require('@/lib/models/interaction');
const AuthLib = require('@/lib/auth');
const { saveUpload } = require('@/lib/utils/upload');

// GET - Get cooksnaps
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const cooksnaps = await InteractionModel.getCooksnaps(parseInt(id));

        return NextResponse.json({ cooksnaps });
    } catch (error) {
        console.error('Get cooksnaps error:', error);
        return NextResponse.json(
            { error: 'Failed to get cooksnaps' },
            { status: 500 }
        );
    }
}

// POST - Add cooksnap
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
        const formData = await request.formData();

        const imageFile = formData.get('image');
        const caption = formData.get('caption');

        if (!imageFile || imageFile.size === 0) {
            return NextResponse.json(
                { error: 'Image required' },
                { status: 400 }
            );
        }

        // Upload image
        const imageUrl = await saveUpload(imageFile, 'cooksnaps');

        // Save cooksnap
        const cooksnapId = await InteractionModel.addCooksnap(
            currentUser.id,
            parseInt(id),
            imageUrl,
            caption
        );

        return NextResponse.json({
            success: true,
            cooksnapId,
            imageUrl
        }, { status: 201 });
    } catch (error) {
        console.error('Add cooksnap error:', error);
        return NextResponse.json(
            { error: 'Failed to add cooksnap' },
            { status: 500 }
        );
    }
}
