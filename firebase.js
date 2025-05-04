import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCtLoJ6MyOOaZkgsGPjJO_lhHPansKN_SE",
  authDomain: "nutrilog-68ee4.firebaseapp.com",
  projectId: "nutrilog-68ee4",
  storageBucket: "nutrilog-68ee4.firebasestorage.app",
  messagingSenderId: "84627290881",
  appId: "1:84627290881:web:5a03462d6769b000967900",
  measurementId: "G-MVKQP93X43"
};

const app = initializeApp(firebaseConfig);

// ✅ Autenticación según plataforma
let auth: Auth;
if (Platform.OS === 'web') {
  auth = getAuth(app); // para Web
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage) // para móviles
  });
}

const firestore = getFirestore(app);

export { auth, firestore };
