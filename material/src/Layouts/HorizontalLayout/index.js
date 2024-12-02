import React from 'react';
import PropTypes from "prop-types";
import { Link } from 'react-router-dom';
import { Col, Collapse, Row } from 'reactstrap';

const HorizontalLayout = (props) => {
  const navData = require('../LayoutMenuData').default;

  return (
    <React.Fragment>
      {navData[0].subItems.map((item, key) => (
        <li className="nav-item" key={key}>
          <Link 
            className="nav-link menu-link"
            to={item.link}
          >
            <i className="ri-dashboard-2-line"></i> <span>{props.t(item.label)}</span>
          </Link>
        </li>
      ))}

      {navData[0].subItems.map((item, key) => (
        <li className="nav-item" key={key}>
          <Link 
            className="nav-link menu-link"
            to={item.link}
          >
            <i className="ri-project-2-fill"></i> <span>{props.t(item.label)}</span>
          </Link>
        </li>
      ))}

      {navData[0].subItems.map((item, key) => (
        <li className="nav-item" key={key}>
          <Link 
            className="nav-link menu-link"
            to={item.link}
          >
            <i className="ri-bom-box-2-line"></i> <span>{props.t(item.label)}</span>
          </Link>
        </li>
      ))}

      {navData[0].subItems.map((item, key) => (
        <li className="nav-item" key={key}>
          <Link 
            className="nav-link menu-link"
            to={item.link}
          >
            <i className="ri-variable-2-line"></i> <span>{props.t(item.label)}</span>
          </Link>
        </li>
      ))}

      {navData[0].subItems.map((item, key) => (
        <li className="nav-item" key={key}>
          <Link 
            className="nav-link menu-link"
            to={item.link}
          >
            <i className="ri-resource-fill"></i> <span>{props.t(item.label)}</span>
          </Link>
        </li>
      ))}
    </React.Fragment>
  );
};

HorizontalLayout.propTypes = {
  t: PropTypes.any,
};

export default HorizontalLayout;