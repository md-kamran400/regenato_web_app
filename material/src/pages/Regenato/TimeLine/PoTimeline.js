import React, { useState, useEffect } from "react";
import Calendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import adaptivePlugin from "@fullcalendar/adaptive";
import "./PoTimeline.css";

// Color palette for different projects
const projectColors = [
  { bg: "#3B82F6", border: "#2563EB" },
  { bg: "#10B981", border: "#059669" },
  { bg: "#F59E0B", border: "#D97706" },
  { bg: "#EF4444", border: "#DC2626" },
  { bg: "#8B5CF6", border: "#7C3AED" },
  { bg: "#EC4899", border: "#DB2777" },
  { bg: "#06B6D4", border: "#0891B2" },
  { bg: "#F97316", border: "#EA580C" },
  { bg: "#84CC16", border: "#65A30D" },
  { bg: "#14B8A6", border: "#0D9488" },
  { bg: "#6366F1", border: "#4F46E5" },
  { bg: "#D946EF", border: "#C026D3" },
  { bg: "#F43F5E", border: "#E11D48" },
  { bg: "#0EA5E9", border: "#0284C7" },
  { bg: "#A855F7", border: "#9333EA" },
];

// Generate consistent color based on project name
const getProjectColor = (projectName) => {
  const hash = projectName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return projectColors[Math.abs(hash) % projectColors.length];
};

