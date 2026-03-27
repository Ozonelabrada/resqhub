# Electron Desktop App Setup Guide

This guide explains how to build and distribute the FindrHub Windows desktop installer.

## What Was Set Up

✅ **Electron Configuration** - Main process to run React app as desktop app
✅ **electron-builder** - Automated Windows installer creation (NSIS)
✅ **GitHub Actions** - Automatic builds on version tags
✅ **GitHub Releases** - Free hosting for installers

## Installation Steps

### Step 1: Install Dependencies
```bash
npm install
```

This will install Electron, electron-builder, and electron-is-dev.

### Step 2: Test Electron Locally (Optional)

To test the Electron app locally:

```bash
# Start dev server in one terminal
npm run dev

# In another terminal, start Electron
npm run electron-dev
```

This will:
- Build the React app with Vite
- Start Electron pointing to your local dev server
- Allow you to test the desktop app locally

### Step 3: Build the Windows Installer

**Option A: Manual Build (Local)**
```bash
npm run build-electron-win
```

This creates `FindrHub-Setup.exe` in the `releases/` folder.

**Option B: Automatic Build (GitHub Actions)**

1. Create a git tag and push it:
```bash
git tag v1.0.0
git push --tags
```

2. GitHub Actions automatically:
   - Detects the tag
   - Builds the Windows installer
   - Creates a GitHub Release
   - Uploads the installer

The installer will be downloadable at:
```
https://github.com/Ozonelabrada/resqhub/releases/download/v1.0.0/FindrHub-Setup.exe
```

## How It Works

### For Users
1. User clicks "Windows" button in Download section
2. Browser downloads `FindrHub-Setup.exe` from GitHub Releases
3. User runs installer → app installed with Start Menu shortcuts
4. User can launch FindrHub like any desktop app

### For Developers

**Local Testing:**
```
npm run dev              # Terminal 1: Vite dev server
npm run electron-dev    # Terminal 2: Electron with dev app
```

**Building Release:**
```
npm run build-electron-win
# → Creates releases/FindrHub-Setup.exe
```

## Configuration

### Package Name & Version

Edit `package.json` `build` section:
```json
"build": {
  "productName": "FindrHub",           // App name in installer
  "version": "1.0.0",                  // Update this for new versions
  "appId": "com.findrhub.app",
  ...
}
```

### Installer Features (NSIS Config)

Current setup includes:
- ✅ Custom installation directory selection
- ✅ Desktop shortcut creation
- ✅ Start Menu shortcuts
- ✅ App icon
- ✅ 64-bit only

## Files Created/Modified

```
electron/
├── main.ts                    # Electron main process
├── preload.ts (optional)      # Preload script (security)
.github/workflows/
├── build-electron.yml         # GitHub Actions workflow
package.json                   # Added scripts & dependencies
tsconfig.electron.json         # TypeScript config for Electron
appStoreConfig.ts              # Updated Windows URL
```

## Troubleshooting

**"FindrHub-Setup.exe not found"**
- Run `npm run build-electron-win` first
- Check if `releases/` folder was created

**Electron won't start locally**
- Make sure `npm run dev` is running on http://localhost:5173
- Update vite port in `electron/main.ts` if you use different port

**GitHub Actions build failed**
- Check workflow logs in GitHub: Actions tab
- Ensure tags are pushed: `git push --tags`

## Next Steps

1. **Test locally:** Run `npm run dev` + `npm run electron-dev`
2. **Create first release:** `git tag v1.0.0 && git push --tags`
3. **Verify installer:** Download from GitHub Releases
4. **Update Windows URL:** Already set to GitHub Releases URL

## Important Notes

- Installer is built only on **Windows** (GitHub Actions uses `windows-latest`)
- For **macOS/Linux**, add additional OS matrices to workflow
- **Code signing**: Currently unsigned (shows warning). Add certificate for production
- **Auto-updates**: Not enabled. Can add with `electron-updater` if needed

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build React app only |
| `npm run electron-dev` | Test Electron locally |
| `npm run build-electron-win` | Build Windows installer |
| `npm run build-electron` | Build all platforms |

---

**GitHub Releases URL:** https://github.com/Ozonelabrada/resqhub/releases
