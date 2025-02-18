// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardBody,
//   Col,
//   DropdownItem,
//   DropdownMenu,
//   DropdownToggle,
//   Input,
//   ModalFooter,
//   Row,
//   UncontrolledDropdown,
//   Modal,
//   ModalBody,
//   ModalHeader,
//   Button,
//   ListGroup,
//   ListGroupItem,
//   Dropdown,
//   Pagination,
//   PaginationItem,
//   PaginationLink,
// } from "reactstrap";
// import { Link } from "react-router-dom";
// import FeatherIcon from "feather-icons-react";
// import "../project.css";
// import BreadCrumb from "../../../../Components/Common/BreadCrumb";

// const AllocationPage = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [projectListsData, setprojectListsData] = useState([]);
//   const [error, setError] = useState(null); // State for handling errors

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
//       );
//       if (!response.ok) {
//         throw new Error("Failed to fetch projects");
//       }
//       const data = await response.json();
//       setprojectListsData(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const formatTime = (time) => {
//     if (time === "-" || isNaN(time)) {
//       return "-";
//     }

//     if (time === 0) {
//       return "-";
//     }

//     const totalMinutes = Math.round(time * 60); // Convert hours to minutes
//     return `${totalMinutes} m`;
//   };
//   return (
//     <React.Fragment>
//       <>
//         {isLoading && (
//           <div className="loader-overlay">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">Loading...</span>
//             </div>
//           </div>
//         )}
//       </>
//       <div style={{ marginTop: "2rem" }}>
//         <BreadCrumb title="Allocation List" pageTitle="Allocations" />
//       </div>

//       <div className="table-container">
//         <div className="table-responsive">
//           <table className="table table-striped">
//             <thead>
//               <tr>
//                 <th
//                   className="sticky-col"
//                   style={{
//                     backgroundColor: "rgb(228, 228, 228)",
//                   }}
//                 >
//                   Name
//                 </th>

//                 <th className="child_parts" style={{ cursor: "pointer" }}>
//                   <span>Start Date</span>
//                 </th>
//                 <th className="child_parts" style={{ cursor: "pointer" }}>
//                   <span>End Date</span>
//                 </th>
//                 <th className="child_parts">Production Order-Types</th>

//                 <th className="sticky-col">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {projectListsData.map((item, index) => (
//                 <tr key={index}>
//                   <td
//                     className="sticky-col"
//                     style={{
//                       color: "blue",
//                       backgroundColor: "rgb(255, 255, 255)",
//                     }}
//                   >
//                     <Link
//                       to={`/regenato-allocation/${item._id}`}
//                     >
//                       {item.projectName}
//                     </Link>
//                   </td>

//                   <td>
//                     {new Date(item.createdAt).toISOString().split("T")[0]}
//                   </td>
//                   <td>
//                     {new Date(item.createdAt).toISOString().split("T")[0]}
//                   </td>
//                   <td>{item.projectType}</td>

//                   <td className="sticky-col">
//                     <UncontrolledDropdown direction="start">
//                       <DropdownToggle
//                         tag="button"
//                         className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
//                       >
//                         <FeatherIcon
//                           icon="more-horizontal"
//                           className="icon-sm"
//                         />
//                       </DropdownToggle>

//                       <DropdownMenu className="dropdown-menu-end">
//                         <DropdownItem href="#">
//                           <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
//                           Remove
//                         </DropdownItem>
//                         <DropdownItem href="#">
//                           <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
//                           Duplicate
//                         </DropdownItem>
//                         <DropdownItem href="#">
//                           <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
//                           Edit
//                         </DropdownItem>
//                       </DropdownMenu>
//                     </UncontrolledDropdown>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </React.Fragment>
//   );
// };

// export default AllocationPage;

import React, { useState, useEffect } from "react";
import { Table, Spinner } from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";

const AllocationPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/allocations`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch allocations");
        }
        const data = await response.json();
        setAllocations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, []); // Remove `_id` from dependencies

  return (
    <div className="table-container">
      <div style={{ marginTop: "0rem", width: "98%", margin: "auto" }}>
        <BreadCrumb title="Allocated Parts" pageTitle="Allocation List" />
      </div>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered>
            <thead>
              <tr>
                <th>Production Order Name</th>
                <th>Part Name</th>
                <th>Allocation ID</th>
                <th>Process Name</th>
                <th>Planned Quantity</th>
                {/* <th>Remaining Quantity</th> */}
                <th>Start Date</th>
                <th>End Date</th>
                <th>Machine ID</th>
                <th>Shift</th>
                <th>Planned Time</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {allocations.length > 0 ? (
                allocations.map((alloc, index) => (
                  <tr key={index}>
                    <td>{alloc.projectName}</td>
                    <td>{alloc.partName}</td>
                    <td>{alloc._id}</td>
                    <td>{alloc.processName}</td>
                    <td>{alloc.plannedQuantity}</td>
                    {/* <td>{alloc.remainingQuantity}</td> */}
                    <td>{new Date(alloc.startDate).toLocaleDateString()}</td>
                    <td>{new Date(alloc.endDate).toLocaleDateString()}</td>
                    <td>{alloc.machineId}</td>
                    <td>{alloc.shift}</td>
                    <td>{alloc.plannedTime} min</td>
                    <td>{alloc.operator}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="12" className="text-center">
                    No allocations found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AllocationPage;
