import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Calendar, Clock } from "lucide-react";
import { Card, CardBody, Badge, Row, Col } from "reactstrap";
import "./Plan.css";

const processColors = {
  C1: { bg: "#3B82F6", border: "#2563EB" },
  C2: { bg: "#10B981", border: "#059669" },
  C3: { bg: "#F59E0B", border: "#D97706" },
  C4: { bg: "#EF4444", border: "#DC2626" },
  C5: { bg: "#8B5CF6", border: "#7C3AED" },
  C6: { bg: "#EC4899", border: "#DB2777" },
  C7: { bg: "#06B6D4", border: "#0891B2" },
  C8: { bg: "#F97316", border: "#EA580C" },
  C9: { bg: "#2563EB", border: "#1D4ED8" },
  C11: { bg: "#DC2626", border: "#B91C1C" },
  C12: { bg: "#059669", border: "#047857" },
  C13: { bg: "#7C3AED", border: "#6D28D9" },
  C14: { bg: "#DB2777", border: "#BE185D" },
  C15: { bg: "#9333EA", border: "#7E22CE" },
  C17: { bg: "#4F46E5", border: "#4338CA" },
  C18: { bg: "#0EA5E9", border: "#0284C7" },
  C19: { bg: "#0D9488", border: "#0F766E" },
};

