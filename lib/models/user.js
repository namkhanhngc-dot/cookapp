const db = require('../db');
const bcrypt = require('bcryptjs');

const UserModel = {
    // Create new user
    create: async (userData) => {
        const { username, email, password, displayName } = userData;
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await db.query(
            `INSERT INTO users (username, email, password_hash, display_name, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, username, email, display_name, created_at`,
            [username, email, passwordHash, displayName || null]
        );

        return result.rows[0];
    },

    // Find user by username or email
    findByCredentials: async (usernameOrEmail) => {
        const result = await db.query(
            `SELECT * FROM users 
       WHERE username = $1 OR email = $1`,
            [usernameOrEmail]
        );

        return result.rows[0];
    },

    // Find user by ID
    findById: async (id) => {
        const result = await db.query(
            `SELECT id, username, email, display_name, bio, avatar_url, role, created_at
       FROM users WHERE id = $1`,
            [id]
        );

        return result.rows[0];
    },

    // Get user profile with stats
    getProfile: async (userId, viewerId = null) => {
        const result = await db.query(
            `SELECT 
        u.id, u.username, u.email, u.display_name, u.bio, u.avatar_url, u.created_at,
        (SELECT COUNT(*) FROM recipes WHERE user_id = u.id AND status = 'published') as recipe_count,
        (SELECT COUNT(*) FROM follows WHERE following_id = u.id) as follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
        ${viewerId ? `(SELECT COUNT(*) > 0 FROM follows WHERE follower_id = $2 AND following_id = u.id) as is_following` : 'false as is_following'}
      FROM users u
      WHERE u.id = $1`,
            viewerId ? [userId, viewerId] : [userId]
        );

        return result.rows[0];
    },

    // Update user profile
    update: async (userId, updates) => {
        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.entries(updates).forEach(([key, value]) => {
            if (['display_name', 'bio', 'avatar_url'].includes(key)) {
                fields.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
            }
        });

        if (fields.length === 0) return null;

        values.push(userId);
        const result = await db.query(
            `UPDATE users SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING id, username, email, display_name, bio, avatar_url`,
            values
        );

        return result.rows[0];
    },

    // Follow user
    follow: async (followerId, followingId) => {
        await db.query(
            `INSERT INTO follows (follower_id, following_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
            [followerId, followingId]
        );

        return true;
    },

    // Unfollow user
    unfollow: async (followerId, followingId) => {
        await db.query(
            `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
            [followerId, followingId]
        );

        return true;
    },

    // Get followers
    getFollowers: async (userId, limit = 20, offset = 0) => {
        const result = await db.query(
            `SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM users u
       JOIN follows f ON u.id = f.follower_id
       WHERE f.following_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return result.rows;
    },

    // Get following
    getFollowing: async (userId, limit = 20, offset = 0) => {
        const result = await db.query(
            `SELECT u.id, u.username, u.display_name, u.avatar_url
       FROM users u
       JOIN follows f ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        return result.rows;
    },

    // Verify password
    verifyPassword: async (password, hash) => {
        return bcrypt.compare(password, hash);
    }
};

module.exports = UserModel;
