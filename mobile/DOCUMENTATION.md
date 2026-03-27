# FindrHub Mobile App - Complete Documentation

This directory contains the complete React Native mobile application for FindrHub, built with Expo for easy cross-platform development and deployment.

## 📋 Quick Reference

| Need | File | Purpose |
|------|------|---------|
| **App Config** | `app.json` | Expo manifest, permissions, package name |
| **Build Config** | `eas.json` | EAS build profiles (dev, preview, production) |
| **TypeScript** | `tsconfig.json` | TypeScript compiler options |
| **Styling** | `tailwind.config.js` | Tailwind CSS theme colors for NativeWind |
| **Environment** | `.env.local` | API URLs, feature flags (create from `.env.example`) |
| **Constants** | `constants.ts` | API endpoints, app config, storage keys |
| **Utils** | `utils.ts` | Helper functions (fetch, format, validate) |
| **Hooks** | `hooks/useReports.ts` | React hooks for data fetching |
| **Navigation** | `app/_layout.tsx` | Root app layout, screen routing |
| **Home** | `app/index.tsx` | App home screen with main CTAs |
| **Report Lost** | `app/report-lost.tsx` | Form for reporting lost items |
| **Report Found** | `app/report-found.tsx` | Form for reporting found items |
| **Browse** | `app/browse.tsx` | List and filter lost/found items |
| **Item Detail** | `app/item-detail.tsx` | Single item details and contact form |
| **Build Guide** | `../EXPO_ANDROID_BUILD.md` | Complete build and distribution guide |
| **Setup Guide** | `../MOBILE_SETUP_GUIDE.md` | Step-by-step setup instructions |

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  FindrHub Mobile App                      │
│           Built with Expo + React Native                 │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼───┐         ┌────▼─────┐      ┌───▼────┐
    │ Home  │         │  Browse   │      │ Report │
    │Screen │         │  Screen   │      │ Screen │
    └───┬───┘         └────┬─────┘      └───┬────┘
        │                  │                │
        │◄─────────────────┴────────────────┤
        │ useReports Hook (Data Fetching)   │
        │◄────────────┬─────────────────────┤
        │             │                     │
    ┌───▼─────────────▼─────────────────────▼───┐
    │     API Client (constants.ts + utils.ts)  │
    │     Backend: http://localhost:3001        │
    └────────────────────────────────────────────┘
```

## 📱 Screen Structure

### 1. **Home Screen** (`app/index.tsx`)
- Shows three main CTAs:
  - 🔴 Report Lost Item
  - 🟢 Report Found Item
  - 🔍 Browse Items
- App branding and welcome message
- Statistics widget (optional)

### 2. **Report Lost** (`app/report-lost.tsx`)
- Text inputs: Title, Description, Location
- Photo upload placeholder
- Submit button

### 3. **Report Found** (`app/report-found.tsx`)
- Similar form to Report Lost
- Different title and styling for Found reports

### 4. **Browse** (`app/browse.tsx`)
- Lists all lost/found items
- Filter buttons: All, Lost, Found
- Shows item cards with image, title, location
- Tap to view details

### 5. **Item Detail** (`app/item-detail.tsx`)
- Full item information
- All images in gallery
- Contact form to message reporter
- Report/flag button

## 🔧 Configuration Files

### `app.json` - Expo Manifest
```json
{
  "expo": {
    "name": "FindrHub",
    "slug": "findrhub",
    "version": "1.0.0",
    "android": {
      "package": "com.findrhub.app",
      "versionCode": 1
    }
  }
}
```
Key fields:
- `package`: Android package name (must be unique)
- `versionCode`: Integer version (auto-incremented for Play Store)
- `permissions`: Android runtime permissions (CAMERA, INTERNET, etc.)

### `eas.json` - Build Profiles
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```
Profiles:
- **preview**: Tests APKs (fast build)
- **production**: Release APKs (optimized, for distribution)

### `.env.local` - Runtime Environment
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001
EXPO_PUBLIC_ENV=development
```
Variables prefixed with `EXPO_PUBLIC_` are embedded in app binary.

⚠️ **Never stored secrets here** - Use backend API calls for authentication.

## 🚀 Development Workflow

### 1. Start Development Server
```bash
npm run dev
```
- Starts Metro bundler
- Shows QR code
- Auto-reload on file changes

### 2. Test Changes
- Scan QR with Expo Go app
- Changes hot-reload instantly
- Check terminal for errors

### 3. Debug Issues
```bash
# View full logs
npm run dev

# Debug with console
console.log('Debug message');  // Appears in terminal
```

### 4. Build for Testing
```bash
# Preview build (fast testing)
npm run build:preview

# Takes ~10-15 minutes
# Outputs APK file path
```

### 5. Build for Release
```bash
# Production build (optimized)
npm run build:production

# Takes ~15-20 minutes
# Triggers GitHub Actions if tagged
```

## 📡 API Integration

### Making API Calls

Use the `apiCall` utility:
```typescript
import { apiCall } from '@/utils';

