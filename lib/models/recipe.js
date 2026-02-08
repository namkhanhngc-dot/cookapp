const db = require('../db');

const RecipeModel = {
    // Find recipe by ID with full details
    findById: async (id, viewerId = null) => {
        // Get recipe with user info
        const recipeResult = await db.query(
            `SELECT 
        r.*,
        u.username, u.display_name, u.avatar_url,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as like_count,
        (SELECT AVG(rating)::numeric(3,2) FROM ratings WHERE recipe_id = r.id) as avg_rating,
        (SELECT COUNT(*) FROM ratings WHERE recipe_id = r.id) as rating_count,
        ${viewerId ? `(SELECT COUNT(*) > 0 FROM likes WHERE user_id = $2 AND recipe_id = r.id) as is_liked,
        (SELECT COUNT(*) > 0 FROM saved_recipes WHERE user_id = $2 AND recipe_id = r.id) as is_saved,
        (SELECT rating FROM ratings WHERE user_id = $2 AND recipe_id = r.id) as user_rating` :
                'false as is_liked, false as is_saved, null as user_rating'}
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1`,
            viewerId ? [id, viewerId] : [id]
        );

        if (recipeResult.rows.length === 0) return null;

        const recipe = recipeResult.rows[0];

        // Get ingredients
        const ingredientsResult = await db.query(
            `SELECT * FROM recipe_ingredients
       WHERE recipe_id = $1
       ORDER BY order_index`,
            [id]
        );

        // Get instructions
        const instructionsResult = await db.query(
            `SELECT * FROM recipe_instructions
       WHERE recipe_id = $1
       ORDER BY step_number`,
            [id]
        );

        // Get categories
        const categoriesResult = await db.query(
            `SELECT c.* FROM categories c
       JOIN recipe_categories rc ON c.id = rc.category_id
       WHERE rc.recipe_id = $1`,
            [id]
        );

        // Get recipe media (images/videos)
        const mediaResult = await db.query(
            `SELECT * FROM recipe_media
       WHERE recipe_id = $1
       ORDER BY order_index`,
            [id]
        );

        return {
            ...recipe,
            ingredients: ingredientsResult.rows,
            instructions: instructionsResult.rows,
            categories: categoriesResult.rows,
            media: mediaResult.rows
        };
    },

    // Search/filter recipes  
    search: async ({ q = '', category = '', difficulty = null, maxTime = null, dietary = '', userId = null, limit = 20, offset = 0 }) => {
        let query = `
      SELECT 
        r.id, r.user_id, r.title, r.description, r.image_url, r.thumbnail_url,
        r.prep_time, r.cook_time, r.total_time, r.servings, r.difficulty,
        r.views, r.created_at,
        u.username, u.display_name,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as like_count,
        (SELECT AVG(rating)::numeric(3,2) FROM ratings WHERE recipe_id = r.id) as avg_rating,
        (SELECT COUNT(*) FROM ratings WHERE recipe_id = r.id) as rating_count
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'published'
    `;

        const params = [];
        let paramCount = 1;

        if (q) {
            // Search in recipe title, description, AND ingredients
            query += ` AND (
        r.title ILIKE $${paramCount} 
        OR r.description ILIKE $${paramCount}
        OR EXISTS (
          SELECT 1 FROM recipe_ingredients ri 
          WHERE ri.recipe_id = r.id 
          AND ri.name ILIKE $${paramCount}
        )
      )`;
            params.push(`%${q}%`);
            paramCount++;
        }

        if (category) {
            query += ` AND EXISTS (
        SELECT 1 FROM recipe_categories rc
        JOIN categories c ON rc.category_id = c.id
        WHERE rc.recipe_id = r.id AND c.name = $${paramCount}
      )`;
            params.push(category);
            paramCount++;
        }

        if (difficulty) {
            query += ` AND r.difficulty = $${paramCount}`;
            params.push(difficulty);
            paramCount++;
        }

        if (maxTime) {
            query += ` AND r.total_time <= $${paramCount}`;
            params.push(maxTime);
            paramCount++;
        }

        if (dietary) {
            // Map filter values to actual tag names in database
            const dietaryTagMap = {
                'vegetarian': 'Vegetarian',
                'vegan': 'Vegan',
                'gluten-free': 'Gluten-Free',
                'dairy-free': 'Dairy-Free',
                'nut-free': 'Nut-Free',
                'egg-free': 'Egg-Free',
                'soy-free': 'Soy-Free',
                'seafood-free': 'Seafood-Free',
                'low-carb': 'Low-Carb',
                'keto': 'Keto',
                'paleo': 'Paleo',
                'halal': 'Halal',
                'kosher': 'Kosher'
            };

            const tagName = dietaryTagMap[dietary.toLowerCase()] || dietary;

            query += ` AND EXISTS (
        SELECT 1 FROM recipe_dietary_tags rdt
        JOIN dietary_tags dt ON rdt.tag_id = dt.id
        WHERE rdt.recipe_id = r.id AND dt.name = $${paramCount}
      )`;
            params.push(tagName);
            paramCount++;
        }

        if (userId) {
            query += ` AND r.user_id = $${paramCount}`;
            params.push(userId);
            paramCount++;
        }

        query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;

        params.push(limit, offset);

        const result = await db.query(query, params);
        return result.rows;
    },

    // Get trending recipes
    getTrending: async (limit = 10) => {
        const result = await db.query(
            `SELECT 
        r.id, r.user_id, r.title, r.description, r.image_url,
        r.prep_time, r.cook_time, r.servings, r.difficulty, r.views,
        u.username, u.display_name,
        (SELECT COUNT(*) FROM likes WHERE recipe_id = r.id) as like_count,
        (SELECT AVG(rating)::numeric(3,2) FROM ratings WHERE recipe_id = r.id) as avg_rating
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'published'
      ORDER BY r.views DESC, like_count DESC
      LIMIT $1`,
            [limit]
        );

        return result.rows;
    },

    // Get categories
    getCategories: async () => {
        const result = await db.query(
            `SELECT * FROM categories ORDER BY type, name`
        );

        return result.rows;
    },

    // Increment views
    incrementViews: async (recipeId) => {
        await db.query(
            `UPDATE recipes SET views = views + 1 WHERE id = $1`,
            [recipeId]
        );
    },

    // Like recipe
    like: async (userId, recipeId) => {
        await db.query(
            `INSERT INTO likes (user_id, recipe_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT DO NOTHING`,
            [userId, recipeId]
        );

        return true;
    },

    // Unlike recipe
    unlike: async (userId, recipeId) => {
        await db.query(
            `DELETE FROM likes WHERE user_id = $1 AND recipe_id = $2`,
            [userId, recipeId]
        );

        return true;
    },

    // Rate recipe
    rate: async (userId, recipeId, rating) => {
        await db.query(
            `INSERT INTO ratings (user_id, recipe_id, rating, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, recipe_id) 
       DO UPDATE SET rating = $3`,
            [userId, recipeId, rating]
        );

        return true;
    },

    // Save recipe
    save: async (userId, recipeId) => {
        await db.query(
            `INSERT INTO saved_recipes (user_id, recipe_id, created_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, recipe_id) DO NOTHING`,
            [userId, recipeId]
        );

        return true;
    },

    // Unsave recipe
    unsave: async (userId, recipeId) => {
        await db.query(
            `DELETE FROM saved_recipes WHERE user_id = $1 AND recipe_id = $2`,
            [userId, recipeId]
        );

        return true;
    },

    // Create recipe - ENHANCED VERSION
    create: async (recipeData, userId) => {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // Get thumbnail URL from images
            const thumbnailImage = recipeData.images?.find(img => img.isThumbnail);
            const thumbnailUrl = thumbnailImage?.url || recipeData.images?.[0]?.url || null;

            // Insert recipe with ALL new fields
            const recipeResult = await client.query(
                `INSERT INTO recipes (
          user_id, title, description, image_url, prep_time, cook_time, 
          total_time, servings, difficulty, status, created_at,
          cooking_method, cooking_temp, skill_level,
          storage_instructions, shelf_life, can_freeze,
          meal_type, estimated_cost, servings_base,
          tips, variations, pairing_suggestions,
          meta_title, meta_description, keywords,
          thumbnail_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(),
                  $11, $12, $13, $14, $15, $16, $17, $18, $19,
                  $20, $21, $22, $23, $24, $25, $26)
        RETURNING *`,
                [
                    userId,
                    recipeData.title,
                    recipeData.description || null,
                    recipeData.imageUrl || thumbnailUrl,
                    recipeData.prepTime || 0,
                    recipeData.cookTime || 0,
                    recipeData.totalTime || 0,
                    recipeData.servings || 4,
                    recipeData.difficulty || 'medium',
                    recipeData.status || 'published',
                    // New fields
                    recipeData.cookingMethod || null,
                    recipeData.cookingTemp || null,
                    recipeData.skillLevel || 'beginner',
                    recipeData.storageInstructions || null,
                    recipeData.shelfLife || null,
                    recipeData.canFreeze || false,
                    recipeData.mealType || null,
                    recipeData.estimatedCost || null,
                    recipeData.servingsBase || recipeData.servings || 4,
                    recipeData.tips || null,
                    recipeData.variations || null,
                    recipeData.pairingSuggestions || null,
                    recipeData.metaTitle || recipeData.title,
                    recipeData.metaDescription || recipeData.description,
                    recipeData.keywords || null,
                    thumbnailUrl
                ]
            );

            const recipe = recipeResult.rows[0];

            // Insert recipe media (images/videos) - only if URLs exist
            if (recipeData.images && recipeData.images.length > 0) {
                for (let i = 0; i < recipeData.images.length; i++) {
                    const media = recipeData.images[i];

                    // Skip if no URL
                    if (!media.url) continue;

                    await client.query(
                        `INSERT INTO recipe_media (
              recipe_id, media_type, media_url, is_thumbnail, 
              order_index, width, height, file_size
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            recipe.id,
                            'image',
                            media.url,
                            media.isThumbnail || false,
                            i,
                            media.width || null,
                            media.height || null,
                            media.size || null
                        ]
                    );
                }
            }

            // Insert ingredients
            if (recipeData.ingredients && recipeData.ingredients.length > 0) {
                for (let i = 0; i < recipeData.ingredients.length; i++) {
                    const ing = recipeData.ingredients[i];
                    await client.query(
                        `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
                        [recipe.id, ing.name, ing.quantity || null, ing.unit || null, i]
                    );
                }
            }

            // Insert instructions
            if (recipeData.instructions && recipeData.instructions.length > 0) {
                for (let i = 0; i < recipeData.instructions.length; i++) {
                    const inst = recipeData.instructions[i];
                    await client.query(
                        `INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration, image_url, image_public_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            recipe.id,
                            i + 1,
                            inst.instruction,
                            inst.duration || null,
                            inst.images?.[0]?.url || null,
                            inst.images?.[0]?.publicId || null
                        ]
                    );
                }
            }

            // Insert categories
            if (recipeData.categoryIds && recipeData.categoryIds.length > 0) {
                for (const categoryId of recipeData.categoryIds) {
                    await client.query(
                        `INSERT INTO recipe_categories (recipe_id, category_id)
             VALUES ($1, $2)`,
                        [recipe.id, categoryId]
                    );
                }
            }

            // Insert dietary tags
            if (recipeData.dietaryTagIds && recipeData.dietaryTagIds.length > 0) {
                for (const tagId of recipeData.dietaryTagIds) {
                    await client.query(
                        `INSERT INTO recipe_dietary_tags (recipe_id, tag_id)
             VALUES ($1, $2)`,
                        [recipe.id, tagId]
                    );
                }
            }

            await client.query('COMMIT');
            return recipe;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Update recipe
    update: async (recipeId, recipeData, userId) => {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // Get thumbnail URL from images if provided
            const thumbnailImage = recipeData.images?.find(img => img.isThumbnail);
            const thumbnailUrl = thumbnailImage?.url || recipeData.images?.[0]?.url || recipeData.imageUrl || null;

            // Update main recipe
            await client.query(
                `UPDATE recipes SET
          title = $1, description = $2, image_url = $3,
          prep_time = $4, cook_time = $5, total_time = $6,
          servings = $7, difficulty = $8,
          cooking_method = $9, cooking_temp = $10, skill_level = $11,
          storage_instructions = $12, shelf_life = $13, can_freeze = $14,
          meal_type = $15, estimated_cost = $16, servings_base = $17,
          tips = $18, variations = $19, pairing_suggestions = $20,
          meta_title = $21, meta_description = $22, keywords = $23,
          thumbnail_url = $24, updated_at = NOW()
        WHERE id = $25`,
                [
                    recipeData.title,
                    recipeData.description || null,
                    recipeData.imageUrl || thumbnailUrl,
                    recipeData.prepTime || 0,
                    recipeData.cookTime || 0,
                    recipeData.totalTime || 0,
                    recipeData.servings || 4,
                    recipeData.difficulty || 'medium',
                    recipeData.cookingMethod || null,
                    recipeData.cookingTemp || null,
                    recipeData.skillLevel || 'beginner',
                    recipeData.storageInstructions || null,
                    recipeData.shelfLife || null,
                    recipeData.canFreeze || false,
                    recipeData.mealType || null,
                    recipeData.estimatedCost || null,
                    recipeData.servingsBase || recipeData.servings || 4,
                    recipeData.tips || null,
                    recipeData.variations || null,
                    recipeData.pairingSuggestions || null,
                    recipeData.metaTitle || recipeData.title,
                    recipeData.metaDescription || recipeData.description,
                    recipeData.keywords || null,
                    thumbnailUrl,
                    recipeId
                ]
            );

            // Delete old related data
            await client.query('DELETE FROM recipe_media WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_instructions WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_categories WHERE recipe_id = $1', [recipeId]);

            // Insert updated media
            if (recipeData.images && recipeData.images.length > 0) {
                for (let i = 0; i < recipeData.images.length; i++) {
                    const media = recipeData.images[i];
                    await client.query(
                        `INSERT INTO recipe_media (recipe_id, media_type, media_url, is_thumbnail, order_index, width, height, file_size)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            recipeId,
                            media.type || 'image',
                            media.url,
                            media.isThumbnail || false,
                            i,
                            media.width || null,
                            media.height || null,
                            media.size || null
                        ]
                    );
                }
            }

            // Insert updated ingredients
            if (recipeData.ingredients && recipeData.ingredients.length > 0) {
                for (let i = 0; i < recipeData.ingredients.length; i++) {
                    const ing = recipeData.ingredients[i];
                    await client.query(
                        `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index)
             VALUES ($1, $2, $3, $4, $5)`,
                        [recipeId, ing.name, ing.quantity || null, ing.unit || null, i]
                    );
                }
            }

            // Insert updated instructions
            if (recipeData.instructions && recipeData.instructions.length > 0) {
                for (let i = 0; i < recipeData.instructions.length; i++) {
                    const inst = recipeData.instructions[i];
                    await client.query(
                        `INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration, image_url, image_public_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            recipeId,
                            i + 1,
                            inst.instruction,
                            inst.duration || null,
                            inst.images?.[0]?.url || null,
                            inst.images?.[0]?.publicId || null
                        ]
                    );
                }
            }

            // Insert updated categories
            if (recipeData.categoryIds && recipeData.categoryIds.length > 0) {
                for (const categoryId of recipeData.categoryIds) {
                    await client.query(
                        `INSERT INTO recipe_categories (recipe_id, category_id)
             VALUES ($1, $2)`,
                        [recipeId, categoryId]
                    );
                }
            }

            await client.query('COMMIT');
            return await RecipeModel.findById(recipeId);

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    // Delete recipe
    delete: async (recipeId, userId) => {
        const client = await db.connect();

        try {
            await client.query('BEGIN');

            // Get recipe to check ownership
            const recipeResult = await client.query(
                'SELECT user_id FROM recipes WHERE id = $1',
                [recipeId]
            );

            if (recipeResult.rows.length === 0) {
                throw new Error('Recipe not found');
            }

            const recipe = recipeResult.rows[0];

            // Get user to check if admin
            const userResult = await client.query(
                'SELECT role FROM users WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length === 0) {
                throw new Error('User not found');
            }

            const user = userResult.rows[0];

            // Authorization check: only owner or admin can delete
            if (recipe.user_id !== userId && user.role !== 'admin') {
                throw new Error('Forbidden: You do not have permission to delete this recipe');
            }

            // Delete related data first (foreign key constraints)
            await client.query('DELETE FROM recipe_media WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_instructions WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_categories WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_dietary_tags WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM likes WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM ratings WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM comments WHERE recipe_id = $1', [recipeId]);

            // Finally delete the recipe itself
            await client.query('DELETE FROM recipes WHERE id = $1', [recipeId]);

            await client.query('COMMIT');
            return { success: true };

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

module.exports = RecipeModel;
