import React from "react";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Widgets from "./Widgets";

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
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Home;
