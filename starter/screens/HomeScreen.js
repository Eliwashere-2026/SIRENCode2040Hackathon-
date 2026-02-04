import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  const handlePress = () => {
    alert('🚨 SIREN ACTIVATED!');
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚨 SIREN</Text>
      <Text style={styles.subtitle}>Your Safety, Your Rights</Text>
      <TouchableOpacity 
        style={styles.sirenButton}
        onPress={handlePress}
      >
        <Text style={styles.buttonText}>ACTIVATE{'\n'}SIREN</Text>
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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});