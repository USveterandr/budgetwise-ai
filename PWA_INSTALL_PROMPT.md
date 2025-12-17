# PWA Install Prompt Feature

## Overview

The Budgetwise AI web app now includes a **Progressive Web App (PWA)** install prompt that encourages users to install the app on their devices for a native app-like experience.

## Features

### ✅ Smart Install Detection
- Automatically detects if the app is installable as a PWA
- Only shows on web browsers (not in native iOS/Android apps)
- Hides if the app is already installed
- Respects user preferences (remembers if dismissed)

### ✅ Beautiful Install Banner
- Modern, premium design matching the app aesthetic
- Appears 3 seconds after page load
- Shows at the bottom of the screen
- Includes:
  - App icon and download indicator
  - Clear "Install" call-to-action
  - "Dismiss" option

### ✅ User Experience
- **Install Button**: Triggers native browser install prompt
- **Dismiss Button**: Hides the banner for the current session
- **Auto-hide**: Disappears after successful installation
- **Non-intrusive**: Easy to dismiss if not interested

## How It Works

### 1. Detection
The component listens for the browser's `beforeinstallprompt` event, which indicates the app meets PWA installability criteria:
- ✅ Served over HTTPS
- ✅ Has a valid manifest.json
- ✅ Has a service worker registered
- ✅ Has appropriate icons

### 2. User Flow
```
User visits web app
  ↓
After 3 seconds, install banner appears
  ↓
User clicks "Install"
  ↓
Browser shows native install dialog
  ↓
User confirms installation
  ↓
App is added to home screen/app drawer
  ↓
Banner disappears
```

### 3. App Behavior After Install
- Opens in standalone mode (no browser UI)
- Has its own window/task in the app switcher
- Can work offline (if service worker is configured)
- Looks and feels like a native app

## PWA Manifest Configuration

The app's PWA manifest (in `app.json`) includes:

```json
{
  "name": "Budgetwise AI - Smart Finance Manager",
  "short_name": "Budgetwise AI",
  "description": "AI-powered personal finance management app...",
  "theme_color": "#7C3AED",
  "background_color": "#0F172A",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "categories": ["finance", "productivity"]
}
```

### Key Properties:
- **name**: Full app name shown during installation
- **short_name**: Name shown on home screen (12 chars max recommended)
- **theme_color**: Browser UI color (purple matching brand)
- **background_color**: Splash screen background
- **display**: `standalone` = full-screen app without browser UI
- **orientation**: Locked to portrait for better mobile UX

## Implementation Details

### Component Location
`components/InstallPrompt.tsx`

### Integration
Added to `app/_layout.tsx` at the root level so it appears on all pages.

### Browser Support
- ✅ Chrome/Edge (Android, Desktop)
- ✅ Safari (iOS 16.4+, requires Add to Home Screen)
- ✅ Firefox (with specific flags enabled)
- ❌ Not supported in incognito/private mode

### Platform Behavior

#### Web Browsers:
- Shows install prompt banner
- Uses browser's native install dialog
- App installs to device home screen

#### iOS Safari:
- Uses Safari's "Add to Home Screen" flow
- May require manual action (share button → Add to Home Screen)
- iOS 16.4+ has better PWA support

#### Android Chrome/Edge:
- Full PWA support
- Shows native install banner
- App appears in app drawer
- Can be uninstalled like any app

#### Native Apps (iOS/Android):
- Component doesn't render
- Users already have the app installed from stores

## Testing the Install Prompt

### Local Development (localhost:8081):
1. Open the app in Chrome/Edge
2. Wait 3 seconds
3. Install banner should appear at the bottom
4. Click "Install"
5. Follow browser prompts

**Note**: Some browsers don't support PWA installation on localhost. Test on a deployed HTTPS URL for best results.

### Production (budgetwise.isaac-trinidad.com):
1. Deploy the app to your domain
2. Ensure HTTPS is enabled
3. Visit the site in a supported browser
4. Install prompt should appear
5. After installation, app opens in standalone mode

## User Benefits

### Why Users Should Install:

1. **Quick Access**: App icon on home screen
2. **Native Experience**: Opens without browser UI
3. **Offline Support**: Works without internet (if configured)
4. **Push Notifications**: Can receive notifications (if enabled)
5. **Full Screen**: More screen space for content
6. **App Switcher**: Appears as separate app in task manager

## Customization

### Adjust Timing
Change delay before showing prompt (currently 3 seconds):
```typescript
// In InstallPrompt.tsx
setTimeout(() => setShowPrompt(true), 3000); // Change 3000 to desired ms
```

### Persistent Dismissal
Currently dismissal is per-session. To make it permanent:
```typescript
// Change expiry in localStorage
localStorage.setItem('install-prompt-dismissed', 'true');
// To: 
localStorage.setItem('install-prompt-dismissed-until', Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
```

### Styling
Modify `styles` object in `InstallPrompt.tsx` to match design preferences.

## SEO & Discoverability

PWAs can be:
- Listed in app stores (Microsoft Store, Google Play)
- Discovered through web search
- Installed without app store approval
- Updated automatically when you deploy new versions

## Future Enhancements

Potential features to add:
- [ ] Service worker for offline support
- [ ] Push notifications
- [ ] Background sync
- [ ] App shortcuts (jump to specific features)
- [ ] Badge API for unread counts
- [ ] Share target (receive shares from other apps)

## Resources

- [MDN: Making PWAs installable](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable)
- [web.dev: Install criteria](https://web.dev/install-criteria/)
- [Expo: Web PWAs](https://docs.expo.dev/guides/progressive-web-apps/)
