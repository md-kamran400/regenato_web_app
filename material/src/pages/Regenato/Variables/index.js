// import React, { useState, useEffect } from "react";
// import {
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   Col,
//   Container,
//   ListGroup,
//   ListGroupItem,
//   Modal,
//   ModalBody,
//   ModalFooter,
//   ModalHeader,
//   Row,
//   Nav,
//   NavItem,
//   NavLink,
// } from "reactstrap";
// import BreadCrumb from "../../../Components/Common/BreadCrumb";
// import List from "list.js";
// import "./Variables.css";
// import { FaBars } from "react-icons/fa";
// // Import table data
// import GeneralVariable from "./GeneralVariable";
// import RmVariable from "./RmVariable";
// import ManufacturingVariable from "./ManufacturingVariable";
// import ShipmentVariable from "./ShipmentVariable";
// import OverheadsVariable from "./OverheadsVariable";
// import UsersListVariable from "./UsersListVariable";
// import ShiftVariable from "./ShiftVariable";
// import { EventScheduler } from "./EventScheduler";
// import InhchargeVariable from "./InhchargeVariable";
// import StoresVariable from "./StoresVariable";

// const Variables = () => {
//   const [modal_list, setmodal_list] = useState(false);
//   const [modal_delete, setmodal_delete] = useState(false);
//   const [activeTab, setActiveTab] = useState("GeneralVariable");
//   const [userRole, setUserRole] = useState("");
//   const [sidebarOpen, setSidebarOpen] = useState(false); // new state
//   useEffect(() => {
//     // Get user role from localStorage when component mounts
//     const role = localStorage.getItem("userRole");
//     if (role) {
//       setUserRole(role);
//       // If user is incharge, set default tab to UsersListVariable
//       if (role === "incharge") {
//         setActiveTab("UsersListVariable");
//       }
//     }
//   }, []);

//   const toggleTab = (tab) => {
//     if (activeTab !== tab) {
//       setActiveTab(tab);
//     }
//   };

//   const renderComponent = () => {
//     // If user is incharge, only show UsersListVariable
//     if (userRole === "incharge") {
//       return <UsersListVariable />;
//     }

//     // Admin can see all components
//     switch (activeTab) {
//       case "GeneralVariable":
//         return <GeneralVariable />;
//       case "RmVariable":
//         return <RmVariable />;
//       case "ManufacturingVariable":
//         return <ManufacturingVariable />;
//       case "ShipmentVariable":
//         return <ShipmentVariable />;
//       case "OverheadsVariable":
//         return <OverheadsVariable />;
//       case "UsersListVariable":
//         return <UsersListVariable />;
//       case "ShiftVariable":
//         return <ShiftVariable />;
//       case "EventScheduler":
//         return <EventScheduler />;
//       case "Incharge":
//         return <InhchargeVariable />;
//       case "Stores":
//         return <StoresVariable />;
//       default:
//         return <GeneralVariable />;
//     }
//   };

//   // Filter tabs based on user role
//   const getFilteredTabs = () => {
//     if (userRole === "incharge") {
//       return [{ id: "UsersListVariable", label: "Operator" }];
//     }

//     return [
//       { id: "GeneralVariable", label: "General" },
//       { id: "RmVariable", label: "Raw Material" },
//       { id: "ManufacturingVariable", label: "Manufacturing" },
//       { id: "ShipmentVariable", label: "Shipment" },
//       { id: "OverheadsVariable", label: "Overheads" },
//       { id: "UsersListVariable", label: "Operator" },
//       { id: "ShiftVariable", label: "Shift" },
//       { id: "EventScheduler", label: "Event Scheduler" },
//       { id: "Incharge", label: "Incharge" },
//       { id: "Stores", label: "Warehouse" },
//     ];
//   };

//   useEffect(() => {
//     const element = document.getElementById("fuzzysearch-list");
//     if (element) {
//       new List("fuzzysearch-list", {
//         valueNames: ["name"],
//       });
//     }

