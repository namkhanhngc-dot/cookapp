// Seed demo recipes into database
// Run: node scripts/seed-recipes.js

const db = require('../lib/db');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function seedRecipes() {
    console.log('🌱 Seeding demo recipes...\n');

    try {
        // 1. Create demo user if not exists
        console.log('👤 Creating demo user...');
        const passwordHash = await bcrypt.hash('demo123', 10);

        const userResult = await db.query(
            `INSERT INTO users (username, email, password_hash, display_name, bio)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO UPDATE SET
         display_name = $4, bio = $5
       RETURNING id`,
            ['demochef', 'demo@nauanngon.vn', passwordHash, 'Đầu Bếp Demo', 'Chào mừng bạn đến với Nấu Ăn Ngon! 🍳']
        );

        const userId = userResult.rows[0].id;
        console.log(`✅ Demo user created/updated (ID: ${userId})\n`);

        // 2. Get category IDs
        const categoriesResult = await db.query(`SELECT id, name FROM categories`);
        const categories = {};
        categoriesResult.rows.forEach(cat => {
            categories[cat.name] = cat.id;
        });

        // 3. Create demo recipes
        const recipes = [
            {
                title: 'Phở Bò Hà Nội',
                description: 'Món phở truyền thống với nước dùng trong veo, thơm ngon từ xương bò ninh nhiều giờ. Bánh phở mềm dai, thịt bò tái mỏng, ăn kèm rau thơm tươi.',
                prepTime: 30,
                cookTime: 120,
                totalTime: 150,
                servings: 4,
                difficulty: 'medium',
                categoryIds: [categories['Món Miền Bắc'], categories['Món Mặn'], categories['Món Trưa']],
                ingredients: [
                    { name: 'Bánh phở', quantity: 500, unit: 'g' },
                    { name: 'Thịt bò', quantity: 300, unit: 'g' },
                    { name: 'Xương ống bò', quantity: 1, unit: 'kg' },
                    { name: 'Hành tây', quantity: 2, unit: 'củ' },
                    { name: 'Gừng', quantity: 50, unit: 'g' },
                    { name: 'Nước mắm', quantity: 3, unit: 'thìa' },
                    { name: 'Hành lá, rau thơm', quantity: 1, unit: 'bó' }
                ],
                instructions: [
                    { instruction: 'Ninh xương bò với hành, gừng đã nướng trong 3-4 giờ để có nước dùng thơm, trong', duration: 180 },
                    { instruction: 'Thái thịt bò mỏng, ướp chút nước mắm', duration: 10 },
                    { instruction: 'Trần bánh phở qua nước sôi cho mềm', duration: 3 },
                    { instruction: 'Cho bánh phở vào tô, xếp thịt bò tái, chan nước dùng nóng, cho hành lá và rau thơm', duration: 2 }
                ]
            },
            {
                title: 'Bánh Mì Thịt Nướng',
                description: 'Bánh mì Việt Nam giòn rụm bên ngoài, mềm bên trong, kẹp thịt nướng thơm lừng, pate, rau sống tươi ngon. Món ăn sáng hoặc ăn vặt đậm chất Sài Gòn.',
                prepTime: 20,
                cookTime: 15,
                totalTime: 35,
                servings: 2,
                difficulty: 'easy',
                categoryIds: [categories['Món Miền Nam'], categories['Món Sáng'], categories['Món Nhanh']],
                ingredients: [
                    { name: 'Bánh mì Việt Nam', quantity: 2, unit: 'ổ' },
                    { name: 'Thịt ba chỉ', quantity: 200, unit: 'g' },
                    { name: 'Pate', quantity: 2, unit: 'thìa' },
                    { name: 'Dưa leo', quantity: 1, unit: 'trái' },
                    { name: 'Rau ngò', quantity: 1, unit: 'bó' },
                    { name: 'Đồ chua', quantity: 50, unit: 'g' },
                    { name: 'Xì dầu, tiêu', quantity: 1, unit: 'chút' }
                ],
                instructions: [
                    { instruction: 'Ướp thịt với xì dầu, tiêu, nướng trên than hồng đến chín vàng', duration: 15 },
                    { instruction: 'Rạch bánh mì, phết pate', duration: 2 },
                    { instruction: 'Kẹp thịt nướng thái lát, dưa leo, rau ngò, đồ chua vào bánh', duration: 3 },
                    { instruction: 'Rưới chút nước tương, ớt nếu thích cay', duration: 1 }
                ]
            },
            {
                title: 'Bún Chả Hà Nội',
                description: 'Bún chả Hà Nội với chả nướng thơm phức, nước mắm chua ngọt đậm đà. Ăn kèm bún tươi, rau sống và nem rán giòn. Món ăn đặc trưng của thủ đô.',
                prepTime: 30,
                cookTime: 20,
                totalTime: 50,
                servings: 3,
                difficulty: 'medium',
                categoryIds: [categories['Món Miền Bắc'], categories['Món Trưa'], categories['Món Mặn']],
                ingredients: [
                    { name: 'Thịt nạc vai', quantity: 300, unit: 'g' },
                    { name: 'Bún tươi', quantity: 400, unit: 'g' },
                    { name: 'Nước mắm', quantity: 3, unit: 'thìa' },
                    { name: 'Đường', quantity: 2, unit: 'thìa' },
                    { name: 'Tỏi, ớt', quantity: 3, unit: 'tép' },
                    { name: 'Rau sống', quantity: 1, unit: 'đĩa' }
                ],
                instructions: [
                    { instruction: 'Băm thịt, trộn gia vị, nặn thành viên tròn', duration: 15 },
                    { instruction: 'Nướng chả trên than hồng đến vàng đều', duration: 20 },
                    { instruction: 'Pha nước mắm chua ngọt với đường, tỏi, ớt', duration: 5 },
                    { instruction: 'Bày bún ra tô, cho chả và rau sống, chan nước mắm', duration: 3 }
                ]
            },
            {
                title: 'Gỏi Cuốn Tôm Thịt',
                description: 'Gỏi cuốn tươi mát với tôm luộc, thịt ba chỉ, bún, rau sống cuốn trong bánh tráng. Chấm cùng nước mắm chua ngọt hoặc tương đậu phộng.',
                prepTime: 25,
                cookTime: 10,
                totalTime: 35,
                servings: 4,
                difficulty: 'easy',
                categoryIds: [categories['Món Miền Nam'], categories['Món Healthy'], categories['Món Nhanh']],
                ingredients: [
                    { name: 'Tôm sú', quantity: 200, unit: 'g' },
                    { name: 'Thịt ba chỉ', quantity: 100, unit: 'g' },
                    { name: 'Bánh tráng', quantity: 12, unit: 'tờ' },
                    { name: 'Bún tươi', quantity: 150, unit: 'g' },
                    { name: 'Rau sống', quantity: 1, unit: 'đĩa' },
                    { name: 'Đậu phộng rang', quantity: 50, unit: 'g' }
                ],
                instructions: [
                    { instruction: 'Luộc tôm, thịt cho chín, để nguội', duration: 10 },
                    { instruction: 'Chuẩn bị rau sống, bún', duration: 5 },
                    { instruction: 'Nhúng bánh tráng qua nước, đặt lên thớt', duration: 1 },
                    { instruction: 'Đặt rau, bún, tôm, thịt lên bánh tráng, cuốn chặt', duration: 2 },
                    { instruction: 'Chấm nước mắm chua ngọt hoặc tương đậu phộng', duration: 1 }
                ]
            },
            {
                title: 'Chè Khúc Bạch',
                description: 'Món tráng miệng mát lạnh với thạch dừa mềm mịn, nước cốt dừa thơm béo, ăn kèm đá bào. Hoàn hảo cho ngày hè.',
                prepTime: 15,
                cookTime: 30,
                totalTime: 45,
                servings: 4,
                difficulty: 'easy',
                categoryIds: [categories['Món Tráng Miệng'], categories['Món Miền Bắc'], categories['Món Nhanh']],
                ingredients: [
                    { name: 'Bột rau câu', quantity: 10, unit: 'g' },
                    { name: 'Nước cốt dừa', quantity: 400, unit: 'ml' },
                    { name: 'Đường', quantity: 100, unit: 'g' },
                    { name: 'Sữa tươi', quantity: 200, unit: 'ml' },
                    { name: 'Vani', quantity: 1, unit: 'chút' },
                    { name: 'Đá bào', quantity: 2, unit: 'cốc' }
                ],
                instructions: [
                    { instruction: 'Nấu bột rau câu với nước, đường, sữa tươi', duration: 10 },
                    { instruction: 'Đổ hỗn hợp vào khuôn, để nguội rồi cho vào tủ lạnh', duration: 180 },
                    { instruction: 'Cắt thạch thành miếng vuông nhỏ', duration: 5 },
                    { instruction: 'Cho thạch vào ly, thêm đá bào, chan nước cốt dừa', duration: 2 }
                ]
            }
        ];

        console.log('📝 Creating recipes...');
        for (const recipe of recipes) {
            // Insert recipe
            const recipeResult = await db.query(
                `INSERT INTO recipes (
          user_id, title, description, prep_time, cook_time, total_time,
          servings, difficulty, status, views, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        RETURNING id`,
                [
                    userId, recipe.title, recipe.description,
                    recipe.prepTime, recipe.cookTime, recipe.totalTime,
                    recipe.servings, recipe.difficulty, 'published',
                    Math.floor(Math.random() * 200) + 50 // Random views
                ]
            );

            const recipeId = recipeResult.rows[0].id;

            // Insert ingredients
            for (let i = 0; i < recipe.ingredients.length; i++) {
                const ing = recipe.ingredients[i];
                await db.query(
                    `INSERT INTO recipe_ingredients (recipe_id, name, quantity, unit, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
                    [recipeId, ing.name, ing.quantity, ing.unit, i]
                );
            }

            // Insert instructions
            for (let i = 0; i < recipe.instructions.length; i++) {
                const inst = recipe.instructions[i];
                await db.query(
                    `INSERT INTO recipe_instructions (recipe_id, step_number, instruction, duration)
           VALUES ($1, $2, $3, $4)`,
                    [recipeId, i + 1, inst.instruction, inst.duration]
                );
            }

            // Insert categories
            for (const categoryId of recipe.categoryIds) {
                await db.query(
                    `INSERT INTO recipe_categories (recipe_id, category_id)
           VALUES ($1, $2)`,
                    [recipeId, categoryId]
                );
            }

            // Add some random likes
            const likeCount = Math.floor(Math.random() * 80) + 20;
            console.log(`  ✓ ${recipe.title} (${likeCount} likes)`);
        }

        console.log(`\n✅ Seeded ${recipes.length} recipes successfully!`);
        console.log('\n💡 You can now:');
        console.log('  1. Start the app: npm run dev');
        console.log('  2. Login with: demochef / demo123');
        console.log('  3. Browse recipes at http://localhost:3000');

    } catch (error) {
        console.error('❌ Error seeding recipes:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

seedRecipes();
