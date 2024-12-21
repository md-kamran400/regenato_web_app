import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import withRouter from "../../Components/Common/withRouter";

// Import Data
import navdata from "../LayoutMenuData";
// i18n
import { withTranslation } from "react-i18next";

const VerticalLayout = (props) => {
  const navData = navdata(); // Correctly retrieve nav data

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const initMenu = () => {
      const pathName = process.env.PUBLIC_URL + props.router.location.pathname;
      const ul = document.getElementById("navbar-nav");
      const items = ul.getElementsByTagName("a");
      let itemsArray = [...items]; // Converts NodeList to Array
      removeActivation(itemsArray);
      let matchingMenuItem = itemsArray.find((x) => x.pathname === pathName);
      if (matchingMenuItem) {
        matchingMenuItem.classList.add("active");
      }
    };
    initMenu();
  }, [props.router.location.pathname]);

  const removeActivation = (items) => {
    let activeItems = items.filter((x) => x.classList.contains("active"));
    activeItems.forEach((item) => {
      item.classList.remove("active");
    });
  };

  return (
    <React.Fragment>
      <ul id="navbar-nav" className="navbar-nav" style={{ marginLeft: "10px" }}>
        {(navData || []).map((menu, key) => (
          <React.Fragment key={key}>
            {(menu.subItems || []).map((subItem) => (
              <li className="nav-item" key={subItem.id}>
                <Link
                  className="nav-link"
                  to={subItem.link ? subItem.link : "/#"}
                >
                  <i className={subItem.icon} style={{ marginRight: "8px", fontSize: "12px" }}></i>
                  <span>{props.t(subItem.label)}</span>
                </Link>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
    </React.Fragment>
  );
};

VerticalLayout.propTypes = {
  location: PropTypes.object,
  t: PropTypes.any,
};

export default withRouter(withTranslation()(VerticalLayout));
