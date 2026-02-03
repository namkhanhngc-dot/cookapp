const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../database/recipes.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Create database
const db = new Database(dbPath);

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

console.log('✅ Database initialized successfully!');

// Insert sample categories
const categories = [
    // Dish types
    { name: 'Breakfast', type: 'dish_type', description: 'Morning meals' },
    { name: 'Lunch', type: 'dish_type', description: 'Midday meals' },
    { name: 'Dinner', type: 'dish_type', description: 'Evening meals' },
    { name: 'Dessert', type: 'dish_type', description: 'Sweet treats' },
    { name: 'Snack', type: 'dish_type', description: 'Light bites' },
    { name: 'Appetizer', type: 'dish_type', description: 'Starters' },
    { name: 'Soup', type: 'dish_type', description: 'Liquid dishes' },
    { name: 'Salad', type: 'dish_type', description: 'Fresh vegetables' },

    // Cooking methods
    { name: 'Baking', type: 'method', description: 'Oven cooking' },
    { name: 'Grilling', type: 'method', description: 'Direct heat cooking' },
    { name: 'Frying', type: 'method', description: 'Oil cooking' },
    { name: 'Steaming', type: 'method', description: 'Steam cooking' },
    { name: 'Slow Cooker', type: 'method', description: 'Long slow cooking' },
    { name: 'Instant Pot', type: 'method', description: 'Pressure cooking' },
    { name: 'No Cook', type: 'method', description: 'No heat required' },

    // Dietary preferences
    { name: 'Vegetarian', type: 'diet', description: 'No meat' },
    { name: 'Vegan', type: 'diet', description: 'No animal products' },
    { name: 'Keto', type: 'diet', description: 'Low carb, high fat' },
    { name: 'Paleo', type: 'diet', description: 'Whole foods' },
    { name: 'Gluten-Free', type: 'diet', description: 'No gluten' },
    { name: 'Dairy-Free', type: 'diet', description: 'No dairy' },
    { name: 'Low-Carb', type: 'diet', description: 'Reduced carbohydrates' },
    { name: 'Clean Eating', type: 'diet', description: 'Whole, unprocessed foods' },

    // Allergies
    { name: 'Nut-Free', type: 'allergy', description: 'No nuts' },
    { name: 'Egg-Free', type: 'allergy', description: 'No eggs' },
    { name: 'Soy-Free', type: 'allergy', description: 'No soy' },
    { name: 'Shellfish-Free', type: 'allergy', description: 'No shellfish' },
];

const insertCategory = db.prepare('INSERT INTO categories (name, type, description) VALUES (?, ?, ?)');
const insertMany = db.transaction((categories) => {
    for (const cat of categories) {
        insertCategory.run(cat.name, cat.type, cat.description);
    }
});

insertMany(categories);
console.log(`✅ Inserted ${categories.length} categories`);

// Create sample user (password: demo123)
const bcrypt = require('bcryptjs');
const samplePassword = bcrypt.hashSync('demo123', 10);

db.prepare(`
  INSERT INTO users (username, email, password_hash, display_name, bio)
  VALUES (?, ?, ?, ?, ?)
`).run(
    'demochef',
    'demo@cookapp.com',
    samplePassword,
    'Demo Chef',
    'Welcome to CookApp! This is a demo account to get you started.'
);

console.log('✅ Created demo user (username: demochef, password: demo123)');

// Create uploads directory
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
['recipes', 'avatars', 'cooksnaps'].forEach(dir => {
    const subDir = path.join(uploadsDir, dir);
    if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir, { recursive: true });
    }
});

console.log('✅ Created upload directories');

console.log('\n🎉 Setup complete! Run "npm run dev" to start the application.');

db.close();
