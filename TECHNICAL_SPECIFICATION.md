# BudgetWise AI - Technical Specification

## 1. Introduction

### 1.1 Purpose
This document provides technical specifications for implementing the features described in the Product Requirements Document (PRD) for BudgetWise AI. It details the architectural design, technology stack, data models, API specifications, and implementation guidelines.

### 1.2 Scope
This specification covers the technical implementation of all core features including authentication, transaction management, budgeting, investment tracking, receipt management, AI advisory, reporting, and subscription management.

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend      │    │   Cloudflare     │    │   Third-Party    │
│   (Next.js)     │◄──►│     Workers      │◄──►│    Services      │
│                 │    │                  │    │                  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                              │
                       ┌─────────────┐
                       │ Cloudflare  │
                       │     D1      │
                       │ (Database)  │
                       └─────────────┘
                              │
                       ┌─────────────┐
                       │ Cloudflare  │
                       │     R2      │
                       │ (Storage)   │
                       └─────────────┘
```

### 2.2 Component Diagram
```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                           │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐ │
│ │   Auth UI   │ │Dashboard UI │ │  Budget UI  │ │ Investment UI   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                    State Management (React)                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                   API Service Layer (Axios)                     │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                   ┌────────────────────────────────────┐
                   │        Cloudflare Workers          │
                   ├────────────────────────────────────┤
                   │ ┌────────────────────────────────┐ │
                   │ │         Auth Service           │ │
                   │ ├────────────────────────────────┤ │
                   │ │       Transaction Service      │ │
                   │ ├────────────────────────────────┤ │
                   │ │        Budget Service          │ │
                   │ ├────────────────────────────────┤ │
                   │ │      Investment Service        │ │
                   │ ├────────────────────────────────┤ │
                   │ │       Receipt Service          │ │
                   │ ├────────────────────────────────┤ │
                   │ │        AI Advisor API          │ │
                   │ ├────────────────────────────────┤ │
                   │ │      Reporting Service         │ │
                   │ ├────────────────────────────────┤ │
                   │ │     Subscription Service       │ │
                   │ └────────────────────────────────┘ │
                   └────────────────────────────────────┘
                                    │
              ┌─────────────────────────────────────────────────┐
              │              DATA & STORAGE SERVICES            │
              ├─────────────────────────┬───────────────────────┤
              │                         │                       │
       ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
       │   Cloudflare D1  │    │   Cloudflare R2  │    │   Third-Party    │
       │   (Database)     │    │   (File Storage) │    │    Services      │
       │                  │    │                  │    │                  │
       │ - Users          │    │ - Receipt Images │    │ - OpenAI GPT-5   │
       │ - Transactions   │    │ - Profile Photos │    │ - Plaid API      │
       │ - Budgets        │    │                  │    │ - Stripe API     │
       │ - Investments    │    │                  │    │ - HubSpot API    │
       │ - Receipts       │    │                  │    │                  │
       │ - Subscriptions  │    │                  │    │                  │
       └──────────────────┘    └──────────────────┘    └──────────────────┘
```

## 3. Technology Stack

### 3.1 Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Charts**: Recharts
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod

### 3.2 Backend
- **Platform**: Cloudflare Workers
- **Runtime**: Node.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Authentication**: JWT-based with secure token handling

### 3.3 APIs & Services
- **AI Advisory**: OpenAI GPT-5
- **Bank Sync**: Plaid API (future implementation)
- **Payments**: Stripe API
- **Email**: HubSpot API
- **Analytics**: Google Analytics 4 (future)
- **Error Tracking**: Sentry (future)

### 3.4 Development & Deployment
- **Package Manager**: npm
- **Testing**: Jest (unit), Cypress (E2E)
- **Linting**: ESLint with TypeScript plugin
- **Formatting**: Prettier
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions (assumed)

## 4. Data Models

### 4.1 Users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 Transactions
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  type TEXT NOT NULL, -- 'income', 'expense', 'transfer'
  category TEXT,
  description TEXT,
  date DATE NOT NULL,
  account_id TEXT,
  receipt_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (receipt_id) REFERENCES receipts(id)
);
```

### 4.3 Budgets
```sql
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  amount REAL NOT NULL,
  period TEXT NOT NULL, -- 'monthly', 'weekly', 'yearly'
  start_date DATE NOT NULL,
  end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.4 Investments
```sql
CREATE TABLE investments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'stock', 'bond', 'mutual_fund', 'etf', 'real_estate'
  symbol TEXT,
  shares REAL,
  purchase_price REAL,
  current_price REAL,
  purchase_date DATE NOT NULL,
  broker TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.5 Receipts
```sql
CREATE TABLE receipts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_key TEXT NOT NULL, -- Key in Cloudflare R2
  amount REAL,
  currency TEXT DEFAULT 'USD',
  merchant TEXT,
  date DATE,
  category TEXT,
  ocr_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4.6 Subscriptions
```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- 'free', 'basic', 'premium', 'premium_annual'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL, -- 'active', 'cancelled', 'past_due'
  current_period_start DATETIME,
  current_period_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 5. API Specifications

