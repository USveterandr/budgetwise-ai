# BudgetWise Architecture

## Data Flow Diagram

```mermaid
graph TB
    A[User Browser] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Cloudflare Worker]
    D --> E[(Cloudflare D1 Database)]
    D --> F[(Cloudflare R2 Storage)]
    G[Bank CSV Files] --> H[CSV Import API]
    H --> D
    I[Reports Export] --> J[Export API]
    J --> D
    D --> K[Generated Reports - R2]
```

## Core DB Schema (Cloudflare D1 - SQLite)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  createdAt DateTime @default(now())
  budgets   Budget[]
  expenses  Expense[]
  goals     Goal[]
}

model Budget {
  id        String   @id @default(uuid())
  name      String   // e.g., "Monthly Groceries"
  amount    Float
  period    String   // "monthly", "weekly"
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expenses  Expense[]
}

model Expense {
  id          String   @id @default(uuid())
  amount      Float
  date        DateTime
  category    String   // e.g., "Dining", "Software"
  description String?
  budgetId    String?
  budget      Budget?  @relation(fields: [budgetId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
}

model Goal {
  id         String   @id @default(uuid())
  name       String   // e.g., "Emergency Fund"
  target     Float    // $10,000
  current    Float    // $2,500
  targetDate DateTime?
  type       String   // "emergency", "retirement", "vacation", "college", "investment"
  userId     String
  user       User     @relation(fields: [userId], references: [id])
}
```

## Cloudflare R2 Storage Structure

R2 stores:
- Uploaded CSVs (key: user/{userId}/uploads/{filename})
- Exported reports (key: user/{userId}/exports/{reportId}.pdf)