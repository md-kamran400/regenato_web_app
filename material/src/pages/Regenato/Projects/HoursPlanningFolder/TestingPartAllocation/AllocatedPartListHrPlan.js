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

export const AllocatedPartListHrPlan = ({
  porjectID,
  partID,
  partListItemId,
  onDeleteSuccess,
}) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTaskModal, setDailyTaskModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [deleteConfirmationModal, setDeleteConfirmationModal] = useState(false);
  const [dailyTracking, setDailyTracking] = useState([
    {
      date: "",
      planned: 0,
      produced: 0,
      dailyStatus: "On Track",
      operator: "",
    },
  ]);

  const [existingDailyTracking, setExistingDailyTracking] = useState([]);
  const [actulEndDateData, setactulEndDateData] = useState([]);
  const [addRowModal, setAddRowModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`
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
                actualEndDate: allocation.actualEndDate || allocation.endDate,
                // ? new Date(allocation.actualEndDate).toLocaleDateString()
                // : "N/A",
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
  }, [porjectID, partID, partListItemId]);

  const handleCancelAllocation = async () => {
    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocation`
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
    console.log("Row Data:", row); // Debugging: Check if actualEndDate is present
    setSelectedSection({
      ...section,
      data: [row], // Pass the specific row data
    });

    setDailyTracking([
      {
        date: "",
        planned: Number(row.dailyPlannedQty) || 0, // Ensure planned is correctly set
        produced: 0,
        dailyStatus: "On Track",
        operator: row.operator || "",
      },
    ]);

    setDailyTaskModal(true);

    // Fetch existing daily tracking data
    try {
      const response = await axios.get(
        `http://localhost:4040/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${section.allocationId}/allocations/${row.trackingId}/dailyTracking`
      );
      setExistingDailyTracking(response.data.dailyTracking || []);

      // Update the actualEndDateData state with the fetched data
      setactulEndDateData(response.data);
    } catch (error) {
      console.error("Error fetching daily tracking data:", error);
    }
  };

  const openAddRowModal = () => {
    setAddRowModal(true);
  };

  const closeAddRowModal = () => {
    setAddRowModal(false);
  };

  const handleDailyTrackingChange = (index, field, value) => {
    setDailyTracking((prev) => {
      const updated = [...prev];

      // SAFETY CHECK
      if (!updated[index]) {
        console.warn(`Index ${index} is undefined`);
        return prev; // or return updated without modification
      }

      updated[index][field] = value;

      if (field === "produced") {
        const produced = Number(value) || 0;
        const planned =
          Number(updated[index].planned) ||
          Number(selectedSection?.data[0]?.dailyPlannedQty) ||
          0;

        if (produced === planned) {
          updated[index].dailyStatus = "On Track";
        } else if (produced > planned) {
          updated[index].dailyStatus = "Ahead";
        } else {
          updated[index].dailyStatus = "Delayed";
        }
      }

      return updated;
    });
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

      // Validate each daily tracking entry
      const isValid = dailyTracking.every((task) => {
        const isValidTask =
          task.date &&
          !isNaN(new Date(task.date)) &&
          !isNaN(Number(task.planned)) &&
          !isNaN(Number(task.produced)) &&
          task.dailyStatus;

        if (!isValidTask) {
          console.error("Invalid Task:", task);
        }

        return isValidTask;
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

        const response = await axios.post(
          `http://localhost:4040/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
          formattedTask // Send the task in the required format
        );
      }

      toast.success("Daily Tracking Updated Successfully!");

      // Fetch the updated daily tracking data
      const updatedResponse = await axios.get(
        `http://localhost:4040/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
      );
      setExistingDailyTracking(updatedResponse.data.dailyTracking || []);

      // Update the actualEndDateData state with the fetched data
      setactulEndDateData(updatedResponse.data);

      // Reset the dailyTracking state to its initial value
      setDailyTracking([
        {
          date: "",
          planned: Number(selectedSection.data[0].dailyPlannedQty) || 0,
          produced: 0,
          dailyStatus: "On Track",
          operator: selectedSection.data[0].operator || "",
        },
      ]);

      // Close the add row modal
      closeAddRowModal();
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
                  <span>{selectedSection.data[0].dailyPlannedQty}</span>
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
                  <span style={{ fontWeight: "bold" }} >Actual End Date: </span>
                  <span style={{ fontWeight: "bold",color:'red' }}>
                    {actulEndDateData.actualEndDate
                      ? new Date(
                          actulEndDateData.actualEndDate
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : new Date(
                        selectedSection.data[0].endDate
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </span>
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
                      {task.dailyStatus === "On Track" ? (
                        <span
                          className="badge bg-primary-subtle text-primary"
                          style={{ fontSize: "13px" }}
                        >
                          On Track
                        </span>
                      ) : task.dailyStatus === "Delayed" ? (
                        <span
                          className="badge bg-danger-subtle text-danger"
                          style={{ fontSize: "13px" }}
                        >
                          Delayed
                        </span>
                      ) : task.dailyStatus === "Ahead" ? (
                        <span
                          className="badge bg-warning-subtle text-warning"
                          style={{ fontSize: "13px" }}
                        >
                          Ahead
                        </span>
                      ) : task.dailyStatus === "Not Started" ||
                        task.produced == null ||
                        task.produced === 0 ? (
                        <span
                          className="badge bg-secondary-subtle text-secondary"
                          style={{ fontSize: "13px" }}
                        >
                          Not Started
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

      {/* daily trackin modal */}
      <Modal isOpen={addRowModal} toggle={closeAddRowModal} size="l">
        <ModalHeader toggle={closeAddRowModal}>Add Daily Tracking</ModalHeader>
        <ModalBody>
          <form>
            {/* Date Input */}
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={dailyTracking.length > 0 ? dailyTracking[0].date : ""}
                onChange={(e) =>
                  handleDailyTrackingChange(0, "date", e.target.value)
                }
              />
            </div>

            {/* Planned and Produced Inputs in a Row */}
            <div className="form-row" style={{ display: "flex", gap: "5px" }}>
              <div className="form-group col-md-6">
                <label>Planned</label>
                <input
                  type="number"
                  className="form-control"
                  value={
                    dailyTracking[0]?.planned ||
                    selectedSection?.data[0]?.dailyPlannedQty ||
                    ""
                  }
                  readOnly
                />
              </div>
              <div className="form-group col-md-6">
                <label>Produced</label>
                <input
                  type="number"
                  className="form-control"
                  value={
                    dailyTracking.length > 0 ? dailyTracking[0].produced : ""
                  }
                  onChange={(e) =>
                    handleDailyTrackingChange(0, "produced", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Produced Status (Styled like an input) */}
            {dailyTracking.length > 0 &&
              dailyTracking[0].produced !== undefined &&
              dailyTracking[0].planned !== undefined && (
                <div className="form-group">
                  <label>Status</label>
                  <div
                    className="form-control"
                    style={{
                      backgroundColor: "#f8f9fa", // Light gray background
                      border: "1px solid #ced4da", // Border like an input
                      padding: "0.375rem 0.75rem", // Input padding
                      borderRadius: "0.25rem", // Rounded corners like an input
                      color: "#495057", // Text color
                    }}
                  >
                    {(() => {
                      const produced = Number(dailyTracking[0].produced) || 0;
                      const planned = Number(dailyTracking[0].planned) || 0;

                      if (produced === 0) {
                        return (
                          <span className="text-danger">
                            Please Enter Produced Quantity
                          </span>
                        );
                      }

                      if (Number(produced) === Number(planned)) {
                        return <span className="text-primary">On Track</span>;
                      } else if (produced > planned) {
                        return <span className="text-warning">Ahead</span>;
                      } else if (produced < planned) {
                        return <span className="text-danger">Delayed</span>;
                      }

                      return null;
                    })()}
                  </div>
                </div>
              )}

            {/* Operator Input */}
            <div className="form-group">
              <label>Operator</label>
              <input
                type="text"
                className="form-control"
                value={
                  dailyTracking[0]?.operator ||
                  selectedSection?.data[0]?.operator ||
                  ""
                }
                readOnly
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          {/* Update Button */}
          <Button
            color="primary"
            onClick={submitDailyTracking}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
