import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

import useUser from "@/app/store/useUser";

const GifImage = ({
  like,
  gif,
  isSaved,
}: {
  like: (link: string) => Promise<void>;
  gif: any;
  isSaved: boolean;
}) => {
  const { user, setUser } = useUser();
  const [color, setColor] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (user.saved.includes(isSaved ? gif : gif.images.fixed_height.url)) {
      setColor(true);
    } else {
      setColor(false);
    }
  }, [user]);

  return (
    <div
      className="imgcontainer relative "
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
    >
      <div
        className="fav absolute w-[40px] h-[40px] right-0 rounded-tr-md rounded-bl-full bg-black bg-opacity-40 flex items-center justify-center z-20"
        onClick={() => {
          like(isSaved ? gif : gif.images.fixed_height.url);
        }}
      >
        <motion.img
          src="/icons/heart.svg"
          alt=""
          className={`w-[23px] h-[23px] invert -mt-2 -mr-2 ${
            color && " change-color-to-wellow "
          }`}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, pointerEvents: "none" }}
        animate={hovered ? { opacity: 1, pointerEvents: "all" } : {}}
        className="hovershare absolute w-full h-full bg-black bg-opacity-40 rounded-md z-10 flex items-center justify-center"
      >
        <div
          className="share p-2 px-4 rounded-full bg-white bg-opacity-75 cursor-pointer"
          onClick={() => {
            navigator.share({
              url: isSaved ? gif : gif.images.fixed_height.url,
            });
          }}
        >
          Share
        </div>
      </motion.div>
      <motion.img
        className="w-[200px] h-[200px] rounded-md  object-cover bg-slate-400"
        src={isSaved ? gif : gif.images.fixed_height.url}
        alt="gif"
      />
    </div>
  );
};

export default GifImage;
