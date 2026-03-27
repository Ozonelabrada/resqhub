# FindrHub Mobile App

React Native mobile application for FindrHub built with Expo. This app allows users to report lost/found items, browse listings, and manage their community presence on iOS and Android devices.

## 📱 Features

- **Report Lost Items**: File reports for missing items with photos and details
- **Report Found Items**: Share found items to help reunite them with owners
- **Browse Listings**: Search and filter lost/found items in your area
- **Push Notifications**: Get notified about matching items (iOS/Android)
- **Offline Support**: Limited functionality available without internet connection
- **Multi-language Support**: English, Tagalog, and Cebuano

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Expo CLI: `npm install -g eas-cli`
- Expo account (free): https://expo.dev
- Android device or emulator (for testing)

### Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Authenticate with Expo**:
   ```bash
   eas login
   # Follow prompts to login or create account
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```
   - Scan QR code with Expo Go app on your phone
   - App will reload as you make changes

## 📦 Building APK

### For Testing (Preview)

```bash
npm run build:preview
```

- Faster build time
- For internal testing on Android devices
- Outputs APK ready for manual sideloading

### For Production Release

```bash
npm run build:production
```

- Optimized build
- For distributing via GitHub Releases
- Outputs production-ready APK

### Automated Builds with GitHub Actions

Push a version tag to trigger automatic build:

```bash
git tag v1.0.0
git push --tags
```

GitHub Actions will:
1. Build the APK automatically
2. Upload to GitHub Releases
3. Available for download

**Setup Required**:
- Add `EXPO_TOKEN` to GitHub Secrets:
  1. Run `eas secret create --scope project --name EXPO_TOKEN`
  2. Follow prompts to generate token
  3. Copy token to GitHub Secrets (Settings → Secrets and variables → Actions)

## 🏗️ Project Structure

```
mobile/
├── app/
│   ├── _layout.tsx       # Root navigation setup
│   └── index.tsx         # Home screen
├── app.json              # Expo app manifest
├── eas.json              # Build profiles
├── tsconfig.json         # TypeScript config
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler config
├── package.json          # Dependencies
└── assets/               # App icons, splash screens
```

## 🔧 Configuration

### app.json

Modify app configuration:
- **Package Name**: Change `com.findrhub.app` for app identification
- **Version**: Update version code and name for releases
- **Permissions**: Android permissions for camera, geolocation, etc.
- **Icons**: Update paths to 1024x1024 icons

### eas.json

Build profiles:
- **development**: Dev client mode for rapid iteration
- **preview**: APK for testing (faster builds)
- **production**: Release build (optimized, signed)

## 📝 Environment Variables

All variables prefixed with `EXPO_PUBLIC_` are available to the app:

```
EXPO_PUBLIC_API_URL=        # Backend API URL
EXPO_PUBLIC_ENABLE_*=       # Feature flags
```

⚠️ **Public variables**: Don't store secrets here; use backend API calls instead.

## 🧪 Testing

### Local Testing

```bash
npm run dev
```

Scan QR with:
- Android: Expo Go app
- iOS: iPhone camera app

### Device Testing

```bash
eas build --platform android --profile preview
```

Download APK and sideload on Android device (Settings → Security → Unknown Sources)

## 🛠️ Troubleshooting

### Build Fails

1. **Clear cache**:
   ```bash
   rm -rf node_modules
   npm install
   eas build --platform android --clear-cache
   ```

2. **Check Expo login**:
   ```bash
   eas whoami
   ```

3. **Review logs**:
   ```bash
   eas build --platform android --profile preview --logs
   ```

### App Won't Start

1. **Check .env.local**: Verify API URL is correct
2. **Metro bundler**: Restart with `npm run dev`
3. **Device cache**: Clear app data and reinstall

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [NativeWind (Tailwind for React Native)](https://www.nativewind.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## 🤝 Contributing

- Follow the same coding standards as the web app
- Use TypeScript for type safety
- Test on multiple screen sizes
- Use theme colors from parent app

## 📄 License

Same as parent project (FindrHub)
