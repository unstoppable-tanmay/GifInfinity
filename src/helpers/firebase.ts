import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
} from "firebase/auth";
import firebase_app,{firebaseConfig} from "../firebase/config";
import { initializeApp } from "firebase/app";
import {  collection, doc, getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(firebase_app);

export {auth,db}