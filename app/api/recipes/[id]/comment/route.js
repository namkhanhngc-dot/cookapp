import { NextResponse } from 'next/server';
const InteractionModel = require('@/lib/models/interaction');
const AuthLib = require('@/lib/auth');
const { moderateContent } = require('@/lib/utils/validation');

// GET - Get comments
export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const comments = await InteractionModel.getComments(parseInt(id));

        return NextResponse.json({ comments });
    } catch (error) {
        console.error('Get comments error:', error);
        return NextResponse.json(
            { error: 'Failed to get comments' },
            { status: 500 }
        );
    }
}

// POST - Add comment
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
        const { content, parentId } = await request.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { error: 'Comment content required' },
                { status: 400 }
            );
        }

        // Moderate content
        const contentCheck = moderateContent(content);
        if (!contentCheck.valid) {
            return NextResponse.json(
                { error: contentCheck.reason },
                { status: 400 }
            );
        }

        const comment = await InteractionModel.addComment(
            currentUser.id,
            parseInt(id),
            content,
            parentId || null
        );

        return NextResponse.json({
            success: true,
            comment
        }, { status: 201 });
    } catch (error) {
        console.error('Add comment error:', error);
        return NextResponse.json(
            { error: 'Failed to add comment' },
            { status: 500 }
        );
    }
}
