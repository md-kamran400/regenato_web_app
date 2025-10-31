import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import dayGridPlugin from "@fullcalendar/daygrid";
import { FaRegCalendarAlt } from "react-icons/fa";
import { Card, CardBody, Badge, Row, Col, CardTitle } from "reactstrap";
import "./PlanPage.css";

const generateRandomColor = () => {
  const letters = "89ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
};

const processColors = {};
const getProcessColor = (processName) => {
  if (!processName) return "#B0BEC5";
  if (!processColors[processName]) {
    processColors[processName] = generateRandomColor();
  }
  return processColors[processName];
};

export function PlanPageNav() {
  const { allocationId } = useParams();
  const [allocationData, setAllocationData] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSplit, setSelectedSplit] = useState(null);

  // Autocomplete UI state
  const [projectQuery, setProjectQuery] = useState("");
  const [partQuery, setPartQuery] = useState("");
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showPartDropdown, setShowPartDropdown] = useState(false);

  // BASE_URL fallback - important if REACT_APP_BASE_URL is not set
  const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4040";

  useEffect(() => {
    fetchAllocationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocationId]);

  // Keep queries in sync with selected values
  useEffect(() => {
    setProjectQuery(selectedProject || "");
  }, [selectedProject]);

  useEffect(() => {
    setPartQuery(selectedPart || "");
  }, [selectedPart]);

  // Helper: find first project & part that actually have allocations
  const findFirstValidProjectPart = (dataArray) => {
    if (!Array.isArray(dataArray)) return null;

    for (const project of dataArray) {
      if (!project || !Array.isArray(project.allocations)) continue;

      for (const partAllocation of project.allocations) {
        if (!partAllocation || !Array.isArray(partAllocation.allocations))
          continue;

        // Check if any process allocation has allocations with actual allocation data
        const hasValidAllocations = partAllocation.allocations.some(
          (processAllocation) =>
            processAllocation &&
            Array.isArray(processAllocation.allocations) &&
            processAllocation.allocations.length > 0
        );

        if (hasValidAllocations && partAllocation.partName) {
          return {
            projectName: project.projectName,
            partName: partAllocation.partName,
          };
        }
      }
    }
    return null;
  };

  const fetchAllocationData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/api/defpartproject/all-allocations`
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Fetch failed (${response.status}): ${text}`);
      }
      const json = await response.json();
      console.log("all-allocations response:", json);
      const dataArray = json?.data || [];
      setAllocationData(dataArray);

      // Debug: Log all projects with valid allocations
      console.log("=== Projects with valid allocations ===");
      const projectsWithAllocations = [];
      dataArray.forEach((project) => {
        if (project && Array.isArray(project.allocations)) {
          const validParts = project.allocations.filter(
            (partAlloc) =>
              partAlloc &&
              Array.isArray(partAlloc.allocations) &&
              partAlloc.allocations.some(
                (processAlloc) =>
                  processAlloc &&
                  Array.isArray(processAlloc.allocations) &&
                  processAlloc.allocations.length > 0
              )
          );
          if (validParts.length > 0) {
            console.log(
              `- ${project.projectName}: ${validParts.length} part(s) with allocations`
            );
            projectsWithAllocations.push(project.projectName);
          }
        }
      });
      console.log("Total projects with allocations:", projectsWithAllocations);

      // If allocationId provided, try to find it
      if (allocationId) {
        let foundAllocation = null;
        let foundProject = null;
        let foundPart = null;
        let foundProcess = null;

        for (const project of dataArray) {
          if (!project || !Array.isArray(project.allocations)) continue;
          for (const partProcess of project.allocations) {
            if (!partProcess || !Array.isArray(partProcess.allocations))
              continue;
            for (const allocation of partProcess.allocations) {
              if (allocation && allocation._id === allocationId) {
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
          setSelectedProcess(foundProcess);
          transformData(foundProject, foundPart, dataArray);
        } else {
          // DON'T auto-select first project - let user choose
          setSelectedProject("");
          setSelectedPart(null);
          setEvents([]);
          setResources([]);
        }
      } else {
        // DON'T auto-select first project - let user choose from dropdown
        setSelectedProject("");
        setSelectedPart(null);
        setEvents([]);
        setResources([]);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching allocations:", err);
      setError("Failed to fetch allocation data. Check console for details.");
      setLoading(false);
    }
  };

  const getStatusBadge = (allocations) => {
    if (!allocations || allocations.length === 0) {
      return <Badge className="bg-info text-white">Not Allocated</Badge>;
    }

    const allocation = allocations[0];
    if (!allocation.actualEndDate) {
      return <Badge className="bg-dark text-white">Allocated</Badge>;
    }
    try {
      const endDate = new Date(allocation.endDate);
      const actualEndDate = new Date(allocation.actualEndDate);
      if (endDate.getTime() === actualEndDate.getTime()) {
        return <Badge className="bg-primary text-white pill">On Track</Badge>;
      } else if (actualEndDate > endDate) {
        return <Badge className="bg-danger text-white pill">Delayed</Badge>;
      } else {
        return <Badge className="bg-success text-white pill">Ahead</Badge>;
      }
    } catch (e) {
      return <Badge className="bg-secondary text-white">Unknown</Badge>;
    }
  };

  const transformData = (projectName, partName, data) => {
    if (!data || !projectName || !partName) {
      setResources([]);
      setEvents([]);
      return;
    }

    const selectedProjectData = data.find((p) => p.projectName === projectName);
    if (!selectedProjectData) {
      setResources([]);
      setEvents([]);
      return;
    }

    // Resources: include the selected part
    const resourcesList = [{ id: partName, title: `Part ${partName}` }];
    setResources(resourcesList);

    const eventsList = [];

    // Process the allocations array from the project data
    selectedProjectData.allocations
      .filter((alloc) => alloc.partName === partName)
      .forEach((partAllocation) => {
        // Check if this part allocation has allocations array
        if (!Array.isArray(partAllocation.allocations)) return;

        // Process each process allocation within the part
        partAllocation.allocations.forEach((processAllocation) => {
          if (
            !processAllocation ||
            !Array.isArray(processAllocation.allocations)
          )
            return;

          // Process each individual allocation within the process
          processAllocation.allocations.forEach((allocation) => {
            if (!allocation) return;

            // Compute status color
            let statusColor = "#B0BEC5";
            if (allocation.actualEndDate) {
              const actualEndDate = new Date(allocation.actualEndDate);
              const plannedEndDate = new Date(allocation.endDate);
              if (actualEndDate < plannedEndDate) statusColor = "#10B981";
              else if (actualEndDate > plannedEndDate) statusColor = "#EF4444";
              else statusColor = "#3B82F6";
            }

            eventsList.push({
              id: allocation._id,
              resourceId: partName,
              start: allocation.startDate,
              end: allocation.actualEndDate || allocation.endDate,
              title: `${processAllocation.processName} - ${
                allocation.machineId || ""
              }`,
              backgroundColor: statusColor,
              borderColor: statusColor,
              extendedProps: {
                processName: processAllocation.processName,
                machineId: allocation.machineId,
                operator: allocation.operator,
                plannedQuantity: allocation.plannedQuantity,
                shift: allocation.shift,
                splitNumber: allocation.splitNumber,
                AllocationPartType: allocation.AllocationPartType,
                startDate: allocation.startDate,
                endDate: allocation.endDate,
                startTime: allocation.startTime,
                dailyTracking: allocation.dailyTracking || [],
              },
            });
          });
        });
      });

    setEvents(eventsList);
  };

  const handleProcessClick = (processAllocation) => {
    setSelectedProcess(processAllocation.processName);
    setSelectedSplit({
      processName: processAllocation.processName,
      allocations: processAllocation.allocations,
    });
  };

  const handleProjectChange = (eOrValue) => {
    const newProject =
      typeof eOrValue === "string" ? eOrValue : eOrValue.target.value;
    setSelectedProject(newProject);
    setSelectedPart(null);
    setSelectedProcess(null);
    setResources([]);
    setEvents([]);

    const selectedProjectData = allocationData.find(
      (project) => project.projectName === newProject
    );
    if (
      selectedProjectData &&
      selectedProjectData.allocations &&
      selectedProjectData.allocations.length > 0
    ) {
      // Find ALL parts that have valid process allocations
      const validParts = selectedProjectData.allocations.filter((partAlloc) => {
        if (!partAlloc || !Array.isArray(partAlloc.allocations)) return false;

        // Check if any process allocation has actual allocations
        return partAlloc.allocations.some(
          (processAlloc) =>
            processAlloc &&
            Array.isArray(processAlloc.allocations) &&
            processAlloc.allocations.length > 0
        );
      });

      if (validParts.length > 0) {
        // Use the first valid part
        const firstValidPart = validParts[0];
        setSelectedPart(firstValidPart.partName);
        transformData(newProject, firstValidPart.partName, allocationData);
      } else {
        // no part with allocations in this project
        console.log(`No valid allocations found for project: ${newProject}`);
        setSelectedPart(null);
        setEvents([]);
        setResources([]);
      }
    } else {
      console.log(`No allocations found for project: ${newProject}`);
      setSelectedPart(null);
      setEvents([]);
      setResources([]);
    }
  };
  const handlePartChange = (eOrValue) => {
    const newPart =
      typeof eOrValue === "string" ? eOrValue : eOrValue.target.value;
    setSelectedPart(newPart);
    setSelectedProcess(null);
    transformData(selectedProject, newPart, allocationData);
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

  if (loading)
    return (
      <div>
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  if (error) return <div>{error}</div>;

  // unique project list
  // const uniqueProjects = [...new Set((allocationData || []).map((project) => project.projectName))];
  // unique project list - ONLY projects that have allocations
  const uniqueProjects = (allocationData || [])
    .filter((project) => {
      if (!project || !Array.isArray(project.allocations)) return false;

      // Check if project has at least one part with process allocations
      return project.allocations.some(
        (partAlloc) =>
          partAlloc &&
          Array.isArray(partAlloc.allocations) &&
          partAlloc.allocations.some(
            (processAlloc) =>
              processAlloc &&
              Array.isArray(processAlloc.allocations) &&
              processAlloc.allocations.length > 0
          )
      );
    })
    .map((project) => project.projectName);

  const selectedProjectData = allocationData.find(
    (project) => project.projectName === selectedProject
  );

  // build unique part list from selected project - ONLY PARTS WITH VALID ALLOCATIONS
  const uniqueParts = new Set();
  if (selectedProjectData && Array.isArray(selectedProjectData.allocations)) {
    selectedProjectData.allocations.forEach((partAlloc) => {
      if (partAlloc && partAlloc.partName) {
        // Check if this part has any valid process allocations
        const hasValidAllocations =
          partAlloc.allocations &&
          Array.isArray(partAlloc.allocations) &&
          partAlloc.allocations.some(
            (processAlloc) =>
              processAlloc &&
              Array.isArray(processAlloc.allocations) &&
              processAlloc.allocations.length > 0
          );

        if (hasValidAllocations) {
          uniqueParts.add(partAlloc.partName);
        }
      }
    });
  }
  const uniquePartList = [...uniqueParts];

  const filteredProjects = uniqueProjects.filter((p) =>
    p.toLowerCase().includes((projectQuery || "").toLowerCase())
  );

  const filteredParts = uniquePartList.filter((p) =>
    (p || "").toLowerCase().includes((partQuery || "").toLowerCase())
  );

  // const filteredAllocations = selectedProjectData
  //   ? selectedProjectData.allocations.filter((alloc) => alloc.partName === selectedPart)
  //   : [];

  const filteredAllocations = selectedProjectData
    ? selectedProjectData.allocations
        .filter((partAlloc) => partAlloc.partName === selectedPart)
        .flatMap((partAlloc) =>
          (partAlloc.allocations || []).filter(
            (processAlloc) =>
              processAlloc &&
              Array.isArray(processAlloc.allocations) &&
              processAlloc.allocations.length > 0
          )
        )
    : [];

  const getStatusColor = (status) => {
    if (status === "On Track") return "#3B82F6";
    if (status === "Ahead") return "#10B981";
    if (status === "Delayed") return "#EF4444";
    return "#666";
  };

  const generateCalendarEvents = (processAllocation) => {
    if (!Array.isArray(processAllocation.allocations)) return [];
    return processAllocation.allocations.map((allocation) => {
      const plannedEndDate = new Date(
        allocation.endDate || allocation.startDate
      );
      const actualEndDate = new Date(
        allocation.actualEndDate || allocation.endDate || allocation.startDate
      );
      let statusColor;
      if (actualEndDate.getTime() === plannedEndDate.getTime())
        statusColor = "#3B82F6";
      else if (actualEndDate < plannedEndDate) statusColor = "#10B981";
      else statusColor = "#EF4444";

      return {
        id: allocation._id,
        title: `${processAllocation.processName} - ${allocation.splitNumber}`,
        start: allocation.startDate,
        end: allocation.actualEndDate || allocation.endDate,
        allDay: true,
        backgroundColor: statusColor,
        borderColor: statusColor,
        extendedProps: {
          processName: processAllocation.processName,
          splitNumber: allocation.splitNumber,
          operator: allocation.operator,
          plannedQuantity: allocation.plannedQuantity,
          startDate: allocation.startDate,
          endDate: allocation.endDate,
          startTime: allocation.startTime,
          actualEndDate: allocation.actualEndDate,
        },
      };
    });
  };

  return (
    <div className="p-4">
      <div className="process-header">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Production Planning</h2>
        </div>
        <div style={{ display: "flex" }} className="flex items-center gap-2">
          {/* Project Autocomplete */}
          <div style={{ position: "relative", minWidth: "240px" }}>
            <input
              type="text"
              value={projectQuery}
              onChange={(e) => {
                setProjectQuery(e.target.value);
                setShowProjectDropdown(true);
              }}
              onFocus={() => setShowProjectDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowProjectDropdown(false), 150);
              }}
              placeholder="Select Production Type"
              className="process-select"
              style={{ width: "100%" }}
            />
            {showProjectDropdown && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 20,
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderTop: "none",
                  maxHeight: "240px",
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {(filteredProjects.length
                  ? filteredProjects
                  : uniqueProjects
                ).map((project) => (
                  <div
                    key={project}
                    onMouseDown={() => {
                      handleProjectChange(project);
                      setProjectQuery(project);
                      setShowProjectDropdown(false);
                    }}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                      background:
                        project === selectedProject ? "#f3f4f6" : "transparent",
                    }}
                  >
                    {project}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Part Autocomplete */}
          <div
            style={{
              position: "relative",
              minWidth: "240px",
              opacity: !selectedProject ? 0.6 : 1,
            }}
          >
            <input
              type="text"
              value={partQuery}
              onChange={(e) => {
                if (!selectedProject) return;
                setPartQuery(e.target.value);
                setShowPartDropdown(true);
              }}
              onFocus={() => selectedProject && setShowPartDropdown(true)}
              onBlur={() => {
                setTimeout(() => setShowPartDropdown(false), 150);
              }}
              placeholder="Select Part"
              className="process-select"
              style={{ width: "100%" }}
              disabled={!selectedProject}
            />
            {showPartDropdown && selectedProject && (
              <div
                style={{
                  position: "absolute",
                  zIndex: 20,
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderTop: "none",
                  maxHeight: "240px",
                  overflowY: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                {(filteredParts.length ? filteredParts : uniquePartList).map(
                  (part) => (
                    <div
                      key={part}
                      onMouseDown={() => {
                        handlePartChange(part);
                        setPartQuery(part);
                        setShowPartDropdown(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        background:
                          part === selectedPart ? "#f3f4f6" : "transparent",
                      }}
                    >
                      {part}
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <FullCalendar
        plugins={[resourceTimelinePlugin, adaptivePlugin]}
        initialView="resourceTimelineMonth"
        schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
        buttonText={{ prev: "<", next: ">", today: "Today" }}
        headerToolbar={{
          left: "prev today next",
          center: "title",
          right:
            "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
        }}
        resources={resources}
        events={events.map((event) => ({
          ...event,
          backgroundColor: getProcessColor(event.extendedProps.processName),
          borderColor: getProcessColor(event.extendedProps.processName),
        }))}
        resourceAreaWidth="200px"
        height="auto"
        slotMinWidth={100}
        resourceAreaHeaderContent="Order Number"
        initialDate={new Date()}
        views={{
          resourceTimelineYear: {
            type: "resourceTimeline",
            duration: { years: 1 },
            slotDuration: { months: 1 },
            slotLabelFormat: { month: "long" },
            slotWidth: 100,
          },
        }}
        eventClick={(e) => {
          e.jsEvent.preventDefault();
          e.jsEvent.stopPropagation();
        }}
        eventContent={(arg) => {
          const processColor = getProcessColor(
            arg.event.extendedProps.processName
          );
          return (
            <div
              className="p-1 text-sm text-white"
              style={{
                backgroundColor: processColor,
                pointerEvents: "none",
                cursor: "not-allowed",
                opacity: 0.6,
              }}
            >
              <div
                style={{
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "16px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                🔧 {arg.event.extendedProps.processName} · 🛠{" "}
                {arg.event.extendedProps.machineId} · 👷{" "}
                {arg.event.extendedProps.operator} · 📅{" "}
                {formatDate(arg.event.extendedProps.startDate)}{" "}
                {arg.event.extendedProps.startTime} →{" "}
                {formatDate(arg.event.extendedProps.endDate)}
              </div>
            </div>
          );
        }}
        eventDidMount={(info) => {
          const event = info.event;
          const props = event.extendedProps;
          const processColor = getProcessColor(props.processName);
          info.el.style.backgroundColor = processColor;
          info.el.style.borderColor = processColor;
          info.el.style.cursor = "not-allowed";
          info.el.style.opacity = "0.6";
          info.el.style.pointerEvents = "auto";
          if (window.tippy) {
            const tooltipContent = `Process: ${props.processName}\nMachine: ${
              props.machineId
            }\nOperator: ${props.operator}\nQuantity: ${
              props.plannedQuantity
            }\nStart: ${event.start?.toLocaleDateString()}\nEnd: ${event.end?.toLocaleDateString()}`;
            window.tippy(info.el, {
              content: tooltipContent,
              allowHTML: false,
              placement: "top",
              theme: "light-border",
            });
          } else {
            info.el.setAttribute("title", props.processName || "");
          }
        }}
      />

      {/* Bottom Panels - Orders, Processes, Details */}
      <div
        className="panels-container"
        style={{
          marginTop: "40px",
          width: "100%",
          display: "flex",
          gap: "10px",
        }}
      >
        <div className="orders-panel">
          {selectedPart && filteredAllocations.length > 0 && (
            <Card key={selectedPart} className="order-card">
              <CardBody>
                <Row>
                  <Col>
                    <div className="order-header">
                      <h5 className="order-title">{selectedPart}</h5>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Badge className="order-badge common-badge">
                          {filteredAllocations[0]?.allocations[0]
                            ?.AllocationPartType || "N/A"}
                        </Badge>
                        <Badge
                          style={{
                            fontSize: "15px",
                            background: "transparent",
                            boxShadow: "none",
                            border: "none",
                            padding: 0,
                          }}
                        >
                          {getStatusBadge(filteredAllocations[0].allocations)}
                        </Badge>
                      </div>
                    </div>

                    <div className="order-info">
                      <div>
                        <span>Start Date:</span>
                        <strong>
                          {formatDate(
                            filteredAllocations.reduce((min, alloc) => {
                              if (
                                !alloc.allocations ||
                                alloc.allocations.length === 0
                              )
                                return min;
                              const earliestAlloc = alloc.allocations.reduce(
                                (a, b) =>
                                  new Date(a.startDate) < new Date(b.startDate)
                                    ? a
                                    : b
                              );
                              return new Date(earliestAlloc.startDate) <
                                new Date(min)
                                ? earliestAlloc.startDate
                                : min;
                            }, filteredAllocations.find((alloc) => alloc.allocations && alloc.allocations.length > 0)?.allocations[0]?.startDate || new Date().toISOString())
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>End Date:</span>
                        <strong>
                          {formatDate(
                            filteredAllocations.reduce((max, alloc) => {
                              if (
                                !alloc.allocations ||
                                alloc.allocations.length === 0
                              )
                                return max;
                              const latestAlloc = alloc.allocations.reduce(
                                (a, b) =>
                                  new Date(a.endDate) > new Date(b.endDate)
                                    ? a
                                    : b
                              );
                              return new Date(latestAlloc.endDate) >
                                new Date(max)
                                ? latestAlloc.endDate
                                : max;
                            }, filteredAllocations.find((alloc) => alloc.allocations && alloc.allocations.length > 0)?.allocations[0]?.endDate || new Date().toISOString())
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Total Duration:</span>
                        <strong>
                          {(() => {
                            const startDate = filteredAllocations.reduce(
                              (min, alloc) => {
                                if (
                                  !alloc.allocations ||
                                  alloc.allocations.length === 0
                                )
                                  return min;
                                const earliestAlloc = alloc.allocations.reduce(
                                  (a, b) =>
                                    new Date(a.startDate) <
                                    new Date(b.startDate)
                                      ? a
                                      : b
                                );
                                return new Date(earliestAlloc.startDate) <
                                  new Date(min)
                                  ? earliestAlloc.startDate
                                  : min;
                              },
                              filteredAllocations.find(
                                (alloc) =>
                                  alloc.allocations &&
                                  alloc.allocations.length > 0
                              )?.allocations[0]?.startDate ||
                                new Date().toISOString()
                            );

                            const endDate = filteredAllocations.reduce(
                              (max, alloc) => {
                                if (
                                  !alloc.allocations ||
                                  alloc.allocations.length === 0
                                )
                                  return max;
                                const latestAlloc = alloc.allocations.reduce(
                                  (a, b) =>
                                    new Date(a.endDate) > new Date(b.endDate)
                                      ? a
                                      : b
                                );
                                return new Date(latestAlloc.endDate) >
                                  new Date(max)
                                  ? latestAlloc.endDate
                                  : max;
                              },
                              filteredAllocations.find(
                                (alloc) =>
                                  alloc.allocations &&
                                  alloc.allocations.length > 0
                              )?.allocations[0]?.endDate ||
                                new Date().toISOString()
                            );

                            return (
                              getDaysBetweenDates(startDate, endDate) + " days"
                            );
                          })()}
                        </strong>
                      </div>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="processes-panel">
          <div className="panel-header">
            <h2 className="panel-title">Processes</h2>
            {selectedPart && (
              <div className="panel-subtitle">Part: {selectedPart}</div>
            )}
          </div>

          <div className="panel-content scrollable-panel">
            {selectedPart &&
              filteredAllocations.map((processAllocation) => {
                const isSelected =
                  processAllocation.processName === selectedProcess;

                // Get allocations for this process
                const processAllocations = processAllocation.allocations || [];

                const getProcessStatus = (allocations) => {
                  if (!allocations || allocations.length === 0)
                    return {
                      text: "Not Allocated",
                      className: "bg-info text-white",
                    };
                  const hasUnfinished = allocations.some(
                    (a) => !a.actualEndDate
                  );
                  const hasDelayed = allocations.some(
                    (a) =>
                      a.actualEndDate &&
                      new Date(a.actualEndDate) > new Date(a.endDate)
                  );
                  const hasAhead = allocations.some(
                    (a) =>
                      a.actualEndDate &&
                      new Date(a.actualEndDate) < new Date(a.endDate)
                  );
                  const allOnTrack = allocations.every(
                    (a) =>
                      a.actualEndDate &&
                      new Date(a.actualEndDate).getTime() ===
                        new Date(a.endDate).getTime()
                  );

                  if (hasUnfinished)
                    return {
                      text: "In Progress",
                      className: "bg-success text-white",
                    };
                  if (hasDelayed)
                    return {
                      text: "Delayed",
                      className: "bg-danger text-white",
                    };
                  if (hasAhead)
                    return {
                      text: "Ahead",
                      className: "bg-success text-white",
                    };
                  if (allOnTrack)
                    return {
                      text: "On Track",
                      className: "bg-primary text-white",
                    };
                  return { text: "Allocated", className: "bg-dark text-white" };
                };

                const processStatus = getProcessStatus(processAllocations);

                return (
                  <Card
                    key={processAllocation._id}
                    className={`process-card ${isSelected ? "selected" : ""}`}
                    onClick={() => handleProcessClick(processAllocation)}
                  >
                    <CardBody>
                      <div className="process-header">
                        <h5 className="process-title">
                          {processAllocation.processName}
                        </h5>
                        <Badge className={processStatus.className}>
                          {processStatus.text}
                        </Badge>
                      </div>
                      {processAllocations.map((allocation) => {
                        const getSplitStatus = (allocation) => {
                          if (!allocation.actualEndDate)
                            return {
                              text: "Allocated",
                              className: "bg-dark text-white",
                            };
                          const endDate = new Date(allocation.endDate);
                          const actualEndDate = new Date(
                            allocation.actualEndDate
                          );
                          if (endDate.getTime() === actualEndDate.getTime())
                            return {
                              text: "On Track",
                              className: "bg-primary text-white",
                            };
                          if (actualEndDate > endDate)
                            return {
                              text: "Delayed",
                              className: "bg-danger text-white",
                            };
                          return {
                            text: "Ahead",
                            className: "bg-success text-white",
                          };
                        };

                        const splitStatus = getSplitStatus(allocation);

                        return (
                          <div
                            key={allocation._id}
                            className="split-box"
                            style={{
                              cursor: "pointer",
                              marginBottom: "16px",
                              padding: "16px",
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              background: "white",
                              boxShadow:
                                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            {/* Main Content Row */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "12px",
                              }}
                            >
                              {/* Left Side - Machine and Operator */}
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: "8px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <div>
                                      <div
                                        style={{
                                          fontSize: "16px",
                                          fontWeight: "600",
                                          color: "#1e293b",
                                        }}
                                      >
                                        {allocation.machineId}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: "14px",
                                          color: "#64748b",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "4px",
                                        }}
                                      >
                                        {allocation.operator}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Date Range */}
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <FaRegCalendarAlt
                                      style={{
                                        color: "#64748b",
                                        fontSize: "14px",
                                      }}
                                    />
                                    <span
                                      style={{
                                        fontSize: "13px",
                                        color: "#475569",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {formatDate(allocation.startDate)} -{" "}
                                      {allocation.startTime}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      color: "#cbd5e1",
                                      fontSize: "12px",
                                    }}
                                  >
                                    →
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: "13px",
                                        color: "#475569",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {formatDate(allocation.endDate)} -{" "}
                                      {allocation.endTime}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Side - Status and Quantity */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "8px",
                                }}
                              >
                                <Badge
                                  className={splitStatus.className}
                                  style={{
                                    fontSize: "0.7rem",
                                    padding: "6px 12px",
                                    borderRadius: "20px",
                                    fontWeight: "600",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {splitStatus.text}
                                </Badge>

                                <div style={{ textAlign: "right" }}>
                                  <div
                                    style={{
                                      fontSize: "20px",
                                      fontWeight: "700",
                                      color: "#1e293b",
                                      lineHeight: "1",
                                    }}
                                  >
                                    {allocation.plannedQuantity}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#64748b",
                                      fontWeight: "500",
                                    }}
                                  >
                                    units
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Bottom Info Bar */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingTop: "12px",
                                borderTop: "1px solid #f1f5f9",
                                fontSize: "12px",
                                color: "#64748b",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "16px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <span style={{ fontWeight: "600" }}>
                                    Shift:
                                  </span>
                                  <span style={{ fontWeight: "500" }}>
                                    {allocation.shift}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        </div>

        <div className="panel details-panel">
          <div className="panel-header">
            <h2 className="panel-title">Process Details</h2>
            {selectedSplit && (
              <div className="panel-subtitle">{selectedSplit.processName}</div>
            )}
          </div>

          <div className="panel-content">
            {selectedSplit ? (
              <>
                <Card className="details-card">
                  <CardBody>
                    <CardTitle tag="h4" className="details-subtitle">
                      Process Details
                    </CardTitle>
                    <div className="table-responsive">
                      <table className="table table-striped vertical-lines horizontals-lines">
                        <thead style={{ backgroundColor: "#f3f4f6" }}>
                          <tr>
                            <th>Split Number</th>
                            <th>Operator</th>
                            <th>Planned Quantity</th>
                            <th>Start Date</th>
                            <th>Planned End Date</th>
                            <th>Actual End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedSplit.allocations?.map((allocation) => (
                            <tr key={allocation._id}>
                              <td>{allocation.splitNumber}</td>
                              <td>{allocation.operator}</td>
                              <td>{allocation.plannedQuantity} units</td>
                              <td>{formatDate(allocation.startDate)}</td>
                              <td>{formatDate(allocation.endDate)}</td>
                              <td>{formatDate(allocation.actualEndDate)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardBody>
                </Card>

                <div className="small-calendar">
                  <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    buttonText={{ prev: "<", next: ">", today: "Today" }}
                    headerToolbar={{
                      left: "prev today next",
                      center: "title",
                      right: "dayGridDay,dayGridWeek,dayGridMonth",
                    }}
                    events={selectedSplit.allocations?.map((allocation) => {
                      const plannedEndDate = new Date(
                        allocation.endDate || allocation.startDate
                      );
                      const actualEndDate = new Date(
                        allocation.actualEndDate ||
                          allocation.endDate ||
                          allocation.startDate
                      );
                      let statusColor;
                      if (actualEndDate.getTime() === plannedEndDate.getTime())
                        statusColor = "#3B82F6";
                      else if (actualEndDate < plannedEndDate)
                        statusColor = "#10B981";
                      else statusColor = "#EF4444";

                      return {
                        id: allocation._id,
                        title: `${selectedSplit.processName} - ${allocation.machineId} - ${allocation.operator}`,
                        start: allocation.startDate,
                        end: allocation.actualEndDate || allocation.endDate,
                        allDay: true,
                        backgroundColor: statusColor,
                        borderColor: statusColor,
                        extendedProps: {
                          processName: selectedSplit.processName,
                          machineId: allocation.machineId,
                          splitNumber: allocation.splitNumber,
                          operator: allocation.operator,
                          plannedQuantity: allocation.plannedQuantity,
                          startDate: allocation.startDate,
                          endDate: allocation.endDate,
                          actualEndDate: allocation.actualEndDate,
                          dailyTracking: allocation.dailyTracking || [],
                        },
                      };
                    })}
                    eventContent={(arg) => (
                      <div className="p-1 text-sm text-white">
                        <div className="font-medium">{arg.event.title}</div>
                      </div>
                    )}
                    eventDidMount={(info) => {
                      const event = info.event;
                      const props = event.extendedProps;
                      let tooltipContent = `Process: ${
                        props.processName
                      }\nMachine: ${props.machineId}\nOperator: ${
                        props.operator
                      }\nPlanned Quantity: ${
                        props.plannedQuantity
                      }\nStart: ${event.start?.toLocaleDateString()}\nEnd: ${event.end?.toLocaleDateString()}`;
                      info.el.setAttribute("title", tooltipContent);
                    }}
                  />
                </div>

                <div className="daily-tracking-table">
                  <h4 className="daily-tracking-title">Daily Tracking</h4>
                  <div className="table-responsive">
                    <table className="table table-striped vertical-lines horizontals-lines">
                      <thead style={{ backgroundColor: "#f3f4f6" }}>
                        <tr>
                          <th>Date</th>
                          <th>Planned</th>
                          <th>Produced</th>
                          <th>Operator</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSplit.allocations?.map((allocation) =>
                          allocation.dailyTracking?.map((tracking) => (
                            <tr key={tracking._id}>
                              <td>{formatDate(tracking.date)}</td>
                              <td>{tracking.planned}</td>
                              <td>{tracking.produced}</td>
                              <td>{tracking.operator}</td>
                              <td
                                style={{
                                  fontWeight: "bold",
                                  color: getStatusColor(tracking.dailyStatus),
                                }}
                              >
                                {tracking.dailyStatus}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p className="no-data-message">
                Click on a process to view details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
