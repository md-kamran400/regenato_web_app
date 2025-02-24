import React, { useState, useEffect } from "react";
import { Table, Spinner } from "reactstrap";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";

const AllocationPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch allocations");
        }
        const data = await response.json();
        setAllocations(data.data);
        console.log(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  return (
    <div className="table-container">
      <div style={{ marginTop: "0rem", width: "98%", margin: "auto" }}>
        <BreadCrumb title="Allocated Parts" pageTitle="Allocation List" />
      </div>
      {isLoading ? (
        <div className="text-center">
          <Spinner color="primary" />
        </div>
      ) : error ? (
        <div className="text-danger text-center">{error}</div>
      ) : (
        <div className="table-responsive">
          <Table striped bordered>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Part Name</th>
                <th>Process Name</th>
                <th>Planned Quantity</th>
                <th>Start Date</th>
                <th>Start Time</th>
                <th>End Date</th>
                <th>Machine ID</th>
                <th>Shift</th>
                <th>Planned Time (hrs)</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((project, index) =>
                project.allocations.map((part, partIndex) =>
                  part.allocations.map((alloc, allocIndex) => (
                    <tr key={`${index}-${partIndex}-${allocIndex}`}>
                      <td>{project.projectName}</td>
                      <td>{part.partName}</td>
                      <td>{part.processName}</td>
                      <td>{alloc.plannedQuantity}</td>
                      <td>{new Date(alloc.startDate).toLocaleDateString()}</td>
                      <td>{alloc.startTime}</td>
                      <td>{new Date(alloc.endDate).toLocaleDateString()}</td>
                      <td>{alloc.machineId}</td>
                      <td>{alloc.shift}</td>
                      <td>{alloc.plannedTime}</td>
                      <td>{alloc.operator}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AllocationPage;
