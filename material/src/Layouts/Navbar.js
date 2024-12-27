// Sidebar.js
import React from 'react';
import { Link } from "react-router-dom";
import logoSm from "../assets/images/logo-sm.png";
import logoDark from "../assets/images/logo-dark.png";
import logoLight from "../assets/images/logo-light.png";

const Navbar = ({ layoutType }) => {
  const navData = require('./LayoutMenuData').default;

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container-fluid">
        <Link to="/" className="logo logo-light">
          <span className="logo-sm">
            <img src={logoSm} alt="" height="35" width={120} />
          </span>
          <span className="logo-lg">
            <img src={logoLight} alt="" height="35" width={120}/>
          </span>
        </Link>

        <ul className="navbar-nav">
          {navData[0].subItems.map((item, key) => (
            <li className="nav-item" key={key}>
              <Link 
                className="nav-link menu-link"
                to={item.link}
              >
                <i className={item.icon} style={{ marginRight: "8px", fontSize: "12px" }}></i>
                <span>{layoutType.t(item.label)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
