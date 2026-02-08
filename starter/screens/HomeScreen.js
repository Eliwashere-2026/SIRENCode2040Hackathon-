import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AudioUploadService from '../src/audioUpload/AudioUploadService';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePress = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!isRecording) {
        // START RECORDING
        await AudioUploadService.startRecording();
        setIsRecording(true);
        Alert.alert('✅ Recording Started', 'SIREN is now recording audio and tracking location.');
      } else {
        // STOP RECORDING
        await AudioUploadService.stopRecording();
        setIsRecording(false);
        Alert.alert('✅ Recording Stopped', 'Your recording has been saved and uploaded.');
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