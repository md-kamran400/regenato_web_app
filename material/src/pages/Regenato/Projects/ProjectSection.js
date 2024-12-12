import React, { useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import classnames from "classnames";
import { BsStopwatch } from "react-icons/bs";
// Import child components
import SingeProject from "./SingeProject";
import ActivitiesTab from "./ActivitiesTab";
import DocumentsTab from "./DocumentsTab";
import HoursPlanningTab from "./HoursPlanningTab";
import HoursSummary from "./HoursSummary";
import NewHoursPlaaning from "./NewHoursPlaaning";

const ProjectSection = () => {
  // State to track the active tab
  const [activeTab, setActiveTab] = useState("1");

  // Function to toggle between tabs
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  return (
    <React.Fragment>
      {/* Top Section with Tabs */}
      <Row style={{ marginTop: "60px"}}>
        <Col lg={12}>
          <Card >
            <div style={{margin: "auto"}}>
              <CardBody >
                {/* Tabs */}
                <Nav className="nav-tabs-custom" role="tablist">
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "1" },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab("1");
                      }}
                      href="#"
                    >
                      Project Details
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "2" },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab("2");
                      }}
                      href="#"
                    >
                      Hours Planning
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "3" },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab("3");
                      }}
                      href="#"
                    >
                      Hours Summary
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "4" },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab("4");
                      }}
                      href="#"
                    >
                      Allocation
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "5" },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab("5");
                      }}
                      href="#"
                    >
                      BOM
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === "6" },
                        "fw-semibold"
                      )}
                      onClick={() => {
                        toggleTab("6");
                      }}
                      href="#"
                    >
                      New Hours Planning
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardBody>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tab Content Section */}
      <Row style={{ paddingTop: "20px"}}>
        <Col lg={12}>
          <TabContent activeTab={activeTab} className="text-muted">
            <TabPane tabId="1">
                <SingeProject />
            </TabPane>
            <TabPane tabId="2">
              <HoursPlanningTab />
            </TabPane>
            <TabPane tabId="3">
              <HoursSummary />
            </TabPane>
            <TabPane tabId="4">
              <DocumentsTab />
            </TabPane>
            <TabPane tabId="5">
              <ActivitiesTab />
            </TabPane>
            <TabPane tabId="6">
              <NewHoursPlaaning />
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProjectSection;


// import React from 'react'

// const ProjectSection = () => {
//   return (
//     <div>ProjectSection</div>
//   )
// }

// export default ProjectSection;
