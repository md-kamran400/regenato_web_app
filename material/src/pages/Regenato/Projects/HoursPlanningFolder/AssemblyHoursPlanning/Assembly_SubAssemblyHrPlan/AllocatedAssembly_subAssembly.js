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

export const AllocatedAssembly_subAssembly = ({
  porjectID,
  AssemblyListId,
  subAssembliesId,
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
  const [existingDailyTracking, setExistingDailyTracking] = useState([]);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/subAssemblies/${subAssembliesId}/partsListItems/${partListItemId}/allocations`
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
  }, [porjectID, AssemblyListId, subAssembliesId, partListItemId]);

  const handleCancelAllocation = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocations`
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

  const openModal = async (section, row) => {
    setSelectedSection({
      ...section,
      data: [row], // Pass the specific row data
    });
    setDailyTaskModal(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/subAssemblies/${subAssembliesId}/partsListItems/${partListItemId}/allocations/${section.allocationId}/allocations/${row.trackingId}/dailyTracking`
      );
      setExistingDailyTracking(response.data.dailyTracking || []);
      console.log(response || []);
    } catch (error) {
      console.error("Error fetching daily tracking data:", error);
    }
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
      {
        date: "",
        planned: calculateDailyPlannedQuantity(),
        produced: 0,
        dailyStatus: "",
        operator: selectedSection?.data[0]?.operator || "",
      },
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

  // Calculate the remaining quantity to produce
  const calculateRemainingQuantity = () => {
    if (!selectedSection || !selectedSection.data[0]) return 0;

    const totalQuantity = selectedSection.data[0].plannedQty;
    const totalProduced = existingDailyTracking.reduce(
      (sum, task) => sum + task.produced,
      0
    );

    return totalQuantity - totalProduced;
  };

  // Calculate the actual end date based on the last tracking date
  // const calculateActualEndDate = () => {
  //   if (!existingDailyTracking || existingDailyTracking.length === 0) {
  //     return selectedSection?.data[0]?.endDate || "";
  //   }

  //   const lastTrackingDate = existingDailyTracking.reduce((latest, task) => {
  //     const taskDate = new Date(task.date);
  //     return taskDate > latest ? taskDate : latest;
  //   }, new Date(0));

  //   return lastTrackingDate.toLocaleDateString();
  // };

  const calculateActualEndDate = () => {
    if (!selectedSection || !selectedSection.data[0]) {
      return ""; // Return empty string if no section or data is selected
    }

    const totalQuantity = selectedSection.data[0].plannedQty;
    const dailyPlannedQuantity = calculateDailyPlannedQuantity();
    const totalProduced = existingDailyTracking.reduce(
      (sum, task) => sum + (task.produced || 0),
      0
    );

    const remainingQuantity = totalQuantity - totalProduced;

    if (remainingQuantity <= 0) {
      // If all quantities are produced, return the last tracking date
      const lastTrackingDate = existingDailyTracking.reduce((latest, task) => {
        const taskDate = new Date(task.date);
        return taskDate > latest && !isNaN(taskDate) ? taskDate : latest;
      }, new Date(0));

      // If no valid tracking dates, return the plan end date
      if (lastTrackingDate.getTime() === new Date(0).getTime()) {
        return selectedSection.data[0].endDate;
      }

      return lastTrackingDate.toLocaleDateString();
    }

    // Calculate the additional days needed based on the remaining quantity
    const additionalDays = Math.ceil(remainingQuantity / dailyPlannedQuantity);

    // Find the last tracking date
    const lastTrackingDate = existingDailyTracking.reduce((latest, task) => {
      const taskDate = new Date(task.date);
      return taskDate > latest && !isNaN(taskDate) ? taskDate : latest;
    }, new Date(0));

    // If no valid tracking dates, return the plan end date
    if (lastTrackingDate.getTime() === new Date(0).getTime()) {
      return selectedSection.data[0].endDate;
    }

    // Calculate the new end date by adding the additional days to the last tracking date
    const newEndDate = new Date(lastTrackingDate);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);

    return newEndDate.toLocaleDateString();
  };

  const submitDailyTracking = async () => {
    try {
      if (!selectedSection || !selectedSection.data.length) {
        toast.error("No allocation selected.");
        return;
      }

      const allocationId = selectedSection.allocationId;
      const trackingId = selectedSection.data[0]?.trackingId;

      if (!allocationId || !trackingId) {
        toast.error("Allocation or Tracking ID is missing.");
        console.error("Missing allocationId or trackingId:", {
          allocationId,
          trackingId,
        });
        return;
      }

      // Validate each daily tracking entry
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

      // Post each daily tracking entry individually
      for (const task of dailyTracking) {
        const formattedTask = {
          date: task.date,
          planned: Number(task.planned),
          produced: Number(task.produced),
          dailyStatus: task.dailyStatus,
          operator: task.operator,
        };

        //http://localhost:4040/api/defpartproject/projects/67d13d05ebba60b51efa8f93/assemblyList/67d152cc71637041c40863b7/subAssemblies/67d071aa321542e5602f65bb/partsListItems/67d071be321542e5602fa149/allocations/67d152e871637041c40907cc/allocations/67d152e871637041c40907cd/dailyTracking
        const response = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/subAssemblies/${subAssembliesId}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
          formattedTask // Send the task in the required format
        );
      }

      toast.success("Daily Tracking Updated Successfully!");
      setDailyTaskModal(false);
    } catch (error) {
      toast.error("Failed to update daily tracking.");
      console.error(
        "Error updating daily tracking:",
        error.response?.data || error
      );
    }
  };

  const closeDailyTaskModal = () => {
    setDailyTracking([]); // Clear added rows
    setDailyTaskModal(false);
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
        toggle={closeDailyTaskModal}
        style={{ maxWidth: "80vw" }}
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
                  <span style={{ fontWeight: "bold" }}>
                    Daily Planned Quantity:{" "}
                  </span>
                  <span>{calculateDailyPlannedQuantity()}</span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>
                    Remaining Produce Quantity:{" "}
                  </span>
                  <span>{calculateRemainingQuantity()}</span>
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
                <Col>
                  <span style={{ fontWeight: "bold" }}>Actual End Date: </span>
                  <span>{calculateActualEndDate()}</span>
                </Col>
              </Row>

              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th style={{ width: "8rem" }}>Planned</th>
                    <th style={{ width: "8rem" }}>Produced</th>
                    <th>Status</th>
                    <th style={{ width: "10rem" }}>Operator</th>
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
                          readOnly
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
                        <input
                          type="text"
                          className="form-control"
                          value={task.operator}
                          onChange={(e) =>
                            handleDailyTrackingChange(
                              index,
                              "operator",
                              e.target.value
                            )
                          }
                          readOnly
                        />
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
          <Button
            color="primary"
            onClick={addDailyTrackingRow}
            disabled={calculateRemainingQuantity() <= 0}
          >
            Add Row
          </Button>
          <Button color="secondary" onClick={() => setDailyTaskModal(false)}>
            Close
          </Button>
        </ModalFooter>

        <ModalHeader>Previous Tracking Data</ModalHeader>
        <ModalBody>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Planned</th>
                <th>Produced</th>
                <th>Status</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {!existingDailyTracking.length ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No daily tracking data available
                  </td>
                </tr>
              ) : (
                existingDailyTracking.map((task, index) => (
                  <tr key={index}>
                    <td>{new Date(task.date).toLocaleDateString()}</td>
                    <td>{task.planned}</td>
                    <td>{task.produced}</td>
                    <td>{task.dailyStatus}</td>
                    <td>{task.operator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </ModalBody>
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
