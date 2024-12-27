import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Form,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

//import images
// import logoSm from "../assets/images/logo-sm.png";
// import logoDark from "../assets/images/logo-dark.png";
// import logoLight from "../assets/images/logo-light.png";

// //import Components
// import SearchOption from "../Components/Common/SearchOption";
// import LanguageDropdown from "../Components/Common/LanguageDropdown";
// import WebAppsDropdown from "../Components/Common/WebAppsDropdown";
// import MyCartDropdown from "../Components/Common/MyCartDropdown";
// import FullScreenDropdown from "../Components/Common/FullScreenDropdown";
// import NotificationDropdown from "../Components/Common/NotificationDropdown";
// import ProfileDropdown from "../Components/Common/ProfileDropdown";
// import LightDark from "../Components/Common/LightDark";

import { changeSidebarVisibility } from "../slices/thunks";
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";

import navdata from '../Layouts/LayoutMenuData';

import "./style.css"
import ProfileDropdown from "../Components/Common/ProfileDropdown";

const Navbar = () => {
  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMobileMenu = () => setMenuOpen(!menuOpen);

  const selectDashboardData = createSelector(
    (state) => state.Layout,
    (sidebarVisibilitytype) => sidebarVisibilitytype.sidebarVisibilitytype
  );
  // Inside your component
  const sidebarVisibilitytype = useSelector(selectDashboardData);

  const [search, setSearch] = useState(false);
  const toogleSearch = () => {
    setSearch(!search);
  };

  const toogleMenuBtn = () => {
    var windowSize = document.documentElement.clientWidth;
    dispatch(changeSidebarVisibility("show"));

    if (windowSize > 767)
      document.querySelector(".hamburger-icon").classList.toggle("open");

    //For collapse horizontal menu
    if (document.documentElement.getAttribute("data-layout") === "horizontal") {
      document.body.classList.contains("menu")
        ? document.body.classList.remove("menu")
        : document.body.classList.add("menu");
    }

    //For collapse vertical and semibox menu
    if (
      sidebarVisibilitytype === "show" &&
      (document.documentElement.getAttribute("data-layout") === "vertical" ||
        document.documentElement.getAttribute("data-layout") === "semibox")
    ) {
      if (windowSize < 1025 && windowSize > 767) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "sm"
          ? document.documentElement.setAttribute("data-sidebar-size", "")
          : document.documentElement.setAttribute("data-sidebar-size", "sm");
      } else if (windowSize > 1025) {
        document.body.classList.remove("vertical-sidebar-enable");
        document.documentElement.getAttribute("data-sidebar-size") === "lg"
          ? document.documentElement.setAttribute("data-sidebar-size", "sm")
          : document.documentElement.setAttribute("data-sidebar-size", "lg");
      } else if (windowSize <= 767) {
        document.body.classList.add("vertical-sidebar-enable");
        document.documentElement.setAttribute("data-sidebar-size", "lg");
      }
    }

    //Two column menu
    if (document.documentElement.getAttribute("data-layout") === "twocolumn") {
      document.body.classList.contains("twocolumn-panel")
        ? document.body.classList.remove("twocolumn-panel")
        : document.body.classList.add("twocolumn-panel");
    }
  };

  const menuItems = navdata()[0]?.subItems || [];

  return (
    <React.Fragment>
      <header className="header-class">
        <div className="layout-width">
          <div className="navbar-header">
            {/* <div className="d-flex">
              <button
                onClick={toogleMenuBtn}
                type="button"
                className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger shadow-none"
                id="topnav-hamburger-icon"
              >
                <span className="hamburger-icon">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div> */}

            <div className="d-flex align-items-center" >
              {/* Navbar Menu */}
              <nav className={`navbar ${menuOpen ? "show" : ""}`}>
                <ul className="nav">
                  {menuItems.map((item) => (
                    <li key={item.id} className="nav-item">
                      <Link to={item.link} className="nav-link">
                        <i className={item.icon}></i> {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              
            </div>
            <ProfileDropdown />
          </div>
        </div>
      </header>
    </React.Fragment>
  );
};

export default Navbar;
