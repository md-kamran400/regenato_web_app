import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { PrjectsStatusCharts } from "./DashboardProjectCharts";

const ProjectsStatus = () => {
  // Static data for different time periods
  const staticData = {
    all: [125, 42, 58, 12],
    week: [15, 8, 5, 2],
    month: [45, 18, 12, 5],
    quarter: [95, 32, 25, 8],
  };

  const [chartData, setChartData] = useState(staticData.all);
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");

  const onChangeChartPeriod = (pType) => {
    setSelectedPeriod(
      pType === "all"
        ? "All Time"
        : pType === "week"
        ? "Last 7 Days"
        : pType === "month"
        ? "Last 30 Days"
        : "Last 90 Days"
    );
    setChartData(staticData[pType]);
  };

  return (
    <React.Fragment>
      <Col xxl={4} lg={6} style={{ marginTop: "20px" }}>
        <Card className="card-height-100">
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Projects Status</h4>
            <div className="flex-shrink-0">
              <UncontrolledDropdown className="card-header-dropdown">
                <DropdownToggle
                  tag="a"
                  className="dropdown-btn text-muted"
                  role="button"
                >
                  {selectedPeriod} <i className="mdi mdi-chevron-down ms-1"></i>
                </DropdownToggle>
                <DropdownMenu className="dropdown-menu-end">
                  <DropdownItem
                    onClick={() => onChangeChartPeriod("all")}
                    className={selectedPeriod === "All Time" ? "active" : ""}
                  >
                    All Time
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => onChangeChartPeriod("week")}
                    className={selectedPeriod === "Last 7 Days" ? "active" : ""}
                  >
                    Last 7 Days
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => onChangeChartPeriod("month")}
                    className={
                      selectedPeriod === "Last 30 Days" ? "active" : ""
                    }
                  >
                    Last 30 Days
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => onChangeChartPeriod("quarter")}
                    className={
                      selectedPeriod === "Last 90 Days" ? "active" : ""
                    }
                  >
                    Last 90 Days
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>
          </CardHeader>

          <CardBody>
            <PrjectsStatusCharts
              series={chartData}
              dataColors='["--vz-success", "--vz-primary", "--vz-warning", "--vz-danger"]'
            />
            <div className="mt-3">
              <div className="d-flex justify-content-center align-items-center mb-4">
                <h2 className="me-3 ff-secondary mb-0">
                  {chartData.reduce((a, b) => a + b, 0)}
                </h2>
                <div>
                  <p className="text-muted mb-0">Total Projects</p>
                  <p className="text-success fw-medium mb-0">
                    <span className="badge bg-success-subtle text-success p-1 rounded-circle">
                      <i className="ri-arrow-right-up-line"></i>
                    </span>{" "}
                    +3 New
                  </p>
                </div>
              </div>

              <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
                <p className="fw-medium mb-0">
                  <i className="ri-checkbox-blank-circle-fill text-success align-middle me-2"></i>{" "}
                  Completed
                </p>
                <div>
                  <span className="text-muted pe-5">
                    {chartData[0]} Projects
                  </span>
                  <span className="text-success fw-medium fs-12">15870hrs</span>
                </div>
              </div>
              <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
                <p className="fw-medium mb-0">
                  <i className="ri-checkbox-blank-circle-fill text-primary align-middle me-2"></i>{" "}
                  In Progress
                </p>
                <div>
                  <span className="text-muted pe-5">
                    {chartData[1]} Projects
                  </span>
                  <span className="text-success fw-medium fs-12">243hrs</span>
                </div>
              </div>
              <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
                <p className="fw-medium mb-0">
                  <i className="ri-checkbox-blank-circle-fill text-warning align-middle me-2"></i>{" "}
                  Yet to Start
                </p>
                <div>
                  <span className="text-muted pe-5">
                    {chartData[2]} Projects
                  </span>
                  <span className="text-success fw-medium fs-12">~2050hrs</span>
                </div>
              </div>
              <div className="d-flex justify-content-between py-2">
                <p className="fw-medium mb-0">
                  <i className="ri-checkbox-blank-circle-fill text-danger align-middle me-2"></i>{" "}
                  Cancelled
                </p>
                <div>
                  <span className="text-muted pe-5">
                    {chartData[3]} Projects
                  </span>
                  <span className="text-success fw-medium fs-12">~900hrs</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
};

export default ProjectsStatus;
