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

//login
import Login from "../pages/Authentication/Login";
import ForgetPasswordPage from "../pages/Authentication/ForgetPassword";
import Logout from "../pages/Authentication/Logout";
import Register from "../pages/Authentication/Register";

// User Profile
// import UserProfile from "../pages/Authentication/user-profile";
import NewAssmebliy from "../pages/Regenato/MultyUseAssmebly/Assmeblies";
import NewSubAssmebly from "../pages/Regenato/MultyUseAssmebly/SubAssmeblies";
import NewPartsLists from "../pages/Regenato/MultyUseAssmebly/Parts-Lists";
import { components } from "react-select";
import SingleSubAssembly from "../pages/Regenato/MultyUseAssmebly/SubAssmeblies/SingleSubAssembly";
import SinglePartsList from "../pages/Regenato/MultyUseAssmebly/Parts-Lists/SinglePartsList";
import SingleAssmeblyList from "../pages/Regenato/MultyUseAssmebly/Assmeblies/SingleAssmeblyList";
import UserHandle from "../pages/Regenato/User_Management/UserHandle";
import HoursPlanningTab from "../pages/Regenato/Projects/HoursPlanningTab";
import AllocationPage from "../pages/Regenato/Projects/Allocation/AllocationPage";
import AllocationList from "../pages/Regenato/Projects/Allocation/AllocationList";
import TimeLine from "../pages/Regenato/TimeLine/TimeLine";
import { PlanPage } from "../pages/Regenato/TimeLine/PlanPage/PlanPage";
import MachineCapecity from "../pages/Regenato/Capecity/MachineCapecity";
import OpearatorCapecity from "../pages/Regenato/Capecity/OpearatorCapecity";
import TimePage from "../pages/Regenato/ProcessTImeline/PageTime";
// import ProjectSection from "../pages/Regenato/Projects/ProjectSection";

// Auth

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
  { path: "/hoursplanningtab/:_id", component: <HoursPlanningTab /> },

  { path: "/singleproject/:_id", component: <SingeProject /> },
  { path: "/projectSection/:_id", component: <ProjectSection /> },
  { path: "/projectinvoice", component: <ProjectInvoice /> },
  { path: "/regenato-timeline", component: <TimeLine /> },
  { path: "/regenato-planPage/:allocationId", component: <PlanPage /> },
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

  // capecity
  { path: "/regenato-machine-capecity", component: <MachineCapecity /> },
  { path: "/regenato-operator-capecity", component: <OpearatorCapecity /> },

  { path: "/regenato-process-view", component: <TimePage /> },

  { path: "/regenato-user-management", component: <UserHandle /> },

  // allocation Page;
  { path: "/regenato-allocation", component: <AllocationPage /> },
  // { path: "/regenato-allocation/:_id", component: <AllocationList /> },

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

  // { path: "/auth-pass-change-basic", component: <BasicPasswCreate /> },
  // { path: "/auth-pass-change-cover", component: <CoverPasswCreate /> },
];

export { authProtectedRoutes, publicRoutes };
