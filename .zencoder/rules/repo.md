---
description: Repository Information Overview
alwaysApply: true
---

# BudgetWise AI Information

## Summary
BudgetWise AI is an AI-powered personal finance tracker that serves as an AI Financial Advisor. The application helps users manage their budgets, track investments, and monitor subscriptions.

## Structure
- **budgetwise-app/**: Main application directory containing both client and server code
  - **client/**: React frontend application
  - **server/**: Express.js backend server
  - **firebase/**: Firebase configuration and rules
- **images/**: Contains application logos and images
- **GoogleService-Info.plist**: iOS Firebase configuration file

## Language & Runtime
**Language**: JavaScript (Node.js for backend, React for frontend)
**Version**: Node.js (implied latest stable)
**Build System**: npm
**Package Manager**: npm

## Dependencies

### Server Dependencies
**Main Dependencies**:
- express: ^4.18.2 (Web framework)
- mongoose: ^8.0.2 (MongoDB ODM)
- bcryptjs: ^2.4.3 (Password hashing)
- jsonwebtoken: ^9.0.2 (Authentication)
- dotenv: ^16.3.1 (Environment variables)

**Development Dependencies**:
- eslint: ^9.32.0 (Code linting)
- nodemon: ^3.1.10 (Development server)

### Client Dependencies
**Main Dependencies**:
- react: ^18.2.0 (UI library)
- react-dom: ^18.2.0 (DOM rendering)
- react-router-dom: ^7.7.1 (Routing)
- react-scripts: 5.0.1 (Build scripts)

**Development Dependencies**:
- @testing-library/jest-dom: ^6.6.4 (Testing utilities)
- @testing-library/react: ^16.3.0 (React testing)

## Build & Installation
```bash
# Install server dependencies
cd budgetwise-app
npm install

# Install client dependencies
cd client
npm install

# Run server in development mode
cd ..
npm run dev

# Run client in development mode
cd client
npm start

# Build client for production
cd client
npm run build
```

## Firebase Integration
The application uses Firebase for authentication and data storage, as evidenced by the firebase directory structure and GoogleService-Info.plist file.

## Testing
**Framework**: Jest with React Testing Library
**Test Location**: Client-side tests in respective component directories
**Configuration**: setupTests.js imports Jest DOM extensions
**Run Command**:
```bash
# Run client tests
cd budgetwise-app/client
npm test
```

## Application Structure
The application follows a typical MERN stack architecture with:
- React frontend with multiple pages (Dashboard, Budget, Investments, etc.)
- Express.js backend with RESTful API endpoints
- MongoDB database (implied by mongoose dependency)
- Firebase integration for authentication and possibly real-time features