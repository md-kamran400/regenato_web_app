import React from "react";
import { Container, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import Section from "./Section";
import AdvanceTimeLine from "../Home/AdvanceTimeLine";
import UpcomingSchedules from "../Home/UpcomingSchedules";

const Resource = () => {
  document.title =
    "Project Overview | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Section />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Resource;

// export default Resource
