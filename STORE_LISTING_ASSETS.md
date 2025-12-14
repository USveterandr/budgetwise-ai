# BudgetWise AI Store Listing Assets

This document provides specifications for all assets required for app store listings on Google Play Store and Apple App Store.

## Asset Inventory

### App Icons
- `assets/images/icon.png` - 512x512px (already exists)
- `assets/images/adaptive-icon.png` - For Android adaptive icons (already exists)
- `assets/images/favicon.png` - For web version (already exists)

### Google Play Store Assets (in `play_store_assets/`)
- `feature_graphic.jpeg` - 1024x500px (already exists)
- `screenshot_dashboard.png` - Phone screenshot (already exists)
- `screenshot_scanner.png` - Phone screenshot (already exists)

### Additional Assets Needed

#### Phone Screenshots (1080x1920)
1. `screenshot_ai_coach.png` - AI Financial Coach
2. `screenshot_receipt_scanner.png` - Smart Receipt Scanner
3. `screenshot_budgeting.png` - Smart Budgeting
4. `screenshot_investments.png` - Investment Tracker

#### Tablet Screenshots (7-inch)
1. `tablet_dashboard.png` - Multi-column dashboard layout
2. `tablet_reports.png` - Detailed reporting view

#### Feature Graphic (Updated)
Consider updating `feature_graphic.jpeg` with enhanced visuals:
- Better showcase of key features
- More prominent branding
- Improved visual hierarchy

## Asset Creation Guidelines

### Design Principles
- Maintain consistent color scheme: Dark theme (#0F172A to #1E1B4B) with purple accents (#7C3AED)
- Use clear, readable typography
- Showcase actual app UI rather than mockups
- Highlight unique selling points: AI insights, receipt scanning, investment tracking
- Ensure text is legible when previewed as thumbnails

### File Format Requirements
- Icons: PNG format with transparency
- Screenshots: PNG format for best quality
- Feature Graphics: JPEG or PNG (PNG preferred for quality)

### Localization Considerations
- Leave space for text overlays in different languages
- Avoid placing critical elements near edges where they might be cropped
- Consider text direction for RTL languages

## Implementation Notes

### Creating Screenshots
1. Use the actual app running on devices/emulators
2. Ensure all personal data is anonymized
3. Capture at device-native resolution
4. Apply device frames for professional presentation
5. Add annotations or callouts to highlight key features

### Uploading Assets
1. Google Play Console:
   - Upload to Store presence > Store listing
   - Minimum 2 screenshots required
   - Maximum 8 screenshots per type

2. Apple App Store Connect:
   - Upload to App Store > App Information > Screenshots
   - Different size requirements for various devices
   - Screenshot sets for different device families