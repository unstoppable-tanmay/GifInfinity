import { GiphyFetch } from "@giphy/js-fetch-api";
import React, { useEffect, useState } from "react";
import GifImage from "./GifImage";
import { doc, updateDoc } from "@firebase/firestore";
import useUser from "@/app/store/useUser";
import { db } from "@/helpers/firebase";
import { message } from "antd";
import { NoticeType } from "antd/es/message/interface";

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY!);

const TrendingComp = () => {
  const [gif, setGif] = useState<any[]>([]);
  const { user, setUser } = useUser();

  const [messageApi, contextHolder] = message.useMessage();

  const loadTrending = async () => {
    const { data: gifs } = await gf.trending({ limit: 20 });
    setGif(gifs);
  };

  const OpenMessage = (type: NoticeType, content: string) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const like = async (link: string) => {
    try {
      if(!user){
        OpenMessage("error", "Signin to Save");
        return
      }
      if (user.saved.includes(link)) {
        const newsaved = user.saved.filter((ele) => ele != link);
        await updateDoc(doc(db, "user", user.uid), {
          saved: newsaved,
        })
          .then(() => {
            setUser({
              saved: newsaved,
              name: user.name,
              email: user.email,
              uid: user.uid,
            });
            OpenMessage("success", "Gif Removed From Liked");
          })
          .catch((e) => {
            OpenMessage("error", e.message);
          });
      } else {
        await updateDoc(doc(db, "user", user.uid), {
          saved: [...user.saved, link],
        })
          .then(() => {
            setUser({
              saved: [...user.saved, link],
              name: user.name,
              email: user.email,
              uid: user.uid,
            });
            OpenMessage("success", "Liked The Gif");
          })
          .catch((e) => {
            OpenMessage("error", e.message);
          });
      }
    } catch (error) {
      console.log(error);
    }
    console.log(user);
  };

  useEffect(()=>{
    loadTrending()
  })

  return (
    <div className="w-[90vw] p-2 flex items-center flex-col rounded-lg bg-white  mb-10 gap-10">
      <div className="heading text-3xl font-medium">Trending</div>
      <div className="flex gap-5 flex-wrap items-center justify-center">
        {gif?.map((gif, index) => (
          <GifImage key={index} like={like} gif={gif} isSaved={false} />
        ))}
      </div>
    </div>
  );
};

export default TrendingComp;
