# SIREN Production Checklist

## Before Hackathon Submission

### Recording & Upload ✅
- [x] Audio recording starts/stops with button press
- [x] 15-second chunking works (upload doesn't block recording)
- [x] Chunks upload to Firebase Storage automatically
- [x] Firestore alert doc tracks recording metadata
- [ ] Implement real AES encryption (currently placeholder)
- [ ] Test on real Android device (not just emulator)
- [ ] Test on real iOS device (background audio modes)

### Firebase & Security
- [ ] Firebase project created & configured
- [ ] Firestore rules deployed (alerts + users collections)
- [ ] Storage rules deployed (alerts bucket)
- [ ] Auth (Anonymous or Email/Password) enabled
- [ ] Test user can create alerts & upload chunks

### UI/UX & Error Handling
- [ ] Recording indicator shows while active
- [ ] Error messages display when permissions denied
- [ ] Button disabled during upload
- [ ] Clean stop even if upload fails

### Android Specific
- [ ] Microphone permission request works
- [ ] Background recording continues (foreground service setup)
- [ ] Chunks upload over Wi-Fi and mobile data
- [ ] Test on API 28+ (Android 9+)

### iOS Specific
- [ ] Microphone permission request works
- [ ] Background audio mode configured
- [ ] Chunks upload over Wi-Fi and mobile data
- [ ] Test on iOS 14+

### Performance & Battery
- [ ] Recording doesn't drain battery excessively
- [ ] Uploads happen in background
- [ ] App doesn't crash after 30+ minutes recording

### Testing Scenarios

#### Scenario 1: Normal Recording
1. Press ACTIVATE SIREN
2. Speak for 30 seconds
3. Press STOP SIREN
4. **Expected**: Chunks in Storage, alert in Firestore with "completed" status

#### Scenario 2: Network Disconnection
1. Press ACTIVATE SIREN
2. Turn off airplane mode
3. Speak for 30 seconds
4. Turn airplane mode off
5. **Expected**: Recording continues locally, uploads when network returns

#### Scenario 3: Forced Stop
1. Press ACTIVATE SIREN
2. Force close app (from recent apps)
3. Reopen app
4. **Expected**: Alert remains in Firestore with graceful status (add checkpoint logic)

#### Scenario 4: Long Recording
1. Press ACTIVATE SIREN
2. Let record for 5+ minutes
3. Press STOP SIREN
4. **Expected**: Multiple chunks in Storage, all uploaded successfully

---

## Features for Future (Post-MVP)

### Phase 2: Intelligence
- [ ] AI stress detection in audio
- [ ] Automatic scene detection (raised voices, etc)
- [ ] Selective upload (only critical moments)

### Phase 3: Legal
- [ ] Auto-transcription with Google Speech-to-Text
- [ ] Incident report generation
- [ ] Blockchain/hash chain-of-custody proof

### Phase 4: Network
- [ ] Community heat map of enforcement activity
- [ ] Safe route suggestions
- [ ] Check-in system with escalation

### Phase 5: Preparation
- [ ] Digital will feature
- [ ] Emergency contact cascade
- [ ] Pre-recorded statement auto-send

---

## Known Limitations

1. **iOS Background Video**: Apple restricts background camera access; focus on audio + occasional screenshots when foreground
2. **Android Battery**: Background recording drains ~1% per hour; recommend users plug in during long encounters
3. **Encryption**: Using placeholder; implement before production
4. **Offline Recording**: Uploads require network; buffering works but untested at scale
