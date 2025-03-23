import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row, Card } from "reactstrap";
// import "./project.css";
import "./projectForProjects.css"
import PartListHoursPlanning from "./HoursPlanningFolder/PartListHoursPlanning";
import SubAssemblyHoursPlanning from "./HoursPlanningFolder/SubAssemblyHoursPlanning";
// hoursplanning
const HoursPlanningTab = () => {
  const { _id } = useParams(); // it will always project id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState({
    allProjects: [],
    assemblyList: [],
    partsLists: [],
    subAssemblyListFirst: [],
  });

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}`
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
  }, []);

  if (loading)
    return (
      <div className="loader-overlay">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="table-container">
      <Row
        lg={12}
        style={{
          width: "93rem",
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="project-header">
          {/* Left Section */}
          <div className="header-section left">
            <h2 className="project-name" style={{ fontWeight: "bold" }}>
              Allocation Planning
            </h2>
            <br />
            <h4 className="">{partDetails.projectName}</h4>
            <p className="po-id">
              {" "}
              <span style={{ fontWeight: "bold" }}>PO Type:</span>{" "}
              {partDetails.projectType}
            </p>
          </div>
        </div>
        <Col>
          <CardBody>
            <PartListHoursPlanning />
          </CardBody>
        </Col>
        <Col>
          <CardBody>
            <SubAssemblyHoursPlanning />
          </CardBody>
        </Col>
      </Row>
    </div>
  );
};
export default HoursPlanningTab;
