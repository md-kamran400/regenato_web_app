// import React from "react";
// import { Navigate } from "react-router-dom";

// // Regenato
// import Home from "../pages/Regenato/Home";
// import Parts from "../pages/Regenato/Parts";
// import Variables from "../pages/Regenato/Variables";
// import Projects from "../pages/Regenato/Projects";
// import Resource from "../pages/Regenato/Resource";
// import SinglePart from "../pages/Regenato/Parts/SinglePart";
// import SingeProject from "../pages/Regenato/Projects/SingeProject";
// import ProjectInvoice from "../pages/Regenato/Projects/ProjectInvoice";
// import ProjectSection from "../pages/Regenato/Projects/ProjectSection";
// import BomNav from "../pages/Regenato/BOM";

// //AuthenticationInner pages
// import BasicSignIn from '../pages/AuthenticationInner/Login/BasicSignIn';
// import CoverSignIn from '../pages/AuthenticationInner/Login/CoverSignIn';
// import BasicSignUp from '../pages/AuthenticationInner/Register/BasicSignUp';
// import CoverSignUp from "../pages/AuthenticationInner/Register/CoverSignUp";
// import BasicPasswReset from '../pages/AuthenticationInner/PasswordReset/BasicPasswReset';
// //pages

// import CoverPasswReset from '../pages/AuthenticationInner/PasswordReset/CoverPasswReset';
// import BasicLockScreen from '../pages/AuthenticationInner/LockScreen/BasicLockScr';
// import CoverLockScreen from '../pages/AuthenticationInner/LockScreen/CoverLockScr';
// import BasicLogout from '../pages/AuthenticationInner/Logout/BasicLogout';
// import CoverLogout from '../pages/AuthenticationInner/Logout/CoverLogout';
// import BasicSuccessMsg from '../pages/AuthenticationInner/SuccessMessage/BasicSuccessMsg';
// import CoverSuccessMsg from '../pages/AuthenticationInner/SuccessMessage/CoverSuccessMsg';
// import BasicTwosVerify from '../pages/AuthenticationInner/TwoStepVerification/BasicTwosVerify';
// import CoverTwosVerify from '../pages/AuthenticationInner/TwoStepVerification/CoverTwosVerify';
// import Basic404 from '../pages/AuthenticationInner/Errors/Basic404';
// import Cover404 from '../pages/AuthenticationInner/Errors/Cover404';
// import Alt404 from '../pages/AuthenticationInner/Errors/Alt404';
// import Error500 from '../pages/AuthenticationInner/Errors/Error500';

// import BasicPasswCreate from "../pages/AuthenticationInner/PasswordCreate/BasicPasswCreate";
// import CoverPasswCreate from "../pages/AuthenticationInner/PasswordCreate/CoverPasswCreate";

// //login
// import Login from "../pages/Authentication/Login";
// import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
// import Logout from "../pages/Authentication/Logout";
// import Register from "../pages/Authentication/Register";

// // User Profile
// import UserProfile from "../pages/Authentication/user-profile";
// // import ProjectSection from "../pages/Regenato/Projects/ProjectSection";

// // Section
// const authProtectedRoutes = [

//     // regenato start here
//     { path: "/regenato-home", component: <Home /> },
//     { path: "/regenato-projects", component: <Projects /> },
//     { path: "/regenato-parts", component: <Parts /> },
//     { path: "/regenato-resource", component: <Resource /> },
//     { path: "/regenato-bom", component: <BomNav /> },
//     { path: "/regenato-variables", component: <Variables /> },
//     { path: "/singlepart/:_id", component: <SinglePart /> },
//     { path: "/singleproject/:_id", component: <SingeProject /> },
//     { path: "/projectSection/:_id", component: <ProjectSection /> },
//     { path: "/projectinvoice", component: <ProjectInvoice /> },

//   {
//     path: "/",
//     exact: true,
//     component: <Navigate to="/regenato-home" />,
//   },
//   { path: "*", component: <Navigate to="/regenato-home" /> },
// ];

// const publicRoutes = [

//   // regenato start here
//   // { path: "/regenato-home", component: <Home /> },
//   // { path: "/regenato-projects", component: <Projects /> },
//   // { path: "/regenato-parts", component: <Parts /> },
//   // { path: "/regenato-variables", component: <Variables /> },
//   // regenato ends here

//   // Authentication Page
//   { path: "/logout", component: <Logout /> },
//   { path: "/login", component: <Login /> },
//   { path: "/forgot-password", component: <ForgetPasswordPage /> },
//   { path: "/register", component: <Register /> },

