import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function POST() {
    try {
        // Insert default banner
        const result = await db.query(
            `INSERT INTO site_banners (title, subtitle, cta_text, cta_link, image_url, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                'Nấu Ăn Ngon Mỗi Ngày',
                'Khám phá hàng nghìn công thức nấu ăn Việt Nam 🇻🇳 - Chia sẻ niềm đam mê ẩm thực của bạn',
                '🔍 Khám Phá Công Thức',
                '/search',
                'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&h=600&fit=crop',
                0,
                true
            ]
        );

        return NextResponse.json({
            success: true,
            message: 'Default banner inserted!',
            banner: result.rows[0]
        });
    } catch (error) {
        console.error('Insert error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
