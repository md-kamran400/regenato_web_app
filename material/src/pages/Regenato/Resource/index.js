import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Container, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import { Link } from 'react-router-dom';
// Import Flatepicker
import Flatpickr from "react-flatpickr";
import ResourceTable from './ResourceTable';


// Import table data
// import {RmtableData} from './variabledata';

const Resource = () => {


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Variables" pageTitle="Tables" />

                    <ResourceTable/>

                    {/* The row that was removed is no longer included */}
                </Container>
            </div>
        </React.Fragment>
    );
}

export default Resource

// export default Resource