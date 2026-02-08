// AudioUploadService.js
// Native audio recording with Firebase Storage upload and Firestore tracking
// Handles chunked recording, encryption placeholder, and background upload

import { Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import { requestAudioPermission, requestStoragePermission } from '../utils/permissions';

const CHUNK_INTERVAL_MS = 15 * 1000; // 15s chunks
const recorder = new AudioRecorderPlayer();

let _currentAlertId = null;
let _chunkIndex = 0;
let _chunkTimer = null;
let _currentFilePath = null;
let _recordingPath = null;
let _isRecording = false;

/**
 * Ensure directory exists for recordings
 */
const ensureDir = async (dir) => {
  try {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
      console.log('Created directory:', dir);
    }
  } catch (error) {
    console.error('ensureDir failed:', error);
  }
};

/**
 * Placeholder encryption - REPLACE WITH REAL ENCRYPTION IN PRODUCTION
 * For hackathon MVP, returns base64; implement AES-GCM with Keychain/Keystore
 */
const encryptChunk = async (base64Data) => {
  // TODO: Implement actual AES-GCM encryption using react-native-keychain
  // For now, return as-is but flag for future encryption
  return base64Data;
};

/**
 * Upload a chunk to Firebase Storage with retry logic
 */
const uploadChunk = async (filePath, alertId, retries = 3) => {
  try {
    const fileExists = await RNFS.exists(filePath);
    if (!fileExists) {
      console.warn('File does not exist:', filePath);
      return false;
    }

    const stat = await RNFS.stat(filePath);
    console.log(`Uploading chunk: ${stat.size} bytes`);

    const base64 = await RNFS.readFile(filePath, 'base64');
    const encrypted = await encryptChunk(base64);

    const user = auth().currentUser;
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const timestamp = Date.now();
    const filename = `${_chunkIndex++}_${timestamp}.m4a`;
    const remotePath = `alerts/${user.uid}/${alertId}/${filename}`;

    // Upload to Firebase Storage
    const ref = storage().ref(remotePath);
    await ref.putString(encrypted, 'base64', {
      contentType: 'audio/m4a',
      cacheControl: 'public, max-age=3600',
    });

    console.log('Chunk uploaded:', remotePath);

    // Record metadata in Firestore
    await firestore()
      .collection('alerts')
      .doc(alertId)
      .collection('chunks')
      .add({
        path: remotePath,
        size: stat.size,
        index: _chunkIndex - 1,
        uploadedAt: firestore.FieldValue.serverTimestamp(),
      });

    // Delete local file after successful upload
    try {
      await RNFS.unlink(filePath);
    } catch (e) {
      console.warn('Failed to delete local chunk:', e);
    }

    return true;
  } catch (error) {
    console.error('Upload chunk error:', error);
    if (retries > 0) {
      console.log(`Retrying upload... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return uploadChunk(filePath, alertId, retries - 1);
    }
    return false;
  }
};

/**
 * Rotate chunk: stop current recording, upload it, start new one
 */
const rotateChunk = async (alertId) => {
  try {
    console.log('Rotating chunk...');
    
    // Stop current recorder
    try {
      await recorder.stopRecorder();
    } catch (e) {
      console.warn('Error stopping recorder:', e);
    }

    // Upload completed chunk
    if (_currentFilePath && _isRecording) {
      await uploadChunk(_currentFilePath, alertId);
    }

    // Start new recording if still active
    if (_isRecording) {
      _currentFilePath = `${_recordingPath}/${alertId}_chunk_${_chunkIndex}.m4a`;
      try {
        await recorder.startRecorder(_currentFilePath);
        console.log('New chunk recording started');
      } catch (e) {
        console.error('Failed to start new recorder:', e);
      }
    }
  } catch (error) {
    console.error('rotateChunk error:', error);
  }
};

/**
 * Initialize recording and create Firestore alert document
 */
const startRecording = async () => {
  try {
    // Verify permissions
    const audioPermOk = await requestAudioPermission();
    const storagePermOk = await requestStoragePermission();

    if (!audioPermOk) {
      throw new Error('Microphone permission denied');
    }

    const user = auth().currentUser;
    if (!user) {
      throw new Error('User must be signed in to start recording');
    }

    _isRecording = true;

    // Create alert document in Firestore
    const alertRef = await firestore().collection('alerts').add({
      userId: user.uid,
      status: 'recording',
      startedAt: firestore.FieldValue.serverTimestamp(),
      platform: Platform.OS,
    });

    _currentAlertId = alertRef.id;
    _chunkIndex = 0;
    console.log('Alert created:', _currentAlertId);

    // Set up recording directory
    _recordingPath = `${RNFS.DocumentDirectoryPath}/sirens`;
    await ensureDir(_recordingPath);

    // Start first chunk
    _currentFilePath = `${_recordingPath}/${_currentAlertId}_chunk_0.m4a`;
    await recorder.startRecorder(_currentFilePath);
    console.log('Recording started:', _currentFilePath);

    // Set up chunking timer
    _chunkTimer = setInterval(() => rotateChunk(_currentAlertId), CHUNK_INTERVAL_MS);

    return _currentAlertId;
  } catch (error) {
    console.error('startRecording error:', error);
    _isRecording = false;
    throw error;
  }
};

/**
 * Stop recording and finalize
 */
const stopRecording = async () => {
  try {
    _isRecording = false;

    if (_chunkTimer) {
      clearInterval(_chunkTimer);
      _chunkTimer = null;
    }

    // Stop recorder
    try {
      await recorder.stopRecorder();
    } catch (e) {
      console.warn('Error stopping recorder:', e);
    }

    // Upload final chunk
    if (_currentFilePath && _currentAlertId) {
      await uploadChunk(_currentFilePath, _currentAlertId);
    }

    // Update alert status
    if (_currentAlertId) {
      await firestore().collection('alerts').doc(_currentAlertId).update({
        status: 'completed',
        completedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('Alert completed:', _currentAlertId);
    }

    console.log('Recording stopped');
  } catch (error) {
    console.error('stopRecording error:', error);
    throw error;
  } finally {
    // Reset state
    _currentAlertId = null;
    _currentFilePath = null;
    _chunkIndex = 0;
    _recordingPath = null;
  }
};

/**
 * Get current recording status
 */
const isRecording = () => _isRecording && !!_currentAlertId;

export default {
  startRecording,
  stopRecording,
  isRecording,
};
