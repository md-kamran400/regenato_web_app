import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import List from "list.js";
import "./Variables.css";

// Import table data
import GeneralVariable from "./GeneralVariable";
import RmVariable from "./RmVariable";
import ManufacturingVariable from "./ManufacturingVariable";
import ShipmentVariable from "./ShipmentVariable";
import OverheadsVariable from "./OverheadsVariable";
import UsersListVariable from "./UsersListVariable";
import ShiftVariable from "./ShiftVariable";
import { EventScheduler } from "./EventScheduler";
import InhchargeVariable from "./InhchargeVariable";

const Variables = () => {
  const [modal_list, setmodal_list] = useState(false);
  const [modal_delete, setmodal_delete] = useState(false);
  const [activeTab, setActiveTab] = useState("GeneralVariable");

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  const renderComponent = () => {
    switch (activeTab) {
      case "GeneralVariable":
        return <GeneralVariable />;
      case "RmVariable":
        return <RmVariable />;
      case "ManufacturingVariable":
        return <ManufacturingVariable />;
      case "ShipmentVariable":
        return <ShipmentVariable />;
      case "OverheadsVariable":
        return <OverheadsVariable />;
      case "UsersListVariable":
        return <UsersListVariable />;
      case "ShiftVariable":
        return <ShiftVariable />;
      case "EventScheduler":
        return <EventScheduler />;
      case "Incharge":
        return <InhchargeVariable />;
      default:
        return <GeneralVariable />;
    }
  };

  useEffect(() => {
    const element = document.getElementById("fuzzysearch-list");
    if (element) {
      new List("fuzzysearch-list", {
        valueNames: ["name"],
      });
    }

    const paginationElement = document.getElementById("pagination-list");
    if (paginationElement) {
      new List("pagination-list", {
        valueNames: ["pagi-list"],
        page: 3,
        pagination: true,
      });
    }
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Variables" pageTitle="Tables" />
          <Row>
            {/* Sidebar */}
            <Col md="3" lg="2" className="sidebar">
              <Nav vertical>
                <NavItem>
                  <NavLink
                    className={activeTab === "GeneralVariable" ? "active" : ""}
                    onClick={() => toggleTab("GeneralVariable")}
                  >
                    General
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "RmVariable" ? "active" : ""}
                    onClick={() => toggleTab("RmVariable")}
                  >
                    Raw Material
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={
                      activeTab === "ManufacturingVariable" ? "active" : ""
                    }
                    onClick={() => toggleTab("ManufacturingVariable")}
                  >
                    Manufacturing
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "ShipmentVariable" ? "active" : ""}
                    onClick={() => toggleTab("ShipmentVariable")}
                  >
                    Shipment
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={
                      activeTab === "OverheadsVariable" ? "active" : ""
                    }
                    onClick={() => toggleTab("OverheadsVariable")}
                  >
                    Overheads
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={
                      activeTab === "UsersListVariable" ? "active" : ""
                    }
                    onClick={() => toggleTab("UsersListVariable")}
                  >
                    Operator
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "ShiftVariable" ? "active" : ""}
                    onClick={() => toggleTab("ShiftVariable")}
                  >
                    Shift
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "EventScheduler" ? "active" : ""}
                    onClick={() => toggleTab("EventScheduler")}
                  >
                    Event Scheduler
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={activeTab === "Incharge" ? "active" : ""}
                    onClick={() => toggleTab("Incharge")}
                  >
                    Incharge
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>

            {/* Main Content */}
            <Col md="9" lg="10" className="main-content">
              {renderComponent()}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Variables;