// Fetch projects data
const fetchProjectsData = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_BASE_URL || "http://localhost:4040"}/api/defpartproject/projects`
  );
  const data = await response.json();
  return data.data || [];
};

// Transform projects data for resource timeline
const transformProjectsData = (projectsData) => {
  const resources = [];
  const events = [];
  
  console.log("Processing projects data for resource timeline:", projectsData);

  projectsData.forEach((project) => {
    // Skip projects without allocations
    if (!project.partsLists || project.partsLists.length === 0) {
      console.log(`Project ${project.projectName} has no parts lists, skipping`);
      return;
    }

    let projectStartDate = null;
    let projectEndDate = null;
    let totalQuantity = 0;
    let allocatedProcesses = [];

    // Scan through all parts to find allocations
    project.partsLists.forEach((partsList) => {
      partsList.partsListItems?.forEach((part) => {
        if (part.allocations && part.allocations.length > 0) {
          // Sum up quantities for this part
          totalQuantity += part.quantity || 0;
          
          // Check each allocation for dates
          part.allocations.forEach((allocation) => {
            allocation.allocations?.forEach((alloc) => {
              if (alloc.startDate && alloc.endDate) {
                const startDate = new Date(alloc.startDate);
                const endDate = new Date(alloc.endDate);
                
                // Update project start and end dates
                if (!projectStartDate || startDate < projectStartDate) {
                  projectStartDate = startDate;
                }
                if (!projectEndDate || endDate > projectEndDate) {
                  projectEndDate = endDate;
                }
                
                // Track unique processes
                if (!allocatedProcesses.includes(allocation.processName)) {
                  allocatedProcesses.push(allocation.processName);
                }
              }
            });
          });
        }
      });
    });

    // Only create resource and event if we found allocations with valid dates
    if (projectStartDate && projectEndDate && totalQuantity > 0) {
      const colors = getProjectColor(project.projectName);
      
      // Format dates for display
      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };

      // Create resource (left side PO list)
      const resourceId = project._id;
      resources.push({
        id: resourceId,
        title: `${project.projectName} (Qty: ${totalQuantity})`,
      });

      // Create event (right side timeline)
      events.push({
        id: project._id,
        resourceId: resourceId,
        start: projectStartDate,
        end: projectEndDate,
        title: `${project.projectName} | ${totalQuantity} units | ${formatDate(projectStartDate)} - ${formatDate(projectEndDate)}`,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#ffffff",
        extendedProps: {
          projectName: project.projectName,
          projectId: project._id,
          projectType: project.projectType || "N/A",
          startDate: formatDate(projectStartDate),
          endDate: formatDate(projectEndDate),
          quantity: totalQuantity,
          allocatedProcesses: allocatedProcesses,
          partsCount: project.partsLists?.reduce((count, list) => 
            count + (list.partsListItems?.length || 0), 0
          ) || 0,
          costPerUnit: project.costPerUnit || 0,
          timePerUnit: Math.ceil(project.timePerUnit || 0),
          totalCost: totalQuantity * (project.costPerUnit || 0),
          totalTime: totalQuantity * (project.timePerUnit || 0),
        },
      });

      console.log(`Added project ${project.projectName}:`, {
        resourceId,
        start: projectStartDate,
        end: projectEndDate,
        quantity: totalQuantity
      });
    } else {
      console.log(`Project ${project.projectName} has no valid allocations, skipping`);
    }
  });

  console.log("Transformed resources:", resources);
  console.log("Transformed events:", events);
  
  return { resources, events };
};

const PoTimeline = () => {
  const [resources, setResources] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState("all");
  const [projectTypes, setProjectTypes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching projects data...");
        
        const projectsData = await fetchProjectsData();
        console.log("Raw projects data:", projectsData);

        const { resources: transformedResources, events: transformedEvents } = 
          transformProjectsData(projectsData);

        setResources(transformedResources);
        setAllEvents(transformedEvents);
        setFilteredEvents(transformedEvents);

        // Extract unique project types from events
        const types = [...new Set(transformedEvents.map(e => e.extendedProps.projectType))];
        setProjectTypes(types);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects data:", err);
        setError(
          "Failed to fetch project data. Please check your connection and try again."
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProjectType === "all") {
      setFilteredEvents(allEvents);
    } else {
      const filtered = allEvents.filter(
        event => event.extendedProps.projectType === selectedProjectType
      );
      setFilteredEvents(filtered);
    }
  }, [selectedProjectType, allEvents]);

  const handleProjectTypeChange = (type) => {
    setSelectedProjectType(type);
  };

  if (loading) {
    return (
      <div className="timeline-container">
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-container">
        <div className="error-container">{error}</div>
      </div>
    );
  }

  const hasEvents = filteredEvents.length > 0;
  const displayedResources = hasEvents 
    ? resources.filter(resource => 
        filteredEvents.some(event => event.resourceId === resource.id)
      )
    : [];

  return (
    <div className="timeline-container">
      <div className="process-header">
        <h1 className="process-title">Production Timeline</h1>
        
        <div className="select-container">
          <select
            className="process-select"
            value={selectedProjectType}
            onChange={(e) => handleProjectTypeChange(e.target.value)}
          >
            <option value="all">All Project Types</option>
            {projectTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {!hasEvents && (
        <div className="alert alert-info mb-3">
          No allocated projects found. 
          {allEvents.length === 0 
            ? " There are no projects with allocations in the system." 
            : " Try selecting a different project type."}
        </div>
      )}

      <div className="calendar-container">
        <Calendar
          plugins={[resourceTimelinePlugin, adaptivePlugin]}
          initialView="resourceTimelineMonth"
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          buttonText={{
            prev: "<",
            next: ">",
            today: "Today",
          }}
          headerToolbar={{
            left: "prev today next",
            center: "title",
            right: "resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth,resourceTimelineYear",
          }}
          resources={displayedResources}
          events={filteredEvents}
          resourceAreaWidth="250px"
          height="auto"
          contentHeight="auto"
          aspectRatio={2.5}
          slotMinWidth={100}
          resourceAreaHeaderContent="PO List"
          initialDate={new Date().toISOString().split("T")[0]}
          resourceLabelDidMount={(arg) => {
            // Highlight resources that have events for the selected type
            if (selectedProjectType !== "all") {
              const hasEvent = filteredEvents.some(
                (event) => event.resourceId === arg.resource.id
              );
              arg.el.style.opacity = hasEvent ? "1" : "0.5";
              arg.el.style.fontWeight = hasEvent ? "bold" : "normal";
            } else {
              arg.el.style.opacity = "1";
              arg.el.style.fontWeight = "normal";
            }
          }}
          views={{
            resourceTimelineDay: {
              duration: { days: 1 },
              buttonText: "1D",
              slotDuration: "02:00:00",
              slotLabelFormat: {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              },
            },
            resourceTimelineWeek: {
              duration: { weeks: 1 },
              buttonText: "1W",
              slotDuration: { days: 1 },
              slotLabelFormat: [{ weekday: "short", day: "numeric" }],
            },
            resourceTimelineMonth: {
              duration: { months: 1 },
              buttonText: "1M",
              slotDuration: { days: 1 },
              slotLabelFormat: [{ day: "numeric" }],
            },
            resourceTimelineYear: {
              duration: { years: 1 },
              buttonText: "1Y",
              slotDuration: { months: 1 },
              slotLabelFormat: [{ month: "short" }],
            },
          }}
          eventContent={(arg) => {
            const props = arg.event.extendedProps;
            const divElement = document.createElement("div");
            divElement.className = "timeline-event";
            divElement.style.height = "28px";
            divElement.style.padding = "4px 8px";
            divElement.style.display = "flex";
            divElement.style.alignItems = "center";
            divElement.style.overflow = "hidden";
            
            // Create content with project details
            const content = document.createElement("div");
            content.style.width = "100%";
            content.style.overflow = "hidden";
            content.style.textOverflow = "ellipsis";
            content.style.whiteSpace = "nowrap";
            content.innerHTML = `
              <div style="font-weight: 600; font-size: 12px;">${props.projectName} | Qty: ${props.quantity} | ${props.projectType}</div>
              
            `;
            
            divElement.appendChild(content);
            return { domNodes: [divElement] };
          }}
          eventDidMount={(info) => {
            const event = info.event;
            const props = event.extendedProps;

            info.el.style.height = "28px";
            info.el.style.cursor = "pointer";
            info.el.style.borderRadius = "4px";
            info.el.style.transition = "all 0.2s ease";

            const tooltipContent = `
