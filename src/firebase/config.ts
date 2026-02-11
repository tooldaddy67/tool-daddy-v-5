// Firebase config loaded from environment variables (NEXT_PUBLIC_FIREBASE_* prefix required for client-side)
const firebaseConfigFromEnv = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Fallback to hardcoded defaults if env vars not set (for backward compatibility during migration)
const hardcodedDefaults = {
  projectId: "tool-daddy-v-5",
  appId: "1:233526439835:web:3cfbfa379c9b6c55edfb3e",
  apiKey: "AIzaSyC-u05z1pDo5xNwCphY9Nt6DsvgZ6jHVPU",
  authDomain: "tool-daddy-v-5.firebaseapp.com",
  measurementId: "G-SPWZ25MGLC",
  messagingSenderId: "233526439835",
  storageBucket: "tool-daddy-v-5.firebasestorage.app"
};

// Use env vars if available, fallback to hardcoded defaults
export const firebaseConfig = {
  projectId: firebaseConfigFromEnv.projectId || hardcodedDefaults.projectId,
  appId: firebaseConfigFromEnv.appId || hardcodedDefaults.appId,
  apiKey: firebaseConfigFromEnv.apiKey || hardcodedDefaults.apiKey,
  authDomain: firebaseConfigFromEnv.authDomain || hardcodedDefaults.authDomain,
  measurementId: firebaseConfigFromEnv.measurementId || hardcodedDefaults.measurementId,
  messagingSenderId: firebaseConfigFromEnv.messagingSenderId || hardcodedDefaults.messagingSenderId,
  storageBucket: firebaseConfigFromEnv.storageBucket || hardcodedDefaults.storageBucket,
};

// Log warning if using hardcoded defaults in production
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn('⚠️  Firebase config using hardcoded defaults. Set NEXT_PUBLIC_FIREBASE_* environment variables for production.');
}
