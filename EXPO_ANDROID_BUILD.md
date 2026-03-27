# Expo Android APK Build Guide

This guide explains how to build and distribute FindrHub Android app using Expo.

## 📱 What Was Set Up

✅ **Expo Project** - Mobile app framework using React Native
✅ **EAS Build** - Expo Application Services for building APK
✅ **GitHub Actions** - Automated APK builds on version tags
✅ **Direct APK Download** - No Google Play required for distribution

## 🚀 Quick Start

### 1. Install Expo CLI
```bash
npm install -g eas-cli@latest
expo login
# Follow the prompts to login/create Expo account (free)
```

### 2. Build APK Locally (Testing)
```bash
cd mobile
npm install
eas build --platform android --profile preview
```

This creates a preview APK for testing.

### 3. Build Production APK (Release)
```bash
cd mobile
eas build --platform android --profile production --non-interactive
```

## 📦 Distribution

### Option A: GitHub Releases (Recommended - Free)

1. Create a Git tag and push:
```bash
git tag v1.0.0
git push --tags
```

2. GitHub Actions automatically:
   - Builds Android APK
   - Creates GitHub Release
   - Uploads APK file

Users download from:
```
https://github.com/Ozonelabrada/resqhub/releases/download/v1.0.0/FindrHub.apk
```

### Option B: Manual Build & Upload

1. Build locally:
```bash
cd mobile
eas build --platform android --profile production --non-interactive
```

2. Download APK from Expo dashboard

3. Upload to GitHub Release manually

## 🔑 Setup for CI/CD (GitHub Actions)

1. Create Expo Token:
   - Go to: https://expo.dev/settings/tokens
   - Create new token
   - Copy token

2. Add to GitHub Secrets:
   - Go to: https://github.com/Ozonelabrada/resqhub/settings/secrets/actions
   - Add new secret: `EXPO_TOKEN` = your token

3. GitHub Actions will automatically build on version tags

## 📋 Build Profiles

### Preview (for testing)
```json
{
  "preview": {
    "android": {
      "buildType": "apk"
    }
  }
}
```
- Faster build (~5-10 mins)
- For testing only
- Debug symbols included

### Production (for release)
```json
{
  "production": {
    "android": {
      "buildType": "apk"
    }
  }
}
```
- Optimized size
- Release mode
- Ready for distribution

## 🎯 APK Direct Download Setup

Users can now install directly without Google Play:

1. Download APK: `FindrHub.apk`
2. Open on Android device
3. Done! App installed

Benefits:
- ✅ No Google Play approval needed
- ✅ Instant distribution
- ✅ Full control over releases
- ✅ No store fees

## 🔗 Update Hero Banner

The hero section already includes:
```
APP_STORE_CONFIG.mobile.androidAPK.url
  → https://github.com/Ozonelabrada/resqhub/releases/download/latest/FindrHub.apk
```

Users can now access:
- **Google Play**: Full store listing (when published)
- **Direct APK**: No store needed (ready now)
- **iOS**: App Store (when published)

## 📊 Build Status

Check build status:
```bash
eas build:list
```

View build logs:
```bash
eas build:view <buildId>
```

## 🐛 Troubleshooting

**"eas: command not found"**
```bash
npm install -g eas-cli@latest
```

**"Not authenticated"**
```bash
eas logout
expo login
```

**"Build failed"**
- Check logs: `eas build:view <buildId>`
- Ensure `eas.json` is valid
- Check `app.json` configuration

## 🚀 Next Steps

1. **Generate Android Icons**
   - Place in `mobile/assets/icon.png` (1024x1024)
   - Place in `mobile/assets/adaptive-icon.png`

2. **Setup Expo Account** (free)
   - https://expo.dev
   - Create account
   - Generate token for CI/CD

3. **Create Release**
   - Tag version
   - Push to GitHub
   - GitHub Actions builds automatically

4. **Download & Test**
   - Get APK from GitHub Releases
   - Install on Android device
   - Test functionality

## 📚 Resources

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/eas-update/introduction/
- React Native: https://reactnative.dev
- NativeWind (Tailwind for React Native): https://www.nativewind.dev

---

**Created:** March 27, 2026
**Version:** 1.0.0
**Status:** Ready for testing
