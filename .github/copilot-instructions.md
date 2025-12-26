# BudgetWise AI Coding Instructions

## Architecture Overview

### Frontend (Mobile/Web)
- **Framework:** React Native with Expo (Managed Workflow).
- **Navigation:** `expo-router` (File-based routing in `app/`).
- **Styling:** Standard React Native `StyleSheet` and `expo-linear-gradient`.
- **State Management:** React Context (`AuthContext`, `FinanceContext`, `NotificationContext`).
- **AI Integration:** Google Gemini via `services/geminiService`.

### Backend (API)
- **Platform:** Cloudflare Workers (`backend/`).
- **Database:** Cloudflare D1 (`budgetwise_db`).
- **Storage:** Cloudflare R2 (`budgetwise-assets`).
- **Authentication:** Clerk (Frontend) + Manual JWT Verification (Backend).

### Authentication Flow
1.  **Frontend:** User logs in via Clerk (`@clerk/clerk-expo`).
2.  **Sync:** `AuthContext.tsx` detects login, retrieves Clerk token, and syncs user profile to Cloudflare D1 via `cloudflare.updateProfile`.
3.  **Backend:** API endpoints in `backend/src/` verify Clerk JWTs using JWKS before allowing access.

## Backend Development (Cloudflare Workers)

### API Structure
- **Routing:** Manual routing via `url.pathname` and `request.method` checks (no router library).
- **CORS:** Apply `corsHeaders` to ALL responses manually.
- **Response:** Use `Response.json(data, { headers: corsHeaders })` for success.

### Database Access (D1)
- **Pattern:** Direct SQL execution via `env.DB`.
- **Read:** `await env.DB.prepare("SELECT ...").bind(params).all()` (returns `{ results }`).
- **Write:** `await env.DB.prepare("INSERT ...").bind(params).run()` (returns `{ success: true }`).
- **Security:** ALWAYS bind parameters `?` to prevent SQL injection.

### Auth Verification
- **Helper:** Use `verifyClerkToken(token, env)` for every protected route.
- **Flow:**
    1. Extract `Authorization: Bearer <token>`.
    2. Call `verifyClerkToken`.
    3. If valid, returns `userId` (Clerk ID).
    4. Use `userId` for all DB queries to ensure data isolation.

## AI Integration (Gemini)

### Service Layer (`services/geminiService.ts`)
- **Models:**
    - Chat/Advice: `gemini-1.5-pro` (Complex reasoning).
    - Vision/OCR: `gemini-1.5-flash` (Fast image processing).
- **System Instructions:** Defined in `SYSTEM_INSTRUCTION` constant (Persona: "BudgetWise AI").

### Prompt Engineering Patterns
- **Context Injection:** Append user financial data (net worth, transactions) as a string to the prompt: `User Context: ${userContext}`.
- **Structured Output:** For tools like receipt scanning, explicitly request "Return JSON only" in the prompt.
- **Safety:** Handle API errors gracefully with fallback messages ("I'm having trouble connecting...").

## Critical Workflows

### Development
- **Frontend:** `npm run dev` (Starts Expo Go/Web).
- **Web Server:** `npm run start` (Runs Express server for production build preview).
- **Backend:** Use `wrangler` commands in `backend/` directory.

### Deployment
- **Web:** Built via `npm run build` (exports to `dist`), served via Express (`server.js`) in a Docker container.
- **Mobile:** Standard EAS Build workflows (`eas.json`).

## Project Conventions

### Navigation & Routing
- **Structure:** Routes defined in `app/`.
- **Protection:** `app/_layout.tsx` handles global auth guards.
- **Groups:**
    - `(auth)`: Public authentication screens (Login, Signup).
    - `(tabs)`: Protected main app screens (Dashboard, Budget, etc.).
    - `onboarding`: Post-signup setup flow.

### Data Fetching
- **Pattern:** Use `services/` for API calls.
- **Auth:** Always pass the Clerk token (retrieved via `getToken()`) in the `Authorization` header for backend requests.

### Styling
- **Approach:** Use `StyleSheet.create` for performance and type safety.
- **Colors:** Reference `constants/Colors.ts` for theme consistency.
- **Icons:** Use `@expo/vector-icons` (Ionicons preferred).

### AI Components
- **Integration:** `AiAdvisor.tsx` consumes `geminiService`.
- **Context:** AI prompts should be enriched with data from `FinanceContext` (transactions, net worth) to provide personalized advice.

## Common Pitfalls
- **Auth Sync:** Ensure `AuthContext` has finished syncing with D1 (`initialized` state) before rendering protected routes to avoid race conditions.
- **Backend Auth:** When modifying backend, ensure `verifyClerkToken` is called for protected routes.
- **Environment:** Clerk keys and API URLs must be set in `.env` and `app.json` (extra config).
