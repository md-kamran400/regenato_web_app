import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdClose } from "react-icons/md";
import ProfileDropdown from "../Components/Common/ProfileDropdown";
import "./navbar.css";
import navdata from "../Layouts/LayoutMenuData";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleMobileMenu = () => setMenuOpen(!menuOpen);

  const handleMouseEnter = (id) => setActiveDropdown(id);

  const handleMouseLeave = () => setActiveDropdown(null);

  const menuItems = navdata()[0]?.subItems || [];

  return (
    <header className="header-class">
      <div className="layout-width">
        <div className="navbar-header">
          {/* Navbar Menu Toggle for Small Screens */}
          <button
            onClick={toggleMobileMenu}
            className="menu-toggle"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <MdClose size={24} /> : <RxHamburgerMenu size={24} />}
          </button>

          {/* Navbar Menu */}
          <nav className={`navbar ${menuOpen ? "show" : ""}`}>
            <ul className="nav">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  className="nav-item"
                  onMouseEnter={() => handleMouseEnter(item.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link to={item.link} className="nav-link">
                    <i className={item.icon}></i> {item.label}
                  </Link>
                  {item.children && activeDropdown === item.id && (
                    <ul className="dropdown-menu">
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

          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
