// import React from "react";
// import UserHandle from "./UserHandle";

// const User_Management = () => {
//   return (
//     <div>
//       <UserHandle />
//     </div>
//   );
// };

// export default User_Management;

import React from "react";
import UserHandle from "./UserHandle";
import { Container} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const User_Management = () => {
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Users List" pageTitle="Users" />
          <UserHandle />
        </Container>
      </div>
    </React.Fragment>
  );
};

export default User_Management;
