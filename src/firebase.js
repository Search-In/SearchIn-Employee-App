// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAx_-9_fhK82TSfo_GqRvHl6HSKeW3mP0s",
  authDomain: "employee-app-bf221.firebaseapp.com",
  projectId: "employee-app-bf221",
  storageBucket: "employee-app-bf221.appspot.com",
  messagingSenderId: "486063551073",
  appId: "1:486063551073:web:a958959cd9c7ef8548f020",
  measurementId: "G-FR61TDE604",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
