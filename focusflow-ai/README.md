# FocusFlow AI - Productivity & Task Management App

A mobile-first productivity assistant powered by AI that helps users manage tasks, goals, and calendars efficiently.

## 🚀 Features

### MVP Features
- ✅ User Authentication (Email + Google Sign-In)
- ✅ Task Management with Priorities (Low, Medium, High)
- ✅ Goal Tracking with Milestones
- ✅ Calendar View with Events
- ✅ Smart Notifications & Reminders
- ✅ AI-Powered Daily Planning
- ✅ Productivity Insights & Analytics

### Planned Features
- 🔄 Calendar Sync (Google, Apple, Outlook)
- 🔄 Voice Commands (Phase 2)
- 🔄 Advanced AI Suggestions
- 🔄 Team Collaboration
- 🔄 Advanced Analytics Dashboard

## 🏗️ Architecture

### Clean Architecture Pattern
```
focusflow-ai/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── TaskCard.tsx
│   │   ├── GoalProgress.tsx
│   │   └── CalendarEvent.tsx
│   ├── screens/             # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── SignupScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── GoalsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/            # Business logic & API calls
│   │   ├── database.ts      # Firebase Firestore operations
│   │   ├── aiService.ts     # OpenAI integration
│   │   ├── notificationService.ts  # Push notifications
│   │   └── calendarSyncService.ts   # Calendar integrations
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx
│   ├── navigation/          # React Navigation setup
│   │   └── AppNavigator.tsx
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── App.tsx                  # Main app entry point
├── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tabs)
- **Language**: TypeScript
- **State Management**: React Context API

### Backend
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Push Notifications**: Firebase Cloud Messaging
- **Cloud Functions**: Firebase Functions (for backend logic)

### AI Integration
- **AI Provider**: OpenAI API (GPT-4o-mini)
- **Use Cases**: Daily planning, productivity insights, task suggestions

### Calendar Integrations
- **Google Calendar**: Google Calendar API
- **Outlook Calendar**: Microsoft Graph API
- **Apple Calendar**: Native iOS integration (planned)

## 📱 Key Components

### 1. Authentication System
- Email/password authentication
- Google Sign-In integration
- Secure session management

### 2. Task Management
- CRUD operations for tasks
- Priority levels (Low, Medium, High)
- Due dates and deadlines
- Task completion tracking

### 3. Goal Tracking
- Goal creation with descriptions
- Milestone system
- Progress tracking (0-100%)
- Target date setting

### 4. Calendar Integration
- Event creation and management
- Multiple calendar sync
- Event reminders
- Visual calendar view

### 5. AI-Powered Features
- **Daily Planning**: Prioritizes tasks based on goals and deadlines
- **Productivity Insights**: Analyzes completion patterns
- **Smart Suggestions**: Provides actionable recommendations
- **Motivational Messages**: Encourages productivity

### 6. Notification System
- Task reminders
- Daily planning reminders
- Goal check-ins
- Productivity tips

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI
- Firebase account
- OpenAI API key
- Google Cloud Console account (for Google Calendar)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd focusflow-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your-openai-api-key
   FIREBASE_API_KEY=your-firebase-api-key
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   FIREBASE_APP_ID=your-app-id
   ```

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication (Email and Google providers)
   - Create Firestore database
   - Set up Cloud Messaging for push notifications
   - Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

5. **Run the app**
   ```bash
   # Start Expo development server
   npm start

   # Run on iOS simulator
   npm run ios

   # Run on Android emulator
   npm run android
   ```

## 🎯 Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
}
```

### Tasks Collection
```typescript
{
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Goals Collection
```typescript
{
  id: string;
  title: string;
  description?: string;
  targetDate?: string;
  progress: number; // 0-100
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Milestones Collection
```typescript
{
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  goalId: string;
}
```

### CalendarEvents Collection
```typescript
{
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  userId: string;
  source: 'google' | 'apple' | 'outlook' | 'manual';
  createdAt: Timestamp;
}
```

## 🔐 Security

- Firebase Authentication for secure user management
- Firestore security rules for data protection
- Environment variables for API keys
- Secure token handling for calendar integrations

## 📊 AI Features

### Daily Planning
Analyzes tasks and goals to generate prioritized daily plans with:
- Top 3-5 prioritized tasks
- Productivity suggestions
- Time estimates
- Motivational messages

### Productivity Insights
Weekly analysis providing:
- Productivity score (0-100)
- Strengths and weaknesses
- Actionable recommendations
- Performance trends

### Smart Suggestions
Context-aware suggestions for:
- Task prioritization
- Time management
- Goal alignment
- Productivity improvements

## 🎨 UI/UX Principles

- **Mobile-first design**: Optimized for mobile devices
- **Clean interface**: Minimalist design with focus on content
- **Intuitive navigation**: Easy-to-use tab-based navigation
- **Accessible**: High contrast colors and readable fonts
- **Responsive**: Adapts to different screen sizes

## 🚀 Deployment

### Production Build
```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to App Store
eas submit --platform ios

# Submit to Play Store
eas submit --platform android
```

### Firebase Deployment
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Firebase for backend services
- Expo for React Native framework
- React Navigation for navigation library
