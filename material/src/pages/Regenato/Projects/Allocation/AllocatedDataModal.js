// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import {
//   Modal,
//   ModalHeader,
//   ModalBody,
//   ModalFooter,
//   Button,
//   Table,
//   Row,
//   Col,
// } from "reactstrap";

// const sectionTitleStyle = {
//   fontSize: "1.1rem",
//   fontWeight: "600",
//   color: "#212529",
//   marginBottom: "1rem",
// };

// const labelStyle = {
//   fontSize: "0.9rem",
//   color: "#495057",
//   marginBottom: "0.3rem",
//   display: "block",
// };

// const valueStyle = {
//   fontSize: "0.9rem",
//   fontWeight: "600",
//   color: "#343a40",
// };

// const AllocatedDataModal = ({ isOpen, toggle, data, projectId,onUpdateData }) => {
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   if (!data) return null;

//   const {
//     _id,
//     partName,
//     processName,
//     initialPlannedQuantity,
//     remainingQuantity,
//     allocations,
//   } = data;

//   console.log(data);
//   console.log(projectId);

//   const handleDelete = async () => {
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/partsLists/${data.partsListId}/partsListItems/${data.partsListItemsId}/allocation/${_id}`,
//         { method: "DELETE" }
//       );

//       if (response.ok) {
//         const newData = await response.json()
//         onUpdateData(newData)
//         toast.success("Allocation deleted successfully");
//         setConfirmDelete(false);
//         toggle(); // ✅ Close modal
//       } else {
//         toast.error("Failed to delete allocation");
//       }
//     } catch (error) {
//       toast.error("Error deleting allocation");
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <React.Fragment>
//       <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "80vw" }}>
//         <ModalHeader toggle={toggle}>Allocated Data</ModalHeader>
//         <ModalBody>
//           <Row className="mb-4">
//             <Col md="6">
//               <span style={labelStyle}>Part Name:</span>
//               <span style={valueStyle}>
//                 {partName}

//               </span>
//             </Col>
//             <Col md="6">
//               <span style={labelStyle}>Process Name:</span>
//               <span style={valueStyle}>{processName}</span>
//             </Col>
//           </Row>

//           <Row className="mb-4">
//             <Col>
//               <span style={labelStyle}>Planned Quantity:</span>
//               <span style={valueStyle}>{initialPlannedQuantity}</span>
//             </Col>
//             <Col>
//               <span style={labelStyle}>Remaining Quantity:</span>
//               <span style={valueStyle}>{remainingQuantity}</span>
//             </Col>
//           </Row>

//           <Row className="d-flex justify-content-between align-items-center mb-3">
//             <Col>
//               <span style={sectionTitleStyle}>Machine-wise Allocation</span>
//             </Col>
//             <Col className="text-end">
//               <Button color="primary"  className="mt-2 me-2">
//                 Update Daily Task
//               </Button>

//               <Button
//                 color="danger"
//                 onClick={() => setConfirmDelete(true)}
//                 className="mt-2"
//               >
//                 Cancel Allocation
//               </Button>
//             </Col>
//           </Row>

//           <Table bordered>
//             <thead>
//               <tr>
//                 <th>Part Type</th>
//                 <th>Planned Quantity</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//                 <th>Machine ID</th>
//                 <th>Shift</th>
//                 <th>Planned Time</th>
//                 <th>Operator</th>
//               </tr>
//             </thead>
//             <tbody>
//               {allocations?.map((alloc, index) => (
//                 <tr key={index}>
//                   <td>{alloc.partType}</td>
//                   <td>{alloc.plannedQuantity}</td>
//                   <td>{new Date(alloc.startDate).toLocaleDateString()}</td>
//                   <td>{new Date(alloc.endDate).toLocaleDateString()}</td>
//                   <td>{alloc.machineId}</td>
//                   <td>{alloc.shift}</td>
//                   <td>{alloc.plannedTime}</td>
//                   <td>{alloc.operator}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </ModalBody>
//         <ModalFooter>
//           <Button color="secondary" onClick={toggle}>
//             Close
//           </Button>
//         </ModalFooter>
//       </Modal>

//       {/* Delete modal */}
//       <Modal
//         isOpen={confirmDelete}
//         toggle={() => setConfirmDelete(false)}
//         centered
//       >
//         <ModalHeader toggle={() => setConfirmDelete(false)}>
//           Confirm Deletion
//         </ModalHeader>
//         <ModalBody>Are you sure you want to delete this allocation?</ModalBody>
//         <ModalFooter>
//           <Button color="danger" onClick={handleDelete}>
//             Delete
//           </Button>
//           <Button color="secondary" onClick={() => setConfirmDelete(false)}>
//             Cancel
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </React.Fragment>
//   );
// };

// export default AllocatedDataModal;

// ===========================================================================

import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
  Row,
  Col,
  Input,
} from "reactstrap";

const sectionTitleStyle = {
  fontSize: "1.1rem",
  fontWeight: "600",
  color: "#212529",
  marginBottom: "1rem",
};

const labelStyle = {
  fontSize: "0.9rem",
  color: "#495057",
  marginBottom: "0.3rem",
  display: "block",
};

const valueStyle = {
  fontSize: "0.9rem",
  fontWeight: "600",
  color: "#343a40",
};

const AllocatedDataModal = ({
  isOpen,
  toggle,
  data,
  projectId,
  onUpdateData,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dailyTaskModal, setDailyTaskModal] = useState(false);
  const [dailyTasks, setDailyTasks] = useState([]);

  if (!data) return null;

  const {
    _id,
    partName,
    processName,
    initialPlannedQuantity,
    remainingQuantity,
    allocations,
  } = data;

  const shiftMinutes = 480;
  const timePerPart =
    allocations && allocations.length > 0
      ? allocations[0].plannedTime / allocations[0].plannedQuantity
      : 0;

  const dailyTarget = timePerPart ? Math.floor(shiftMinutes / timePerPart) : 0;
  const totalDaysRequired = Math.ceil(initialPlannedQuantity / dailyTarget);
  const startDate =
    allocations && allocations.length > 0
      ? new Date(allocations[0].startDate)
      : new Date();
  const endDate =
    allocations && allocations.length > 0
      ? new Date(allocations[0].endDate)
      : new Date();

  useEffect(() => {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    setDailyTasks([
      {
        date: today,
        planned: dailyTarget,
        produced: 0,
        delay: "Pending",
      },
    ]);
  }, []);

  useEffect(() => {
    const checkNewDay = () => {
      let lastTaskDate = dailyTasks.length
        ? new Date(dailyTasks[dailyTasks.length - 1].date)
        : null;
      let today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!lastTaskDate || lastTaskDate < today) {
        setDailyTasks((prevTasks) => [
          ...prevTasks,
          {
            date: today,
            planned: dailyTarget,
            produced: 0,
            delay: "Pending",
          },
        ]);
      }
    };

    // Check once every hour
    const interval = setInterval(checkNewDay, 1000 * 60);

    return () => clearInterval(interval);
  }, [dailyTasks]);

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/partsLists/${data.partsListId}/partsListItems/${data.partsListItemsId}/allocation/${_id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        const newData = await response.json();
        onUpdateData(newData);
        toast.success("Allocation deleted successfully");
        setConfirmDelete(false);
        toggle();
      } else {
        toast.error("Failed to delete allocation");
      }
    } catch (error) {
      toast.error("Error deleting allocation");
      console.error("Error:", error);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} toggle={toggle} style={{ maxWidth: "80vw" }}>
        <ModalHeader toggle={toggle}>Allocated Data</ModalHeader>
        <ModalBody>
          <Row className="mb-4">
            <Col md="6">
              <span style={labelStyle}>Part Name:</span>
              <span style={valueStyle}>{partName}</span>
            </Col>
            <Col md="6">
              <span style={labelStyle}>Process Name:</span>
              <span style={valueStyle}>{processName}</span>
            </Col>
          </Row>

          <Row className="mb-4">
            <Col>
              <span style={labelStyle}>Planned Quantity:</span>
              <span style={valueStyle}>{initialPlannedQuantity}</span>
            </Col>
            <Col>
              <span style={labelStyle}>Remaining Quantity:</span>
              <span style={valueStyle}>{remainingQuantity}</span>
            </Col>
          </Row>

          <Row className="d-flex justify-content-between align-items-center mb-3">
            <Col>
              <span style={sectionTitleStyle}>Machine-wise Allocation</span>
            </Col>
            <Col className="text-end">
              <Button
                color="primary"
                onClick={() => setDailyTaskModal(true)}
                className="mt-2 me-2"
              >
                Update Daily Task
              </Button>

              <Button
                color="danger"
                onClick={() => setConfirmDelete(true)}
                className="mt-2"
              >
                Cancel Allocation
              </Button>
            </Col>
          </Row>

          <Table bordered>
            <thead>
              <tr>
                <th>Part Type</th>
                <th>Planned Quantity</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Machine ID</th>
                <th>Shift</th>
                <th>Planned Time</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {allocations?.map((alloc, index) => (
                <tr key={index}>
                  <td>{alloc.partType}</td>
                  <td>{alloc.plannedQuantity}</td>
                  <td>{new Date(alloc.startDate).toLocaleDateString()}</td>
                  <td>{new Date(alloc.endDate).toLocaleDateString()}</td>
                  <td>{alloc.machineId}</td>
                  <td>{alloc.shift}</td>
                  <td>{`${alloc.plannedTime} m`}</td>
                  <td>{alloc.operator}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete modal */}
      <Modal
        isOpen={confirmDelete}
        toggle={() => setConfirmDelete(false)}
        centered
      >
        <ModalHeader toggle={() => setConfirmDelete(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>Are you sure you want to delete this allocation?</ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete}>
            Delete
          </Button>
          <Button color="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={dailyTaskModal}
        toggle={() => setDailyTaskModal(false)}
        style={{ maxWidth: "50vw" }}
      >
        <ModalHeader toggle={() => setDailyTaskModal(false)}>
          Daily Task Update
        </ModalHeader>
        <ModalBody>
          <Row className="mb-3">
            <Col>
              <span style={labelStyle}>Total Quantity:</span>
              <span style={valueStyle}>{initialPlannedQuantity}</span>
            </Col>
            <Col>
              <span style={labelStyle}>Daily Target:</span>
              <span style={valueStyle}>{dailyTarget}</span>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <span style={labelStyle}>Start Date:</span>
              <span style={valueStyle}>{startDate.toDateString()}</span>
            </Col>
            <Col>
              <span style={labelStyle}>End Date:</span>
              <span style={valueStyle}>{endDate.toDateString()}</span>
            </Col>
          </Row>
          <Table bordered>
            <thead>
              <tr>
                <th>Date</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dailyTasks.map((task, index) => (
                <tr key={index}>
                  <td>{task.date.toDateString()}</td>
                  <td>{task.planned}</td>
                  <td>
                    <Input type="number" defaultValue={task.produced} />
                  </td>
                  <td>{task.delay}</td>
                  <td>
                    <Button>Update</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDailyTaskModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default AllocatedDataModal;
