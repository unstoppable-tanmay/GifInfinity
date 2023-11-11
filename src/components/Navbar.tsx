import React, { useState } from "react";
import useUser from "../app/store/useUser";
import { Drawer, Dropdown, Input, MenuProps, Modal, Spin, message } from "antd";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getAuth,
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
import { addDoc, collection, doc, getDoc, setDoc } from "@firebase/firestore";
import { auth, db } from "@/helpers/firebase";

const Navbar = () => {
  const { isUser, user, setIsUser, setUser, mainLoading, setMainLoading } =
    useUser();
  const [signin, setSignin] = useState(false);
  const [login, setLogin] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const OpenMessage = (type: NoticeType, content: string) => {
    messageApi.open({
      type: type,
      content: content,
    });
  };

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
              name: userData.name,
              email: userData.email,
              saved: [],
            })
              .then((data) => {
                setUser({
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

  const items: MenuProps["items"] = [
    {
      label: "Saved GIFs",
      key: "1",
    },
    {
      label: "Reset password",
      key: "2",
    },
    {
      label: "Forgot Password",
      key: "3",
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
        <div className="logo font-semibold text-2xl leading-none">
          GIFInfinity
        </div>
        {isUser ? (
          <Dropdown menu={{ items }} trigger={["click"]} className="mr-2">
            <div className="flex gap-2 items-center justify-center">
              <div className="name text-lg cursor-pointer leading-none -mt-[4px] font-medium">
                {user.name || "Tanmay"}
              </div>
              <div className="border-right-top image w-[40px] h-[40px] rounded-full cursor-pointer bg-white border-black flex items-center justify-center text-2xl font-semibold"></div>
            </div>
            {/* </a> */}
          </Dropdown>
        ) : (
          <div className="name text-lg cursor-pointer leading-none flex gap-4 md:gap-6">
            <span
              onClick={() => {
                setSignin(true);
              }}
              className="p-3 px-6 rounded-full bg-white shadow-sm"
            >
              Signup
            </span>
            <span
              onClick={() => {
                setLogin(true);
              }}
              className="p-3 px-6 rounded-full bg-white shadow-sm"
            >
              Login
            </span>
          </div>
        )}

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
      </div>
    </>
  );
};

export default Navbar;
