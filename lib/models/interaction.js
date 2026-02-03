const { query, queryOne, run } = require('../db');

const InteractionModel = {
    // Toggle like on recipe
    toggleLike: (userId, recipeId) => {
        const existing = queryOne(
            `SELECT * FROM likes WHERE user_id = ? AND recipe_id = ?`,
            [userId, recipeId]
        );

        if (existing) {
            run(
                `DELETE FROM likes WHERE user_id = ? AND recipe_id = ?`,
                [userId, recipeId]
            );
            return { liked: false };
        } else {
            run(
                `INSERT INTO likes (user_id, recipe_id) VALUES (?, ?)`,
                [userId, recipeId]
            );
            return { liked: true };
        }
    },

    // Rate recipe
    rateRecipe: (userId, recipeId, rating) => {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const existing = queryOne(
            `SELECT * FROM ratings WHERE user_id = ? AND recipe_id = ?`,
            [userId, recipeId]
        );

        if (existing) {
            run(
                `UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ? AND recipe_id = ?`,
                [rating, userId, recipeId]
            );
        } else {
            run(
                `INSERT INTO ratings (user_id, recipe_id, rating) VALUES (?, ?, ?)`,
                [userId, recipeId, rating]
            );
        }

        // Return updated average
        const avg = queryOne(
            `SELECT AVG(rating) as avg_rating, COUNT(*) as count 
       FROM ratings WHERE recipe_id = ?`,
            [recipeId]
        );

        return avg;
    },

    // Add comment
    addComment: (userId, recipeId, content, parentId = null) => {
        const result = run(
            `INSERT INTO comments (user_id, recipe_id, content, parent_id)
       VALUES (?, ?, ?, ?)`,
            [userId, recipeId, content, parentId]
        );

        return InteractionModel.getComment(result.lastInsertRowid);
    },

    // Get comment by ID
    getComment: (commentId) => {
        return queryOne(
            `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
            [commentId]
        );
    },

    // Get comments for recipe
    getComments: (recipeId, limit = 50) => {
        const comments = query(
            `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM comments c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ? AND c.parent_id IS NULL
       ORDER BY c.created_at DESC
       LIMIT ?`,
            [recipeId, limit]
        );

        // Get replies for each comment
        comments.forEach(comment => {
            comment.replies = query(
                `SELECT c.*, u.username, u.display_name, u.avatar_url
         FROM comments c
         INNER JOIN users u ON c.user_id = u.id
         WHERE c.parent_id = ?
         ORDER BY c.created_at ASC`,
                [comment.id]
            );
        });

        return comments;
    },

    // Delete comment
    deleteComment: (commentId, userId) => {
        run(
            `DELETE FROM comments WHERE id = ? AND user_id = ?`,
            [commentId, userId]
        );
    },

    // Add cooksnap
    addCooksnap: (userId, recipeId, imageUrl, caption = null) => {
        const result = run(
            `INSERT INTO cooksnaps (user_id, recipe_id, image_url, caption)
       VALUES (?, ?, ?, ?)`,
            [userId, recipeId, imageUrl, caption]
        );

        return result.lastInsertRowid;
    },

    // Get cooksnaps for recipe
    getCooksnaps: (recipeId, limit = 20) => {
        return query(
            `SELECT c.*, u.username, u.display_name, u.avatar_url
       FROM cooksnaps c
       INNER JOIN users u ON c.user_id = u.id
       WHERE c.recipe_id = ?
       ORDER BY c.created_at DESC
       LIMIT ?`,
            [recipeId, limit]
        );
    },

    // Toggle save recipe
    toggleSave: (userId, recipeId) => {
        const existing = queryOne(
            `SELECT * FROM saved_recipes WHERE user_id = ? AND recipe_id = ?`,
            [userId, recipeId]
        );

        if (existing) {
            run(
                `DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?`,
                [userId, recipeId]
            );
            return { saved: false };
        } else {
            run(
                `INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)`,
                [userId, recipeId]
            );
            return { saved: true };
        }
    },

    // Get saved recipes
    getSavedRecipes: (userId, limit = 50, offset = 0) => {
        return query(
            `SELECT r.*, u.username, u.display_name, u.avatar_url,
              (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as like_count,
              (SELECT AVG(rating) FROM ratings WHERE recipe_id = r.id) as avg_rating
       FROM recipes r
       INNER JOIN users u ON r.user_id = u.id
       INNER JOIN saved_recipes sr ON r.id = sr.recipe_id
       WHERE sr.user_id = ?
       ORDER BY sr.created_at DESC
       LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
    },

    // Save/update user note
    saveNote: (userId, recipeId, note) => {
        const existing = queryOne(
            `SELECT * FROM user_notes WHERE user_id = ? AND recipe_id = ?`,
            [userId, recipeId]
        );

        if (existing) {
            run(
                `UPDATE user_notes SET note = ?, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND recipe_id = ?`,
                [note, userId, recipeId]
            );
        } else {
            run(
                `INSERT INTO user_notes (user_id, recipe_id, note) VALUES (?, ?, ?)`,
                [userId, recipeId, note]
            );
        }
    },

    // Get user note for recipe
    getNote: (userId, recipeId) => {
        return queryOne(
            `SELECT note FROM user_notes WHERE user_id = ? AND recipe_id = ?`,
            [userId, recipeId]
        )?.note || null;
    },

    // Report content
    reportContent: (userId, contentType, contentId, reason, description = null) => {
        const result = run(
            `INSERT INTO reports (user_id, content_type, content_id, reason, description)
       VALUES (?, ?, ?, ?, ?)`,
            [userId, contentType, contentId, reason, description]
        );

        return result.lastInsertRowid;
    }
};

module.exports = InteractionModel;
