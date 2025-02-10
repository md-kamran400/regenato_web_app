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
  const [chartData, setChartData] = useState([350, 120, 220, 94]); // Hardcoded project status data
  const [seletedMonth, setSeletedMonth] = useState("All Time");

  const onChangeChartPeriod = (pType) => {
    setSeletedMonth(pType);
  };

  return (
    <Col xxl={4} lg={6}>
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
                {seletedMonth} <i className="mdi mdi-chevron-down ms-1"></i>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem
                  onClick={() => onChangeChartPeriod("All Time")}
                  className={seletedMonth === "All Time" ? "active" : ""}
                >
                  All Time
                </DropdownItem>
                <DropdownItem
                  onClick={() => onChangeChartPeriod("Last 7 Days")}
                  className={seletedMonth === "Last 7 Days" ? "active" : ""}
                >
                  Last 7 Days
                </DropdownItem>
                <DropdownItem
                  onClick={() => onChangeChartPeriod("Last 30 Days")}
                  className={seletedMonth === "Last 30 Days" ? "active" : ""}
                >
                  Last 30 Days
                </DropdownItem>
                <DropdownItem
                  onClick={() => onChangeChartPeriod("Last 90 Days")}
                  className={seletedMonth === "Last 90 Days" ? "active" : ""}
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
              <span className="text-muted pe-5">{chartData[0]} Projects</span>
            </div>
            <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
              <p className="fw-medium mb-0">
                <i className="ri-checkbox-blank-circle-fill text-primary align-middle me-2"></i>{" "}
                In Progress
              </p>
              <span className="text-muted pe-5">{chartData[1]} Projects</span>
            </div>
            <div className="d-flex justify-content-between border-bottom border-bottom-dashed py-2">
              <p className="fw-medium mb-0">
                <i className="ri-checkbox-blank-circle-fill text-warning align-middle me-2"></i>{" "}
                Yet to Start
              </p>
              <span className="text-muted pe-5">{chartData[2]} Projects</span>
            </div>
            <div className="d-flex justify-content-between py-2">
              <p className="fw-medium mb-0">
                <i className="ri-checkbox-blank-circle-fill text-danger align-middle me-2"></i>{" "}
                Cancelled
              </p>
              <span className="text-muted pe-5">{chartData[3]} Projects</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ProjectsStatus;
