import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDr-u5MRi1vpTUE8rzD7ghJo_Z77qRFY7k",
    authDomain: "opencv-image-converter.firebaseapp.com",
    projectId: "opencv-image-converter",
    storageBucket: "opencv-image-converter.firebasestorage.app",
    messagingSenderId: "710127514665",
    appId: "1:710127514665:web:1decc25feb152d0266d838",
    measurementId: "G-KJW334FKE3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);