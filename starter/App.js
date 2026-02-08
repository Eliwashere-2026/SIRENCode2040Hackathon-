import React, { useEffect } from 'react';
import './src/firebase/init'; // Initialize Firebase first
import HomeScreen from './screens/HomeScreen';

export default function App() {
  useEffect(() => {
    console.log('🚨 SIREN App Started');
  }, []);

  return <HomeScreen />;
}