import React from "react";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Container } from "reactstrap";

import List from "./List";

const ProjectList = () => {
  // document.title = "Project List | Velzon - React Admin & Dashboard Template";

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Part List" pageTitle="Parts" />
          <List />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ProjectList;
