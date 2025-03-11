// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Container,
//   Row,
//   Col,
//   Table,
//   Button,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Spinner,
//   Alert,
//   CardBody,
// } from "reactstrap";
// import { toast } from "react-toastify";

// export const AllocatedSubAssemblyPlan = ({
//   porjectID,
//   subAssemblyListFirstId,
//   partListItemId,
//   onDeleteSuccess,
// }) => {
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [dailyTaskModal, setDailyTaskModal] = useState(false);
//   const [selectedSection, setSelectedSection] = useState(null);
//   const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
//   const [dailyTracking, setDailyTracking] = useState([]);

//   console.log(porjectID, subAssemblyListFirstId, partListItemId);

//   useEffect(() => {
//     const fetchAllocations = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
//         );

//         if (!response.data.data || response.data.data.length === 0) {
//           setSections([]);
//         } else {
//           const formattedSections = response.data.data.map((item) => ({
//             allocationId: item._id,
//             title: item.processName,
//             data: item.allocations.map((allocation) => ({
//               trackingId: allocation._id,
//               plannedQty: allocation.plannedQuantity,
//               startDate: new Date(allocation.startDate).toLocaleDateString(),
//               endDate: new Date(allocation.endDate).toLocaleDateString(),
//               machineId: allocation.machineId,
//               shift: allocation.shift,
//               plannedTime: `${allocation.plannedTime} min`,
//               operator: allocation.operator,
//             })),
//           }));
//           setSections(formattedSections);
//         }
//       } catch (error) {
//         setError("Failed to fetch allocations. Please try again later.");
//         console.error("Error fetching allocations:", error);
//       }
//       setLoading(false);
//     };

//     fetchAllocations();
//   }, [porjectID, subAssemblyListFirstId, partListItemId]);

//   const handleCancelAllocation = async () => {
//     try {
//       const response = await axios.delete(
//         `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
//       );
//       if (response.status === 200) {
//         toast.success("Allocation successfully canceled!");
//         setSections([]);
//         onDeleteSuccess();
//       }
//     } catch (error) {
//       toast.error("Failed to cancel allocation.");
//       console.error("Error canceling allocation:", error);
//     }
//     setDeleteConfirmationModal(false);
//   };

//   const openModal = (section, row) => {
//     setSelectedSection({
//       ...section,
//       data: [row], // Pass the specific row data
//     });
//     setDailyTaskModal(true);
//   };

//   const handleDailyTrackingChange = (index, field, value) => {
//     setDailyTracking((prev) => {
//       const updated = [...prev];
//       updated[index][field] = value;
//       return updated;
//     });
//   };

//   const addDailyTrackingRow = () => {
//     setDailyTracking((prev) => [
//       ...prev,
//       { date: "", planned: 0, produced: 0, dailyStatus: "" },
//     ]);
//   };

//   const removeDailyTrackingRow = (index) => {
//     setDailyTracking((prev) => prev.filter((_, i) => i !== index));
//   };

//   const calculateDailyPlannedQuantity = () => {
//     if (!selectedSection || !selectedSection.data[0]) return 0;

//     const totalQuantity = selectedSection.data[0].plannedQty;
//     const startDate = new Date(selectedSection.data[0].startDate);
//     const endDate = new Date(selectedSection.data[0].endDate);

//     const timeDifference = endDate - startDate;
//     const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
//     const days = daysDifference < 1 ? 1 : daysDifference;

//     return Math.ceil(totalQuantity / days);
//   };

//   // const submitDailyTracking = async () => {
//   //   try {
//   //     if (!selectedSection || !selectedSection.data.length) {
//   //       toast.error("No allocation selected.");
//   //       return;
//   //     }

//   //     const allocationId = selectedSection.allocationId;
//   //     const trackingId = selectedSection.data[0]?.trackingId;

//   //     if (!allocationId || !trackingId) {
//   //       toast.error("Allocation or Tracking ID is missing.");
//   //       console.error("Missing allocationId or trackingId:", {
//   //         allocationId,
//   //         trackingId,
//   //       });
//   //       return;
//   //     }

//   //     const isValid = dailyTracking.every((task) => {
//   //       return (
//   //         task.date &&
//   //         !isNaN(new Date(task.date)) &&
//   //         !isNaN(Number(task.planned)) &&
//   //         !isNaN(Number(task.produced)) &&
//   //         task.dailyStatus
//   //       );
//   //     });

