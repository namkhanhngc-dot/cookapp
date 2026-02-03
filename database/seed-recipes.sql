-- Seed demo recipes for Nấu Ăn Ngon
-- Run this in Supabase SQL Editor after migration

-- 1. Update demo user password hash (password: demo123)
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'demochef';

-- 2. Insert demo recipes
INSERT INTO recipes (user_id, title, description, prep_time, cook_time, total_time, servings, difficulty, status, views, created_at) VALUES
  (1, 'Phở Bò Hà Nội', 'Món phở truyền thống với nước dùng trong veo, thơm ngon từ xương bò ninh nhiều giờ. Bánh phở mềm dai, thịt bò tái mỏng, ăn kèm rau thơm tươi.', 30, 120, 150, 4, 'medium', 'published', 156, NOW()),
  (1, 'Bánh Mì Thịt Nướng', 'Bánh mì Việt Nam giòn rụm bên ngoài, mềm bên trong, kẹp thịt nướng thơm lừng, pate, rau sống tươi ngon. Món ăn sáng hoặc ăn vặt đậm chất Sài Gòn.', 20, 15, 35, 2, 'easy', 'published', 98, NOW()),
  (1, 'Bún Chả Hà Nội', 'Bún chả Hà Nội với chả nướng thơm phức, nước mắm chua ngọt đậm đà. Ăn kèm bún tươi, rau sống và nem rán giòn. Món ăn đặc trưng của thủ đô.', 30, 20, 50, 3, 'medium', 'published', 124, NOW()),
  (1, 'Gỏi Cuốn Tôm Thịt', 'Gỏi cuốn tươi mát với tôm luộc, thịt ba chỉ, bún, rau sống cuốn trong bánh tráng. Chấm cùng nước mắm chua ngọt hoặc tương đậu phộng.', 25, 10, 35, 4, 'easy', 'published', 87, NOW()),
  (1, 'Chè Khúc Bạch', 'Món tráng miệng mát lạnh với thạch dừa mềm mịn, nước cốt dừa thơm béo, ăn kèm đá bào. Hoàn hảo cho ngày hè.', 15, 30, 45, 4, 'easy', 'published', 65, NOW());

-- 3. Get recipe IDs (they auto-increment, starting from 1)
-- Recipe 1: Phở Bò
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index) VALUES
  (1, 'Bánh phở', 500, 'g', 0),
  (1, 'Thịt bò', 300, 'g', 1),
  (1, 'Xương ống bò', 1, 'kg', 2),
  (1, 'Hành tây', 2, 'củ', 3),
  (1, 'Gừng', 50, 'g', 4),
  (1, 'Nước mắm', 3, 'thìa', 5),
  (1, 'Hành lá, rau thơm', 1, 'bó', 6);

INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration) VALUES
  (1, 1, 'Ninh xương bò với hành, gừng đã nướng trong 3-4 giờ để có nước dùng thơm, trong', 180),
  (1, 2, 'Thái thịt bò mỏng, ướp chút nước mắm', 10),
  (1, 3, 'Trần bánh phở qua nước sôi cho mềm', 3),
  (1, 4, 'Cho bánh phở vào tô, xếp thịt bò tái, chan nước dùng nóng, cho hành lá và rau thơm', 2);

-- Recipe 2: Bánh Mì
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index) VALUES
  (2, 'Bánh mì Việt Nam', 2, 'ổ', 0),
  (2, 'Thịt ba chỉ', 200, 'g', 1),
  (2, 'Pate', 2, 'thìa', 2),
  (2, 'Dưa leo', 1, 'trái', 3),
  (2, 'Rau ngò', 1, 'bó', 4),
  (2, 'Đồ chua', 50, 'g', 5);

INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration) VALUES
  (2, 1, 'Ướp thịt với xì dầu, tiêu, nướng trên than hồng đến chín vàng', 15),
  (2, 2, 'Rạch bánh mì, phết pate', 2),
  (2, 3, 'Kẹp thịt nướng thái lát, dưa leo, rau ngò, đồ chua vào bánh', 3),
  (2, 4, 'Rưới chút nước tương, ớt nếu thích cay', 1);

