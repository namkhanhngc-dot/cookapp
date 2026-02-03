# Recipe Sharing Platform 🍳

A modern, community-focused recipe sharing platform where users can create, discover, and cook amazing recipes.

## Features

### 🎯 Core Features
- **Recipe Sharing** - Create, edit, and share recipes with images/videos
- **Advanced Search** - Find recipes by name or ingredients you have (pantry search)
- **Smart Filters** - Filter by cooking time, difficulty, dietary preferences, allergies, and ratings
- **Community Interaction** - Follow users, like recipes, leave comments, and share cooking results
- **Cook Mode** - Fullscreen step-by-step cooking interface with timer and ingredient checklist
- **Screen Wake Lock** - Keep screen active while cooking (HTTPS/localhost only)
- **SEO Optimized** - Recipe Schema (JSON-LD) for search engines
- **Social Sharing** - Share recipes on Facebook, Pinterest, and Zalo

### 👥 User Roles
- **Guest** - Browse and search recipes
- **Registered User** - Full access to create, share, and interact
- **Admin** - Content moderation and management (future)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT with httpOnly cookies
- **Styling**: Vanilla CSS with modern design system
- **Image Processing**: Sharp for optimization

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd cookapp
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your values
```

4. Initialize the database
```bash
npm run init-db
```

5. Run the development server
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
cookapp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── recipes/           # Recipe pages
│   ├── users/             # User profile pages
│   ├── login/             # Auth pages
│   └── page.jsx           # Homepage
├── components/            # React components
├── lib/                   # Business logic
│   ├── models/           # Database models
│   └── utils/            # Utilities
├── database/             # Database files
│   └── schema.sql        # Database schema
├── public/               # Static files
│   └── uploads/          # User uploads
└── scripts/              # Utility scripts
```

## Key Features Explained

### Cook Mode
Fullscreen interface optimized for cooking:
- Large, readable text
- Step-by-step navigation
- Built-in timer with alerts
- Ingredient checklist
- Screen Wake Lock API (keeps screen on)
- Servings scaler

### Pantry Search
Find recipes based on ingredients you have at home:
1. Toggle "Pantry Mode"
2. Enter available ingredients
3. Get recipes you can make right now

### Recipe Schema (SEO)
Every recipe includes structured data for search engines:
- Better visibility in Google Search
- Rich snippets with ratings and images
- Cooking time and difficulty displayed in results

## Development

### Database Schema
See `database/schema.sql` for complete schema including:
- Users and authentication
- Recipes with ingredients and instructions
- Social features (follows, likes, comments)
- Cooksnaps (user cooking results)

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/recipes` - List/search recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/[id]` - Get recipe details
- `POST /api/recipes/[id]/like` - Toggle like
- `POST /api/recipes/[id]/comment` - Add comment
- And more...

## Future Enhancements
- AI-powered recipe recommendations
- Nutrition analysis
- Meal planning
- Shopping list generation
- Email notifications
- Advanced analytics
- E-commerce integrations

## License
MIT

## Contributing
Contributions welcome! Please read contributing guidelines first.
