import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { delay } from "../helpers/utils";
import { Button, Pagination, Spin, message } from "antd";

import useUser from "@/app/store/useUser";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { NoticeType } from "antd/es/message/interface";
import { doc, updateDoc } from "@firebase/firestore";
import { db } from "@/helpers/firebase";
import GifImage from "./GifImage";
import { CloseOutlined } from "@ant-design/icons";

// the giphyfetch instance
const gf = new GiphyFetch(process.env.NEXT_PUBLIC_GIPHY_API_KEY!);

const GifContainer = () => {
  const Limit = 20;
  const inputRef = useRef<HTMLInputElement>(null);

  // Animation states
  const [animated, setAnimated] = useState(false);
  const [loader, setLoader] = useState(false);

  // message api of antd
  const [messageApi, contextHolder] = message.useMessage();

  // Gif search states
  const [searchData, setSearchData] = useState("");
  const [gif, setGif] = useState<any[]>([]);
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [gifloadmore, setGifloadmore] = useState(1);

  // Page size for pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPaseSize] = useState(20);

  const { isUser, user, setUser } = useUser(); // the user store

  // Function For Calling The message in ANTD
  const OpenMessage = (type: NoticeType, content: string) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  // Animate The search Box
  const animate = async () => {
    setAnimated(true);
    await delay(300);
    // setLoader(true);
  };

  // The Search function where gifs are fetched
  const search = async () => {
    setLoader(true);
    setIsGifLoaded(false);
    if (!searchData) {
      setAnimated(false);
      setLoader(false);
      setIsGifLoaded(false);
      OpenMessage("info", "Type Anything In The Box");
      return;
    } else if (!isUser) {
      OpenMessage("error", "Please Sign In to Search");
      setSearchData("");
      return;
    }
    const { data: gifs } = await gf.search(searchData, { limit: 60 });
    if (gifs.length == 0) {
      OpenMessage("info", "No Gifs Found");
      setAnimated(false);
      setLoader(false)
      setSearchData("")
      return;
    } else {
      // animate();
      setAnimated(true);
      setGif(gifs);
    }
    setLoader(false);
    console.log(loader);
    setIsGifLoaded(true);
  };

  // The loadmore function which is for loading more gifs
  const loadmore = async () => {
    if (gifloadmore <= 3) {
      const { data: gifs } = await gf.search(searchData, {
        limit: Limit,
        offset: Limit * gifloadmore,
      });
      if (gifs.length == 0) OpenMessage("error", "No Gifs Left");
      setGif([...gif, ...gifs]);
      console.log(gifs);
      setGifloadmore(gifloadmore + 1);
    } else {
      OpenMessage("error", "There Is No Gif Left");
    }
  };

  // Like for saving the favourite
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

  // Hot Search
  useEffect(() => {
    setLoader(true);
    const getData = setTimeout(async () => {
      search();
    }, 800);

    return () => clearTimeout(getData);
  }, [searchData]);

  // For Resetng The page After LogOut
  useEffect(() => {
    setAnimated(false);
    setGif([]);
    setLoader(false);
    setIsGifLoaded(false);
    setSearchData("");
  }, [isUser]);

  return (
    <div className="wrapper flex items-center justify-center min-h-[88vh] mb-32 relative">
      {contextHolder} {/* for the message box rendering context */}
      {/* Trending Gif Container Direction Displayer */}
      <div className="bottomcontent absolute -bottom-0 text-sm text-black text-opacity-60 flex flex-col items-center justify-center gap-2">
        <div className="mouse">
          <div className="scrollWheel"></div>
        </div>
        <div className="text-xs text-black text-opacity-50 font-medium">
          Scroll For Trending Gifs
        </div>
      </div>
      {/* main Container for gif searching and loading */}
      <motion.div
        layout
        className={`container ${
          animated ? "w-[90vw] md:w-[70vw] min-h-[80vh]" : "w-[750px] -mt-16"
        } ${
          isGifLoaded ? "gap-10" : ""
        } max-w-[90vw] p-2 md:p-5 rounded-2xl bg-white flex items-center justify-start flex-col shadow-lg relative `}
      >
        {/* Bottom content about the page and me */}
        {!animated && (
          <div className="bottomtext absolute -bottom-20 text-xs md:text-sm text-black text-opacity-40 font-medium flex items-center flex-col">
            Search Whatever, There are Infinite GIFs
            <div className="footer mb-2 font-medium">
              Made by{" "}
              <a
                href="https://tanmay-kumar.netlify.app/"
                target="_blank"
                className="text-blue-500"
              >
                Tanmay
              </a>
            </div>
          </div>
        )}

        {/* Search Box with Hotsearch */}
        <motion.div
          layout
          className="searchbox flex w-full gap-2 md:gap-4 items-center justify-center flex-wrap "
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
              name="hot_search"
              placeholder="Search Anything . . ."
              className="outline-none border-none flex-1 bg-transparent"
            />
            {loader && <Spin />}
            {searchData.length != 0 && (
              <CloseOutlined
                className="cursor-pointer"
                onClick={() => {
                  setSearchData("");
                }}
              />
            )}
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

        {/* Gif Contailer where gifs are loaded with a loading animation */}
        <motion.div
          layout
          className="gifcontainer flex items-center justify-center"
        >
          {isGifLoaded && (
            <div className="flex flex-col gap-6">
              <div className="flex gap-5 flex-wrap items-center justify-center">
                {gif.length != 0 ? (
                  gif
                    .slice(page * pageSize - pageSize, page * pageSize)
                    ?.map((gif, index) => (
                      <GifImage
                        key={index}
                        like={like}
                        gif={gif}
                        isSaved={false}
                      />
                    ))
                ) : (
                  <span className="text-black text-lg font-medium">
                    No Gifs Found
                  </span>
                )}
              </div>
              <div className="bottombar w-full flex items-center justify-center gap-3">
                <Pagination
                  defaultCurrent={1}
                  total={gif.length}
                  defaultPageSize={20}
                  className=""
                  onChange={(page, pageSize) => {
                    setPage(page);
                    setPaseSize(pageSize);
                  }}
                />
                <Button onClick={loadmore}>Load More</Button>
                {/* <div
                  className="loadmore p-2 px-4 rounded-md bg-black self-center text-white cursor-pointer"
                  onClick={loadmore}
                >
                  Load More
                </div> */}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GifContainer;