//   //     if (!isValid) {
//   //       toast.error("Invalid daily tracking data. Please check all fields.");
//   //       return;
//   //     }

//   //     const formattedDailyTracking = dailyTracking.map((task) => ({
//   //       date: task.date,
//   //       planned: Number(task.planned),
//   //       produced: Number(task.produced),
//   //       dailyStatus: task.dailyStatus,
//   //     }));

//   //     const response = await axios.post(
//   //       `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocations/${allocationId}/dailyTrack/${trackingId}/dailyTracking`,
//   //       { dailyTracking: formattedDailyTracking }
//   //     );

//   //     if (response.status === 200) {
//   //       toast.success("Daily Tracking Updated!");
//   //       setDailyTaskModal(false);
//   //     }
//   //   } catch (error) {
//   //     toast.error("Failed to update daily tracking.");
//   //     console.error(
//   //       "Error updating daily tracking:",
//   //       error.response?.data || error
//   //     );
//   //   }
//   // };

//   const submitDailyTracking = async () => {
//     try {
//       if (!selectedSection || !selectedSection.data.length) {
//         toast.error("No allocation selected.");
//         return;
//       }

//       const allocationId = selectedSection.allocationId;
//       const trackingId = selectedSection.data[0]?.trackingId;

//       console.log("Allocation ID:", allocationId);
//       console.log("Daily Tracking ID:", trackingId);

//       if (!allocationId || !trackingId) {
//         toast.error("Allocation or Tracking ID is missing.");
//         console.error("Missing allocationId or trackingId:", {
//           allocationId,
//           trackingId,
//         });
//         return;
//       }

//       const isValid = dailyTracking.every((task) => {
//         return (
//           task.date &&
//           !isNaN(new Date(task.date)) &&
//           !isNaN(Number(task.planned)) &&
//           !isNaN(Number(task.produced)) &&
//           task.dailyStatus
//         );
//       });

//       if (!isValid) {
//         toast.error("Invalid daily tracking data. Please check all fields.");
//         return;
//       }

//       const formattedDailyTracking = dailyTracking.map((task) => ({
//         date: task.date,
//         planned: Number(task.planned),
//         produced: Number(task.produced),
//         dailyStatus: task.dailyStatus,
//       }));

//       const response = await axios.post(
//         `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocations/${allocationId}/dailyTrack/${trackingId}/dailyTracking`,
//         { dailyTracking: formattedDailyTracking }
//       );

//       if (response.status === 200) {
//         toast.success("Daily Tracking Updated!");
//         setDailyTaskModal(false);
//       }
//     } catch (error) {
//       toast.error("Failed to update daily tracking.");
//       console.error(
//         "Error updating daily tracking:",
//         error.response?.data || error
//       );
//     }
//   };

//   return (
//     <div style={{ width: "100%" }}>
//       <Container fluid className="mt-4">
//         {loading ? (
//           <div className="text-center">
//             <Spinner color="primary" />
//             <p>Loading allocations...</p>
//           </div>
//         ) : error ? (
//           <Alert color="danger">{error}</Alert>
//         ) : sections.length === 0 ? (
//           <div className="text-center">
//             <Alert color="warning">No allocations available.</Alert>
//           </div>
//         ) : (
//           sections.map((section, index) => (
//             <div
//               className="shadow-lg p-2"
//               key={index}
//               style={{ marginBottom: "30px" }}
//             >
//               <Row className="mb-3 d-flex justify-content-between align-items-center">
//                 <Col>
//                   <h4
//                     style={{
//                       fontSize: "16px",
//                       fontWeight: "bold",
//                       color: "#495057",
//                     }}
//                   >
//                     {section.title}
//                   </h4>
//                 </Col>
//               </Row>

//               <Table bordered responsive>
//                 <thead>
//                   <tr className="table-secondary">
//                     <th>Planned Quantity</th>
//                     <th>Start Date</th>
//                     <th>End Date</th>
//                     <th>Machine ID</th>
//                     <th>Shift</th>
//                     <th>Planned Time</th>
//                     <th>Operator</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {section.data.map((row, rowIndex) => (
//                     <tr key={rowIndex}>
//                       <td>{row.plannedQty}</td>
//                       <td>{row.startDate}</td>
//                       <td>{row.endDate}</td>
//                       <td>{row.machineId}</td>
//                       <td>{row.shift}</td>
//                       <td>{row.plannedTime}</td>
//                       <td>{row.operator}</td>
//                       <td>
//                         <Button
//                           color="primary"
//                           onClick={() => openModal(section, row)} // Pass the row data
//                         >
//                           Update Input
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </div>
//           ))
//         )}
//         <CardBody className="d-flex justify-content-end align-items-center">
//           <Button
//             color="danger"
//             onClick={() => setDeleteConfirmationModal(true)}
//             disabled={sections.length === 0}
//           >
//             Cancel Allocation
//           </Button>
//         </CardBody>
//       </Container>

