# 📖 Recipe Tracker

A shared recipe book web app built with React + Vite + Supabase.

## Features
- Add, edit, and delete recipes
- 9 categories with subcategories (Breakfast, Lunch, Dinner, BBQ, World Cuisine, Baked Goods, Desserts, Drinks, Sides & Sauces)
- Ingredients list, instructions, notes, difficulty, cook time, servings
- Tag system (vegetarian, gluten-free, kid-friendly, etc.)
- Live search
- Shared collection — no login required
- Persistent storage via Supabase (Postgres)

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/recipe-tracker.git
cd recipe-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Copy your Project URL and anon key from **Project Settings → API**

### 4. Configure environment variables
```bash
cp .env.example .env
```
Fill in your values:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Run locally
```bash
npm run dev
```

## Deploy to Vercel
1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in Vercel project settings
4. Deploy!

## Tech Stack
- [React 18](https://react.dev)
- [Vite](https://vitejs.dev)
- [Supabase](https://supabase.com) (Postgres + REST API)
