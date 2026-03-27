# Mobile App Setup Guide

Complete step-by-step instructions for setting up the FindrHub mobile app development environment.

## Phase 1: Initial Setup (5 minutes)

### 1.1 Install Dependencies

```bash
cd mobile
npm install
```

This installs all required packages from `mobile/package.json`:
- Expo framework
- React Native
- NativeWind (Tailwind for React Native)
- Navigation libraries
- EAS CLI for building

### 1.2 Create Environment File

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001  # Your backend API
EXPO_PUBLIC_ENV=development
```

ℹ️ Use your local machine's IP (not localhost) if testing on actual device

## Phase 2: Expo Account Setup (3 minutes)

### 2.1 Create Free Expo Account

Visit: https://expo.dev and sign up (free)

### 2.2 Login Locally

```bash
eas login
# Enter email and password
eas whoami  # Verify login
```

✅ You're now authenticated for building

## Phase 3: Development (Ongoing)

### 3.1 Start Development Server

```bash
npm run dev
```

Output will show:
```
│ Expo Go
│ Android:   Press 'a' to open Android Emulator
│ iOS:       Press 'i' to open iOS Simulator
│ Web:       Press 'w' to open web
│ Or scan QR code below
└─ ...
```

### 3.2 Test on Device

**Option A: Physical Device**
1. Install Expo Go app from Play Store
2. Scan QR code with app
3. App loads on your phone
4. Changes hot-reload as you edit code

**Option B: Android Emulator**
1. Press 'a' in dev server terminal
2. Emulator opens automatically
3. App loads
4. Changes hot-reload

### 3.3 View Logs

```bash
npm run dev
# Logs appear in terminal
# Or open DevTools: Press 'j' for Hermes debugger
```

## Phase 4: Building APK (For Testing)

### 4.1 Local Preview Build

Fast build for testing on your device:

```bash
npm run build:preview
```

This:
- Compiles React Native code
- Creates optimized APK
- Takes ~10-15 minutes
- Runs on your machine (no cloud)

After completion:
- APK path shown in terminal
- Download manually and sideload on Android

### 4.2 Sideload on Android Device

1. Download APK from build output
2. Enable "Unknown Sources" in Android Settings
3. Open file manager and tap APK
4. Install app
5. Grant permissions when prompted

✅ App is now installed and can be tested independently

## Phase 5: Production Build & Release (For Distribution)

### 5.1 Build Production APK

```bash
npm run build:production
```

This:
- Creates optimized, signed APK
- Suitable for distribution
- Takes ~15-20 minutes

### 5.2 Setup GitHub for Automated Builds

#### 5.2.1 Generate Expo Token

```bash
eas secret create --scope project --name EXPO_TOKEN
# Follow prompts
```

This creates a secure token for GitHub Actions to authenticate

#### 5.2.2 Add Token to GitHub

1. Go to: https://github.com/Ozonelabrada/resqhub/settings/secrets/actions
2. Click "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: Paste the token from step 5.2.1
5. Click "Add secret"

✅ GitHub can now build APKs automatically

### 5.3 Trigger Automated Build

```bash
git add .
git commit -m "Add mobile app setup and configs"
git tag v1.0.0
git push --tags
```

This:
- Pushes code and new tag
- GitHub Actions automatically triggered
- `.github/workflows/build-expo-android.yml` runs
- APK built in cloud
- Uploaded to GitHub Releases

### 5.4 Download and Test Release APK

1. Go to: https://github.com/Ozonelabrada/resqhub/releases
2. Find v1.0.0 release
3. Download FindrHub.apk
4. Sideload on Android device (as per Phase 4.2)
5. Test thoroughly

✅ You can now distribute this APK to users

## Phase 6: App Icons (Important for Release)

### 6.1 Prepare App Icon

Create or download a 1024x1024 PNG image of your app icon

### 6.2 Add to Mobile App

```bash
# Copy to mobile/assets/
cp your-icon.png mobile/assets/icon.png
```

Expo automatically:
- Resizes for all screen sizes
- Creates adaptive icons for Android
- Updates in all builds

ℹ️ **Icon Guidelines:**
- Minimum 1024x1024 pixels
- PNG format (transparent background recommended)
- Simple, recognizable logo
- No rounded corners (Expo handles this)

## Phase 7: Testing Strategy

### 7.1 Development Testing

```bash
npm run dev
# Use Expo Go on physical device or emulator
# Test features as you work
# Hot-reload for fast iteration
```

### 7.2 Pre-Release Testing

```bash
npm run build:preview
# Sideload APK on device
# Test without Expo Go (more realistic)
# Test all features end-to-end
# Check performance
```

### 7.3 Release Testing

```bash
npm run build:production
# Same as preview, but optimized
# Run on multiple Android devices if possible
# Test on different screen sizes
```

## Phase 8: Handling Errors

### Build Fails: "Could not find EXPO_TOKEN"

```bash
# Verify secret exists
eas secret list

# If not, create it
eas secret create --scope project --name EXPO_TOKEN

# Verify GitHub secret added
# Go to: Settings → Secrets and variables → Actions
```

### APK Won't Install

1. Enable "Unknown Sources" in Android Settings
2. Uninstall old version first
3. Ensure APK is from your device architecture (ARMv8 or x86)
4. Try from different device if available

### App Crashes on Launch

1. Check `.env.local` - verify API_URL is correct
2. Restart dev server: `npm run dev`
3. Clear cache: `eas build --platform android --clear-cache`
4. Check logs: `npm run dev` and look for errors

### API Requests Failing

```bash
# Verify backend is running
curl http://YOUR_IP:3001/health

# Update .env.local with correct IP
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001

# Restart dev server
npm run dev
```

## File Reference

### Created Files:
```
mobile/
├── tsconfig.json           ← TypeScript config
├── babel.config.js         ← Babel (JS transformer)
├── metro.config.js         ← Metro bundler config
├── tailwind.config.js      ← Tailwind CSS config
├── nativewind.config.ts    ← NativeWind config
├── constants.ts            ← API endpoints, app config
├── utils.ts                ← Utility functions
├── .env.example            ← Environment template
├── README.md               ← Project documentation
├── hooks/
│   └── useReports.ts       ← React hook for fetching reports
└── app/                    ← Expo Router app directory
    ├── _layout.tsx         ← Root navigation
    └── index.tsx           ← Home screen
```

## Next Steps

1. ✅ **Install dependencies** - `npm install`
2. ✅ **Setup Expo account** - Sign up at expo.dev
3. ✅ **Test development server** - `npm run dev`
4. ✅ **Create preview build** - `npm run build:preview`
5. ✅ **Setup GitHub token** - `eas secret create --name EXPO_TOKEN`
6. ✅ **Add app icons** - Place in `mobile/assets/`
7. ✅ **Create production build** - `npm run build:production`
8. ✅ **Tag and release** - `git tag v1.0.0 && git push --tags`
9. ⏳ **Develop mobile features** - Add screens and integrate API
10. ⏳ **Distribute to users** - GitHub Releases APK available for download

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Guide](https://reactnative.dev)
- [NativeWind Docs](https://www.nativewind.dev)
- [Expo Router Navigation](https://docs.expo.dev/routing/introduction/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
