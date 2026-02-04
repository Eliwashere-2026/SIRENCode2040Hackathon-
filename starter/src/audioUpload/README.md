Audio Upload Flow (starter)

What this folder contains:
- `AudioUploadService.js` — starter service to record audio in chunks and upload to Firebase Storage.

Quick setup (React Native):
1. Install dependencies (example):
   - `yarn add @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage react-native-audio-recorder-player react-native-fs`
2. Follow each library's platform setup steps (Android foreground service for continuous recording; iOS background audio modes).
3. Import `AudioUploadService` from `src/audioUpload/AudioUploadService.js` and call `startRecording()` / `stopRecording()`.

Notes & limitations:
- This is a prototype: encryption is left as a placeholder. For production, implement proper AES-GCM or platform secure storage and encryption.
- iOS has stricter background recording restrictions; prefer audio-only continuous recording on Android for MVP.
- Test on real devices (simulators often have different behavior for background tasks and audio recording).