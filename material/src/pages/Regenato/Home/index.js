import React, { useEffect, useState } from "react";
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
import PoDailyInput from "./PoDailyInput";

const Home = () => {
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Home Page" pageTitle="Home" />

          {userRole === "admin" ? (
            <>
              <Row className="project-wrapper">
                <Col xxl={8}>
                  <Widgets />
                </Col>
              </Row>

              <Row>
                <Col lg={12}>
                  {/* <ChartJSPieChart /> */}
                </Col>
              </Row>

              <Row>
                <Col lg={6}>
                  <MachineCapacityChart />
                </Col>
                <Col lg={6}>
                  <OperatorCapacityChart />
                </Col>
              </Row>

              <Row lg={12}>
                <PoDailyInput />
              </Row>
            </>
          ) : (
            <Row>
              <Col>
                <Card className="text-center mt-5">
                  <CardHeader>Notice</CardHeader>
                  <CardBody>
                    <h4>Empty Home Page</h4>
                    <p>This page is not available for your role.</p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Home;
