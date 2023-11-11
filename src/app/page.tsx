"use client";

import GifContainer from "@/components/GifContainer";
import Navbar from "@/components/Navbar";
import { auth, db } from "@/helpers/firebase";
import { useEffect } from "react";
import useUser from "./store/useUser";
import { Spin } from "antd";
import {
  collection,
  getDocs,
  getDoc,
  where,
  query,
  limit,
  doc,
} from "@firebase/firestore";

export default function Home() {
  const { setIsUser, setUser, mainLoading, setMainLoading } = useUser();
  
  const getUserData = async (uid: string) => {
    const docRef = doc(db, "user", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUser({
        name: userData.name,
        email: userData.email,
        saved: userData.saved,
      });
    } else {
      console.log("No such document!");
    }
  };
  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      user && setIsUser(true);
      user && getUserData(user?.uid!);
      setMainLoading(false);
    });
  }, []);

  return (
    <main className="w-screen min-h-screen flex items-center justify-start flex-col overflow-x-hidden">
      <Spin spinning={mainLoading} fullscreen />
      <Navbar />
      <GifContainer />
    </main>
  );
}
