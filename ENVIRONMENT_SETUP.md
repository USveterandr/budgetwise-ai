# Environment Setup Guide

## 🔒 Security Notice
This repository has been cleaned of sensitive information. The `.env` files containing API keys and secrets have been removed from the commit history to protect against security vulnerabilities.

## 📋 Required Environment Variables

### Backend Configuration (`/backend/.env`)
Create a `.env` file in the backend directory with the following variables:

```bash
# Database Configuration
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS Configuration  
CORS_ORIGINS="*"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"

# PayPal Integration (Optional)
PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret" 
PAYPAL_MODE="sandbox"

# SendGrid Email Service (Required for Phase 2)
SENDGRID_API_KEY="your-sendgrid-api-key-here"
SENDGRID_AUTH_TOKEN="your-sendgrid-auth-token-here"
SENDER_EMAIL="noreply@yourdomain.com"
```

### Frontend Configuration (`/frontend/.env`)
Create a `.env` file in the frontend directory with:

```bash
# Backend API URL
REACT_APP_BACKEND_URL=https://your-backend-url.com

# WebSocket Configuration
WDS_SOCKET_PORT=443

# PayPal Client ID (Optional)
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
```

## 🚀 Setup Instructions

### 1. Clone and Setup
```bash
git clone <your-repository-url>
cd budgetwise
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your actual values
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd ../frontend
yarn install
# Create .env file with your values
```

### 4. Required Services

#### SendGrid Setup (Phase 2 Email Features)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key with Mail Send permissions
3. Verify your sender email address
4. Add your API key to `SENDGRID_API_KEY`

#### PayPal Setup (Optional - Payment Features)
1. Create PayPal Developer account
2. Create sandbox/live application
3. Get Client ID and Secret
4. Add to environment variables

#### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update `MONGO_URL` with your connection string
3. The app will create collections automatically

## 🔧 Development Workflow

### Starting the Application
```bash
# Backend (from /backend directory)
python server.py

# Frontend (from /frontend directory)  
yarn start
```

### Available Features by Phase

**Phase 1**: Core registration, demo modal, dashboard
- No additional setup required

**Phase 2**: Email confirmation system
- Requires SendGrid configuration

**Phase 3**: Gamification system  
- No additional setup required

**Phase 4**: Camera & file uploads
- No additional setup required (uses local storage)

## 🛡️ Security Best Practices

### Never Commit Secrets
The `.gitignore` file now includes:
```
.env
.env.local
.env.development
.env.production
.env.test
backend/.env
frontend/.env
frontend/.env.local
```

### Use Environment Templates
- Always update `.env.example` when adding new variables
- Never include actual secrets in example files
- Document required vs optional variables

### GitHub Security
- Enable secret scanning on your repository
- Use GitHub Secrets for CI/CD pipelines
- Review commits before pushing

## 🔍 Troubleshooting

### GitHub Push Protection Errors
If you encounter secret scanning errors:

1. **Never push real secrets** to public repositories
2. **Use this guide** to set up environment properly
3. **If secrets are committed**: Use `git filter-branch` to clean history
4. **Alternative**: Create new repository and copy clean code

### Environment Issues
- Check file paths are correct (`backend/.env` not `.env`)
- Verify all required variables are set
- Use example files as templates
- Check for typos in variable names

### Service Connection Issues
- Verify API keys are valid and have correct permissions
- Check network connectivity to external services
- Validate environment variable values
- Review service-specific documentation

## 📞 Support

For environment setup issues:
1. Check this documentation first
2. Verify your `.env` files match the examples
3. Ensure all required services are configured
4. Test with minimal configuration first

## ✅ Verification Checklist

Before running the application:

- [ ] Backend `.env` file created with all required variables
- [ ] Frontend `.env` file created with backend URL
- [ ] SendGrid API key configured (if using email features)
- [ ] PayPal credentials configured (if using payment features)
- [ ] MongoDB connection string configured
- [ ] All dependencies installed (`pip install -r requirements.txt`, `yarn install`)
- [ ] No `.env` files committed to git
- [ ] `.env.example` files are up to date

---

**Security Note**: This application has been cleaned of all sensitive information. Always use your own API keys and never commit them to version control.