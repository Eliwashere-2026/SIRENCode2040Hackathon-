// AudioUploadService.js
// Basic starter implementation for recording audio in chunks and uploading to Firebase Storage
// IMPORTANT: This is a hackathon MVP starter. Test thoroughly on real devices and follow the library docs.

import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const CHUNK_MS = 15 * 1000; // 15s chunks (adjust as needed)
const recorder = new AudioRecorderPlayer();

let _currentAlertId = null;
let _chunkIndex = 0;
let _chunkTimer = null;
let _currentFilePath = null;

const ensureDir = async (dir) => {
  try {
    const exists = await RNFS.exists(dir);
    if (!exists) await RNFS.mkdir(dir);
  } catch (e) {
    console.warn('ensureDir failed', e);
  }
};

const encryptBase64 = async (base64) => {
  // Placeholder: implement AES-GCM or similar using device Keystore/Keychain
  // For prototype we return base64 directly; DO NOT use in production without encryption
  return base64;
};

const uploadChunk = async (path, alertId) => {
  try {
    const stat = await RNFS.stat(path);
    if (!stat || !stat.isFile()) return;

    const base64 = await RNFS.readFile(path, 'base64');
    const encrypted = await encryptBase64(base64);

    const user = auth().currentUser;
    if (!user) throw new Error('Not authenticated');

    const filename = `${_chunkIndex++}_${Date.now()}.m4a`;
    const remotePath = `alerts/${user.uid}/${alertId}/${filename}`;

    // upload base64 to Firebase Storage
    const ref = storage().ref(remotePath);
    await ref.putString(encrypted, 'base64', { contentType: 'audio/m4a' });

    // add metadata to Firestore for the alert
    await firestore().collection('alerts').doc(alertId).collection('chunks').add({
      path: remotePath,
      size: stat.size,
      uploadedAt: firestore.FieldValue.serverTimestamp(),
    });

    // remove local file
    await RNFS.unlink(path);
  } catch (e) {
    console.error('uploadChunk error', e);
  }
};

const rotateChunk = async (alertId) => {
  try {
    // stop current recording, upload, then start a new file
    await recorder.stopRecorder();
    if (_currentFilePath) {
      await uploadChunk(_currentFilePath, alertId);
    }

    // start a fresh recorder for the next chunk
    const dir = `${RNFS.DocumentDirectoryPath}/sirens`;
    await ensureDir(dir);
    _currentFilePath = `${dir}/${alertId}_${Date.now()}.m4a`;
    await recorder.startRecorder(_currentFilePath);
  } catch (e) {
    console.error('rotateChunk error', e);
  }
};

export default {
  startRecording: async () => {
    const user = auth().currentUser;
    if (!user) throw new Error('User must be signed in to start recording.');

    // create alert doc first
    const alertRef = await firestore().collection('alerts').add({
      userId: user.uid,
      status: 'recording',
      startedAt: firestore.FieldValue.serverTimestamp(),
    });
    const alertId = alertRef.id;
    _currentAlertId = alertId;
    _chunkIndex = 0;

    // start first chunk immediately
    const dir = `${RNFS.DocumentDirectoryPath}/sirens`;
    await ensureDir(dir);
    _currentFilePath = `${dir}/${alertId}_${Date.now()}.m4a`;

    await recorder.startRecorder(_currentFilePath);

    // start timer to rotate chunk periodically
    _chunkTimer = setInterval(() => rotateChunk(alertId), CHUNK_MS);

    return alertId;
  },

  stopRecording: async () => {
    try {
      if (_chunkTimer) {
        clearInterval(_chunkTimer);
        _chunkTimer = null;
      }

      // stop and upload last chunk
      try { await recorder.stopRecorder(); } catch (e) { /* ignore */ }
      if (_currentFilePath) await uploadChunk(_currentFilePath, _currentAlertId);

      // update Firestore alert status
      if (_currentAlertId) {
        await firestore().collection('alerts').doc(_currentAlertId).update({
          status: 'completed',
          completedAt: firestore.FieldValue.serverTimestamp(),
        });
      }

    } catch (e) {
      console.error('stopRecording error', e);
    } finally {
      _currentAlertId = null;
      _currentFilePath = null;
      _chunkIndex = 0;
    }
  },

  // helper for debugging
  isRecording: () => !!_currentAlertId,
};
