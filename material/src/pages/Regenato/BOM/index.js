import React, { useState, useEffect } from 'react';
import { Container} from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import BomList from './BomList';


// Import table data
// import {RmtableData} from './variabledata';

const BomNav = () => {


    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Variables" pageTitle="Tables" />

                    <BomList/>

                    {/* The row that was removed is no longer included */}
                </Container>
            </div>
        </React.Fragment>
    );
}

export default BomNav
