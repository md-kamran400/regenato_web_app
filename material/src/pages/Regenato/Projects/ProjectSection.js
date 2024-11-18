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

// Import child components
import SingeProject from "./SingeProject";
import ActivitiesTab from "./ActivitiesTab";
import DocumentsTab from "./DocumentsTab";
import OverviewTab from "./OverviewTab";

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
      <Row style={{ marginTop: "60px" }}>
        <Col lg={12}>
          <Card className="mt-n4 ">
            <div className="bg-warning-subtle">
              <CardBody className="pb-0 ">
                <Row>
                  <div className="col-md">
                    <Row className="align-items-center">
                      <div className="col-md-auto">
                        <div className="avatar-md">
                          <div className="avatar-title bg-white rounded-circle">
                            {/* Add content here if needed */}
                          </div>
                        </div>
                      </div>
                    </Row>
                  </div>
                </Row>

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
                      Overview
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
                      Allocation
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
                      BOM
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
              <OverviewTab />
            </TabPane>
            <TabPane tabId="3">
              <DocumentsTab />
            </TabPane>
            <TabPane tabId="4">
              <ActivitiesTab />
            </TabPane>
          </TabContent>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default ProjectSection;