//     const paginationElement = document.getElementById("pagination-list");
//     if (paginationElement) {
//       new List("pagination-list", {
//         valueNames: ["pagi-list"],
//         page: 3,
//         pagination: true,
//       });
//     }
//   }, []);

//   return (
//     <React.Fragment>
//       <div className="page-content">
//         <Container fluid>
//           <BreadCrumb title="Variables" pageTitle="Tables" />
//           <div className="d-md-none d-flex justify-content-between align-items-center p-3">
//             <h5 className="mb-0">Variables</h5>
//             <FaBars
//               size={24}
//               onClick={() => setSidebarOpen(true)}
//               style={{ cursor: "pointer" }}
//             />
//           </div>

//           <Row>
//             {/* Sidebar */}
//             <Col
//               md="3"
//               lg="2"
//               className={`sidebar d-none d-md-block ${
//                 sidebarOpen ? "d-block" : ""
//               }`}
//             >
//               <Nav vertical>
//                 {getFilteredTabs().map((tab) => (
//                   <NavItem key={tab.id}>
//                     <NavLink
//                       className={activeTab === tab.id ? "active" : ""}
//                       onClick={() => toggleTab(tab.id)}
//                     >
//                       {tab.label}
//                     </NavLink>
//                   </NavItem>
//                 ))}
//               </Nav>
//             </Col>

//             {/* Main Content */}
//             <Col md="9" lg="10" className="main-content">
//               {renderComponent()}
//             </Col>
//           </Row>
//         </Container>
//       </div>
//     </React.Fragment>
//   );
// };

// export default Variables;


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
import { FaBars, FaTimes } from "react-icons/fa"; // Import both icons
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
import StoresVariable from "./StoresVariable";

const Variables = () => {
  const [modal_list, setmodal_list] = useState(false);
  const [modal_delete, setmodal_delete] = useState(false);
  const [activeTab, setActiveTab] = useState("GeneralVariable");
  const [userRole, setUserRole] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role) {
      setUserRole(role);
      if (role === "incharge") {
        setActiveTab("UsersListVariable");
      }
    }
  }, []);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      // Close sidebar when a tab is selected on mobile
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderComponent = () => {
    if (userRole === "incharge") {
      return <UsersListVariable />;
    }

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
      case "Stores":
        return <StoresVariable />;
      default:
        return <GeneralVariable />;
    }
  };

  const getFilteredTabs = () => {
    if (userRole === "incharge") {
      return [{ id: "UsersListVariable", label: "Operator" }];
    }

    return [
      { id: "GeneralVariable", label: "General" },
      { id: "RmVariable", label: "Raw Material" },
      { id: "ManufacturingVariable", label: "Manufacturing" },
      { id: "ShipmentVariable", label: "Shipment" },
      { id: "OverheadsVariable", label: "Overheads" },
      { id: "UsersListVariable", label: "Operator" },
      { id: "ShiftVariable", label: "Shift" },
      { id: "EventScheduler", label: "Event Scheduler" },
      { id: "Incharge", label: "Incharge" },
      { id: "Stores", label: "Warehouse" },
    ];
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
          <div className="d-md-none d-flex justify-content-between align-items-center p-1">
            <h5 className="mb-0">Variables</h5>
            {sidebarOpen ? (
              <FaTimes
                size={24}
                onClick={toggleSidebar}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <FaBars
                size={24}
                onClick={toggleSidebar}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>

          <Row>
            {/* Sidebar */}
            <Col
              md="3"
              lg="2"
              className={`sidebar d-none d-md-block ${
                sidebarOpen ? "d-block" : ""
              }`}
            >
              <Nav vertical>
                {getFilteredTabs().map((tab) => (
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
            <Col md="9" lg="10"  className="main-content">
              {renderComponent()}
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Variables;