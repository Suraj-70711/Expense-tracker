// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCfX8yzWtCCWGOgAA8UHEye5TYPwbDASZs",
  authDomain: "expense-tracker-a6432.firebaseapp.com",
  projectId: "expense-tracker-a6432",
  storageBucket: "expense-tracker-a6432.firebasestorage.app",
  messagingSenderId: "91453211822",
  appId: "1:91453211822:web:dc10e811b16565a0f3193f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Get a reference to the Firestore database
const db = firebase.firestore();


// Get a reference to Firebase Authentication
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();