//   //AuthenticationInner pages
//   { path: "/auth-signin-basic", component: <BasicSignIn /> },
//   { path: "/auth-signin-cover", component: <CoverSignIn /> },
//   { path: "/auth-signup-basic", component: <BasicSignUp /> },
//   { path: "/auth-signup-cover", component: <CoverSignUp /> },
//   { path: "/auth-pass-reset-basic", component: <BasicPasswReset /> },
//   { path: "/auth-pass-reset-cover", component: <CoverPasswReset /> },
//   { path: "/auth-lockscreen-basic", component: <BasicLockScreen /> },
//   { path: "/auth-lockscreen-cover", component: <CoverLockScreen /> },
//   { path: "/auth-logout-basic", component: <BasicLogout /> },
//   { path: "/auth-logout-cover", component: <CoverLogout /> },
//   { path: "/auth-success-msg-basic", component: <BasicSuccessMsg /> },
//   { path: "/auth-success-msg-cover", component: <CoverSuccessMsg /> },
//   { path: "/auth-twostep-basic", component: <BasicTwosVerify /> },
//   { path: "/auth-twostep-cover", component: <CoverTwosVerify /> },
//   { path: "/auth-404-basic", component: <Basic404 /> },
//   { path: "/auth-404-cover", component: <Cover404 /> },
//   { path: "/auth-404-alt", component: <Alt404 /> },
//   { path: "/auth-500", component: <Error500 /> },

//   { path: "/auth-pass-change-basic", component: <BasicPasswCreate /> },
//   { path: "/auth-pass-change-cover", component: <CoverPasswCreate /> },

// ];

// export { authProtectedRoutes, publicRoutes };




import React from "react";
import { Navigate } from "react-router-dom";

// Regenato
import Home from "../pages/Regenato/Home";
import Parts from "../pages/Regenato/Parts";
import Variables from "../pages/Regenato/Variables";
import Projects from "../pages/Regenato/Projects";
import Resource from "../pages/Regenato/Resource";
import SinglePart from "../pages/Regenato/Parts/SinglePart";
import SingeProject from "../pages/Regenato/Projects/SingeProject";
import ProjectInvoice from "../pages/Regenato/Projects/ProjectInvoice";
import ProjectSection from "../pages/Regenato/Projects/ProjectSection";
import BomNav from "../pages/Regenato/BOM";

//AuthenticationInner pages
import BasicSignIn from "../pages/AuthenticationInner/Login/BasicSignIn";
import CoverSignIn from "../pages/AuthenticationInner/Login/CoverSignIn";
import BasicSignUp from "../pages/AuthenticationInner/Register/BasicSignUp";
import CoverSignUp from "../pages/AuthenticationInner/Register/CoverSignUp";
import BasicPasswReset from "../pages/AuthenticationInner/PasswordReset/BasicPasswReset";
//pages

import CoverPasswReset from "../pages/AuthenticationInner/PasswordReset/CoverPasswReset";
import BasicLockScreen from "../pages/AuthenticationInner/LockScreen/BasicLockScr";
import CoverLockScreen from "../pages/AuthenticationInner/LockScreen/CoverLockScr";
import BasicLogout from "../pages/AuthenticationInner/Logout/BasicLogout";
import CoverLogout from "../pages/AuthenticationInner/Logout/CoverLogout";
import BasicSuccessMsg from "../pages/AuthenticationInner/SuccessMessage/BasicSuccessMsg";
import CoverSuccessMsg from "../pages/AuthenticationInner/SuccessMessage/CoverSuccessMsg";
import BasicTwosVerify from "../pages/AuthenticationInner/TwoStepVerification/BasicTwosVerify";
import CoverTwosVerify from "../pages/AuthenticationInner/TwoStepVerification/CoverTwosVerify";
import Basic404 from "../pages/AuthenticationInner/Errors/Basic404";
import Cover404 from "../pages/AuthenticationInner/Errors/Cover404";
import Alt404 from "../pages/AuthenticationInner/Errors/Alt404";
import Error500 from "../pages/AuthenticationInner/Errors/Error500";

import BasicPasswCreate from "../pages/AuthenticationInner/PasswordCreate/BasicPasswCreate";
import CoverPasswCreate from "../pages/AuthenticationInner/PasswordCreate/CoverPasswCreate";

//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
import UserProfile from "../pages/Authentication/user-profile";
import NewAssmebliy from "../pages/Regenato/MultyUseAssmebly/Assmeblies";
import NewSubAssmebly from "../pages/Regenato/MultyUseAssmebly/SubAssmeblies";
import NewPartsLists from "../pages/Regenato/MultyUseAssmebly/Parts-Lists";
import { components } from "react-select";
import SingleSubAssembly from "../pages/Regenato/MultyUseAssmebly/SubAssmeblies/SingleSubAssembly";
import SinglePartsList from "../pages/Regenato/MultyUseAssmebly/Parts-Lists/SinglePartsList";
import SingleAssmeblyList from "../pages/Regenato/MultyUseAssmebly/Assmeblies/SingleAssmeblyList";
// import ProjectSection from "../pages/Regenato/Projects/ProjectSection";

