import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';

const AudioUploadService =
  Platform.OS === 'web'
    ? {
        startRecording: async () => {},
        stopRecording: async () => {},
      }
    : require('../src/audioUpload/AudioUploadService').default;

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('http://localhost:3001');
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaChunksRef = useRef([]);
  const videoPreviewRef = useRef(null);

  const sendPing = async () => {
    if (!phone) return;
    try {
      const response = await fetch(`${apiBaseUrl}/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: [phone],
          message: 'SIREN activated. Please check in ASAP.',
          location: null,
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Ping failed');
      }
    } catch (err) {
      Alert.alert('Ping failed', err.message || 'Unable to send SMS');
    }
  };

  const startWebRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Webcam/mic not available in this browser.');
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    mediaStreamRef.current = stream;
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
      await videoPreviewRef.current.play();
    }
    const recorder = new MediaRecorder(stream);
    mediaChunksRef.current = [];
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        mediaChunksRef.current.push(event.data);
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
  };

  const stopWebRecording = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    await new Promise((resolve) => {
      recorder.onstop = resolve;
      recorder.stop();
    });
    const blob = new Blob(mediaChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `siren_recording_${Date.now()}.webm`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    mediaChunksRef.current = [];
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const handlePress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isRecording) {
        // START RECORDING
        if (Platform.OS === 'web') {
          await startWebRecording();
        } else {
          await AudioUploadService.startRecording();
        }
        setIsRecording(true);
        Alert.alert(
          '✅ Recording Started',
          Platform.OS === 'web'
            ? 'Recording webcam + mic on this computer.'
            : 'SIREN is now recording audio and tracking location.'
        );
        await sendPing();
      } else {
        // STOP RECORDING
        if (Platform.OS === 'web') {
          await stopWebRecording();
        } else {
          await AudioUploadService.stopRecording();
        }
        setIsRecording(false);
        Alert.alert(
          '✅ Recording Stopped',
          Platform.OS === 'web'
            ? 'Saved to your Downloads folder.'
            : 'Your recording has been saved and uploaded.'
        );
      }
    } catch (err) {
      const errorMsg = err.message || 'Unknown error';
      setError(errorMsg);
      Alert.alert('❌ Error', errorMsg);
      console.error('Recording error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 SIREN</Text>
      <Text style={styles.subtitle}>Your Safety, Your Rights</Text>

      {Platform.OS === 'web' && (
        <View style={styles.previewCard}>
          <Text style={styles.inputLabel}>Live Preview</Text>
          <View style={styles.previewFrame}>
            <video
              ref={videoPreviewRef}
              style={styles.previewVideo}
              muted
              playsInline
            />
          </View>
        </View>
      )}

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Ping Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="+15551234567"
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.input}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
        <Text style={styles.inputHint}>
          Sends an SMS when SIREN is activated.
        </Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>SMS API URL</Text>
        <TextInput
          value={apiBaseUrl}
          onChangeText={setApiBaseUrl}
          placeholder="http://localhost:3001"
          placeholderTextColor="rgba(255,255,255,0.6)"
          style={styles.input}
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={[styles.sirenButton, isRecording && styles.sirenActive]}
        onPress={handlePress}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isRecording ? 'STOP' + '\n' + 'SIREN' : 'ACTIVATE' + '\n' + 'SIREN'}</Text>
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>🔴 RECORDING...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
  },
  sirenButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sirenActive: {
    backgroundColor: '#ff6b81',
    shadowColor: '#ff6b81',
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 24,
  },
  statusContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4757',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  inputCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  inputLabel: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 6,
  },
  inputHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: 'white',
  },
  previewCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  previewFrame: {
    width: 240,
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignSelf: 'center',
  },
  previewVideo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  errorContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 12,
  },
});