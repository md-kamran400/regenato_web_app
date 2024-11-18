import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardBody, Col, CardHeader, Button } from "reactstrap";

const PartsList = () => {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState([]); // Local state to store project list

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  return (
    <div>
      <Col>
        <Card>
          <CardHeader>
            <h4 className="card-title mb-0">Parts List</h4>
            <div className="d-flex justify-content-sm-start mt-2">
              <div className="search-box">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                />
                <i className="ri-search-line search-icon"></i>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div
              className="table-responsive table-card mb-1"
              style={{
                maxHeight: "300px", // Set a fixed height
                overflowY: "auto", // Enable vertical scrolling
              }}
            >
              <table className="table align-middle table-nowrap">
                <thead
                  className="table-light"
                  style={{
                    position: "sticky", // Keep the header in place
                    top: 0, // Ensure it stays at the top
                    zIndex: 1, // Ensure it stays above body rows
                  }}
                >
                  <tr>
                    <th>Part Name</th>
                    <th>Required</th>
                    <th>Produced</th>
                    <th>Daily Production</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && partDetails.allProjects?.length > 0 ? (
                    partDetails.allProjects.map((item) => (
                      <tr key={item._id}>
                        <td>{item.partName || "N/A"}</td>
                        <td>{item.quantity || 0}</td>
                        <td>0</td>
                        <td>
                          <Button>Update</Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        {loading
                          ? "Loading..."
                          : error
                          ? error
                          : "No parts available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </div>
  );
};

export default PartsList;
