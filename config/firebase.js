import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWeZhPBS7KGoCHbmw2HNAbJcEQJ8ChzoA",
  authDomain: "zen-multi-vendor.firebaseapp.com",
  projectId: "zen-multi-vendor",
  storageBucket: "zen-multi-vendor.firebasestorage.app",
  messagingSenderId: "448948400699",
  appId: "1:448948400699:web:df977e2efc02e64eed621e",
  measurementId: "G-5RSC7KS6VS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
