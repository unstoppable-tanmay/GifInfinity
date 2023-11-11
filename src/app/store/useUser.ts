import { create } from "zustand";

type user = {
  uid:string
  name: string;
  email: string;
  saved: string[];
};

interface UserType {
  mainLoading: boolean;
  isUser: boolean;
  user: user;
  setMainLoading: (arg0: boolean) => void;
  setUser: (arg0: user) => void;
  setIsUser: (arg0: boolean) => void;
}

const useUser = create<UserType>((set) => ({
  mainLoading: true,
  isUser: false,
  user: { uid:"",name: "", email: "", saved: [] },
  setUser: (data) => set({ user: data }),
  setIsUser: (data: boolean) =>
    set({
      isUser: data,
    }),
  setMainLoading: (data) => set({ mainLoading: data }),
}));

export default useUser;