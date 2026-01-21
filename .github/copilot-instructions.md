# BudgetWise AI Coding Instructions

## Architecture Overview

### Frontend (Expo / React Native)
- **Framework:** React Native with Expo (Managed Workflow), TypeScript.
- **Routing:** `expo-router` (File-based routing in `app/`).
- **State Management:** React Context (`AuthContext`, `FinanceContext`, `InstallContext`).
- **Styling:** Standard `StyleSheet` and `expo-linear-gradient`. **No NativeWind.**
- **API Client:** `app/lib/cloudflare.ts` handles all backend communication.
- **AI Integration:** Google Gemini SDK (`@google/generative-ai`) used directly on the client via `services/geminiService.ts`.

### Backend (Cloudflare Workers)
- **Framework:** Hono (`backend/src/index.ts`).
- **Database:** Cloudflare D1 (accessed via `c.env.DB`).
- **Authentication:** Custom JWT implementation.
    - **Signup/Login:** `/api/auth/*` routes in backend.
    - **Middleware:** Tokens verified using `verify` from `jsonwebtoken` inside route handlers or middleware.
- **Project Root:** `backend/` directory.

## Critical Workflows

### Authentication Flow (Custom)
1.  **Login/Signup:** User interacts with `Login.tsx` / `signup.tsx`.
2.  **API Call:** `AuthContext` calls `cloudflare.login()` or `cloudflare.signup()` (`app/lib/cloudflare.ts`).
3.  **Token:** Backend returns a JWT. Frontend caches it using `tokenCache` (in `utils/tokenCache.ts`).
4.  **Protected Requests:** `cloudflare.ts` automatically attaches `Authorization: Bearer <token>` to requests (e.g., `getProfile`, `getTransactions`).

### Backend Development
- **Dev Command:** `wrangler dev` (inside `backend/`).
- **Deployment:** `wrangler deploy` (inside `backend/`).
- **Database Schema:** Managed in `backend/schema.sql`.
- **Bindings:** `DB`, `JWT_SECRET`, `GEMINI_API_KEY`, `RESEND_API_KEY` defined in `wrangler.toml`.

### AI Integration (Gemini)
- **Service:** `services/geminiService.ts`.
- **Keys:** Uses `EXPO_PUBLIC_GEMINI_API_KEY`.
- **Models:** 
    - Chat: `gemini-1.5-pro` (via `getFinancialAdvice`).
    - Vision/OCR: `gemini-1.5-flash` (via `parseReceiptImage`).
- **Pattern:** Client-side direct calls to Google Generative AI.

## Project Conventions

### Data Fetching
- **Strict Separation:** Always use `app/lib/cloudflare.ts` for API calls. Do not use `fetch` directly in components.
- **Error Handling:** API methods in `cloudflare.ts` throw errors with messages derived from the backend response. Components should wrap calls in `try/catch`.

### Styling & UI
- **Core Components:** React Native built-ins (`View`, `Text`, `TouchableOpacity`).
- **Colors:** Import `Colors` from `constants/Colors.ts`.
- **Icons:** `@expo/vector-icons` (Ionicons preferred).

### Database Access (D1 via Hono)
- **Querying:** Use `c.env.DB.prepare(...).bind(...).all()` (read) or `.run()` (write).
- **Safety:** Always verify ownership of data using `userId` extracted from the JWT.
- **IDs:** Use `nanoid` for generating unique IDs (Users, Transactions).

## Application Structure
- `app/` - Expo Router screens and layouts.
    - `(auth)/` - Public auth screens.
    - `(app)/` - Protected app tabs/screens.
- `components/` - Reusable UI components (e.g., `AiAdvisor.tsx`).
- `context/` - `AuthContext`, `FinanceContext` (Global state).
- `services/` - `geminiService` (AI), `revenueCatService` (IAP).
- `backend/` - Cloudflare Worker code.

## Troubleshooting
- **API Connection:** If `fetch` fails, ensure `process.env.EXPO_PUBLIC_API_URL` is set or fallback is correct in `app/lib/cloudflare.ts`.
- **Auth State:** `AuthContext` handles the "loading" state. Ensure usage of `if (loading) return ...` in protected layouts.
