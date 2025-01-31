import React from "react";
import { SubAssmeblies } from "./SubAssmeblies";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Container } from "reactstrap";

const NewSubAssmebly = () => {
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Sub Assmebly List" pageTitle="Sub ASsmeblies" />
          <SubAssmeblies />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default NewSubAssmebly;