const data = await apiCall('/reports/search', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

Or use the `useReports` hook:
```typescript
import { useReports } from '@/hooks/useReports';

const { reports, loading, error } = useReports({ type: 'lost' });
```

### Environment Setup
1. Backend must be running: `http://localhost:3001` or your server URL
2. Set in `.env.local`: `EXPO_PUBLIC_API_URL=http://YOUR_IP:3001`
3. Use IP address if testing on physical device (not localhost)

## 🎨 Styling with NativeWind

The app uses NativeWind (Tailwind CSS for React Native). All theme colors are defined in `tailwind.config.js`.

### Color Palette
```
Primary (Teal):     #14b8a6 (from-teal-600)
Accent (Emerald):   #059669 (to-emerald-600)
Success (Green):    #22c55e
Error (Red):        #ef4444
Warning (Yellow):   #eab308
```

### Using Tailwind Classes
```tsx
<View className="flex-1 bg-white p-4">
  <Text className="text-xl font-bold text-teal-600">Hello</Text>
  <Pressable className="bg-gradient-to-r from-teal-600 to-emerald-600 p-4 rounded-lg">
    <Text className="text-white font-semibold">Button</Text>
  </Pressable>
</View>
```

## 🏗️ Project Structure

```
mobile/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout (navigation setup)
│   ├── index.tsx                # Home screen
│   ├── report-lost.tsx          # Lost report form
│   ├── report-found.tsx         # Found report form
│   ├── browse.tsx               # Browse/search screen
│   └── item-detail.tsx          # Single item view
│
├── hooks/                        # Custom React hooks
│   └── useReports.ts            # Fetch reports data
│
├── app.json                      # Expo configuration
├── eas.json                      # EAS build profiles
├── tsconfig.json                # TypeScript config
├── tailwind.config.js           # Tailwind theme
├── babel.config.js              # Babel transformer config
├── metro.config.js              # Metro bundler config
├── nativewind.config.ts         # NativeWind setup
├── constants.ts                 # API endpoints, app config
├── utils.ts                     # Helper functions
├── .env.example                 # Environment template
├── .env.local                   # Local environment (git-ignored)
├── .gitignore                   # Git exclusions
├── package.json                 # Dependencies
└── README.md                    # Project README
```

## 🔐 Environment Security

### What's Public (Embedded in App)
- API URLs (prefixed with `EXPO_PUBLIC_`)
- Feature flags
- App configuration

### What's Secret (Never in App)
- API keys
- Private credentials
- Passwords

**Pattern**: Handle secrets via:
- Backend API endpoints
- Secure token storage on device
- System KeyChain/Keystore

## 📦 Building & Distribution

### Development → Preview Testing
```bash
npm run build:preview
# → APK for manual testing
```

### Preview → Production Release
```bash
npm run build:production
git tag v1.0.0
git push --tags
# → GitHub Actions builds APK
# → Uploaded to GitHub Releases
# → Users download APK for sideload
```

### GitHub Releases URL
```
https://github.com/Ozonelabrada/resqhub/releases/download/{TAG}/FindrHub.apk
```

## 🧪 Testing Checklist

- [ ] **Development**: Run `npm run dev`, test all screens on device
- [ ] **Preview APK**: Build and install on Android device
- [ ] **All Features**:
  - [ ] Report Lost Item form submission
  - [ ] Report Found Item form submission
  - [ ] Browse items with filters
  - [ ] View item details
  - [ ] Back navigation
  - [ ] Responsive on multiple screen sizes
- [ ] **Performance**: App responds quickly, no crashes
- [ ] **Offline**: Some screens load from cache
- [ ] **Permissions**: Camera/geolocation working
- [ ] **API Integration**: Connects to backend correctly

## 🆘 Troubleshooting

### "Cannot find module" Error
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Also clear Expo cache
npm run dev  # Press 'c' during dev server
```

### APK Build Fails
```bash
# Check Expo login
eas whoami

# Clear build cache
eas build --platform android --clear-cache

# View build logs
eas build --platform android --profile preview --logs
```

### API Requests Failing
1. Verify backend running: `curl http://localhost:3001`
2. Check `.env.local` has correct API_URL
3. If on device, use IP not localhost: `http://192.168.1.X:3001`
4. Check CORS headers in backend

### App Crashes on Startup
1. Check console: `npm run dev`
2. Review `.env.local` syntax
3. Verify API endpoint exists
4. Clear app cache: Uninstall and reinstall

## 📚 Additional Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev/docs/getting-started
- **NativeWind**: https://www.nativewind.dev/quick-starts/with-expo
- **Tailwind CSS**: https://tailwindcss.com/docs
- **EAS Build**: https://docs.expo.dev/build/introduction/

## 🚀 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup `.env.local` with API URL
3. ✅ Test on device: `npm run dev`
4. ✅ Build preview APK: `npm run build:preview`
5. ⏳ Add app icons to `assets/`
6. ⏳ Implement remaining screens
7. ⏳ Setup GitHub token for CI/CD
8. ⏳ Build and release v1.0.0

## 📞 Support

For issues or questions:
1. Check **Troubleshooting** section above
2. Review **MOBILE_SETUP_GUIDE.md** for step-by-step help
3. Check **EXPO_ANDROID_BUILD.md** for build-specific info
4. Review Expo/React Native docs

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Development