### 5.1 Authentication API

#### POST /api/auth/signup
Creates a new user account
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}

// Response (Success)
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification.",
  "data": {
    "userId": "uuid-string",
    "email": "user@example.com"
  }
}

// Response (Error)
{
  "success": false,
  "error": "Email already exists"
}
```

#### POST /api/auth/login
Authenticates a user and returns a JWT token
```json
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response (Success)
{
  "success": true,
  "data": {
    "token": "jwt-token-string",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}

// Response (Error)
{
  "success": false,
  "error": "Invalid email or password"
}
```

#### POST /api/auth/forgot-password
Initiates password reset process
```json
// Request
{
  "email": "user@example.com"
}

// Response (Success)
{
  "success": true,
  "message": "If an account exists with that email, you will receive a password reset link shortly."
}
```

#### POST /api/auth/reset-password
Resets user password
```json
// Request
{
  "token": "reset-token-string",
  "newPassword": "NewSecurePass123"
}

// Response (Success)
{
  "success": true,
  "message": "Password reset successfully. You can now log in with your new password."
}

// Response (Error)
{
  "success": false,
  "error": "Invalid or expired reset token"
}
```

### 5.2 Transaction API

#### GET /api/transactions
Retrieves user transactions with optional filters
```json
// Request (Query Parameters)
?page=1&limit=20&startDate=2023-01-01&endDate=2023-12-31&category=groceries

// Response (Success)
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid-string",
        "amount": 45.99,
        "currency": "USD",
        "type": "expense",
        "category": "groceries",
        "description": "Weekly groceries",
        "date": "2023-06-15",
        "accountId": "account-uuid",
        "receiptId": "receipt-uuid",
        "createdAt": "2023-06-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

#### POST /api/transactions
Creates a new transaction
```json
// Request
{
  "amount": 45.99,
  "currency": "USD",
  "type": "expense",
  "category": "groceries",
  "description": "Weekly groceries",
  "date": "2023-06-15",
  "accountId": "account-uuid"
}

// Response (Success)
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "amount": 45.99,
    "currency": "USD",
    "type": "expense",
    "category": "groceries",
    "description": "Weekly groceries",
    "date": "2023-06-15",
    "accountId": "account-uuid",
    "createdAt": "2023-06-15T10:30:00Z"
  }
}
```

### 5.3 Budget API

#### GET /api/budgets
Retrieves user budgets
```json
// Response (Success)
{
  "success": true,
  "data": [
    {
      "id": "budget-uuid",
      "name": "Groceries",
      "category": "food",
      "amount": 400.00,
      "period": "monthly",
      "startDate": "2023-06-01",
      "endDate": "2023-06-30",
      "spent": 245.50,
      "remaining": 154.50,
      "progress": 61.4
    }
  ]
}
```

#### POST /api/budgets
Creates a new budget
```json
// Request
{
  "name": "Groceries",
  "category": "food",
  "amount": 400.00,
  "period": "monthly",
  "startDate": "2023-06-01"
}

// Response (Success)
{
  "success": true,
  "data": {
    "id": "budget-uuid",
    "name": "Groceries",
    "category": "food",
    "amount": 400.00,
    "period": "monthly",
    "startDate": "2023-06-01",
    "endDate": "2023-06-30"
  }
}
```

### 5.4 Investment API

#### GET /api/investments
Retrieves user investments
```json
// Response (Success)
{
  "success": true,
  "data": [
    {
      "id": "investment-uuid",
      "name": "Vanguard S&P 500 ETF",
      "type": "etf",
      "symbol": "VOO",
      "shares": 10.5,
      "purchasePrice": 380.25,
      "currentPrice": 410.75,
      "purchaseDate": "2022-01-15",
      "broker": "Fidelity",
      "value": 4312.88,
      "gainLoss": 320.25,
      "gainLossPercentage": 8.42
    }
  ]
}
```

### 5.5 Receipt API

#### POST /api/receipts/upload
Uploads a receipt image
```json
// Request (multipart/form-data)
// File field: receiptImage

// Response (Success)
{
  "success": true,
  "data": {
    "id": "receipt-uuid",
    "filename": "receipt.jpg",
    "fileKey": "receipts/user-id/receipt.jpg",
    "ocrText": "Extracted text from receipt",
    "amount": 45.99,
    "merchant": "Whole Foods",
    "date": "2023-06-15",
    "category": "groceries"
  }
}
```

### 5.6 AI Advisor API

#### POST /api/ai/advisor
Gets AI-powered financial advice
```json
// Request
{
  "queryType": "budget_optimization", // or "investment_advice", "spending_analysis"
  "data": {
    // Query-specific data
  }
}

// Response (Success)
{
  "success": true,
  "data": {
    "advice": "Based on your spending patterns, consider reducing dining out expenses by 20% to increase savings.",
    "recommendations": [
      "Create a specific budget for restaurant spending",
      "Cook at home 3 more times per week",
      "Use meal planning to reduce food waste"
    ],
    "confidence": 0.85
  }
}
```

## 6. Implementation Guidelines

### 6.1 Security Best Practices
1. **Password Security**:
   - Use Web Crypto API for password hashing
   - Enforce strong password requirements (8+ chars, uppercase, lowercase, number)
   - Implement rate limiting on auth endpoints

2. **Data Protection**:
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement proper CORS policies
   - Sanitize all user inputs

3. **Authentication**:
   - Use JWT tokens with short expiration
   - Implement refresh token mechanism
   - Store tokens securely (HttpOnly cookies or localStorage with care)
   - Validate all protected routes

### 6.2 Performance Optimization
1. **Frontend**:
   - Implement code splitting for pages
   - Use React.memo for components
   - Optimize images and assets
   - Implement caching strategies

2. **Backend**:
   - Use database indexing for frequently queried fields
   - Implement pagination for large datasets
   - Cache API responses where appropriate
   - Optimize database queries

3. **Database**:
   - Create indexes on foreign keys and frequently queried columns
   - Use efficient query patterns
   - Monitor query performance

### 6.3 Error Handling
1. **Consistent Error Format**:
   ```json
   {
     "success": false,
     "error": "Human-readable error message",
     "errorCode": "MACHINE_READABLE_CODE"
   }
   ```

2. **Error Logging**:
   - Log all server errors with context
   - Don't expose sensitive information in error messages
   - Implement proper error boundaries in React

### 6.4 Testing Strategy
1. **Unit Tests**:
   - Test all utility functions
   - Test validation logic
   - Test business logic components
   - Target 90%+ code coverage

2. **Integration Tests**:
   - Test API endpoints
   - Test database operations
   - Test authentication flows

3. **End-to-End Tests**:
   - Test user registration flow
   - Test login/logout flows
   - Test core feature workflows
   - Test error scenarios

## 7. Deployment Architecture

### 7.1 Cloudflare Pages Deployment
- Static export for frontend
- Custom domain configuration
- PWA support for mobile installation
- Edge caching for performance

### 7.2 Cloudflare Workers
- Serverless functions for API endpoints
- Database operations through D1
- File storage through R2
- Authentication and authorization

### 7.3 Environment Configuration
```bash
# Required Environment Variables
NEXT_PUBLIC_HUBSPOT_API_KEY=your_hubspot_api_key
NEXT_PUBLIC_HUBSPOT_TEMPLATE_ID=your_email_template_id
OPENAI_API_KEY=your_openai_api_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 8. Monitoring & Observability

### 8.1 Error Tracking
- Sentry integration for frontend errors
- Structured logging in Cloudflare Workers
- Alerting for critical errors

### 8.2 Performance Monitoring
- Page load time tracking
- API response time monitoring
- Database query performance

### 8.3 User Analytics
- Google Analytics 4 for user behavior
- Feature usage tracking
- Conversion funnel analysis

## 9. Future Considerations

### 9.1 Scalability
- Database sharding strategy
- CDN implementation for assets
- Load balancing considerations
- Microservices architecture evaluation

### 9.2 Advanced Features
- Real-time collaboration
- Mobile app development (React Native)
- Machine learning for predictions
- Advanced reporting capabilities

### 9.3 Compliance
- GDPR compliance for European users
- SOC 2 certification preparation
- Financial data protection regulations

## 10. Appendices

### 10.1 File Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Main dashboard
│   ├── transactions/    # Transaction management
│   ├── budget/          # Budget management
│   ├── investments/     # Investment tracking
│   ├── receipts/        # Receipt management
│   ├── consultation/    # AI advisor interface
│   ├── subscription/    # Subscription management
│   └── ...              # Other pages
├── components/          # Shared React components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── transactions/    # Transaction components
│   ├── budget/          # Budget components
│   ├── investments/     # Investment components
│   ├── receipts/        # Receipt components
│   ├── ui/              # Generic UI components
│   └── ...              # Other component categories
├── lib/                 # Utility libraries
│   ├── auth.ts          # Authentication utilities
│   ├── db.ts            # Database utilities
│   ├── r2.ts            # Cloudflare R2 utilities
│   └── utils.ts         # General utilities
└── styles/              # Global styles
workers/
├── database-worker.js   # Cloudflare Worker for database operations
└── wrangler.toml        # Worker configuration
```

### 10.2 Development Workflow
1. Create feature branch from `main`
2. Implement functionality following this specification
3. Write unit and integration tests
4. Create pull request with description
5. Code review and approval
6. Merge to `main` and deploy

### 10.3 References
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Stripe API Documentation](https://stripe.com/docs/api)