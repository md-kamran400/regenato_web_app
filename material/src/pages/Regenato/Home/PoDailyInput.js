import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Badge } from "reactstrap";

const PoDailyInput = () => {
  const [projects, setProjects] = useState([]);
  const [dailyTracking, setDailyTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch projects data
        const projectsResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
        );
        if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
        const projectsData = await projectsResponse.json();

        // Fetch daily tracking data
        const trackingResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/daily-tracking`
        );
        if (!trackingResponse.ok)
          throw new Error("Failed to fetch daily tracking");
        const trackingData = await trackingResponse.json();

        setProjects(projectsData);
        setDailyTracking(trackingData.dailyTracking || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    return totalCost.toLocaleString("en-IN");
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
      <Table striped bordered responsive>
        <thead className="thead-dark">
          <tr>
            <th></th>
            <th>Name</th>
            <th>Date</th>
            <th>Production Order-Types</th>
            <th>Total Cost (INR)</th>
            <th>Total Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const projectTracking = getProjectTracking(project.projectName);
            const hasTracking = projectTracking.length > 0;

            return (
              <React.Fragment key={project._id}>
                <tr>
                  <td>
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
                  <td>{new Date(project.createdAt).toLocaleDateString()}</td>
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
                    <td colSpan="7">
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
                                    <td>
                                      {new Date(
                                        track.date
                                      ).toLocaleDateString()}
                                    </td>
                                    <td>{track.partName}</td>
                                    <td>{track.processName}</td>
                                    <td>{track.planned}</td>
                                    <td>{track.produced}</td>
                                    <td>{track.operator}</td>
                                    <td>{getStatusBadge(track.dailyStatus)}</td>
                                    <td>{track.machineId}</td>
                                    <td>{track.shift}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </>
                        )}

                        {/* Sub Assemblies Section */}
                        {/* <h5>Sub Assemblies</h5>
                        {project.subAssemblyListFirst?.map((subAssembly) => (
                          <div key={subAssembly._id} className="mb-4">
                            <h6>
                              {subAssembly.subAssemblyName} (
                              {subAssembly.SubAssemblyNumber})
                            </h6>
                            <Table size="sm" bordered>
                              <thead>
                                <tr>
                                  <th>Part Name</th>
                                  <th>Part Code</th>
                                  <th>Quantity</th>
                                  <th>Processes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subAssembly.partsListItems?.map((part) => (
                                  <tr key={part._id}>
                                    <td>{part.partName}</td>
                                    <td>{part.partsCodeId}</td>
                                    <td>{part.quantity}</td>
                                    <td>
                                      <ul className="list-unstyled">
                                        {part.manufacturingVariables?.map(
                                          (process) => (
                                            <li key={process._id}>
                                              {process.name} ({process.hours}{" "}
                                              hrs × {part.quantity} ={" "}
                                              {(
                                                process.hours * part.quantity
                                              ).toFixed(2)}{" "}
                                              hrs)
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        ))} */}
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
  );
};

export default PoDailyInput;