//       {/* Modal for Updating Daily Task */}
//       <Modal
//         isOpen={dailyTaskModal}
//         toggle={() => setDailyTaskModal(false)}
//         style={{ maxWidth: "60vw" }}
//       >
//         <ModalHeader toggle={() => setDailyTaskModal(false)}>
//           Update Daily Tracking - {selectedSection?.title}
//         </ModalHeader>
//         <ModalBody>
//           {selectedSection && (
//             <>
//               <Row className="mb-3">
//                 <Col>
//                   <span style={{ fontWeight: "bold" }}>Total Quantity: </span>
//                   <span>{selectedSection.data[0].plannedQty}</span>
//                 </Col>
//                 <Col>
//                   <span style={{ fontWeight: "bold" }}>Planned Quantity: </span>
//                   <span>{calculateDailyPlannedQuantity()}</span>
//                 </Col>
//               </Row>
//               <Row className="mb-3">
//                 <Col>
//                   <span style={{ fontWeight: "bold" }}>Start Date: </span>
//                   <span>{selectedSection.data[0].startDate}</span>
//                 </Col>
//                 <Col>
//                   <span style={{ fontWeight: "bold" }}>Plan End Date: </span>
//                   <span>{selectedSection.data[0].endDate}</span>
//                 </Col>
//               </Row>

//               {/* Dynamic Daily Tracking Inputs */}
//               <Table bordered responsive>
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th style={{ width: "8rem" }}>Planned</th>
//                     <th style={{ width: "8rem" }}>Produced</th>
//                     <th>Status</th>
//                     <th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {dailyTracking.map((task, index) => (
//                     <tr key={index}>
//                       <td>
//                         <input
//                           type="date"
//                           className="form-control"
//                           value={task.date}
//                           onChange={(e) =>
//                             handleDailyTrackingChange(
//                               index,
//                               "date",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           value={task.planned}
//                           onChange={(e) =>
//                             handleDailyTrackingChange(
//                               index,
//                               "planned",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control"
//                           value={task.produced}
//                           onChange={(e) =>
//                             handleDailyTrackingChange(
//                               index,
//                               "produced",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                       <td>
//                         <select
//                           className="form-control"
//                           value={task.dailyStatus}
//                           onChange={(e) =>
//                             handleDailyTrackingChange(
//                               index,
//                               "dailyStatus",
//                               e.target.value
//                             )
//                           }
//                         >
//                           <option value="">Select Status</option>
//                           <option value="On Track">On Track</option>
//                           <option value="Delayed">Delayed</option>
//                           <option value="Completed">Completed</option>
//                         </select>
//                       </td>
//                       <td>
//                         <Button color="success" onClick={submitDailyTracking}>
//                           Update
//                         </Button>
//                         <Button
//                           color="danger"
//                           onClick={() => removeDailyTrackingRow(index)}
//                           style={{ marginLeft: "1rem" }}
//                         >
//                           Delete
//                         </Button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             </>
//           )}
//         </ModalBody>
//         <ModalFooter>
//           <Button color="primary" onClick={addDailyTrackingRow}>
//             Add Row
//           </Button>
//           <Button color="secondary" onClick={() => setDailyTaskModal(false)}>
//             Close
//           </Button>
//         </ModalFooter>
//       </Modal>

//       {/* Modal for Delete Confirmation */}
//       <Modal
//         isOpen={deleteConfirmationModal}
//         toggle={() => setDeleteConfirmationModal(false)}
//       >
//         <ModalHeader toggle={() => setDeleteConfirmationModal(false)}>
//           Confirm Deletion
//         </ModalHeader>
//         <ModalBody>
//           Are you sure you want to delete this allocation? This action cannot be
//           undone.
//         </ModalBody>
//         <ModalFooter>
//           <Button color="danger" onClick={handleCancelAllocation}>
//             Delete
//           </Button>
//           <Button
//             color="secondary"
//             onClick={() => setDeleteConfirmationModal(false)}
//           >
//             Cancel
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// };

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  CardBody,
} from "reactstrap";
import { toast } from "react-toastify";

