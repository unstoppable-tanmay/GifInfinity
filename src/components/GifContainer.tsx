import { useRef, useState } from "react";
import { motion } from "framer-motion";

import { delay } from "../helpers/utils";
import { message } from "antd";

import useUser from "@/app/store/useUser";

const GifContainer = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [animated, setAnimated] = useState(false);
  const [closed, setClosed] = useState(false);
  const [loader, setLoader] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const [searchData, setSearchData] = useState("");

  const {isUser} = useUser()

  const animate = async () => {
    setAnimated(true);
    await delay(300);
    setClosed(true);
    setLoader(true);
  };

  const search = () => {
    if (!searchData) {
      messageApi.open({
        type: "error",
        content: "Type Anything In The Box",
      });
      return;
    }
    else if(!isUser){
      messageApi.open({
        type: "error",
        content: "Please Sign In to Search",
      });
      return;
    }
    animate();
  };
  return (
    <div className="wrapper flex items-center justify-center flex-1">
      <motion.div
        layout
        className={`container ${
          animated ? "w-[90vw] min-h-[80vh]" : "w-[750px]"
        } max-w-[90vw] p-2 md:p-5 rounded-2xl bg-white flex items-center justify-start flex-col shadow-lg relative -mt-9`}
      >
        {contextHolder}

        {!animated && (
          <div className="bottomtext absolute -bottom-9 text-xs md:text-sm text-black text-opacity-40 font-medium ">
            Search What Can You Do, We Have Infinity
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
          <motion.div
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
          </motion.div>
        </motion.div>

        <motion.div
          layout
          className="gifcontainer flex items-center justify-center"
        >
          {loader && <motion.div layout className="loader"></motion.div>}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default GifContainer;
