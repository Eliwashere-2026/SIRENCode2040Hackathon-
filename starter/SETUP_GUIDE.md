# SIREN Native Audio Recording Setup Guide

## 🎯 What's Been Configured
- **Native audio recording** with `react-native-audio-recorder-player`
- **Firebase integration** (Auth, Firestore, Storage)
- **Chunked audio uploads** (15s chunks) to Firebase Storage
- **Automatic alert tracking** in Firestore
- **Android/iOS permissions** configured in `app.json`
- **Error handling & UI feedback** in HomeScreen

---

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd "starter"
npm install
# or yarn install
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing)
3. Copy your credentials from **Project Settings**
4. Replace placeholders in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

### 3. Set Up Authentication
In Firebase Console:
- Go to **Authentication** > **Sign-in method**
- Enable **Anonymous** (for hackathon MVP testing)
- Or enable **Email/Password** and add test account

### 4. Configure Firebase Security Rules
Update Firestore & Storage rules in Firebase Console:

**Firestore Rules** (already in repo):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /alerts/{alertId} {
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow read: if request.auth != null && (resource.data.userId == request.auth.uid || false);
    }
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Storage Rules** (add to Firebase Console):
```
service firebase.storage {
  match /b/{bucket}/o {
    match /alerts/{userId}/{alertId}/{file=**} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🚀 Run the App

### Android
```bash
npm run android
```
- Requires Android Studio + emulator or real device with USB debugging
- First run takes ~3-5 minutes

### iOS
```bash
npm run ios
```
- Requires Xcode + simulator
- First run takes ~3-5 minutes

### Web (Preview only - no audio recording)
```bash
npm start
# Press 'w' for web
```

---

## 📱 Testing Locally

### 1. Start the app
```bash
npm run android  # or ios
```

### 2. Wait for app to load (should see SIREN screen)

### 3. Press **ACTIVATE SIREN** button
- Should show: "✅ Recording Started" alert
- Button turns brighter red
- Status shows "🔴 RECORDING..."
- Audio/chunks being recorded locally

### 4. Speak into the microphone (simulate encounter)

### 5. Press **STOP SIREN** button
- Should show: "✅ Recording Stopped" alert
- Recording ends, chunks uplod to Firebase

### 6. Check Firebase Console
- Go to **Firestore** > `alerts` collection
  - You should see a new alert doc with your recording metadata
- Go to **Storage** > `alerts/{userId}/{alertId}/`
  - You should see uploaded audio chunks (`.m4a` files)

---

## 🔧 Troubleshooting

### Build Fails / Metro Error
```bash
# Clear cache and rebuild
npm start -- --reset-cache
```

### Permission Denied (Microphone)
- **Android**: Grant microphone permission when app asks
- **iOS**: Check Settings > SIREN > Microphone > Allow

### Recording Not Uploading
- Check Firebase config in `src/firebase/config.js`
- Verify Storage rules allow your user ID
- Check device logs: `npm run android -- --no-packager` and look for upload errors

### "User not authenticated"
- Make sure Anonymous Auth is enabled in Firebase
- Or sign in with Email/Password if configured

---

## 📂 File Structure
```
starter/
├── App.js                          # Initializes Firebase
├── app.json                        # Native permissions & plugins
├── package.json                    # Dependencies (now includes Firebase)
├── screens/
│   └── HomeScreen.js              # SIREN button UI with error handling
├── src/
│   ├── audioUpload/
│   │   ├── AudioUploadService.js  # Core recording + upload logic
│   │   └── README.md
│   ├── firebase/
│   │   ├── config.js              # Your Firebase credentials (edit)
│   │   └── init.js                # Firebase initialization
│   └── utils/
│       └── permissions.js         # Android/iOS permission handling
```

---

## 🔒 Security Notes

### Encryption Placeholder
The `encryptChunk()` function in `AudioUploadService.js` is currently a placeholder. **For production:**
- Implement AES-GCM encryption using `react-native-keychain`
- Generate encryption keys from Keystore/Keychain
- Never upload unencrypted audio

### User Privacy
- All alerts are tied to `userId` via Firebase Auth
- Only the authenticated user can read their own alerts
- Location data not yet implemented (add with `react-native-background-geolocation`)

---

## 🎉 Next Steps (After MVP Works)

1. **Cloud Functions** (in `Firestore_rules/` or new folder):
   - Trigger on alert creation → send push notifications
   - Trigger on storage upload → transcribe with Google Speech-to-Text

2. **Encryption** (upgrade security):
   - Implement real AES-GCM in `encryptChunk()`

3. **Background Location**:
   - Add `react-native-background-geolocation`
   - Log lat/lng every 10s during recording

4. **UI/UX Polish**:
   - Add recording timer
   - Show upload progress
   - Add trusted contacts UI

---

## ✅ Checklist Before Demo
- [ ] Firebase project created & credentials added
- [ ] Anonymous Auth enabled (or Email/Password set up)
- [ ] Firestore & Storage rules deployed
- [ ] App runs without errors on real device
- [ ] SIREN button starts/stops recording
- [ ] Audio chunks appear in Firebase Storage
- [ ] Alert docs created in Firestore
- [ ] Error messages display clearly
