import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD44V9yQRD_EMaxGLdBBHQghf6BbBJtmiA",
  authDomain: "pg-feedback-app.firebaseapp.com",
  projectId: "pg-feedback-app",
  storageBucket: "pg-feedback-app.firebasestorage.app",
  messagingSenderId: "665515220780",
  appId: "1:665515220780:web:dd934c31cbb8b185971689"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;