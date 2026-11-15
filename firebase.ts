import { getApp, getApps, initializeApp } from 'firebase/app';

import {
    getAuth,
    initializeAuth,
    type Auth,
} from 'firebase/auth';

// @ts-expect-error Firebase React Native runtime export
import { getReactNativePersistence } from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBtXxAZc__TdbisEw4HQ_Lud5p29pMNSFc",
  authDomain: "healthmate-e0f41.firebaseapp.com",
  projectId: "healthmate-e0f41",
  storageBucket: "healthmate-e0f41.firebasestorage.app",
  messagingSenderId: "512291292546",
  appId: "1:512291292546:web:a9174860025ece8917fb9b"
};

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };

