# Keystore Details

This document contains the details for the Android upload keystore used for signing the BudgetWise AI application.

## Keystore Information

- **File Path**: `/Users/isaactrinidad/upload-keystore.jks`
- **Alias**: `upload`
- **Store Password**: `android`
- **Key Password**: `android`

## Key Pair Details

- **Algorithm**: RSA
- **Key Size**: 2048 bits
- **Signature Algorithm**: SHA384withRSA
- **Validity Period**: 90 days

## Certificate Details

- **Distinguished Name (DN)**:
  - **Common Name (CN)**: Isaac Trinidad
  - **Organizational Unit (OU)**: Isaac Trinidad, LLC
  - **Organization (O)**: Isaac Trinidad, LLC
  - **Locality (L)**: Flowery Branch
  - **State (ST)**: Georgia
  - **Country (C)**: US

- **Validity Dates**:
  - **Issued On**: Dec 10, 2025
  - **Expires On**: Mar 10, 2026

## Usage Instructions

To use this keystore for Android app signing with Expo/EAS:

1. Reference this keystore in your `eas.json` configuration
2. Use the alias `upload` when prompted
3. Use `android` as both the store password and key password

Example EAS configuration:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "credentialsSource": "local"
      }
    }
  }
}
```

## Security Notes

- Store this keystore file securely
- Never commit this file to version control
- Keep passwords in a secure password manager
- Generate a new keystore for production releases with stronger passwords