import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Widgets from "./Widgets";
import RechartsLineChart from "./RechartsLineChart";
import RechartsBarChart from "./RechartsBarChart";
import RechartsPieChart from "./RechartsPieChart";
import RechartsMixedChart from "./RechartsMixedChart";
import ChartJSLineChart from "./ChartJSLineChart";
import ChartJSBarChart from "./ChartJSBarChart";
import ChartJSPieChart from "./ChartJSPieChart";
import ChartJSMixedChart from "./ChartJSMixedChart";
import BigMultiChart from "./BigMultiChart";
import BigChartJS from "./BigChartJS";
import MachineCapacityChart from "./MachineCapacityChart";
import OperatorCapacityChart from "./OperatorCapacityChart";

const Home = () => {
  // document.title="Projects | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Home Page" pageTitle="Home" />
          <Row className="project-wrapper">
            <Col xxl={8}>
              <Widgets />
            </Col>
          </Row>

          {/* Recharts Section */}
          <Row>
            <Col lg={12}>
              <ChartJSPieChart />
            </Col>
          </Row>
          {/* <Row>
            <Col lg={6}>
              <RechartsPieChart />
            </Col>
            <Col lg={6}>
              <RechartsMixedChart />
            </Col>
          </Row>
          <Row>
            <Col lg={6}>
              <RechartsLineChart />
            </Col>
            <Col lg={6}>
              <RechartsBarChart />
            </Col>
          </Row> */}

          {/* Chart.js Section */}
          <Row>
            <Col lg={6}>
              <MachineCapacityChart />
            </Col>
            <Col lg={6}>
              <OperatorCapacityChart />
            </Col>
          </Row>

          {/* <Row>
            <Col lg={12}>
              <BigMultiChart />
            </Col>
          </Row> */}
          {/* <Row>
            <Col lg={12}>
              <BigChartJS />
            </Col>
          </Row> */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Home;
