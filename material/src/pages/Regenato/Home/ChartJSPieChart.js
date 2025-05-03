import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import {
  Card,
  CardBody,
  CardHeader,
  Row,
  Col,
  Badge,
  Spinner,
  Button,
} from "reactstrap";
import { toast } from "react-toastify";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartJSPieChart = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Fetch projects from API
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:4040/api/defpartproject/projects"
      );
      setProjects(response.data);
    } catch (error) {
      toast.error(`Failed to fetch projects: ${error.message}`);
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount and when refreshCount changes
  useEffect(() => {
    fetchProjects();
  }, [refreshCount]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
    toast.info("Refreshing project data...");
  };

  // Enhanced getStatus function
  const getStatus = (project) => {
    // Default state - Not Allocated
    let status = "Not Allocated";
    let statusColor = "secondary";

    // Check if any parts exist in the project
    const hasPartsItems = project.partsLists?.some(
      (list) => list.partsListItems && list.partsListItems.length > 0
    );
    const hasSubAssemblyItems = project.subAssemblyListFirst?.some(
      (list) => list.partsListItems && list.partsListItems.length > 0
    );
    const hasAssemblyItems = project.assemblyList?.some(
      (list) => list.partsListItems && list.partsListItems.length > 0
    );

    // If no parts exist at all, return Not Allocated
    if (!hasPartsItems && !hasSubAssemblyItems && !hasAssemblyItems) {
      return { status, statusColor };
    }

    // Helper function to check if any allocations exist
    const hasAllocations = (partsListItem) => {
      return (
        partsListItem.allocations &&
        Array.isArray(partsListItem.allocations) &&
        partsListItem.allocations.length > 0 &&
        partsListItem.allocations.some(
          (allocGroup) =>
            allocGroup.allocations &&
            Array.isArray(allocGroup.allocations) &&
            allocGroup.allocations.length > 0
        )
      );
    };

    // Check if any parts have allocations
    const hasAnyAllocations =
      project.partsLists?.some((list) =>
        list.partsListItems?.some(hasAllocations)
      ) ||
      project.subAssemblyListFirst?.some((list) =>
        list.partsListItems?.some(hasAllocations)
      ) ||
      project.assemblyList?.some((list) =>
        list.partsListItems?.some(hasAllocations)
      );

    // If no allocations exist but parts exist, return "Not Allocated"
    if (!hasAnyAllocations) {
      return { status, statusColor };
    }

    // If we have allocations but no tracking data, return "Allocated"
    status = "Allocated";
    statusColor = "info";

    // Helper function to check tracking status
    const checkTrackingStatus = (partsListItem) => {
      if (!partsListItem.allocations) return;

      partsListItem.allocations.forEach((allocGroup) => {
        if (!allocGroup.allocations) return;

        allocGroup.allocations.forEach((allocation) => {
          if (allocation.dailyTracking && allocation.dailyTracking.length > 0) {
            allocation.dailyTracking.forEach((tracking) => {
              if (tracking.actualEndDate && tracking.endDate) {
                const actualEnd = new Date(tracking.actualEndDate);
                const plannedEnd = new Date(tracking.endDate);

                if (actualEnd > plannedEnd) {
                  status = "Delayed";
                  statusColor = "danger";
                } else if (actualEnd < plannedEnd && status !== "Delayed") {
                  status = "Ahead";
                  statusColor = "success";
                } else if (status === "Allocated") {
                  status = "On Track";
                  statusColor = "primary";
                }
              } else if (status === "Allocated") {
                // If we have tracking but no dates, consider it "On Track"
                status = "On Track";
                statusColor = "primary";
              }
            });
          }
        });
      });
    };

    // Check tracking status in all parts lists
    project.partsLists?.forEach((list) => {
      list.partsListItems?.forEach(checkTrackingStatus);
    });

    project.subAssemblyListFirst?.forEach((list) => {
      list.partsListItems?.forEach(checkTrackingStatus);
    });

    project.assemblyList?.forEach((list) => {
      list.partsListItems?.forEach(checkTrackingStatus);
    });

    return { status, statusColor };
  };

  // Process project data for chart
  const processStatusData = () => {
    const statusData = {
      "Not Allocated": 0,
      Allocated: 0,
      "On Track": 0,
      Ahead: 0,
      Delayed: 0,
    };

    projects.forEach((project) => {
      const { status } = getStatus(project);
      statusData[status]++;
    });

    return statusData;
  };

  const statusData = processStatusData();
  const totalProjects = projects.length;

  // Chart data configuration
  const chartData = {
    labels: Object.keys(statusData).filter((key) => statusData[key] > 0),
    datasets: [
      {
        data: Object.values(statusData).filter((val) => val > 0),
        backgroundColor: [
          "rgba(108, 117, 125, 0.7)", // Not Allocated
          "rgba(23, 162, 184, 0.7)", // Allocated
          "rgba(0, 123, 255, 0.7)", // On Track
          "rgba(40, 167, 69, 0.7)", // Ahead
          "rgba(220, 53, 69, 0.7)", // Delayed
        ],
        borderColor: [
          "rgba(108, 117, 125, 1)",
          "rgba(23, 162, 184, 1)",
          "rgba(0, 123, 255, 1)",
          "rgba(40, 167, 69, 1)",
          "rgba(220, 53, 69, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const percentage = Math.round((value / totalProjects) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const colorMap = {
      "Not Allocated": "secondary",
      Allocated: "info",
      "On Track": "primary",
      Ahead: "success",
      Delayed: "danger",
    };

    return (
      <Badge color={colorMap[status]} pill className="mr-2 status-badge" />
    );
  };

  return (
    <Card className="shadow border-0">
      <CardHeader className="bg-white border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 d-flex align-items-center">
          <i className="ri-pie-chart-2-line mr-2"></i>
          Project Status Overview
        </h5>
        <Button
          color="light"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <i className={`ri-refresh-line ${isLoading ? "d-none" : ""}`}></i>
          <span className="ml-1">Refresh</span>
          {isLoading && <Spinner size="sm" className="ml-2" />}
        </Button>
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner color="primary" />
            <p className="mt-2 mb-0 text-muted">Loading project data...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-5">
            <i className="ri-information-line display-4 text-muted"></i>
            <p className="mt-3 mb-0 text-muted">No projects found</p>
            <Button
              color="primary"
              size="sm"
              className="mt-3"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <Row>
            <Col lg="7" xl="8">
              <div style={{ height: "350px", position: "relative" }}>
                <Pie data={chartData} options={chartOptions} />
              </div>
            </Col>
            <Col lg="5" xl="4" className="mt-4 mt-lg-0">
              <div className="status-legend pl-lg-4">
                <h6 className="mb-3">Status Breakdown</h6>
                <ul className="list-unstyled">
                  {Object.entries(statusData)
                    .filter(([_, count]) => count > 0)
                    .map(([status, count]) => (
                      <li
                        key={status}
                        className="mb-2 d-flex align-items-center"
                      >
                        <StatusBadge status={status} />
                        <span className="text-muted flex-grow-1">{status}</span>
                        <span className="font-weight-bold">
                          {count}{" "}
                          <small className="text-muted">
                            ({Math.round((count / totalProjects) * 100)}%)
                          </small>
                        </span>
                      </li>
                    ))}
                </ul>
                <div className="mt-4 pt-2 border-top">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Total Projects</span>
                    <span className="font-weight-bold">{totalProjects}</span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <span className="text-muted">Last Updated</span>
                    <span className="font-weight-bold">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default ChartJSPieChart;