export function PlanPage() {
  const { allocationId } = useParams();
  const [allocationData, setAllocationData] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dailyTrackingEvents, setDailyTrackingEvents] = useState([]);

  useEffect(() => {
    fetchAllocationData();
  }, [allocationId]);

  const fetchAllocationData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
      );
      const data = await response.json();
      setAllocationData(data.data);

      if (allocationId) {
        // Find the allocation by ID
        let foundAllocation = null;
        let foundProject = null;
        let foundPart = null;
        let foundProcess = null;

        // Search through all projects and their allocations
        for (const project of data.data) {
          for (const partProcess of project.allocations) {
            for (const allocation of partProcess.allocations) {
              if (allocation._id === allocationId) {
                foundAllocation = allocation;
                foundProject = project.projectName;
                foundPart = partProcess.partName;
                foundProcess = partProcess.processName;
                break;
              }
            }
            if (foundAllocation) break;
          }
          if (foundAllocation) break;
        }

        if (foundAllocation && foundProject) {
          setSelectedProject(foundProject);
          setSelectedPart(foundPart);
          setSelectedOrder(
            foundAllocation.splitNumber || foundAllocation.orderNumber
          );
          setSelectedProcess(foundProcess);
          transformData(foundProject, foundPart, data.data);
        } else {
          // If allocation not found, set default project and part
          if (data.data.length > 0 && data.data[0].allocations.length > 0) {
            setSelectedProject(data.data[0].projectName);
            setSelectedPart(data.data[0].allocations[0].partName);
            transformData(
              data.data[0].projectName,
              data.data[0].allocations[0].partName,
              data.data
            );
          }
        }
      } else {
        // No allocation ID provided, set default project and part
        if (data.data.length > 0 && data.data[0].allocations.length > 0) {
          setSelectedProject(data.data[0].projectName);
          setSelectedPart(data.data[0].allocations[0].partName);
          transformData(
            data.data[0].projectName,
            data.data[0].allocations[0].partName,
            data.data
          );
        }
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch allocation data");
      setLoading(false);
    }
  };

  const transformData = (projectName, partName, data) => {
    // Find the selected project
    const selectedProjectData = data.find(
      (project) => project.projectName === projectName
    );

    if (!selectedProjectData) return;

    // Get all unique order numbers for the selected part
    const splitNumbers = new Set();
    selectedProjectData.allocations
      .filter((alloc) => alloc.partName === partName)
      .forEach((alloc) => {
        alloc.allocations.forEach((a) => {
          splitNumbers.add(a.splitNumber || a.orderNumber);
        });
      });

    // Create resources (order numbers)
    const resourcesList = Array.from(splitNumbers).map((orderNum) => ({
      id: orderNum,
      title: `Order ${orderNum}`,
    }));
    setResources(resourcesList);

    // Create events
    const eventsList = [];
    selectedProjectData.allocations
      .filter((alloc) => alloc.partName === partName)
      .forEach((alloc) => {
        alloc.allocations.forEach((a) => {
          const machineCode = a.machineId.split("-")[0];
          const colors = processColors[machineCode] || {
            bg: "#666",
            border: "#444",
          };

          eventsList.push({
            id: a._id,
            resourceId: a.splitNumber || a.orderNumber,
            start: a.startDate,
            end: a.endDate,
            title: `${alloc.processName} - ${a.machineId}`,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            extendedProps: {
              processName: alloc.processName,
              machineId: a.machineId,
              operator: a.operator,
              plannedQuantity: a.plannedQuantity,
              shift: a.shift,
              splitNumber: a.splitNumber || a.orderNumber,
              AllocationPartType: a.AllocationPartType,
            },
          });
        });
      });
    setEvents(eventsList);
  };

  const transformDailyTrackingData = (dailyTracking, processName) => {
    return dailyTracking.map((tracking) => ({
      id: tracking._id,
      title: `${processName} - ${tracking.dailyStatus}`,
      start: tracking.date,
      allDay: true,
      backgroundColor: "#3B82F6", // You can customize the color
      borderColor: "#2563EB", // You can customize the color
      extendedProps: {
        planned: tracking.planned,
        produced: tracking.produced,
        operator: tracking.operator,
        status: tracking.dailyStatus,
      },
    }));
  };

  const handleProjectChange = (e) => {
    const newProject = e.target.value;
    setSelectedProject(newProject);
    setSelectedPart("");
    setSelectedOrder(null);
    setSelectedProcess(null);

    // Reset resources and events
    setResources([]);
    setEvents([]);
  };

  const handlePartChange = (e) => {
    const newPart = e.target.value;
    setSelectedPart(newPart);
    setSelectedOrder(null);
    setSelectedProcess(null);
    transformData(selectedProject, newPart, allocationData);
  };

  const handleEventClick = (info) => {
    const { splitNumber, processName } = info.event.extendedProps;
    setSelectedOrder(splitNumber);
    setSelectedProcess(processName);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Get unique projects for the dropdown
  const uniqueProjects = [
    ...new Set(allocationData.map((project) => project.projectName)),
  ];

  // Get parts for the selected project
  const selectedProjectData = allocationData.find(
    (project) => project.projectName === selectedProject
  );
  const uniqueParts = selectedProjectData
    ? [
        ...new Set(
          selectedProjectData.allocations.map((alloc) => alloc.partName)
        ),
      ]
    : [];

  // Get filtered allocations for the selected project and part
  const filteredAllocations = selectedProjectData
    ? selectedProjectData.allocations.filter(
        (alloc) => alloc.partName === selectedPart
      )
    : [];

  // Get unique orders for the selected part
  const uniqueOrders = [
    ...new Set(
      filteredAllocations.flatMap((alloc) =>
        alloc.allocations.map((a) => a.splitNumber || a.orderNumber)
      )
    ),
  ];

  return (
    <div className="p-4">
      <div className="process-header">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Production Planning</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Select Project Dropdown */}
          <select
            value={selectedProject}
            onChange={handleProjectChange}
            className="process-select"
          >
            <option value="" disabled>
              Select Production Orders
            </option>
            {uniqueProjects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>

          {/* Select Part Dropdown */}
          <select
            value={selectedPart}
            onChange={handlePartChange}
            className="process-select"
            disabled={!selectedProject}
          >
            <option value="" disabled>
              Select Part
            </option>
            {uniqueParts.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-lg shadow-sm">
        <FullCalendar
          plugins={[resourceTimelinePlugin, adaptivePlugin]}
          initialView="resourceTimelineMonth"
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right:
              "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth",
          }}
          resources={resources}
          events={events}
          resourceAreaWidth="200px"
          height="auto"
          slotMinWidth={100}
          resourceAreaHeaderContent="Order Number"
          eventClick={handleEventClick}
          eventContent={(arg) => {
            return (
              <div className="p-1 text-sm text-white">
                <div className="font-medium">
                  {arg.event.extendedProps.processName}
                </div>
                <div>{arg.event.extendedProps.machineId}</div>
              </div>
            );
          }}
          eventDidMount={(info) => {
            const event = info.event;
            const props = event.extendedProps;

            const tooltipContent = `
              Process: ${props.processName}
              Machine: ${props.machineId}
              Operator: ${props.operator}
              Quantity: ${props.plannedQuantity}
              Shift: ${props.shift}
              Start: ${event.start?.toLocaleDateString()}
              End: ${event.end?.toLocaleDateString()}
            `;
            info.el.setAttribute("title", tooltipContent);
          }}
        />
      </div>

      {/* Bottom Panels */}
      <div
        className="panels-container"
        style={{
          marginTop: "40px",
          width: "100%",
          display: "flex",
          gap: "16px",
        }}
      >
        {/* Orders Panel */}
        <div className="panel orders-panel" style={{ flex: 1 }}>
          <Card>
            <CardBody>
              <div style={{ marginBottom: "16px" }}>
                <h2
                  style={{ fontSize: "18px", fontWeight: "600", color: "#333" }}
                >
                  Orders
                </h2>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Total Orders: {uniqueOrders.length}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxHeight: "500px",
                  overflowY: "auto",
                  paddingRight: "8px", // Prevents scrollbar overlap with content
                }}
              >
                {uniqueOrders.map((orderNum) => {
                  console.log("Rendering Order:", orderNum);

                  const orderAllocations = filteredAllocations.flatMap(
                    (allocation) =>
                      allocation.allocations.filter(
                        (a) => (a.splitNumber || a.orderNumber) === orderNum
                      )
                  );

                  console.log(
                    `Order ${orderNum} Allocations:`,
                    orderAllocations
                  );

                  const firstAllocation = orderAllocations[0];
                  // Calculate total planned quantity for the order
                  const totalQuantity = orderAllocations.reduce(
                    (sum, alloc) => sum + (alloc.plannedQuantity || 0),
                    0
                  );

                  if (orderAllocations.length === 0) {
                    console.warn(`Order ${orderNum} has no allocations!`);
                    return null; // Avoid rendering empty orders
                  }

                  // Calculate total duration for the order
                  const startDate = new Date(firstAllocation?.startDate);
                  const endDate = new Date(firstAllocation?.endDate);
                  const totalDuration = Math.ceil(
                    (endDate - startDate) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <Card
                      key={orderNum}
                      style={{
                        background:
                          orderNum === selectedOrder ? "#e0f2fe" : "#f9fafb",
                        border: `1px solid ${
                          orderNum === selectedOrder ? "#7dd3fc" : "#e5e7eb"
                        }`,
                        borderRadius: "8px",
                        padding: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onClick={() => {
                        setSelectedOrder(orderNum);
                        setSelectedProcess(null);
                      }}
                    >
                      <CardBody style={{ padding: "0" }}>
                        <Row>
                          <Col>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "500",
                                  color: "#111827",
                                }}
                              >
                                Order #{orderNum}
                              </div>
                              <Badge
                                color="primary"
                                style={{
                                  fontSize: "12px",
                                  padding: "4px 8px",
                                  borderRadius: "12px",
                                }}
                              >
                                {firstAllocation?.AllocationPartType || "N/A"}
                              </Badge>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <div>
                                <span
                                  style={{ fontSize: "14px", color: "#666" }}
                                >
                                  Total Quantity:{" "}
                                </span>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: "#111827",
                                    fontWeight: "500",
                                  }}
                                >
                                  {totalQuantity} units
                                </span>
                              </div>
                              <div>
                                <span
                                  style={{ fontSize: "14px", color: "#666" }}
                                >
                                  Duration:{" "}
                                </span>
                                <span
                                  style={{
                                    fontSize: "14px",
                                    color: "#111827",
                                    fontWeight: "500",
                                  }}
                                >
                                  {totalDuration} days
                                </span>
                              </div>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "14px",
                                color: "#666",
                              }}
                            >
                              <Calendar size={14} color="#666" />
                              <span>
                                {formatDate(firstAllocation?.startDate)} -{" "}
                                {formatDate(firstAllocation?.endDate)}
                              </span>
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
        {/* Processes Panel */}
        <div className="panel processes-panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <h2 className="panel-title">Processes</h2>
            {selectedOrder && (
              <div className="panel-subtitle">Order: {selectedOrder}</div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder &&
              filteredAllocations.map((processAllocation) => {
                const allocation = processAllocation.allocations.find(
                  (a) => a.splitNumber === selectedOrder
                );

                if (!allocation) return null;

                const isSelected =
                  processAllocation.processName === selectedProcess;
                const machineCode = allocation.machineId.split("-")[0];
                const colors = processColors[machineCode] || {
                  bg: "#666",
                  border: "#444",
                };

                return (
                  <div
                    key={processAllocation._id}
                    className={`process-item ${
                      isSelected ? "selected-item" : ""
                    }`}
                    onClick={() =>
                      setSelectedProcess(processAllocation.processName)
                    }
                    style={{
                      borderColor: isSelected ? colors.border : undefined,
                      backgroundColor: isSelected
                        ? `${colors.bg}15`
                        : undefined,
                    }}
                  >
                    <div className="process-item-header">
                      <span className="process-item-name">
                        {processAllocation.processName}
                      </span>
                      <span className="process-item-machine">
                        {allocation.machineId}
                      </span>
                    </div>
                    <div className="process-item-dates">
                      <Clock size={14} className="date-icon" />
                      <span>
                        {formatDate(allocation.startDate)} -
                        {formatDate(allocation.endDate)}
                      </span>
                    </div>
                    <div className="process-item-operator">
                      Operator: {allocation.operator}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div
          className="panel details-panel"
          style={{ flex: "0 0 50%", maxWidth: "50%" }}
        >
          <div className="panel-header">
            <h2 className="panel-title">Process Details</h2>
            {selectedOrder && selectedProcess && (
              <div className="panel-subtitle">
                {selectedProcess} - {selectedOrder}
              </div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder &&
              selectedProcess &&
              filteredAllocations
                .filter((p) => p.processName === selectedProcess)
                .map((processAllocation) => {
                  const allocation = processAllocation.allocations.find(
                    (a) => a.splitNumber === selectedOrder
                  );

                  if (!allocation) return null;

                  const machineCode = allocation.machineId.split("-")[0];
                  const colors = processColors[machineCode] || {
                    bg: "#666",
                    border: "#444",
                  };

                  // Transform daily tracking data into calendar events
                  const dailyTrackingEvents = transformDailyTrackingData(
                    allocation.dailyTracking,
                    processAllocation.processName
                  );

                  return (
                    <div
                      key={processAllocation._id}
                      className="details-content"
                    >
                      <div className="details-header">
                        <h3 className="details-title">
                          {processAllocation.processName}
                        </h3>
                        <div className="details-subtitle">
                          <Clock size={16} className="details-icon" />
                          <span>
                            {formatDate(allocation.startDate)} -
                            {formatDate(allocation.endDate)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="details-card"
                        style={{ borderColor: colors.border }}
                      >
                        <div className="details-row">
                          <div className="details-label">Machine ID</div>
                          <div className="details-value">
                            {allocation.machineId}
                          </div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Order Number</div>
                          <div className="details-value">
                            {allocation.splitNumber}
                          </div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Operator</div>
                          <div className="details-value">
                            {allocation.operator}
                          </div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Planned Quantity</div>
                          <div className="details-value">
                            {allocation.plannedQuantity} units
                          </div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Duration</div>
                          <div className="details-value">
                            {getDaysBetweenDates(
                              allocation.startDate,
                              allocation.endDate
                            )}{" "}
                            days
                          </div>
                        </div>
                      </div>

                      {/* Small Calendar for Daily Tracking */}
                      <div className="small-calendar">
                        <FullCalendar
                          plugins={[dayGridPlugin]}
                          initialView="dayGridMonth" // Default View
                          headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridDay,dayGridWeek,dayGridMonth", // Allows switching between Day, Week, and Month views
                          }}
                          views={{
                            dayGridDay: { buttonText: "Day" },
                            dayGridWeek: { buttonText: "Week" },
                            dayGridMonth: { buttonText: "Month" },
                          }}
                          events={transformDailyTrackingData(
                            allocation.dailyTracking,
                            processAllocation.processName
                          )}
                          eventContent={(arg) => (
                            <div className="p-1 text-sm text-white">
                              <div className="font-medium">
                                {arg.event.title}
                              </div>
                            </div>
                          )}
                          eventDidMount={(info) => {
                            const event = info.event;
                            const props = event.extendedProps;

                            const tooltipContent = `
      Process: ${event.title}
      Planned: ${props.planned}
      Produced: ${props.produced}
      Operator: ${props.operator}
      Status: ${props.status}
    `;
                            info.el.setAttribute("title", tooltipContent);
                          }}
                        />
                      </div>

                      {/* Daily Tracking Table */}
                      <div className="daily-tracking-table">
                        <h4 className="daily-tracking-title">Daily Tracking</h4>
                        <table className="tracking-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Planned</th>
                              <th>Produced</th>
                              <th>Operator</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allocation.dailyTracking.map((tracking) => (
                              <tr key={tracking._id}>
                                <td>{formatDate(tracking.date)}</td>
                                <td>{tracking.planned}</td>
                                <td>{tracking.produced}</td>
                                <td>{tracking.operator}</td>
                                <td>{tracking.dailyStatus}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