Project: ${props.projectName || "N/A"}
Project Type: ${props.projectType || "N/A"}
Quantity: ${props.quantity || "N/A"}
Total Cost: ₹${props.totalCost.toLocaleString('en-IN')}
Total Time: ${props.totalTime.toFixed(2)} hours
Start Date: ${props.startDate || "N/A"}
End Date: ${props.endDate || "N/A"}
Duration: ${Math.round((event.end - event.start) / (1000 * 60 * 60 * 24))} days
Parts Count: ${props.partsCount}
Allocated Processes: ${props.allocatedProcesses?.join(", ") || "N/A"}
Cost Per Unit: ₹${props.costPerUnit?.toLocaleString('en-IN') || "N/A"}
Time Per Unit: ${props.timePerUnit || "N/A"} hours
            `.trim();

            info.el.setAttribute("title", tooltipContent);
            
            // Add hover effect
            info.el.addEventListener('mouseenter', () => {
              info.el.style.opacity = '0.9';
              info.el.style.transform = 'scale(1.02)';
              info.el.style.zIndex = '1000';
              info.el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            info.el.addEventListener('mouseleave', () => {
              info.el.style.opacity = '1';
              info.el.style.transform = 'scale(1)';
              info.el.style.zIndex = 'auto';
              info.el.style.boxShadow = 'none';
            });
          }}
          eventDataTransform={(eventData) => {
            // Ensure events display correctly in all views
            if (eventData.displayStart && eventData.displayEnd) {
              return {
                ...eventData,
                start: eventData.displayStart,
                end: eventData.displayEnd,
              };
            }
            return eventData;
          }}
        />
      </div>

      {/* Summary statistics */}
      {/* {hasEvents && (
        <div className="summary-stats mt-3 p-3 bg-light rounded">
          <h5>Project Summary</h5>
          <div className="row">
            <div className="col-md-3">
              <div className="stat-box">
                <div className="stat-label">Total Projects</div>
                <div className="stat-value">{filteredEvents.length}</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-box">
                <div className="stat-label">Total Quantity</div>
                <div className="stat-value">
                  {filteredEvents.reduce((sum, event) => sum + (event.extendedProps.quantity || 0), 0)}
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-box">
                <div className="stat-label">Avg Duration</div>
                <div className="stat-value">
                  {Math.round(filteredEvents.reduce((sum, event) => {
                    const duration = (event.end - event.start) / (1000 * 60 * 60 * 24);
                    return sum + duration;
                  }, 0) / filteredEvents.length)} days
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-box">
                <div className="stat-label">Total Value</div>
                <div className="stat-value">
                  ₹{filteredEvents.reduce((sum, event) => sum + (event.extendedProps.totalCost || 0), 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default PoTimeline;