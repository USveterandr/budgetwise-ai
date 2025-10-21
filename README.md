# BudgetWise AI

A comprehensive personal finance management application built with Next.js 15, TypeScript, and Cloudflare.

## Overview

BudgetWise AI is a modern personal finance application that helps users manage their finances, track expenses, monitor investments, and receive AI-powered financial advice. The application is designed to be deployed on Cloudflare Pages with Cloudflare Workers for backend services.

## Features

### Core Functionality
- User authentication with secure password handling
- Email verification workflow
- Password reset functionality
- Subscription plan management
- Transaction tracking
- Budget management
- Investment tracking
- Receipt management
- Financial consultations
- AI-powered financial insights

### Security Features
- Secure password hashing using Web Crypto API
- Password strength requirements
- Email verification
- Password reset with secure tokens
- Protected routes
- Client-side authentication

### Technical Features
- Progressive Web App (PWA) support
- Responsive design for all devices
- Static export for Cloudflare Pages deployment
- Cloudflare D1 database integration
- Cloudflare R2 storage integration

## Architecture

### Frontend
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Shadcn UI components
- Recharts for data visualization

### Backend
- Cloudflare Workers for serverless functions
- Cloudflare D1 (SQLite) for database
- Cloudflare R2 for file storage
- HubSpot for email sending

### Authentication
- Client-side JWT token storage
- Secure password hashing
- Email verification workflow
- Password reset functionality
- Protected routes

## Security Implementation

### Password Security
- Passwords are hashed using Web Crypto API SHA-256
- Password strength requirements (8+ characters, uppercase, lowercase, number)
- Secure login verification
- Password reset with secure tokens

### Email Verification
- Confirmation emails sent via HubSpot
- Secure token generation
- Verified email required for login

### Password Reset
- Secure token generation and validation
- One-hour token expiration
- Single-use tokens
- Privacy-preserving email verification

### API Security
- CORS configuration
- Secure error handling
- Protected routes

## Deployment

### Cloudflare Pages
- Static export deployment
- Custom domain support
- PWA installation capability

### Cloudflare Workers
- Database operations
- File storage
- Email sending
- Authentication services

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account
- HubSpot account (for email)

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

### Environment Variables
- `NEXT_PUBLIC_HUBSPOT_API_KEY` - HubSpot API key
- `NEXT_PUBLIC_HUBSPOT_TEMPLATE_ID` - Email template ID

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run deploy` - Deploy to Cloudflare Pages

## Testing

### Unit Tests
- Jest testing framework
- Test coverage for authentication functions
- Test coverage for password reset functions

### Integration Tests
- API endpoint testing
- Database operation testing

### End-to-End Tests
- User flow testing
- Feature integration testing

## Monitoring & Analytics

### Error Tracking
- Sentry integration planned

### Performance Monitoring
- Page load tracking
- API response monitoring

### User Analytics
- Google Analytics integration planned

## Roadmap

### Completed
- ✅ Secure password handling
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Protected routes
- ✅ Unit testing framework

### In Progress
- 🔧 Integration testing
- 🔧 Error tracking implementation

### Planned
- 📊 Monitoring and analytics
- 🔒 Additional security features
- 🚀 Advanced features
- 📚 Documentation and support

## Documentation

- [Production Readiness Summary](PRODUCTION_READINESS_SUMMARY.md)
- [Full Production Roadmap](FULL_PRODUCTION_ROADMAP.md)
- [Password Reset Implementation Plan](PASSWORD_RESET_IMPLEMENTATION_PLAN.md)
- [Password Reset Feature Summary](PASSWORD_RESET_FEATURE_SUMMARY.md)
- [Monitoring Implementation Plan](MONITORING_IMPLEMENTATION_PLAN.md)
- [Next Steps Implementation Guide](NEXT_STEPS_IMPLEMENTATION.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

MIT License

## Support

For support, please open an issue on GitHub or contact the development team.