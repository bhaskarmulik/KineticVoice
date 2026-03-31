# Kinetic Voice - Build Instructions

## Building the Android APK

This app is now a **monolithic mobile application** where all logic runs on the device. The FastAPI backend is optional and only used if deployed separately.

### Option 1: EAS Build (Recommended - Cloud Build)

```bash
cd frontend

# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile production

# Or build locally
eas build --platform android --profile production --local
```

The APK will be available for download from the EAS dashboard or locally in the `dist/` folder.

### Option 2: Expo Classic Build

```bash
cd frontend

# Build APK
expo build:android -t apk

# Download the APK when complete
```

### Option 3: Local Android Build

**Prerequisites:**
- Android Studio installed
- Android SDK (API 34)
- Java JDK 11+
- Node.js 18+

```bash
cd frontend

# Generate Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Option 4: Docker Build

```bash
# Build the Docker image
docker build -t kinetic-voice-builder .

# Run the container to export the bundle
docker run -v $(pwd)/dist:/app/dist kinetic-voice-builder

# Note: Full APK build in Docker requires EAS authentication
```

## App Architecture (Monolithic)

The app is now **completely self-contained**:

### Core Features (100% On-Device)
- ✅ SQLite database for all activity storage
- ✅ GPS tracking with expo-location
- ✅ Voice recording with expo-av
- ✅ Direct Groq API calls for STT and LLM (no backend proxy)
- ✅ AI insights generated on-device
- ✅ All business logic in React Native services
- ✅ Works 100% offline (except voice AI requires internet)

### Optional Cloud Sync
- ⚙️ Firebase sync (if user provides credentials)
- ⚙️ Custom backend sync (if user wants to use the FastAPI backend)

The FastAPI backend is **NOT REQUIRED** for the app to function. It's only there as an optional cloud sync endpoint.

## Configuration

### App Configuration (app.json)

Key settings:
```json
{
  "expo": {
    "name": "Kinetic Voice",
    "slug": "kinetic-voice",
    "version": "1.0.0",
    "android": {
      "package": "com.kineticvoice.app",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "RECORD_AUDIO",
        "FOREGROUND_SERVICE"
      ]
    }
  }
}
```

### Environment Variables

The app requires NO backend URL since it's monolithic. Optional:

```env
# Optional: User can provide their own Groq key
GROQ_API_KEY=your-key-here

# Optional: Firebase configuration (if user wants cloud sync)
FIREBASE_API_KEY=your-firebase-key
FIREBASE_PROJECT_ID=your-project-id
```

## APK Size Expectations

- **Development APK**: ~50-70 MB
- **Production APK (optimized)**: ~30-40 MB
- **AAB (Android App Bundle)**: ~25-35 MB

## Distribution

### Internal Testing
1. Build APK using any method above
2. Share APK file directly
3. Users install via file manager
4. Enable "Install from Unknown Sources"

### Google Play Store
1. Build AAB: `eas build --platform android --profile production`
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review

## Troubleshooting

### Build Fails
- Ensure Node.js 18+ is installed
- Clear cache: `rm -rf node_modules && yarn install`
- Clear Expo cache: `expo start -c`

### APK Won't Install
- Check Android version (minimum: Android 6.0 / API 23)
- Enable "Install Unknown Apps" permission
- Check storage space

### Location Not Working
- Ensure GPS is enabled
- Grant location permissions
- Test outdoors for better GPS signal

### Voice Commands Failing
- Check microphone permission
- Ensure internet connectivity (for Groq API)
- Fallback rule-based parsing works offline

## Development vs Production

### Development Build
```bash
eas build --profile development --platform android
```
- Larger size
- Includes dev tools
- Hot reload enabled

### Production Build  
```bash
eas build --profile production --platform android
```
- Optimized and minified
- Smaller size
- Better performance
- Obfuscated code

## Next Steps After Building

1. ✅ Test APK on real Android device
2. ✅ Grant all permissions
3. ✅ Test GPS tracking outdoors
4. ✅ Test voice commands with internet
5. ✅ Test offline functionality
6. ✅ Verify SQLite database persistence
7. ✅ Test activity history
8. ✅ Submit to Play Store (if ready)
