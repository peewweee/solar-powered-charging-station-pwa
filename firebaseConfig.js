// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDL55fN1SNIkNOx3K8kdaLVHqbbCnfEdA4",
  authDomain: "charging-ports.firebaseapp.com",
  // Note: This URL is crucial. It points to the Singapore (Southeast Asia) server.
  databaseURL: "https://charging-ports-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "charging-ports",
  storageBucket: "charging-ports.firebasestorage.app",
  messagingSenderId: "250864389682",
  appId: "1:250864389682:web:2232830b0bf2dd040db62b",
  measurementId: "G-C65YG8DXZ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Realtime Database so StationStatus.jsx can use it
export const database = getDatabase(app);