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
  const location = useLocation();

  // Custom hook to sync localStorage with state
  const useLocalStorageSync = () => {
    useEffect(() => {
      const handleStorageChange = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        setUserRole(user?.role || "guest");
      };

      // Listen for storage changes
      window.addEventListener("storage", handleStorageChange);

      // Also check on initial load
      handleStorageChange();

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }, []);
  };

  useLocalStorageSync();

  // Also check user role when location changes (as backup)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role) {
      setUserRole(user.role);
    }
  }, [location]);

  const toggleMobileMenu = () => setMenuOpen(!menuOpen);
  const handleMouseEnter = (id) => setActiveDropdown(id);
  const handleMouseLeave = () => setActiveDropdown(null);

  const menuItems = navdata(userRole)[0]?.subItems || [];

  return (
    <header className="header-class">
      <div className="layout-width">
        <div className="navbar-header">
          <button
            onClick={toggleMobileMenu}
            className="menu-toggle"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <MdClose size={24} /> : <RxHamburgerMenu size={24} />}
          </button>
          <div style={{ width: "12rem" }}>
            <Link to={"/regenato-home"}>
              <img
                src={logo1}
                alt="Regenato Logo"
                style={{ width: "100%", cursor: "pointer" }}
              />
            </Link>
          </div>
          <nav className={`navbar ${menuOpen ? "show" : ""}`}>
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
                  <Link to={item.link} className="nav-link">
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
                          <Link to={child.link} className="dropdown-item">
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
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
