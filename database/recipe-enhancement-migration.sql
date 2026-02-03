-- Comprehensive Recipe Enhancement Migration
-- Adds all features: images, videos, dietary tags, autosave, SEO, and more

-- ============================================
-- PART 1: Update recipes table with new columns
-- ============================================

-- Cooking & preparation details
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cooking_method VARCHAR(50);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cooking_temp INTEGER; -- Temperature in Celsius
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS skill_level VARCHAR(20) DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Storage & preservation
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS storage_instructions TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS shelf_life VARCHAR(100); -- e.g., "3 days in fridge"
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS can_freeze BOOLEAN DEFAULT FALSE;

-- Meal planning
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS meal_type VARCHAR(50)[]; -- Array of meal types
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2); -- Cost in VND
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS servings_base INTEGER DEFAULT 4; -- Base serving size for scaling

-- Content enhancements
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS tips TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS variations TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS pairing_suggestions TEXT;

-- SEO & metadata
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS meta_title VARCHAR(200);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS keywords TEXT[];

-- Media
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS thumbnail_url TEXT; -- Main thumbnail (deprecated - use recipe_media)

-- ============================================
-- PART 2: Create recipe_media table (multiple images/videos)
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_media (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video')),
    media_url TEXT NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    caption TEXT,
    order_index INTEGER DEFAULT 0,
    width INTEGER,
    height INTEGER,
    file_size INTEGER, -- in bytes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recipe_media_recipe_id ON recipe_media(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_media_thumbnail ON recipe_media(recipe_id, is_thumbnail);

-- ============================================
-- PART 3: Create dietary_tags table
-- ============================================

CREATE TABLE IF NOT EXISTS dietary_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('diet', 'allergen', 'restriction')),
    icon VARCHAR(10),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for recipe dietary tags (many-to-many)
CREATE TABLE IF NOT EXISTS recipe_dietary_tags (
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES dietary_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_dietary_tags_recipe ON recipe_dietary_tags(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_dietary_tags_tag ON recipe_dietary_tags(tag_id);

-- Seed dietary tags
INSERT INTO dietary_tags (name, type, icon, description) VALUES
    ('Vegetarian', 'diet', '🥬', 'Không có thịt'),
    ('Vegan', 'diet', '🌱', 'Hoàn toàn chay, không có sản phẩm động vật'),
    ('Gluten-Free', 'allergen', '🌾', 'Không chứa gluten'),
    ('Dairy-Free', 'allergen', '🥛', 'Không có sữa'),
    ('Nut-Free', 'allergen', '🥜', 'Không có hạt'),
    ('Egg-Free', 'allergen', '🥚', 'Không có trứng'),
    ('Soy-Free', 'allergen', '🫘', 'Không có đậu nành'),
    ('Seafood-Free', 'allergen', '🦐', 'Không có hải sản'),
    ('Low-Carb', 'diet', '🍞', 'Ít carbohydrate'),
    ('Keto', 'diet', '🥑', 'Chế độ ăn ketogenic'),
    ('Paleo', 'diet', '🦴', 'Chế độ ăn cổ đại'),
    ('Halal', 'restriction', '☪️', 'Phù hợp cho người Hồi giáo'),
    ('Kosher', 'restriction', '✡️', 'Phù hợp cho người Do Thái')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART 4: Create recipe_drafts table (autosave)
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_drafts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE, -- NULL for new recipes
    draft_data JSONB NOT NULL, -- Complete form state
    last_saved TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_drafts_user ON recipe_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_drafts_last_saved ON recipe_drafts(last_saved DESC);

-- ============================================
-- PART 5: Create recipe_tags table (for keywords/search)
-- ============================================

CREATE TABLE IF NOT EXISTS recipe_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_tag_relations (
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES recipe_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (recipe_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_tag_relations_recipe ON recipe_tag_relations(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_tag_relations_tag ON recipe_tag_relations(tag_id);

-- ============================================
-- PART 6: Update recipe_instructions for step images
-- ============================================

ALTER TABLE recipe_instructions ADD COLUMN IF NOT EXISTS has_timer BOOLEAN DEFAULT FALSE;
ALTER TABLE recipe_instructions ADD COLUMN IF NOT EXISTS timer_start_at INTEGER; -- When to start timer (in minutes from recipe start)

-- ============================================
-- PART 7: Add cooking methods enum values
-- ============================================

COMMENT ON COLUMN recipes.cooking_method IS 'Phương pháp nấu: Hấp, Rán, Nướng, Rim, Xào, Luộc, Chiên, Kho';
COMMENT ON COLUMN recipes.skill_level IS 'Mức độ: beginner, intermediate, advanced, expert';
COMMENT ON COLUMN recipes.meal_type IS 'Bữa ăn: breakfast, lunch, dinner, snack, dessert';

-- ============================================
-- PART 8: Update indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_recipes_cooking_method ON recipes(cooking_method) WHERE cooking_method IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipes_skill_level ON recipes(skill_level);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes USING GIN(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_servings ON recipes(servings_base);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'recipes' 
AND column_name IN ('cooking_method', 'skill_level', 'tips', 'meta_title')
ORDER BY column_name;

-- Check new tables
SELECT tablename 
FROM pg_tables 
WHERE tablename IN ('recipe_media', 'dietary_tags', 'recipe_drafts', 'recipe_tags')
ORDER BY tablename;

-- Count dietary tags
SELECT COUNT(*) as tag_count FROM dietary_tags;

-- Show all recipe columns
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'recipes'
ORDER BY ordinal_position;
