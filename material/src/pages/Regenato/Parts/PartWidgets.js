// import React from 'react';
// import { Card, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from 'reactstrap';
// import { Link } from 'react-router-dom';

// import CountUp from "react-countup";

// //Import Icons
// import FeatherIcon from "feather-icons-react";

// import { tileBoxes5 } from "../../../common/data/index";

// const PartWidgets = () => {
//     return (
//         <React.Fragment>

// <Row>
//     {(tileBoxes5 || []).map((item, key) => (
//         <Col xl={3} ms={6} key={key}>
//             <Card className={"card-height-100 " + item.class}>
//                 <CardBody>
//                     <UncontrolledDropdown className="float-end">
//                         <DropdownToggle tag="a" className="text-reset dropdown-btn" href="#">
//                             <span className="text-muted fs-18"><i className="mdi mdi-dots-vertical"></i></span>
//                         </DropdownToggle>
//                         <DropdownMenu className="dropdown-menu-end">
//                             <DropdownItem>Favorite</DropdownItem>
//                             <DropdownItem>Apply Now</DropdownItem>
//                         </DropdownMenu>
//                     </UncontrolledDropdown>
//                     <div className="mb-4 pb-2">
//                         {/* Wrapper with the avatar style */}
//                         <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                             <i className={item.class1} style={{ fontSize: '33px' }}></i>
//                         </div>
//                     </div>
//                     <Link to="#!">
//                         <div className="d-flex justify-content-between align-items-center">
//                             <h6 className="fs-15 fw-bold mb-0">Part Name</h6>
//                             <span className="text-muted fs-13">{item.year}</span>
//                         </div>
//                     </Link>
//                 </CardBody>
//             </Card>
//         </Col>
//     ))}
// </Row>

//         </React.Fragment>
//     );
// };

// export default PartWidgets;

import React from "react";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import { Link } from "react-router-dom";

import CountUp from "react-countup";

//Import Icons
import FeatherIcon from "feather-icons-react";

import { tileBoxes5 } from "../../../common/data/index";

const PartWidgets = () => {
  return <React.Fragment></React.Fragment>;
};

export default PartWidgets;
