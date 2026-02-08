// Platform-specific permission handling
import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestAudioPermission = async () => {
  try {
    const permission = Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.MICROPHONE 
      : PERMISSIONS.ANDROID.RECORD_AUDIO;

    const result = await check(permission);
    
    if (result === RESULTS.GRANTED) {
      console.log('Audio permission already granted');
      return true;
    }

    const requestResult = await request(permission);
    return requestResult === RESULTS.GRANTED;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

export const requestStoragePermission = async () => {
  try {
    if (Platform.OS === 'ios') return true; // iOS handles file storage differently

    const result = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    
    if (result === RESULTS.GRANTED) {
      console.log('Storage permission already granted');
      return true;
    }

    const requestResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    return requestResult === RESULTS.GRANTED;
  } catch (error) {
    console.error('Storage permission error:', error);
    return false;
  }
};
