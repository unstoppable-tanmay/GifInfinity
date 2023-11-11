import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { delay } from "../helpers/utils";
import { message } from "antd";

import useUser from "@/app/store/useUser";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { NoticeType } from "antd/es/message/interface";
import { doc, updateDoc } from "@firebase/firestore";
import { db } from "@/helpers/firebase";
import GifImage from "./GifImage";

const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY!);

const GifContainer = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [animated, setAnimated] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loader, setLoader] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const [searchData, setSearchData] = useState("");
  const [gif, setGif] = useState<any[]>([]);
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [gifloadmore, setGifloadmore] = useState(1);

  const { isUser, user, setUser } = useUser();

  const OpenMessage = (type: NoticeType, content: string) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  const animate = async () => {
    setAnimated(true);
    await delay(300);
    setClosed(true);
    setLoader(true);
  };

  const search = async () => {
    setIsGifLoaded(false);
    if (!searchData) {
      setAnimated(false);
      setLoader(false);
      setIsGifLoaded(false);
      OpenMessage("error", "Type Anything In The Box");
      return;
    } else if (!isUser) {
      OpenMessage("error", "Please Sign In to Search");
      return;
    }
    animate();
    const { data: gifs } = await gf.search(searchData, { limit: 25 });
    setGif(gifs);
    console.log(gifs);
    setLoader(false);
    setIsGifLoaded(true);
  };

  const loadmore = async () => {
    const { data: gifs } = await gf.search(searchData, {
      limit: 25,
      offset: 25 * gifloadmore,
    });
    setGif([...gif, ...gifs]);
    console.log(gifs);
    setGifloadmore(gifloadmore + 1);
  };

  const like = async (link: string) => {
    try {
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

  useEffect(() => {
    const getData = setTimeout(async () => {
      search();
    }, 1700);

    return () => clearTimeout(getData);
  }, [searchData]);

  return (
    <div className="wrapper flex items-center justify-center min-h-[70vh] mt-20 mb-20">
      {contextHolder}
      <motion.div
        layout
        className={`container ${
          animated ? "w-[90vw] min-h-[80vh]" : "w-[750px]"
        } ${
          isGifLoaded ? "gap-10" : ""
        } max-w-[90vw] p-2 md:p-5 rounded-2xl bg-white flex items-center justify-start flex-col shadow-lg relative -mt-9`}
      >
        {contextHolder}

        {!animated && (
          <div className="bottomtext absolute -bottom-9 text-xs md:text-sm text-black text-opacity-40 font-medium ">
            Search Whatever, There are Infinity GIFs
          </div>
        )}
        <motion.div
          layout
          className="searchbox flex w-full gap-2 md:gap-4 items-center justify-center flex-wrap"
        >
          <motion.div
            layout
            className="inputcontainer p-3 md:p-4 bg-[#f2f4f8] flex flex-1 items-center justify-center gap-3 rounded-xl md:text-lg"
            onClick={() => {
              inputRef.current?.focus();
            }}
          >
            <motion.img
              layout
              src="/icons/search.svg"
              className="hidden md:flex"
              alt="🔍"
            />
            <motion.input
              value={searchData}
              onChange={(data) => {
                setSearchData(data.target.value);
              }}
              layout="preserve-aspect"
              ref={inputRef}
              type="text"
              placeholder="Search Anything"
              className="outline-none border-none flex-1 bg-transparent"
            />
          </motion.div>
          {/* If You need search btn */}
          {/* <motion.div
            layout
            className="search p-2 md:p-4 md:px-8 md:text-lg bg-black rounded-2xl text-white cursor-pointer select-none"
            onClick={search}
          >
            <motion.img
              layout
              src="/icons/search.svg"
              className="md:hidden invert"
              alt="🔍"
            />
            <span className="hidden md:flex">Search</span>
          </motion.div> */}
        </motion.div>

        <motion.div
          layout
          className="gifcontainer flex items-center justify-center"
        >
          {loader && <motion.div layout className="loader"></motion.div>}
          {isGifLoaded && (
            <div className="flex flex-col gap-6">
              <div className="flex gap-5 flex-wrap items-center justify-center">
                {gif?.map((gif, index) => (
                  <GifImage key={index} like={like} gif={gif} isSaved={false} />
                ))}
              </div>
              <div
                className="loadmore p-2 px-4 rounded-md bg-black self-center text-white cursor-pointer"
                onClick={loadmore}
              >
                Load More
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GifContainer;
