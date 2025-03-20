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

export const AllocatedAssemblyPartList = ({
  porjectID,
  AssemblyListId,
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
  const [addRowModal, setAddRowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocations`
        );

        if (!response.data.data || response.data.data.length === 0) {
          setSections([]);
        } else {
          const formattedSections = response.data.data.map((item) => ({
            allocationId: item._id,
            title: item.processName,
            data: item.allocations.map((allocation) => {
              // Calculate daily planned quantity
              const shiftTotalTime = allocation.shiftTotalTime; // Total working time per day in minutes
              const perMachinetotalTime = allocation.perMachinetotalTime; // Time required to produce one part
              const plannedQuantity = allocation.plannedQuantity; // Total planned quantity

              // Calculate total time required to produce all parts
              const totalTimeRequired = plannedQuantity * perMachinetotalTime;

              // If total time required is less than or equal to shift time, dailyPlannedQty = plannedQuantity
              // Otherwise, calculate based on shift time
              const dailyPlannedQty =
                totalTimeRequired <= shiftTotalTime
                  ? plannedQuantity
                  : Math.floor(shiftTotalTime / perMachinetotalTime);

              return {
                trackingId: allocation._id,
                plannedQty: allocation.plannedQuantity,
                startDate: new Date(allocation.startDate).toLocaleDateString(),
                endDate: new Date(allocation.endDate).toLocaleDateString(),
                machineId: allocation.machineId,
                shift: allocation.shift,
                plannedTime: `${allocation.plannedTime} min`,
                operator: allocation.operator,
                actualEndDate: allocation.actualEndDate
                  ? new Date(allocation.actualEndDate).toLocaleDateString()
                  : "N/A",
                dailyPlannedQty: dailyPlannedQty, // Updated calculation
                shiftTotalTime: allocation.shiftTotalTime,
                perMachinetotalTime: allocation.perMachinetotalTime,
              };
            }),
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
  }, [porjectID, AssemblyListId, partListItemId]);

  const handleCancelAllocation = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocation`
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

    // Fetch existing daily tracking data
    try {
      const response = await axios.get(
        `http://localhost:4040/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocations/${section.allocationId}/allocations/${row.trackingId}/dailyTracking`
      );
      setExistingDailyTracking(response.data.dailyTracking || []);
    } catch (error) {
      console.error("Error fetching daily tracking data:", error);
    }
  };

  // Add this function to handle opening the new modal
  const openAddRowModal = () => {
    setAddRowModal(true);
  };

  // Add this function to handle closing the new modal
  const closeAddRowModal = () => {
    setAddRowModal(false);
  };

  // const handleDailyTrackingChange = (index, field, value) => {
  //   setDailyTracking((prev) => {
  //     const updated = [...prev];
  //     updated[index][field] = value;
  //     return updated;
  //   });
  // };
  const handleDailyTrackingChange = (index, field, value) => {
    setDailyTracking((prev) => {
      const updated = [...prev];
      updated[index][field] = value;

      // Update the status based on the produced and planned values
      if (field === "produced") {
        const produced = Number(value);
        const planned = Number(updated[index].planned);

        if (produced > 0) {
          if (produced === planned) {
            updated[index].dailyStatus = "On Track";
          } else if (produced < planned) {
            updated[index].dailyStatus = "Delayed";
          } else if (produced > planned) {
            updated[index].dailyStatus = "Ahead";
          }
        } else {
          updated[index].dailyStatus = "Not Started";
        }
      }

      return updated;
    });
  };

  const addDailyTrackingRow = () => {
    setDailyTracking((prev) => [
      ...prev,
      {
        date: "",
        planned: selectedSection?.data[0]?.dailyPlannedQty || "", // Use dailyPlannedQty as the default value
        produced: 0,
        dailyStatus: "On Track", // Set a default status
        operator: selectedSection?.data[0]?.operator || "",
      },
    ]);
  };

  const removeDailyTrackingRow = (index) => {
    setDailyTracking((prev) => prev.filter((_, i) => i !== index));
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

  const submitDailyTracking = async () => {
    setIsUpdating(true); // Set updating state to true
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

      // Calculate the status for each task before posting
      const updatedDailyTracking = dailyTracking.map((task) => {
        const produced = Number(task.produced);
        const planned = Number(task.planned);

        let dailyStatus = "Not Started";
        if (produced > 0) {
          if (produced === planned) {
            dailyStatus = "On Track";
          } else if (produced < planned) {
            dailyStatus = "Delayed";
          } else if (produced > planned) {
            dailyStatus = "Ahead";
          }
        }

        return {
          ...task,
          dailyStatus, // Update the status based on the produced and planned values
        };
      });

      // Post each daily tracking entry individually
      for (const task of updatedDailyTracking) {
        const formattedTask = {
          date: task.date,
          planned: Number(task.planned),
          produced: Number(task.produced),
          dailyStatus: task.dailyStatus, // Use the calculated status
          operator: task.operator,
        };

        const response = await axios.post(
          `http://localhost:4040/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
          formattedTask // Send the task in the required format
        );
      }

      toast.success("Daily Tracking Updated Successfully!");

      // Fetch the updated daily tracking data
      const updatedResponse = await axios.get(
        `http://localhost:4040/api/defpartproject/projects/${porjectID}/assemblyList/${AssemblyListId}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
      );
      setExistingDailyTracking(updatedResponse.data.dailyTracking || []);

      // Close the add row modal
      closeAddRowModal();
      setDailyTracking([]);
    } catch (error) {
      toast.error("Failed to update daily tracking.");
      console.error(
        "Error updating daily tracking:",
        error.response?.data || error
      );
    } finally {
      setIsUpdating(false); // Set updating state to false
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
                      <td>
                        {new Date(row.startDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        {new Date(row.endDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

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
                  <span>{selectedSection.data[0].dailyPlannedQty}</span>{" "}
                  {/* Display dailyPlannedQty */}
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
                  <span>
                    {new Date(
                      selectedSection.data[0].startDate
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Plan End Date: </span>
                  <span>
                    {new Date(
                      selectedSection.data[0].endDate
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Actual End Date: </span>
                  <span>{selectedSection.data[0].actualEndDate}</span>{" "}
                </Col>
              </Row>

              <div
                className="d-flex justify-content-end"
                style={{ marginBottom: "-3rem" }}
              >
                <Button
                  color="primary"
                  onClick={openAddRowModal}
                  disabled={calculateRemainingQuantity() <= 0}
                >
                  Add Row
                </Button>
              </div>
            </>
          )}
        </ModalBody>
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
                    <td>
                      {new Date(task.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td>{task.planned}</td>
                    <td>{task.produced}</td>

                    <td>
                      {task.produced == null || task.produced === 0 ? (
                        <span
                          className="badge bg-secondary-subtle text-secondary"
                          style={{ fontSize: "12px" }}
                        >
                          Not Started
                        </span>
                      ) : Number(task.produced) === Number(task.planned) ? (
                        <span
                          className="badge bg-primary-subtle text-primary"
                          style={{ fontSize: "12px" }}
                        >
                          On Track
                        </span>
                      ) : Number(task.produced) < Number(task.planned) ? (
                        <span
                          className="badge bg-danger-subtle text-danger"
                          style={{ fontSize: "12px" }}
                        >
                          Delayed
                        </span>
                      ) : Number(task.produced) > Number(task.planned) ? (
                        <span
                          className="badge bg-warning-subtle text-warning"
                          style={{ fontSize: "12px" }}
                        >
                          Ahead
                        </span>
                      ) : null}
                    </td>
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

      {/* Add Row Modal */}
      <Modal isOpen={addRowModal} toggle={closeAddRowModal} size="xl">
        <ModalHeader toggle={closeAddRowModal}>Add Daily Tracking</ModalHeader>

        <ModalBody>
          <Table bordered responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th style={{ width: "10rem" }}>Planned</th>
                <th style={{ width: "10rem" }}>Produced</th>
                <th>Status</th>
                <th style={{ width: "12rem" }}>Operator</th>
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
                        handleDailyTrackingChange(index, "date", e.target.value)
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
                    {task.produced == null ||
                    task.produced === 0 ? null : Number(task.produced) ===
                      Number(task.planned) ? (
                      <span
                        className="badge bg-primary-subtle text-primary"
                        style={{ fontSize: "12px" }}
                      >
                        On Track
                      </span>
                    ) : Number(task.produced) < Number(task.planned) ? (
                      <span
                        className="badge bg-danger-subtle text-danger"
                        style={{ fontSize: "12px" }}
                      >
                        Delayed
                      </span>
                    ) : Number(task.produced) > Number(task.planned) ? (
                      <span
                        className="badge bg-warning-subtle text-warning"
                        style={{ fontSize: "12px" }}
                      >
                        Ahead
                      </span>
                    ) : null}
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
                    <Button
                      color="success"
                      onClick={submitDailyTracking}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update"}
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
      </Modal>
    </div>
  );
};