// Section
const authProtectedRoutes = [
  // // regenato start here
  // { path: "/regenato-home", component: <Home /> },
  // { path: "/regenato-projects", component: <Projects /> },
  // { path: "/regenato-parts", component: <Parts /> },
  // { path: "/regenato-resource", component: <Resource /> },
  // { path: "/regenato-bom", component: <BomNav /> },
  // { path: "/regenato-variables", component: <Variables /> },
  // { path: "/singlepart/:_id", component: <SinglePart /> },
  // { path: "/singleproject/:_id", component: <SingeProject /> },
  // { path: "/projectSection/:_id", component: <ProjectSection /> },
  // { path: "/projectinvoice", component: <ProjectInvoice /> },
];

const publicRoutes = [
  // regenato start here
  // { path: "/regenato-home", component: <Home /> },
  // { path: "/regenato-projects", component: <Projects /> },
  // { path: "/regenato-parts", component: <Parts /> },
  // { path: "/regenato-variables", component: <Variables /> },

  // regenato start here
  { path: "/regenato-home", component: <Home /> },
  { path: "/regenato-projects", component: <Projects /> },
  { path: "/regenato-parts", component: <Parts /> },
  { path: "/regenato-resource", component: <Resource /> },
  { path: "/regenato-bom", component: <BomNav /> },
  { path: "/regenato-variables", component: <Variables /> },
  { path: "/singlepart/:_id", component: <SinglePart /> },

  { path: "/singleproject/:_id", component: <SingeProject /> },
  { path: "/projectSection/:_id", component: <ProjectSection /> },
  { path: "/projectinvoice", component: <ProjectInvoice /> },
  // SingleSubAssembly

  { path: "/regenato-assembly-list", component: <NewAssmebliy /> }, // New route
  { path: "/regenato-sub-assembly-list", component: <NewSubAssmebly /> }, // New route
  { path: "/regenato-parts-list", component: <NewPartsLists /> }, // New route

  { path: "/singleSubAssembly/:_id", component: <SingleSubAssembly /> }, // New route
  { path: "/singleAssembly/:_id", component: <SingleAssmeblyList /> }, // New route
  // {path: "/regenato-single-subAssmebly", component: <SingleSubAssembly/>},
  // {path: "/regenato-single-parts", component: <SinglePartsList/>},
  // {path: "/regenato-single-assmebly", component: <SingleAssmeblyList/>},
  // {path: "/regenato-single-assmebly", component: <SingleAssmeblyList/>},

  {
    path: "/",
    exact: true,
    component: <Navigate to="/regenato-home" />,
  },
  { path: "*", component: <Navigate to="/regenato-home" /> },

  // regenato ends here

  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
  { path: "/forgot-password", component: <ForgetPasswordPage /> },
  { path: "/register", component: <Register /> },

  //AuthenticationInner pages
  { path: "/auth-signin-basic", component: <BasicSignIn /> },
  { path: "/auth-signin-cover", component: <CoverSignIn /> },
  { path: "/auth-signup-basic", component: <BasicSignUp /> },
  { path: "/auth-signup-cover", component: <CoverSignUp /> },
  { path: "/auth-pass-reset-basic", component: <BasicPasswReset /> },
  { path: "/auth-pass-reset-cover", component: <CoverPasswReset /> },
  { path: "/auth-lockscreen-basic", component: <BasicLockScreen /> },
  { path: "/auth-lockscreen-cover", component: <CoverLockScreen /> },
  { path: "/auth-logout-basic", component: <BasicLogout /> },
  { path: "/auth-logout-cover", component: <CoverLogout /> },
  { path: "/auth-success-msg-basic", component: <BasicSuccessMsg /> },
  { path: "/auth-success-msg-cover", component: <CoverSuccessMsg /> },
  { path: "/auth-twostep-basic", component: <BasicTwosVerify /> },
  { path: "/auth-twostep-cover", component: <CoverTwosVerify /> },
  { path: "/auth-404-basic", component: <Basic404 /> },
  { path: "/auth-404-cover", component: <Cover404 /> },
  { path: "/auth-404-alt", component: <Alt404 /> },
  { path: "/auth-500", component: <Error500 /> },

  { path: "/auth-pass-change-basic", component: <BasicPasswCreate /> },
  { path: "/auth-pass-change-cover", component: <CoverPasswCreate /> },
];

export { authProtectedRoutes, publicRoutes };
