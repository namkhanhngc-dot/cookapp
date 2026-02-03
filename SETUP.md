# CookApp - Setup Instructions

## Prerequisites

Before you start, make sure you have:
- **Node.js 18+** and **npm** installed
- A code editor (VS Code recommended)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- Next.js 14+ (framework)
- React 18+ (UI library)
- better-sqlite3 (database)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- sharp (image processing)
- date-fns (date utilities)

### 2. Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

This will:
- Create the SQLite database file
- Set up all tables (users, recipes, comments, etc.)
- Insert sample categories
- Create a demo user account
- Set up upload directories

**Demo Account Credentials:**
- Username: `demochef`
- Password: `demo123`

### 3. Configure Environment Variables

The `.env.local` file is already created with default values:

```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
DATABASE_PATH=./database/recipes.db
UPLOAD_DIR=./public/uploads
```

⚠️ **Important:** Change the `JWT_SECRET` in production!

### 4. Start the Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

## First Steps

1. **Open the app** - Navigate to http://localhost:3000
2. **Create an account** - Click "Sign Up" or use the demo account
3. **Explore recipes** - Browse the homepage
4. **Create a recipe** - Click "Create Recipe" (requires login)
5. **Try Cook Mode** - Open any recipe and click "Start Cook Mode"

## Project Structure

```
cookapp/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (backend)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── recipes/      # Recipe CRUD & interactions
│   │   ├── users/        # User profiles
│   │   └── categories/   # Categories
│   ├── recipes/          # Recipe pages
│   │   └── [id]/        # Dynamic recipe detail
│   │       ├── cook/    # Cook Mode
│   │       └── edit/    # Edit recipe
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── page.jsx         # Homepage
├── components/           # Reusable React components
│   ├── Navbar.jsx       # Navigation bar
│   └── RecipeCard.jsx   # Recipe card component
├── lib/                 # Business logic & utilities
│   ├── models/          # Database models
│   │   ├── user.js     # User operations
│   │   ├── recipe.js   # Recipe operations
│   │   └── interaction.js # Social features
│   ├── utils/           # Utility functions
│   │   ├── seo.js      # SEO & Schema generation
│   │   ├── validation.js # Input validation
│   │   ├── conversion.js # Unit conversion
│   │   └── upload.js   # File uploads
│   ├── db.js           # Database connection
│   └── auth.js         # Authentication helpers
├── database/           # Database files
│   ├── schema.sql     # Database schema
│   └── recipes.db     # SQLite database (created on init)
├── public/            # Static files
│   └── uploads/       # User-uploaded files
└── scripts/           # Utility scripts
    └── init-db.js    # Database initialization
```

## Key Features

### 🔐 Authentication
- User registration and login
- JWT-based sessions
- Protected routes

### 📝 Recipe Management
- Create, edit, delete recipes
- Upload images
- Add ingredients with quantities
- Step-by-step instructions
- Categories and tags

### 🔍 Discovery & Search
- Browse all recipes
- Search by recipe name
- **Pantry Search** - Find recipes by ingredients you have
- Filter by:
  - Cooking time
  - Difficulty (easy, medium, hard)
  - Dietary preferences (vegan, keto, gluten-free, etc.)
  - Ratings

### 👥 Social Features
- Follow other users
- Like recipes
- Rate recipes (1-5 stars)
- Comment on recipes
- Upload "Cooksnaps" (cooking results)
- Personalized feed

### 🧑‍🍳 Cook Mode
- Fullscreen step-by-step interface
- Large, readable text for cooking
- Ingredient checklist
- Built-in timer with alerts
- Servings scaler
- **Screen Wake Lock** (keeps screen on while cooking)
  - ⚠️ Requires HTTPS or localhost
  - Works on modern browsers

### 📊 SEO Optimization
- Recipe Schema (JSON-LD) for search engines
- Rich snippets with ratings and images
- SEO-friendly URLs
- Meta tags for social sharing

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Recipes
- `GET /api/recipes` - List/search recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/[id]` - Get recipe details
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `POST /api/recipes/[id]/like` - Toggle like
- `POST /api/recipes/[id]/rate` - Rate recipe
- `GET /api/recipes/[id]/comment` - Get comments
- `POST /api/recipes/[id]/comment` - Add comment
- `GET /api/recipes/[id]/cooksnap` - Get cooksnaps
- `POST /api/recipes/[id]/cooksnap` - Upload cooksnap

### Users
- `GET /api/users/[id]` - Get user profile
- `POST /api/users/[id]/follow` - Toggle follow

### Categories
- `GET /api/categories` - Get all categories

## Testing Features

### 1. Recipe Creation
- Login with demo account or create new account
- Click "Create Recipe"
- Fill in recipe details
- Add ingredients (quantity, unit, name)
- Add cooking instructions
- Select categories
- Upload image (optional)
- Submit

### 2. Pantry Search
- Go to Search page
- Toggle "Pantry Mode"
- Enter ingredients you have (comma-separated)
  - Example: "chicken, rice, onion"
- See recipes you can make

### 3. Cook Mode
- Open any recipe
- Click "Start Cook Mode"
- Check off ingredients as you prepare
- Navigate through steps
- Use the built-in timer
- Screen will stay awake (on HTTPS/localhost)

### 4. Social Features
- Like a recipe (heart icon)
- Rate a recipe (1-5 stars)
- Comment on recipes
- Follow other users
- View user profiles

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

To run the production build:

```bash
npm start
```

## Troubleshooting

### Database Issues
If you encounter database errors, try re-initializing:
```bash
rm database/recipes.db
npm run init-db
```

### Port Already in Use
If port 3000 is busy, specify a different port:
```bash
PORT=3001 npm run dev
```

### Image Upload Errors
Ensure the `public/uploads` directory exists and has write permissions.

### Screen Wake Lock Not Working
- Screen Wake Lock requires HTTPS or localhost
- Only works on supported browsers (Chrome, Edge, Safari 16.4+)
- Check browser console for errors

## Database Schema Highlights

### Users Table
- id, username (unique), email (unique)
- password_hash, display_name, bio
- avatar_url, timestamps

### Recipes Table
- id, user_id, title, description
- image_url, video_url
- prep_time, cook_time, total_time
- servings, difficulty, status
- views (auto-incremented on view)

### Relationships
- Recipes → User (many-to-one)
- Ingredients → Recipe (many-to-one)
- Instructions → Recipe (many-to-one)
- RecipeCategories → Recipe + Category (many-to-many)
- Follows → User + User (many-to-many)
- Likes, Ratings, Comments → User + Recipe

## Future Enhancements

The platform is designed to scale beyond MVP:

- **AI Features**
  - Smart recipe recommendations
  - Nutrition analysis
  - Ingredient substitution suggestions

- **Advanced Features**
  - Meal planning calendar
  - Shopping list generation
  - Recipe collections/cookbooks
  - Video recipe support

- **Integrations**
  - Email notifications
  - Social media sharing
  - E-commerce (ingredient delivery)
  - Smart appliance integration

- **Mobile App**
  - Native iOS and Android apps
  - Offline recipe access

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check the browser console for errors
4. Verify all dependencies are installed

## License

MIT License - Feel free to use and modify as needed.

---

**Happy Cooking! 🍳**
