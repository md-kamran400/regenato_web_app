import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Widgets from "./Widgets";
// import { Advanced } from "./TimelineCharts";
// import ProjectsOverview from "./ProjectsOverview";
// import UpcomingSchedules from "./UpcomingSchedules";
// import ActiveProjects from "./ActiveProjects";
// import ProjectsStatus from "./ProjectsStatus";
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
          {/* <Row>
            <Col lg={8}>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">
                    Advanced Timeline (Multiple Range)
                  </h4>
                </CardHeader>
                <CardBody>
                  <Advanced dataColors='["--vz-primary", "--vz-success", "--vz-warning"]' />
                </CardBody>
              </Card>
            </Col>
            <Col lg={4}>
              <Card>
                <UpcomingSchedules />
              </Card>
            </Col>
          </Row>
          <Row className="project-wrapper">
            <Col xxl={8}>
              <ProjectsOverview />
            </Col>
          </Row>

          <Row className="project-wrapper">
            <Col lg={8}>
              <ActiveProjects />
            </Col>
            <Col lg={4}>
              <ProjectsStatus />
            </Col>
          </Row> */}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Home;
