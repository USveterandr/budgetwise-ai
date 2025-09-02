# BudgetWise AI Mobile Deployment Guide

## Overview
This guide covers the deployment process for BudgetWise AI mobile applications on iOS and Android platforms using Capacitor.

## Prerequisites

### For iOS Development
- macOS with Xcode installed
- Apple Developer Account ($99/year)
- iOS device or simulator for testing

### For Android Development
- Android Studio installed
- Google Play Console Account ($25 one-time fee)
- Android device or emulator for testing

## Project Structure
```
frontend/
├── ios/                    # iOS native project
├── android/                # Android native project
├── capacitor.config.json   # Capacitor configuration
└── build/                  # Web build output
```

## Building the Apps

### 1. Build the Web App
```bash
cd frontend
npm run build
```

### 2. Sync with Native Platforms
```bash
npx cap sync
```

### 3. Open in Native IDEs

#### iOS (Xcode)
```bash
npx cap open ios
```

#### Android (Android Studio)
```bash
npx cap open android
```

## iOS Deployment Steps

### 1. Configure App Settings in Xcode
- Open `frontend/ios/App/App.xcworkspace` in Xcode
- Update Bundle Identifier: `com.isaactrinidad.budgetwise`
- Set Team and Signing Certificate
- Configure App Icons and Launch Screen

### 2. Build for Device
- Select "Any iOS Device" as target
- Product → Archive
- Upload to App Store Connect

### 3. App Store Submission
- Create app listing in App Store Connect
- Add screenshots, description, keywords
- Submit for review

## Android Deployment Steps

### 1. Configure App Settings in Android Studio
- Open `frontend/android` in Android Studio
- Update `applicationId` in `app/build.gradle`
- Configure app icons and splash screen
- Set version code and version name

### 2. Generate Signed APK/AAB
- Build → Generate Signed Bundle/APK
- Create or use existing keystore
- Build release version

### 3. Google Play Store Submission
- Create app listing in Google Play Console
- Upload AAB file
- Add store listing details
- Submit for review

## Configuration Files

### capacitor.config.json
```json
{
  "appId": "com.isaactrinidad.budgetwise",
  "appName": "BudgetWise AI",
  "webDir": "build",
  "bundledWebRuntime": false,
  "server": {
    "url": "https://budgetwise-ai.pages.dev",
    "cleartext": true
  }
}
```

## Mobile-Specific Features

### Web App Redirect
- Automatically detects mobile devices
- Shows download banner for native apps
- Dismissible with localStorage persistence
- Links to App Store and Google Play (when published)

### Native Capabilities
- Camera access for receipt scanning
- Push notifications
- Biometric authentication
- Offline data storage
- Native navigation

## Testing

### iOS Testing
```bash
# Run on iOS simulator
npx cap run ios

# Run on connected iOS device
npx cap run ios --target="Your Device Name"
```

### Android Testing
```bash
# Run on Android emulator
npx cap run android

# Run on connected Android device
npx cap run android --target="device-id"
```

## Deployment Checklist

### Pre-Deployment
- [ ] Test on physical devices
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Validate app icons and splash screens
- [ ] Check app permissions

### iOS Deployment
- [ ] Configure provisioning profiles
- [ ] Set up App Store Connect listing
- [ ] Upload screenshots (required sizes)
- [ ] Write app description and keywords
- [ ] Submit for App Store review

### Android Deployment
- [ ] Generate signed release build
- [ ] Create Google Play Console listing
- [ ] Upload feature graphic and screenshots
- [ ] Configure content rating
- [ ] Submit for Google Play review

## Post-Deployment

### App Store Optimization (ASO)
- Monitor app store rankings
- Respond to user reviews
- Update keywords based on performance
- A/B test app store listings

### Analytics and Monitoring
- Implement crash reporting
- Track user engagement metrics
- Monitor app performance
- Set up push notification campaigns

## Maintenance

### Regular Updates
```bash
# Update web content
npm run build
npx cap sync

# Push updates to app stores
# iOS: Archive and upload via Xcode
# Android: Generate new AAB and upload
```

### Version Management
- Update version numbers in native projects
- Maintain changelog for app store updates
- Test thoroughly before each release

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Signing Issues**: Verify certificates and provisioning profiles
3. **API Connectivity**: Ensure CORS and SSL certificates are configured
4. **Performance**: Optimize bundle size and lazy loading

### Support Resources
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

## Next Steps

1. Set up Apple Developer and Google Play Console accounts
2. Configure app store listings with proper metadata
3. Test thoroughly on physical devices
4. Submit for app store review
5. Plan marketing and user acquisition strategy

The mobile apps are now ready for deployment to the App Store and Google Play Store!