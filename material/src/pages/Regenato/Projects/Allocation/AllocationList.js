import React, { useState, useEffect } from "react";
import { Table, Spinner } from "reactstrap";
import { useLocation, useParams } from "react-router-dom";
import "../project.css";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";

const AllocationList = () => {
  const { _id } = useParams(); // Get project ID from URL
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchAllocations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/allocations/${_id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch allocations");
        }
        const data = await response.json();
        setAllocations(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllocations();
  }, [_id]);

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
                <th>Production Order Name</th>
                <th>Part Name</th>
                <th>Allocation ID</th>
                <th>Process Name</th>
                <th>Planned Quantity</th>
                {/* <th>Remaining Quantity</th> */}
                <th>Start Date</th>
                <th>End Date</th>
                <th>Machine ID</th>
                <th>Shift</th>
                <th>Planned Time</th>
                <th>Operator</th>
                {/* <th>Source Type</th> */}
              </tr>
            </thead>
            <tbody>
              {allocations.length > 0 ? (
                allocations.map((alloc, index) => (
                  <tr key={index}>
                    <td>{alloc.projectName}</td>
                    <td>{alloc.partName}</td>
                    <td>{alloc._id}</td>
                    <td>{alloc.processName}</td>
                    <td>{alloc.plannedQuantity}</td>
                    {/* <td>{alloc.remainingQuantity}</td> */}
                    <td>{new Date(alloc.startDate).toLocaleDateString()}</td>
                    <td>{new Date(alloc.endDate).toLocaleDateString()}</td>
                    <td>{alloc.machineId}</td>
                    <td>{alloc.shift}</td>
                    <td>{alloc.plannedTime} min</td>
                    <td>{alloc.operator}</td>
                    {/* <td>{alloc.sourceType}</td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No allocations found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AllocationList;
