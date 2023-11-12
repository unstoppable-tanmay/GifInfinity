import {
  getAuth,
} from "firebase/auth";
import firebase_app from "../firebase/config";

import { getFirestore } from "firebase/firestore";

const db = getFirestore(firebase_app);

const auth = getAuth(firebase_app);

export {auth,db}