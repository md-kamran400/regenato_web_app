import React from "react";
import { Assmeblies } from "./Assmeblies";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";
import { Container } from "reactstrap";

const NewAssmebliy = () => {
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Assembly List" pageTitle="Assemblies" />
          <Assmeblies />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default NewAssmebliy;
