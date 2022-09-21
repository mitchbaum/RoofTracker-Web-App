import React from "react";
import { AiFillSetting } from "react-icons/ai";
import { IoMdPeople } from "react-icons/io";
import { BiLogOut } from "react-icons/bi";
import { BsFillFolderFill } from "react-icons/bs";
import { MdSpaceDashboard } from "react-icons/md";

export const SuperAdminSidebarPages = [
  {
    title: "Home",
    path: "/home",
    icon: <MdSpaceDashboard />,
    className: "nav-text",
  },
  {
    title: "Team",
    path: "/team",
    icon: <IoMdPeople />,
    className: "nav-text",
  },
  {
    title: "My Files",
    path: "/my-files",
    icon: <BsFillFolderFill />,
    className: "nav-text",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <AiFillSetting />,
    className: "nav-text",
  },
];

export const UserSidebarPages = [
  {
    title: "My Files",
    path: "/my-files",
    icon: <BsFillFolderFill />,
    className: "nav-text",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: <AiFillSetting />,
    className: "nav-text",
  },
];
