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
import DatePicker from "react-datepicker";
import "../TestingPartAllocation/AllocatedPartListHrPlan.css";
import moment from "moment";
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
  const [isDateBlocked, setIsDateBlocked] = useState(false);
  const [highlightDates, setHighlightDates] = useState([]);

  useEffect(() => {
    const fetchHighlightDates = async () => {
      try {
        // Fetch all events (including holidays)
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/eventScheduler/events`
        );
        const dates = [];
        response.data.forEach((event) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          let current = new Date(start);
          while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });
        // Filter out holiday dates (events with eventName === "HOLIDAY")
        const holidayDates = response.data
          .filter((event) => event.eventName === "HOLIDAY")
          .flatMap((event) => {
            const start = new Date(event.startDate);
            const end = new Date(event.endDate);
            let current = new Date(start);
            const dates = [];
            while (current <= end) {
              dates.push(new Date(current));
              current.setDate(current.getDate() + 1);
            }
            return dates;
          });
        // Combine all dates and holiday dates
        const combinedDates = [...dates, ...holidayDates];
        console.log("Highlight Dates:", combinedDates); // Debugging: Log the combined dates
        setHighlightDates(combinedDates);
      } catch (error) {
        console.error("Error fetching highlight dates:", error);
      }
    };
    fetchHighlightDates();
  }, []);

  const getExcludedDates = () => {
    if (
      !selectedSection?.data[0]?.startDate ||
      !actulEndDateData.actualEndDate
    ) {
      return [];
    }

    const startDate = new Date(selectedSection.data[0].startDate);
    const endDate = new Date(actulEndDateData.actualEndDate);
    const excludedDates = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      excludedDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return excludedDates;
  };

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
                // startDate: new Date(allocation.startDate).toLocaleDateString(), //start date
                // endDate: new Date(allocation.endDate).toLocaleDateString(),
                startDate: moment(allocation.startDate).format("DD MMM YYYY"), // Updated
                endDate: moment(allocation.endDate).format("DD MMM YYYY"), // Updated
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
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${section.allocationId}/allocations/${row.trackingId}/dailyTracking`
      );
      setExistingDailyTracking(response.data.dailyTracking || []);

      // Update the actualEndDateData state with the fetched data
      setactulEndDateData(response.data); //actual end date
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
    if (field === "produced") {
      const remainingQty = calculateRemainingQuantity();
      const numericValue = Number(value) || 0;

      // If the new value exceeds remaining quantity
      if (numericValue > remainingQty) {
        toast.error(
          `Produced quantity cannot exceed remaining quantity (${remainingQty})`
        );

        // Keep the previous value (don't update the state)
        return;
      }
    }

    setDailyTracking((prev) => {
      const updated = [...prev];

      // SAFETY CHECK
      if (!updated[index]) {
        console.warn(`Index ${index} is undefined`);
        return prev;
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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`,
          formattedTask // Send the task in the required format
        );
      }

      toast.success("Daily Tracking Updated Successfully!");

      // Fetch the updated daily tracking data
      const updatedResponse = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${porjectID}/partsLists/${partID}/partsListItems/${partListItemId}/allocations/${allocationId}/allocations/${trackingId}/dailyTracking`
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
    setDailyTaskModal(false);
    setDailyTracking([
      {
        date: "",
        planned: selectedSection?.data[0]?.dailyPlannedQty || 0,
        produced: 0,
        dailyStatus: "On Track",
        operator: selectedSection?.data[0]?.operator || "",
      },
    ]);
  };

  const hasTrackingForToday = () => {
    if (!existingDailyTracking || existingDailyTracking.length === 0)
      return false;

    const today = moment().startOf("day"); // Get today's date at midnight
    return existingDailyTracking.some((task) =>
      moment(task.date).startOf("day").isSame(today)
    );
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
              <div className="table-responsive">
                <table className="table table-striped vertical-lines horizontals-lines">
                  <thead style={{ backgroundColor: "#f3f4f6" }}>
                    <tr>
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
                        <td>{moment(row.startDate).format("DD MMM YYYY")}</td>
                        <td>{moment(row.endDate).format("DD MMM YYYY")} </td>

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
                </table>
              </div>
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
          {/* Update Daily Tracking -  {selectedSection?.title}  */}
          Update Daily Tracking -- {selectedSection?.title} - (Machine ID:{" "}
          {selectedSection?.data[0]?.machineId || "N/A"})
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
                    {moment(selectedSection.data[0].startDate).format(
                      "DD MMM YYYY"
                    )}
                  </span>
                </Col>
                <Col>
                  <span style={{ fontWeight: "bold" }}>Plan End Date: </span>
                  <span>
                    {moment(selectedSection.data[0].endDate).format(
                      "DD MMM YYYY"
                    )}
                  </span>
                </Col>

                <Col>
                  <span style={{ fontWeight: "bold" }}>Actual End Date: </span>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: (() => {
                        const actualEndDate = actulEndDateData.actualEndDate
                          ? moment(actulEndDateData.actualEndDate)
                          : null;
                        const endDate = moment(selectedSection.data[0].endDate);

                        if (!actualEndDate) return "black"; // Default case
                        if (actualEndDate.isSame(endDate, "day"))
                          return "black"; // Dates are equal
                        if (actualEndDate.isAfter(endDate, "day")) return "red"; // Delayed
                        return "green"; // Completed early
                      })(),
                    }}
                  >
                    {actulEndDateData.actualEndDate
                      ? moment(actulEndDateData.actualEndDate).format(
                          "DD MMM YYYY"
                        )
                      : moment(selectedSection.data[0].endDate).format(
                          "DD MMM YYYY"
                        )}
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
                  disabled={
                    calculateRemainingQuantity() <= 0 || hasTrackingForToday()
                  }
                >
                  Add Daily Input
                </Button>
              </div>
            </>
          )}
        </ModalBody>
        <ModalHeader>Previous Tracking Data</ModalHeader>
        <ModalBody>
          <div className="table-responsive">
            <table className="table table-striped vertical-lines horizontals-lines">
              <thead style={{ backgroundColor: "#f3f4f6" }}>
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
                      <td>{moment(task.date).format("DD MMM YYYY")}</td>
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
                            className="badge bg-success-subtle text-success"
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
            </table>
          </div>
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
            <div className="form-group">
              <label>Date</label>
              <div>
                <DatePicker
                  selected={
                    dailyTracking[0].date
                      ? new Date(dailyTracking[0].date)
                      : new Date() // Default to current date
                  }
                  onChange={(date) =>
                    handleDailyTrackingChange(0, "date", date)
                  }
                  dateFormat="dd-MM-yyyy"
                  className="form-control-date"
                  placeholderText="DD-MM-YYYY"
                  minDate={new Date(selectedSection?.data[0]?.startDate)}
                  maxDate={
                    actulEndDateData?.actualEndDate
                      ? new Date(actulEndDateData.actualEndDate)
                      : selectedSection?.data[0]?.endDate
                      ? new Date(selectedSection.data[0].endDate)
                      : null
                  }
                  filterDate={(date) => {
                    const isHoliday = highlightDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    );
                    const isSunday = date.getDay() === 0;

                    const maxAllowedDate = actulEndDateData?.actualEndDate
                      ? new Date(actulEndDateData.actualEndDate)
                      : selectedSection?.data[0]?.endDate
                      ? new Date(selectedSection.data[0].endDate)
                      : null;

                    // Block if holiday, Sunday, or after actual end date
                    if (maxAllowedDate && date > maxAllowedDate) {
                      return false;
                    }

                    return !isHoliday && !isSunday;
                  }}
                  dayClassName={(date) => {
                    const isHighlighted = highlightDates.some(
                      (d) => d.toDateString() === date.toDateString()
                    );
                    const isSunday = date.getDay() === 0;

                    if (isHighlighted || isSunday) {
                      return "highlighted-date";
                    }
                    return undefined;
                  }}
                />
              </div>
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
                <label>
                  Produced (Remaining: {calculateRemainingQuantity()})
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={
                    dailyTracking.length > 0 ? dailyTracking[0].produced : ""
                  }
                  max={calculateRemainingQuantity()} // HTML max attribute
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
                        return <span className="text-success">Ahead</span>;
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
