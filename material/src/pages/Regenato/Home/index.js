import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import ActiveProjects from "./ActiveProjects";
import Chat from "./Chat"; //
import MyTasks from "./MyTasks";
import ProjectsOverview from "./ProjectsOverview";
import ProjectsStatus from "./ProjectsStatus";
import TeamMembers from "./TeamMembers";
import UpcomingSchedules from "./UpcomingSchedules";
import Widgets from "./Widgets";
import AdvanceTimeLine from "./AdvanceTimeLine";

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
              <Row lg={12}>
                <Col lg={7}>
                  <Card>
                    <CardHeader>
                      <h4 className="card-title mb-0">
                        Advanced Timeline (Multiple Range)
                      </h4>
                    </CardHeader>
                    <CardBody>
                      <AdvanceTimeLine dataColors='["--vz-primary", "--vz-success", "--vz-warning"]' />
                    </CardBody>
                  </Card>
                </Col>
                <Col lg={5}>
                  <Card>
                    <CardBody>
                      <UpcomingSchedules />
                    </CardBody>
                  </Card>
                </Col>
              </Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <ProjectsOverview />
                  </CardBody>
                </Card>
              </Col>
            </Col>
          </Row>
          <Row>
            <ActiveProjects />
            <ProjectsStatus />
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Home;
