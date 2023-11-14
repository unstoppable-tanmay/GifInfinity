import React, { useState } from "react";
import useUser from "../app/store/useUser";
import { Dropdown, Input, MenuProps, Modal, Spin, message } from "antd";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  updateEmail,
} from "firebase/auth";

import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  KeyOutlined,
  MailOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { NoticeType } from "antd/es/message/interface";
import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { auth, db } from "@/helpers/firebase";
import GifImage from "./GifImage";
import Image from "next/image";

const Navbar = () => {
  const { isUser, user, setIsUser, setUser, mainLoading, setMainLoading } =
    useUser();
  const [signin, setSignin] = useState(false);
  const [login, setLogin] = useState(false);
  const [updatepassword, setUpdatepassword] = useState(false);
  const [updateemail, setUpdateemail] = useState(false);
  const [opensaved, setOpensaved] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Open The Message box (Toast)
  const OpenMessage = (type: NoticeType, content: string) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

  // Gettign UserData If User Signed in or Signed Up
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

  // Login Function with email & password
  const Login = async () => {
    try {
      setMainLoading(true);
      if (userData.email == "" || userData.password == "") {
        OpenMessage("error", "Enter the mail and password");
        return;
      }
      signInWithEmailAndPassword(auth, userData.email, userData.password)
        .then((data) => {
          console.log(data);
          getUserData(data.user.uid);
          OpenMessage("success", "Logged in Succesfully");
          setIsUser(true);
          setLogin(false);
        })
        .catch((e) => {
          OpenMessage("error", e.message);
          setIsUser(false);
        });
      setMainLoading(false);
    } catch (e) {
      OpenMessage("error", "Some Error Occured");
      setIsUser(false);
    }
  };

  // Signup Function with email & password
  const SignUp = () => {
    try {
      setMainLoading(true);
      if (
        userData.email == "" ||
        userData.password == "" ||
        userData.name == ""
      ) {
        OpenMessage("error", "Enter the mail and password");
        return;
      }
      createUserWithEmailAndPassword(auth, userData.email, userData.password)
        .then(async (data) => {
          console.log(data);
          try {
            await setDoc(doc(db, "user", data.user.uid), {
              uid: data.user.uid,
              name: userData.name,
              email: userData.email,
              saved: [],
            })
              .then(() => {
                setUser({
                  uid: data.user.uid,
                  name: userData.name,
                  email: userData.email,
                  saved: [],
                });
                OpenMessage("success", "Logged in Succesfully");
                setIsUser(true);
                setSignin(false);
              })
              .catch((e) => {
                OpenMessage("error", e.message);
                setIsUser(false);
              });
          } catch (e) {
            console.log(e);
            OpenMessage("error", "Some Internal Error occured");
            setIsUser(false);
          }
        })
        .catch((e) => {
          OpenMessage("error", e.message);
          setIsUser(false);
        });
      setMainLoading(false);
    } catch (e) {
      console.log(e);
      OpenMessage("error", "Some Error Occured");
      setIsUser(false);
    }
  };

  // Signout function and reset page data
  const SignOut = () => {
    try {
      auth
        .signOut()
        .then(() => {
          setIsUser(false);
          OpenMessage("success", "Sign Out SuccessFully");
        })
        .catch((e) => {
          OpenMessage("error", e);
        });
      // setUser({ name: "", email: "", saved: [] });
      setUserData({ name: "", email: "", password: "" });
    } catch (e) {
      OpenMessage("error", "Some Error Occured");
    }
  };

  // Update Email function 
  const UpdateEmail = (email: string) => {
    try {
      updateEmail(auth.currentUser!, email)
        .then(() => {
          OpenMessage("success", "Email Changed Succesfully");
          setUpdateemail(false);
        })
        .catch((e) => {
          OpenMessage("error", e.message);
        });
    } catch (e) {
      OpenMessage("error", "Some Error Occured");
    }
  };

  // Upadate password function 
  const UpdatePassword = (password: string) => {
    try {
      updatePassword(auth.currentUser!, password)
        .then(() => {
          OpenMessage("success", "Password Succesfully Updated");
          setUpdatepassword(false);
        })
        .catch((e) => {
          OpenMessage("error", e.message);
        });
    } catch (e) {
      OpenMessage("error", "Some Error Occured");
    }
  };

  // like The gif 
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


  // Items for the dropdown for profile
  const items: MenuProps["items"] = [
    {
      label: "Saved GIFs",
      key: "1",
      onClick: () => {
        setOpensaved(true);
      },
    },
    {
      label: "Update Email",
      key: "2",
      onClick: () => {
        setUpdateemail(true);
      },
    },
    {
      label: "Update Password",
      key: "3",
      onClick: () => {
        setUpdatepassword(true);
      },
    },
    {
      label: "Log out",
      key: "4",
      icon: <LogoutOutlined />,
      onClick: SignOut,
    },
  ];

  return (
    <>
      <Spin spinning={mainLoading} fullscreen />
      {contextHolder}
      <div className="Nav w-full flex items-center justify-between px-6 py-3">
        <div className="logo font-semibold text-2xl leading-none cursor-pointer">
          GIFInfinity
        </div>
        {isUser ? (
          // If User logged in
          <Dropdown menu={{ items }} trigger={["click"]} className="mr-2">
            <div className="flex gap-2 items-center justify-center">
              <div className="name text-lg cursor-pointer leading-none font-medium">
                {user.name}
              </div>
              <div className=" image w-[40px] h-[40px] rounded-full cursor-pointer bg-white border-black border flex items-center justify-center text-2xl font-semibold relative overflow-hidden">
                <Image src={'/images/profile.gif'} alt="" fill className="object-cover"></Image>
              </div>
            </div>
            {/* </a> */}
          </Dropdown>
        ) : (
          // If User Not Logged In
          <div className="name text-lg cursor-pointer leading-none flex gap-4 md:gap-6">
            <span
              onClick={() => {
                setSignin(true);
              }}
              className="p-3 px-4 rounded-full bg-white shadow-sm"
            >
              Signup
            </span>
            <span
              onClick={() => {
                setLogin(true);
              }}
              className="p-3 px-4 rounded-full bg-white shadow-sm"
            >
              Login
            </span>
          </div>
        )}

        {/* Sign up */}
        <Modal
          title="Sign Up"
          open={signin}
          centered
          width={400}
          onOk={SignUp}
          onCancel={() => {
            setSignin(false);
          }}
          closable
          okButtonProps={{ style: { background: "#4096ff" } }}
          okText="Sign Up"
        >
          <div className="signup flex flex-col gap-3 py-3">
            <Input
              placeholder="Name"
              size="large"
              name="name"
              prefix={<UserOutlined />}
              value={userData.name}
              onChange={(data) => {
                setUserData({
                  name: data.target.value,
                  email: userData?.email,
                  password: userData?.password,
                });
              }}
            />
            <Input
              placeholder="Email"
              size="large"
              name="email"
              prefix={<MailOutlined />}
              value={userData.email}
              onChange={(data) => {
                setUserData({
                  name: userData.name,
                  email: data.target.value,
                  password: userData.password,
                });
              }}
            />
            <Input.Password
              placeholder="Password"
              size="large"
              name="password"
              prefix={<KeyOutlined />}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              value={userData.password}
              onChange={(data) => {
                setUserData({
                  name: userData.name,
                  email: userData.email,
                  password: data.target.value,
                });
              }}
            />
          </div>
        </Modal>
        {/* login */}
        <Modal
          title="Log In"
          open={login}
          centered
          width={400}
          onOk={Login}
          onCancel={() => {
            setLogin(false);
          }}
          okButtonProps={{ style: { background: "#4096ff" } }}
          okText="Log In"
        >
          <div className="Login flex flex-col gap-3 py-3">
            <Input
              placeholder="Email"
              size="large"
              name="email"
              prefix={<MailOutlined />}
              value={userData.email}
              onChange={(data) => {
                setUserData({
                  name: userData.name,
                  email: data.target.value,
                  password: userData.password,
                });
              }}
            />
            <Input.Password
              placeholder="Password"
              size="large"
              name="password"
              prefix={<KeyOutlined />}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              value={userData.password}
              onChange={(data) => {
                setUserData({
                  name: userData.name,
                  email: userData.email,
                  password: data.target.value,
                });
              }}
            />
          </div>
        </Modal>
        {/* Password Update */}
        <Modal
          title="Update Password"
          open={updatepassword}
          centered
          width={400}
          onOk={() => UpdatePassword(userData.password)}
          onCancel={() => {
            setUpdatepassword(false);
          }}
          okButtonProps={{ style: { background: "#4096ff" } }}
          okText="Update"
        >
          <div className="Login flex flex-col gap-3 py-3">
            <Input.Password
              placeholder="Password"
              size="large"
              name="password"
              prefix={<KeyOutlined />}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              value={userData.password}
              onChange={(data) => {
                setUserData({
                  name: userData.name,
                  email: userData.email,
                  password: data.target.value,
                });
              }}
            />
          </div>
        </Modal>
        {/* Email Update */}
        <Modal
          title="Update Email"
          open={updateemail}
          centered
          width={400}
          onOk={() => {
            UpdateEmail(userData.email);
          }}
          onCancel={() => {
            setUpdateemail(false);
          }}
          okButtonProps={{ style: { background: "#4096ff" } }}
          okText="Update"
        >
          <div className="Login flex flex-col gap-3 py-3">
            <Input
              placeholder="Email"
              size="large"
              name="email"
              prefix={<MailOutlined />}
              value={userData.email}
              onChange={(data) => {
                setUserData({
                  name: userData.name,
                  email: data.target.value,
                  password: userData.password,
                });
              }}
            />
          </div>
        </Modal>
        {/* Saved */}
        <Modal
          title="Saved Gifs"
          open={opensaved}
          centered
          width={"80vw"}
          onCancel={() => {
            setOpensaved(false);
          }}
          footer
          style={{marginTop: "10vh"}}
          // okButtonProps={{ style: { background: "#4096ff" } }}
          // okText="Close"
        >
          <div className="flex gap-5 flex-wrap items-center justify-center">
            {user.saved.map((gif, index) => (
              <GifImage key={index} like={like} gif={gif} isSaved />
            ))}
            {user.saved.length==0 && <div className="text-lg">No Saved GIFs There</div>}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Navbar;
