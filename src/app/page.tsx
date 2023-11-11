"use client";

import GifContainer from "@/components/GifContainer";
import Navbar from "@/components/Navbar";
import { auth, db } from "@/helpers/firebase";
import { useEffect } from "react";
import useUser from "./store/useUser";
import { Spin } from "antd";
import { getDoc, doc } from "@firebase/firestore";

export default function Home() {
  const { setIsUser, setUser, mainLoading, setMainLoading, user } = useUser();

  const getUserData = async (uid: string) => {
    const docRef = doc(db, "user", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setUser({
        uid: userData.uid,
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
      if (user) {
        setIsUser(true);
        getUserData(user?.uid!);
      }
      setMainLoading(false);
    });
  }, []);

  return (
    <main className="w-screen min-h-screen flex items-center justify-start flex-col overflow-x-hidden">
      <Spin spinning={mainLoading} fullscreen />
      <Navbar />
      <GifContainer />
      {/* <TrendingComp/> */}
    </main>
  );
}
