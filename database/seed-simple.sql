-- Seed demo recipes - SIMPLIFIED VERSION
-- Run each section separately in Supabase SQL Editor

-- ====================
-- SECTION 1: Check and update demo user
-- ====================
-- First, let's see if demo user exists and get its ID
SELECT id, username, email FROM users WHERE username = 'demochef';

-- If user exists, update password. If not, this will do nothing
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'demochef';

-- ====================
-- SECTION 2: Insert ONE recipe first (test)
-- ====================
-- Insert just Phở Bò to test
INSERT INTO recipes (user_id, title, description, prep_time, cook_time, total_time, servings, difficulty, status, views, created_at)
SELECT 
  u.id,
  'Phở Bò Hà Nội',
  'Món phở truyền thống với nước dùng trong veo, thơm ngon từ xương bò ninh nhiều giờ.',
  30, 120, 150, 4, 'medium', 'published', 156, NOW()
FROM users u
WHERE u.username = 'demochef'
RETURNING id, title;

-- Note the ID returned! Let's say it's X

-- ====================
-- SECTION 3: Add ingredients for recipe ID X
-- (Replace X with the actual ID from above)
-- ====================
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index) VALUES
  (1, 'Bánh phở', 500, 'g', 0),
  (1, 'Thịt bò', 300, 'g', 1),
  (1, 'Xương ống bò', 1, 'kg', 2),
  (1, 'Hành tây', 2, 'củ', 3),
  (1, 'Gừng', 50, 'g', 4),
  (1, 'Nước mắm', 3, 'thìa', 5),
  (1, 'Hành lá, rau thơm', 1, 'bó', 6);

-- ====================
-- SECTION 4: Add instructions for recipe ID X
-- ====================
INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration) VALUES
  (1, 1, 'Ninh xương bò với hành, gừng đã nướng trong 3-4 giờ để có nước dùng thơm, trong', 180),
  (1, 2, 'Thái thịt bò mỏng, ướp chút nước mắm', 10),
  (1, 3, 'Trần bánh phở qua nước sôi cho mềm', 3),
  (1, 4, 'Cho bánh phở vào tô, xếp thịt bò tái, chan nước dùng nóng, cho hành lá', 2);

-- ====================
-- SECTION 5: Add categories
-- ====================
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
  (1, 7),  -- Món Miền Bắc
  (1, 2);  -- Món Trưa

-- ====================
-- SECTION 6: Verify the recipe
-- ====================
SELECT 
  r.id, r.title, r.difficulty,
  COUNT(DISTINCT ri.id) as ingredient_count,
  COUNT(DISTINCT inst.id) as instruction_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN recipe_instructions inst ON r.id = inst.recipe_id
GROUP BY r.id, r.title, r.difficulty;
