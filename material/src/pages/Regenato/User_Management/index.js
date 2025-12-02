import React, { useState } from "react";
import { Col, Container, Nav, NavItem, NavLink, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import RoleManagement from "./RoleManagement";
import AccessControl from "./AccessControl";
import UserHandle from "./UserHandle";
import "./Settings.css";
import LogoHandler from "./LogoHandler";
import ApiHandler from "./ApiHandler";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("users");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const renderComponent = () => {
    switch (activeTab) {
      case "users":
        return <UserHandle />;
      case "roles":
        return <RoleManagement />;
      case "access-control":
        return <AccessControl />;
        case "logo-handler":
        return <LogoHandler />;
         case "api-handler":
        return <ApiHandler />;
      default:
        return <UserHandle />;
    }
  };

  const tabs = [
    { id: "users", label: "Users" },
    { id: "roles", label: "Roles" },
    { id: "access-control", label: "Access Control" },
    { id: "logo-handler", label: "Logo Handler" },
    { id: "api-handler", label: "API Handler" },
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Settings" pageTitle="Admin" />

          <Row>
            {/* Sidebar */}
            <Col md="3" lg="2" className="settings-sidebar">
              <Nav vertical>
                {tabs.map((tab) => (
                  <NavItem key={tab.id}>
                    <NavLink
                      className={activeTab === tab.id ? "active" : ""}
                      onClick={() => toggleTab(tab.id)}
                    >
                      {tab.label}
                    </NavLink>
                  </NavItem>
                ))}
              </Nav>
            </Col>

            {/* Main Content */}
            <Col md="9" lg="10" className="settings-content">
              {renderComponent()}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Settings;
