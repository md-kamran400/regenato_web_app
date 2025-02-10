import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import CountUp from "react-countup";
import { ProjectsOverviewCharts } from "./DashboardProjectCharts";

const ProjectsOverview = () => {
  const [chartData, setChartData] = useState([]);

  // Dummy data for projects overview
  const dummyProjectData = [
    { name: "Project A", value: 40 },
    { name: "Project B", value: 30 },
    { name: "Project C", value: 20 },
    { name: "Project D", value: 10 },
  ];

  useEffect(() => {
    setChartData(dummyProjectData);
  }, []);

  return (
    <Row>
      <Col xl={12}>
        <Card>
          <CardHeader className="border-0 align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Projects Overview</h4>
          </CardHeader>

          <CardHeader className="p-0 border-0 bg-light-subtle">
            <Row className="g-0 text-center">
              <Col xs={6} sm={3}>
                <div className="p-3 border border-dashed border-start-0">
                  <h5 className="mb-1">
                    <CountUp start={0} end={120} separator="," duration={4} />
                  </h5>
                  <p className="text-muted mb-0">Number of Projects</p>
                </div>
              </Col>
              <Col xs={6} sm={3}>
                <div className="p-3 border border-dashed border-start-0">
                  <h5 className="mb-1">
                    <CountUp start={0} end={14} separator="," duration={4} />
                  </h5>
                  <p className="text-muted mb-0">Active Projects</p>
                </div>
              </Col>
              <Col xs={6} sm={3}>
                <div className="p-3 border border-dashed border-start-0">
                  <h5 className="mb-1">
                    ₹
                    <CountUp
                      start={0}
                      end={2500000}
                      decimals={2}
                      duration={4}
                    />
                    k
                  </h5>
                  <p className="text-muted mb-0">Revenue</p>
                </div>
              </Col>
              <Col xs={6} sm={3}>
                <div className="p-3 border border-dashed border-start-0 border-end-0">
                  <h5 className="mb-1 text-success">
                    <CountUp start={0} end={10589} separator="," duration={4} />
                    h
                  </h5>
                  <p className="text-muted mb-0">Working Hours</p>
                </div>
              </Col>
            </Row>
          </CardHeader>
          <CardBody className="p-0 pb-2">
            <ProjectsOverviewCharts
              series={chartData}
              dataColors='["--vz-primary", "--vz-warning", "--vz-success"]'
            />
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectsOverview;
