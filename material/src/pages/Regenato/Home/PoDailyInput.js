import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Badge } from "reactstrap";
import PaginatedList from "../Pagination/PaginatedList";

const PoDailyInput = () => {
  const [projects, setProjects] = useState([]);
  const [dailyTracking, setDailyTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    const fetchAllPages = async (baseUrl, key) => {
      let allData = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const res = await fetch(`${baseUrl}?page=${currentPage}`);
        if (!res.ok)
          throw new Error(`Failed to fetch ${key} page ${currentPage}`);
        const data = await res.json();

        // For projects endpoint
        if (key === "projects") {
          allData = [...allData, ...(data.data || [])];
          totalPages = data.pagination?.totalPages || 1;
        }

        // For daily tracking endpoint
        if (key === "dailyTracking") {
          allData = [...allData, ...(data.data || [])];
          totalPages = data.totalPages || 1;
        }

        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    };

    const fetchData = async () => {
      try {
        setLoading(true);

        const [projectsData, trackingData] = await Promise.all([
          fetchAllPages(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`,
            "projects"
          ),
          fetchAllPages(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/daily-tracking`,
            "dailyTracking"
          ),
        ]);

        setProjects(projectsData);
        setDailyTracking(trackingData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date to "28 Sept 2025" format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Calculate pagination values
  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = projects.slice(indexOfFirstItem, indexOfLastItem);

  const toggleRow = (projectId) => {
    if (expandedRows.includes(projectId)) {
      setExpandedRows(expandedRows.filter((id) => id !== projectId));
    } else {
      setExpandedRows([...expandedRows, projectId]);
    }
  };

  const calculateTotalCost = (project) => {
    let totalCost = 0;
    project.subAssemblyListFirst?.forEach((subAssembly) => {
      subAssembly.partsListItems?.forEach((part) => {
        part.manufacturingVariables?.forEach((variable) => {
          totalCost += variable.totalRate * part.quantity;
        });
      });
    });
    return Math.round(totalCost).toLocaleString("en-IN");
  };

  const calculateTotalHours = (project) => {
    let totalHours = 0;
    project.subAssemblyListFirst?.forEach((subAssembly) => {
      subAssembly.partsListItems?.forEach((part) => {
        part.manufacturingVariables?.forEach((variable) => {
          totalHours += variable.hours * part.quantity;
        });
      });
    });
    return totalHours.toFixed(2);
  };

  const getProjectTracking = (projectName) => {
    return dailyTracking.filter((track) => track.projectName === projectName);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "On Track":
        return <Badge color="success">{status}</Badge>;
      case "Delayed":
        return <Badge color="success">{status}</Badge>;
      case "Completed":
        return <Badge color="info">{status}</Badge>;
      default:
        return <Badge color="warning">{status}</Badge>;
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setExpandedRows([]); // Collapse all expanded rows when changing page
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">Error: {error}</div>;
  }

  if (projects.length === 0) {
    return <div className="alert alert-info mt-3">No projects found</div>;
  }

  return (
    <div style={{ width: "100%", marginTop: "3rem" }}>
      <h2 className="mb-4">Production Orders with Daily Tracking</h2>

      {/* Show current page info */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          Showing {indexOfFirstItem + 1} to{" "}
          {Math.min(indexOfLastItem, projects.length)} of {projects.length}{" "}
          projects
        </div>
      </div>

      <div style={{ maxHeight: "600px", overflow: "auto" }}>
        <Table striped bordered responsive>
          <thead
            className="thead-dark"
            style={{ position: "sticky", top: 0, zIndex: 1 }}
          >
            <tr>
              <th>SN</th>
              <th>Name</th>
              <th>Date</th>
              <th>Production Order-Types</th>
              <th>Total Cost (INR)</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentProjects.map((project, index) => {
              const projectTracking = getProjectTracking(project.projectName);
              const hasTracking = projectTracking.length > 0;
              const serialNumber = indexOfFirstItem + index + 1;

              return (
                <React.Fragment key={project._id}>
                  <tr>
                    <td>
                      {serialNumber}{" "}
                      {(hasTracking ||
                        project.subAssemblyListFirst?.length > 0) && (
                        <Button
                          color="primary"
                          size="sm"
                          onClick={() => toggleRow(project._id)}
                        >
                          {expandedRows.includes(project._id) ? "−" : "+"}
                        </Button>
                      )}
                    </td>
                    <td>{project.projectName}</td>
                    <td>{formatDate(project.createdAt)}</td>
                    <td>{project.projectType}</td>
                    <td>{calculateTotalCost(project)}</td>
                    <td>{calculateTotalHours(project)}</td>
                    <td>
                      {hasTracking ? (
                        getStatusBadge(projectTracking[0].dailyStatus)
                      ) : (
                        <Badge color="secondary">No Tracking</Badge>
                      )}
                    </td>
                  </tr>
                  {expandedRows.includes(project._id) && (
                    <tr>
                      <td colSpan="8">
                        <div className="p-3 bg-light">
                          {/* Daily Tracking Section */}
                          {hasTracking && (
                            <>
                              <h5>Daily Tracking</h5>
                              <Table size="sm" bordered className="mb-4">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Part Name</th>
                                    <th>Process</th>
                                    <th>Planned</th>
                                    <th>Produced</th>
                                    <th>Operator</th>
                                    <th>Status</th>
                                    <th>Machine</th>
                                    <th>Shift</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {projectTracking.map((track) => (
                                    <tr key={track._id}>
                                      <td>{formatDate(track.date)}</td>
                                      <td>{track.partName}</td>
                                      <td>{track.processName}</td>
                                      <td>{track.planned}</td>
                                      <td>{track.produced}</td>
                                      <td>{track.operator}</td>
                                      <td>
                                        {getStatusBadge(track.dailyStatus)}
                                      </td>
                                      <td>{track.machineId}</td>
                                      <td>{track.shift}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginatedList
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default PoDailyInput;
