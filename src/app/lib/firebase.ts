import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Replace with your Firebase config from Step 3
const firebaseConfig = {
  apiKey: "AIzaSyCXlsExdF_HvcWa5oZm6l9xklFASoR7dag",
  authDomain: "nextjs-todo-app-14b7c.firebaseapp.com",
  projectId: "nextjs-todo-app-14b7c",
  storageBucket: "nextjs-todo-app-14b7c.firebasestorage.app",
  messagingSenderId: "307379396622",
  appId: "1:307379396622:web:b2bad52ac55352c6cd9c5f"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;