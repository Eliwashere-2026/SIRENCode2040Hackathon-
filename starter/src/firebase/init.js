// Firebase initialization
import { initializeApp } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import '@react-native-firebase/storage';
import firebaseConfig from './config';

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
