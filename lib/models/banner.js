const db = require('../db');

const BannerModel = {
    // Get all active banners (for public homepage)
    getActiveBanners: async () => {
        const result = await db.query(
            `SELECT id, title, subtitle, cta_text, cta_link, image_url, display_order
             FROM site_banners 
             WHERE is_active = true 
             ORDER BY display_order ASC, created_at DESC`
        );
        return result.rows;
    },

    // Get all banners (for admin)
    getAllBanners: async () => {
        const result = await db.query(
            `SELECT b.*, u.username as creator_username
             FROM site_banners b
             LEFT JOIN users u ON b.created_by = u.id
             ORDER BY b.display_order ASC, b.created_at DESC`
        );
        return result.rows;
    },

    // Get single banner by ID
    findById: async (id) => {
        const result = await db.query(
            `SELECT * FROM site_banners WHERE id = $1`,
            [id]
        );
        return result.rows[0];
    },

    // Create new banner
    create: async (data) => {
        const { title, subtitle, cta_text, cta_link, image_url, image_public_id, created_by, display_order } = data;

        const result = await db.query(
            `INSERT INTO site_banners 
             (title, subtitle, cta_text, cta_link, image_url, image_public_id, created_by, display_order, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
             RETURNING *`,
            [title, subtitle || null, cta_text || null, cta_link || null, image_url, image_public_id || null, created_by, display_order || 0]
        );

        return result.rows[0];
    },

    // Update banner
    update: async (id, data) => {
        const { title, subtitle, cta_text, cta_link, image_url, image_public_id, display_order } = data;

        const result = await db.query(
            `UPDATE site_banners 
             SET title = $1, 
                 subtitle = $2, 
                 cta_text = $3, 
                 cta_link = $4, 
                 image_url = $5, 
                 image_public_id = $6,
                 display_order = $7,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8
             RETURNING *`,
            [title, subtitle || null, cta_text || null, cta_link || null, image_url, image_public_id || null, display_order || 0, id]
        );

        return result.rows[0];
    },

    // Toggle active status
    setActive: async (id, isActive) => {
        const result = await db.query(
            `UPDATE site_banners 
             SET is_active = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [isActive, id]
        );

        return result.rows[0];
    },

    // Delete banner
    delete: async (id) => {
        await db.query(
            `DELETE FROM site_banners WHERE id = $1`,
            [id]
        );

        return true;
    }
};

module.exports = BannerModel;
