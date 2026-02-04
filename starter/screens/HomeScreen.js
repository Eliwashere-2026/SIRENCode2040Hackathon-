import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AudioUploadService from '../src/audioUpload/AudioUploadService';

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);

  const handlePress = async () => {
    try {
      if (!isRecording) {
        await AudioUploadService.startRecording();
        setIsRecording(true);
      } else {
        await AudioUploadService.stopRecording();
        setIsRecording(false);
      }
    } catch (e) {
      console.error(e);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 SIREN</Text>
      <Text style={styles.subtitle}>Your Safety, Your Rights</Text>
      <TouchableOpacity 
        style={[styles.sirenButton, isRecording && styles.sirenActive]}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>{isRecording ? 'STOP' + '\n' + 'SIREN' : 'ACTIVATE' + '\n' + 'SIREN'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  sirenButton: {
    backgroundColor: '#ff4757',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  sirenActive: {
    backgroundColor: '#ff6b81',
    shadowColor: '#ff6b81',
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});