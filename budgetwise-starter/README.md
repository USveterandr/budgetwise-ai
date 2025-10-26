# BudgetWise - Starter

## Tech Stack
- Next.js 14 (Pages Router for simplicity)
- TypeScript
- Tailwind CSS v4
- Prisma ORM (schema included)
- Cloudflare D1 (SQLite) + R2 (via wrangler dev)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Prisma:
   ```bash
   npx prisma generate
   ```

3. Set up environment variables:
   Create a `.env` file with your database configuration:
   ```
   DATABASE_URL="file:./dev.db"
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Scripts
- `npm run dev` → Start development server
- `npm run build` → Build for production
- `npm run seed` → Create sample user + goals (dummy implementation)
- API routes are dummy handlers (return static data)

> Note: Full Cloudflare integration requires `wrangler.toml` (not included in MVP scaffold).

## Project Structure
```
budgetwise-starter/
├── prisma/
│   └── schema.prisma # DB schema
├── scripts/
│   └── seed.ts # Seed sample data
├── src/
│   ├── pages/
│   │   ├── api/
│   │   │   ├── budgets.ts # GET/POST /api/budgets
│   │   │   ├── csv/
│   │   │   │   └── import.ts
│   │   │   ├── expenses.ts # POST /api/expenses
│   │   │   ├── goals.ts # GET/POST /api/goals
│   │   │   └── reports/
│   │   │       └── export.ts
│   │   ├── _app.tsx
│   │   ├── goals.tsx # Goals detail page
│   │   └── index.tsx # Home/dashboard page
│   ├── lib/
│   │   └── prisma.ts # Prisma client init
│   └── styles/
│       └── globals.css
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```