-- Recipe 3: Bún Chả
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index) VALUES
  (3, 'Thịt nạc vai', 300, 'g', 0),
  (3, 'Bún tươi', 400, 'g', 1),
  (3, 'Nước mắm', 3, 'thìa', 2),
  (3, 'Đường', 2, 'thìa', 3),
  (3, 'Tỏi, ớt', 3, 'tép', 4),
  (3, 'Rau sống', 1, 'đĩa', 5);

INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration) VALUES
  (3, 1, 'Băm thịt, trộn gia vị, nặn thành viên tròn', 15),
  (3, 2, 'Nướng chả trên than hồng đến vàng đều', 20),
  (3, 3, 'Pha nước mắm chua ngọt với đường, tỏi, ớt', 5),
  (3, 4, 'Bày bún ra tô, cho chả và rau sống, chan nước mắm', 3);

-- Recipe 4: Gỏi Cuốn
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index) VALUES
  (4, 'Tôm sú', 200, 'g', 0),
  (4, 'Thịt ba chỉ', 100, 'g', 1),
  (4, 'Bánh tráng', 12, 'tờ', 2),
  (4, 'Bún tươi', 150, 'g', 3),
  (4, 'Rau sống', 1, 'đĩa', 4),
  (4, 'Đậu phộng rang', 50, 'g', 5);

INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration) VALUES
  (4, 1, 'Luộc tôm, thịt cho chín, để nguội', 10),
  (4, 2, 'Chuẩn bị rau sống, bún', 5),
  (4, 3, 'Nhúng bánh tráng qua nước, đặt lên thớt', 1),
  (4, 4, 'Đặt rau, bún, tôm, thịt lên bánh tráng, cuốn chặt', 2);

-- Recipe 5: Chè Khúc Bạch
INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index) VALUES
  (5, 'Bột rau câu', 10, 'g', 0),
  (5, 'Nước cốt dừa', 400, 'ml', 1),
  (5, 'Đường', 100, 'g', 2),
  (5, 'Sữa tươi', 200, 'ml', 3),
  (5, 'Đá bào', 2, 'cốc', 4);

INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration) VALUES
  (5, 1, 'Nấu bột rau câu với nước, đường, sữa tươi', 10),
  (5, 2, 'Đổ hỗn hợp vào khuôn, để nguội rồi cho vào tủ lạnh', 180),
  (5, 3, 'Cắt thạch thành miếng vuông nhỏ', 5),
  (5, 4, 'Cho thạch vào ly, thêm đá bào, chan nước cốt dừa', 2);

-- 4. Add categories to recipes
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
  -- Phở Bò: Món Miền Bắc, Món Mặn, Món Trưa
  (1, 7), (1, 2),
  -- Bánh Mì: Món Miền Nam, Món Sáng, Món Nhanh
  (2, 8), (2, 1), (2, 10),
  -- Bún Chả: Món Miền Bắc, Món Trưa, Món Mặn
  (3, 7), (3, 2),
  -- Gỏi Cuốn: Món Miền Nam, Món Healthy, Món Nhanh
  (4, 8), (4, 11), (4, 10),
  -- Chè: Món Tráng Miệng, Món Miền Bắc, Món Nhanh
  (5, 4), (5, 7), (5, 10);

-- 5. Add some demo likes (simulate popularity)
INSERT INTO likes (user_id, recipe_id, created_at)
SELECT 1, id, NOW() 
FROM recipes 
WHERE id <= 5;

-- 6. Add some demo ratings
INSERT INTO ratings (user_id, recipe_id, rating, created_at) VALUES
  (1, 1, 5, NOW()),
  (1, 2, 5, NOW()),
  (1, 3, 4, NOW()),
  (1, 4, 5, NOW()),
  (1, 5, 4, NOW());

-- Done! You should now have 5 demo recipes
SELECT 
  r.id, 
  r.title, 
  r.difficulty,
  COUNT(DISTINCT ri.id) as ingredient_count,
  COUNT(DISTINCT inst.id) as instruction_count
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN recipe_instructions inst ON r.id = inst.recipe_id
WHERE r.user_id = 1
GROUP BY r.id, r.title, r.difficulty
ORDER BY r.id;
