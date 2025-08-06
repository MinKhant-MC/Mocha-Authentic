import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOck224ypGByu9iYJRcnUsObHL9_E4V_4",
  authDomain: "mocha-tracking.firebaseapp.com",
  projectId: "mocha-tracking",
  storageBucket: "mocha-tracking.appspot.com",
  messagingSenderId: "621083249074",
  appId: "1:621083249074:web:00fdd0dfe34507e6bc3cab"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);