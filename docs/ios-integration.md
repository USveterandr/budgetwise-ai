# iOS Integration Guide for Clerk

## Overview

This guide will help you integrate Clerk authentication into your iOS application for BudgetWise AI.

## Prerequisites

- Xcode 12.0 or later
- iOS 14.0 or later
- A Clerk account with a Native application configured

## Setup Instructions

### 1. Create an iOS Project

To get started using Clerk with iOS, create a new project in Xcode. Select SwiftUI as your interface and Swift as your language. See the Xcode documentation for more information.

### 2. Install the Clerk iOS SDK

Follow the Swift Package Manager instructions to install Clerk as a dependency. When prompted for the package URL, enter `https://github.com/clerk/clerk-ios`. Be sure to add the package to your target.

### 3. Add Your Native Application

Add your iOS application to the Native applications page in the Clerk Dashboard. You will need your iOS app's App ID Prefix and Bundle ID.

### 4. Add Associated Domain Capability

To enable seamless authentication flows, you need to add an associated domain capability to your iOS app. This allows your app to work with Clerk's authentication services.

In Xcode:
1. Select your project in the Project Navigator
2. Select your app target
3. Under the Signing & Capabilities tab, select the + Capability option to add a new capability
4. Search for and add Associated Domains
5. Under Associated Domains, add a new entry with the value: `webcredentials:{YOUR_FRONTEND_API_URL}`

**Note:** Replace `{YOUR_FRONTEND_API_URL}` with your Frontend API URL, which can be found on the Native applications page in the Clerk Dashboard.

### 5. Load Clerk

To use Clerk in your app, you must first configure and load Clerk.

Inside your new project in Xcode, open your `@main` app file:

```swift
import SwiftUI
import Clerk

@main
struct ClerkQuickstartApp: App {
  @State private var clerk = Clerk.shared

  var body: some Scene {
    WindowGroup {
      ContentView()
        .environment(\.clerk, clerk)
        .task {
          clerk.configure(publishableKey: "pk_test_YWN0aXZlLWVmdC0xNC5jbGVyay5hY2NvdW50cy5kZXYk")
          try? await clerk.load()
        }
  }
}
```

### 6. Conditionally Render Content

To render content based on whether a user is authenticated or not, open your `ContentView` file:

```swift
import SwiftUI
import Clerk

struct ContentView: View {
  @Environment(\.clerk) private var clerk

  var body: some View {
    VStack {
      if let user = clerk.user {
        Text("Hello, \(user.firstName ?? 'User')")
      } else {
        Text("You are signed out")
      }
    }
  }
}
```

### 7. Add Clerk Components to Your App

Clerk provides prebuilt SwiftUI components that handle authentication flows and user management:

```swift
import SwiftUI
import Clerk

struct ContentView: View {
  @Environment(\.clerk) private var clerk
  @State private var authIsPresented = false

  var body: some View {
    VStack {
      if clerk.user != nil {
        UserButton()
          .frame(width: 36, height: 36)
      } else {
        Button("Sign in") {
          authIsPresented = true
        }
      }
    }
    .sheet(isPresented: $authIsPresented) {
      AuthView()
    }
  }
}
```

## Create Your First User

Run your project. When you tap "Sign in", the AuthView will appear, allowing you to sign up or sign in.

## Next Steps

- Review the [Clerk iOS SDK Reference](https://clerk.dev/docs/reference/clerk-ios) for detailed information about available classes and methods
- Implement custom authentication flows as needed for your application
- Configure additional OAuth providers in the Clerk Dashboard

## Troubleshooting

### Native API Not Enabled

Ensure that the Native API is enabled to integrate Clerk in your native application. In the Clerk Dashboard, navigate to the Native applications page.

### Common Issues

1. **Associated Domains Not Configured**: Double-check that you've added the correct associated domain in Xcode
2. **Publishable Key Incorrect**: Verify that you're using the correct publishable key from the Clerk Dashboard
3. **Network Issues**: Ensure your development environment has internet access

## Support

For additional help, refer to the [Clerk Documentation](https://clerk.dev/docs) or contact support through the Clerk Dashboard.