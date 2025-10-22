import React, { useEffect, useState } from "react";
import CountUp from "react-countup";
import FeatherIcon from "feather-icons-react";
import { Card, CardBody, Col, Row } from "reactstrap";

const Widgets = () => {
  const [counts, setCounts] = useState({
    parts: 0,
    assembly: 0,
    subAssembly: 0,
    projects: 0,
  });
  //
// Alternative approach using existing endpoints
useEffect(() => {
  const fetchCounts = async () => {
    try {
      const [partsRes, assemblyRes, subAssemblyRes, projectsRes] =
        await Promise.all([
          fetch(`${process.env.REACT_APP_BASE_URL}/api/parts`).then((res) =>
            res.json()
          ),
          fetch(`${process.env.REACT_APP_BASE_URL}/api/assmebly`).then(
            (res) => res.json()
          ),
          fetch(`${process.env.REACT_APP_BASE_URL}/api/subAssembly`).then(
            (res) => res.json()
          ),
          fetch(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projectss`
          ).then((res) => res.json()),
        ]);

      setCounts({
        parts: partsRes.pagination ? partsRes.pagination.total : (Array.isArray(partsRes) ? partsRes.length : 0),
        assembly: assemblyRes.pagination ? assemblyRes.pagination.total : (Array.isArray(assemblyRes) ? assemblyRes.length : 0),
        subAssembly: subAssemblyRes.pagination ? subAssemblyRes.pagination.total : (Array.isArray(subAssemblyRes) ? subAssemblyRes.length : 0),
        projects: projectsRes.pagination ? projectsRes.pagination.totalItems : (Array.isArray(projectsRes) ? projectsRes.length : 0),
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };
  fetchCounts();
}, []);

  const projectsWidgets = [
    {
      id: 1,
      feaIcon: "briefcase",
      feaIconClass: "primary",
      label: "Part List",
      badgeClass: "danger",
      icon: "ri-arrow-down-s-line",
      counter: counts.parts,
    },
    {
      id: 2,
      feaIcon: "award",
      feaIconClass: "warning",
      label: "Assembly List",
      badgeClass: "success",
      icon: "ri-arrow-up-s-line",
      counter: counts.assembly,
    },
    {
      id: 3,
      feaIcon: "clock",
      feaIconClass: "info",
      label: "Sub Assembly List",
      badgeClass: "danger",
      icon: "ri-arrow-down-s-line",
      counter: counts.subAssembly,
    },
    {
      id: 4,
      feaIcon: "layers",
      feaIconClass: "success",
      label: "Projects List",
      badgeClass: "primary",
      icon: "ri-arrow-down-s-line",
      counter: counts.projects,
    },
  ];

  return (
    <Row>
      {projectsWidgets.map((item) => (
        <Col xl={3} key={item.id}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={`avatar-title bg-${item.feaIconClass} rounded-2 fs-2`}
                  >
                    <FeatherIcon icon={item.feaIcon} />
                  </span>
                </div>
                <div className="flex-grow-1 overflow-hidden ms-3">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-3">
                    {item.label}
                  </p>
                  <div className="d-flex align-items-center mb-3">
                    <h4 className="fs-4 flex-grow-1 mb-0">
                      <span className="counter-value me-1">
                        <CountUp start={0} end={item.counter} duration={3} />
                      </span>
                    </h4>
                  </div>
                  <p className="text-muted text-truncate mb-0">
                    {item.caption}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default Widgets;