export const AllocatedSubAssemblyPlan = ({
  porjectID,
  subAssemblyListFirstId,
  partListItemId,
  onDeleteSuccess,
}) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTaskModal, setDailyTaskModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [dailyTracking, setDailyTracking] = useState([]);

  console.log(porjectID, subAssemblyListFirstId, partListItemId);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
        );

        if (!response.data.data || response.data.data.length === 0) {
          setSections([]);
        } else {
          const formattedSections = response.data.data.map((item) => ({
            allocationId: item._id,
            title: item.processName,
            data: item.allocations.map((allocation) => ({
              trackingId: allocation._id,
              plannedQty: allocation.plannedQuantity,
              startDate: new Date(allocation.startDate).toLocaleDateString(),
              endDate: new Date(allocation.endDate).toLocaleDateString(),
              machineId: allocation.machineId,
              shift: allocation.shift,
              plannedTime: `${allocation.plannedTime} min`,
              operator: allocation.operator,
            })),
          }));
          setSections(formattedSections);
        }
      } catch (error) {
        setError("Failed to fetch allocations. Please try again later.");
        console.error("Error fetching allocations:", error);
      }
      setLoading(false);
    };

    fetchAllocations();
  }, [porjectID, subAssemblyListFirstId, partListItemId]);

  const handleCancelAllocation = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocation`
      );
      if (response.status === 200) {
        toast.success("Allocation successfully canceled!");
        setSections([]);
        onDeleteSuccess();
      }
    } catch (error) {
      toast.error("Failed to cancel allocation.");
      console.error("Error canceling allocation:", error);
    }
    setDeleteConfirmationModal(false);
  };

  const openModal = (section, row) => {
    setSelectedSection({
      ...section,
      data: [row], // Pass the specific row data
    });
    setDailyTaskModal(true);
  };

  const handleDailyTrackingChange = (index, field, value) => {
    setDailyTracking((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addDailyTrackingRow = () => {
    setDailyTracking((prev) => [
      ...prev,
      { date: "", planned: 0, produced: 0, dailyStatus: "" },
    ]);
  };

  const removeDailyTrackingRow = (index) => {
    setDailyTracking((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateDailyPlannedQuantity = () => {
    if (!selectedSection || !selectedSection.data[0]) return 0;

    const totalQuantity = selectedSection.data[0].plannedQty;
    const startDate = new Date(selectedSection.data[0].startDate);
    const endDate = new Date(selectedSection.data[0].endDate);

    const timeDifference = endDate - startDate;
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    const days = daysDifference < 1 ? 1 : daysDifference;

    return Math.ceil(totalQuantity / days);
  };

  const submitDailyTracking = async () => {
    try {
      if (!selectedSection || !selectedSection.data.length) {
        toast.error("No allocation selected.");
        return;
      }

      const allocationId = selectedSection.allocationId;
      const trackingId = selectedSection.data[0]?.trackingId;

      console.log("Allocation ID:", allocationId);
      console.log("Daily Tracking ID:", trackingId);

      if (!allocationId || !trackingId) {
        toast.error("Allocation or Tracking ID is missing.");
        console.error("Missing allocationId or trackingId:", {
          allocationId,
          trackingId,
        });
        return;
      }

      const isValid = dailyTracking.every((task) => {
        return (
          task.date &&
          !isNaN(new Date(task.date)) &&
          !isNaN(Number(task.planned)) &&
          !isNaN(Number(task.produced)) &&
          task.dailyStatus
        );
      });

      if (!isValid) {
        toast.error("Invalid daily tracking data. Please check all fields.");
        return;
      }

      const formattedDailyTracking = dailyTracking.map((task) => ({
        date: task.date,
        planned: Number(task.planned),
        produced: Number(task.produced),
        dailyStatus: task.dailyStatus,
      }));

      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/subAssemblyListFirst/${subAssemblyListFirstId}/partsListItems/${partListItemId}/allocations/${allocationId}/dailyTrack/${trackingId}/dailyTracking`,
        { dailyTracking: formattedDailyTracking }
      );

      if (response.status === 200) {
        toast.success("Daily Tracking Updated!");
        setDailyTaskModal(false);
      }
    } catch (error) {
      toast.error("Failed to update daily tracking.");
      console.error(
        "Error updating daily tracking:",
        error.response?.data || error
      );
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <Container fluid className="mt-4">
        {loading ? (
          <div className="text-center">
            <Spinner color="primary" />
            <p>Loading allocations...</p>
          </div>
        ) : error ? (
          <Alert color="danger">{error}</Alert>
        ) : sections.length === 0 ? (
          <div className="text-center">
            <Alert color="warning">No allocations available.</Alert>
          </div>
        ) : (
          sections.map((section, index) => (
            <div
              className="shadow-lg p-2"
              key={index}
              style={{ marginBottom: "30px" }}
            >
              <Row className="mb-3 d-flex justify-content-between align-items-center">
                <Col>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#495057",
                    }}
                  >
                    {section.title}
                  </h4>
                </Col>
              </Row>

              <Table bordered responsive>
                <thead>
                  <tr className="table-secondary">
                    <th>Planned Quantity</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Machine ID</th>
                    <th>Shift</th>
                    <th>Planned Time</th>
                    <th>Operator</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {section.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{row.plannedQty}</td>
                      <td>{row.startDate}</td>
                      <td>{row.endDate}</td>
                      <td>{row.machineId}</td>
                      <td>{row.shift}</td>
                      <td>{row.plannedTime}</td>
                      <td>{row.operator}</td>
                      <td>
                        <Button
                          color="primary"
                          onClick={() => openModal(section, row)} // Pass the row data
                        >
                          Update Input
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
        )}
        <CardBody className="d-flex justify-content-end align-items-center">
          <Button
            color="danger"
            onClick={() => setDeleteConfirmationModal(true)}
            disabled={sections.length === 0}
          >
            Cancel Allocation
          </Button>
        </CardBody>
      </Container>

      {/* Modal for Updating Daily Task */}
      <Modal
        isOpen={dailyTaskModal}
        toggle={() => setDailyTaskModal(false)}
        style={{ maxWidth: "60vw" }}
      >
        <ModalHeader toggle={() => setDailyTaskModal(false)}>
          Update Daily Tracking - {selectedSection?.title}
        </ModalHeader>
        <ModalBody>
          {selectedSection && (
            <>
              <Row className="mb-3">
                <Col>
                  <span style={{ fontWeight: "bold" }}>Total Quantity: </span>
                  <span>{selectedSection.data[0].plannedQty}</span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Planned Quantity: </span>
                  <span>{calculateDailyPlannedQuantity()}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col>
                  <span style={{ fontWeight: "bold" }}>Start Date: </span>
                  <span>{selectedSection.data[0].startDate}</span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Plan End Date: </span>
                  <span>{selectedSection.data[0].endDate}</span>
                </Col>
              </Row>

              {/* Dynamic Daily Tracking Inputs */}
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ width: "8rem" }}>Planned</th>
                    <th style={{ width: "8rem" }}>Produced</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTracking.map((task, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="date"
                          className="form-control"
                          value={task.date}
                          onChange={(e) =>
                            handleDailyTrackingChange(
                              index,
                              "date",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={task.planned}
                          onChange={(e) =>
                            handleDailyTrackingChange(
                              index,
                              "planned",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={task.produced}
                          onChange={(e) =>
                            handleDailyTrackingChange(
                              index,
                              "produced",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="form-control"
                          value={task.dailyStatus}
                          onChange={(e) =>
                            handleDailyTrackingChange(
                              index,
                              "dailyStatus",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select Status</option>
                          <option value="On Track">On Track</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <Button color="success" onClick={submitDailyTracking}>
                          Update
                        </Button>
                        <Button
                          color="danger"
                          onClick={() => removeDailyTrackingRow(index)}
                          style={{ marginLeft: "1rem" }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={addDailyTrackingRow}>
            Add Row
          </Button>
          <Button color="secondary" onClick={() => setDailyTaskModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        isOpen={deleteConfirmationModal}
        toggle={() => setDeleteConfirmationModal(false)}
      >
        <ModalHeader toggle={() => setDeleteConfirmationModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this allocation? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleCancelAllocation}>
            Delete
          </Button>
          <Button
            color="secondary"
            onClick={() => setDeleteConfirmationModal(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};