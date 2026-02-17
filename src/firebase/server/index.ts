import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
// Firestore removed
import { firebaseConfig } from '../config';

let serverApp: FirebaseApp | null = null;

function initializeServerApp() {
    // Check if a 'server-app' instance already exists
    const existingApp = getApps().find(app => app.name === 'server-app');
    if (existingApp) {
        return existingApp;
    }

    // In a server environment, we can't rely on App Hosting's auto-initialization.
    // We must explicitly use the firebaseConfig to ensure a connection.
    // We also give it a unique name to avoid conflicts with the client-side app instance.
    return initializeApp(firebaseConfig, 'server-app');
}

export function getFirestoreServer() {
    return null;
}
