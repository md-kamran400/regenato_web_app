import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdClose } from "react-icons/md";
import ProfileDropdown from "../Components/Common/ProfileDropdown";
import "./navbar.css";
import navdata from "../Layouts/LayoutMenuData";
import logo1 from "../assets/logo/remove -bg-regenato logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userRole, setUserRole] = useState("guest");
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isMediumScreen, setIsMediumScreen] = useState(
    window.innerWidth <= 992 && window.innerWidth > 768
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsMediumScreen(width > 768 && width <= 992);

      if (width > 992 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [menuOpen]);

  const useLocalStorageSync = () => {
    useEffect(() => {
      const handleStorageChange = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        setUserRole(user?.role || "guest");
      };

      window.addEventListener("storage", handleStorageChange);
      handleStorageChange();

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, []);
  };

  useLocalStorageSync();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, [location]);

  const toggleMobileMenu = () => {
    if (userRole !== "guest" && (isMobile || isMediumScreen)) {
      if (menuOpen) {
        setIsClosing(true);
        setTimeout(() => {
          setMenuOpen(false);
          setIsClosing(false);
        }, 250);
      } else {
        setMenuOpen(true);
      }
    }
  };

  const handleMouseEnter = (id) => setActiveDropdown(id);
  const handleMouseLeave = () => setActiveDropdown(null);

  const menuItems = navdata(userRole)[0]?.subItems || [];

  return (
    <header className="header-class">
      <div className="layout-width">
        <div className="navbar-header">
          
          <div className="logo-wrapper" style={{ width: "12rem" }}>
            <Link to={"/regenato-home"}>
              <img
                src={logo1}
                alt="Regenato Logo"
                style={{ width: "100%", cursor: "pointer" }}
              />
            </Link>
          </div>

          {userRole !== "guest" && (
            <button
              onClick={toggleMobileMenu}
              className="menu-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <MdClose size={24} className="close-icon" />
              ) : (
                <RxHamburgerMenu size={24} className="menu-icon" />
              )}
            </button>
          )}

          {userRole !== "guest" && (
            <nav
              className={`navbar ${menuOpen ? "show" : ""} ${
                isClosing ? "closing" : ""
              }`}
              aria-hidden={!menuOpen}
            >
              <ul className="nav">
                {menuItems.map((item) => (
                  <li
                    key={item.id}
                    className={`nav-item ${
                      location.pathname === item.link ? "active" : ""
                    }`}
                    onMouseEnter={() => handleMouseEnter(item.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      to={item.link}
                      className="nav-link"
                      onClick={() => {
                        if (isMobile || isMediumScreen) {
                          toggleMobileMenu();
                        }
                      }}
                    >
                      <i className={item.icon}></i> {item.label}
                    </Link>

                    {item.children && (
                      <ul
                        className={`dropdown-menu ${
                          activeDropdown === item.id ? "show" : ""
                        }`}
                      >
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              to={child.link}
                              className="dropdown-item"
                              onClick={() => {
                                if (isMobile || isMediumScreen) {
                                  toggleMobileMenu();
                                }
                              }}
                            >
                              <i className={child.icon}></i> {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div
            className="profile_icon_layout"
          >
            <ProfileDropdown />
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default Navbar;
