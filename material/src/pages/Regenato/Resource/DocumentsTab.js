import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  CardHeader,
  Container,
  Table,
  UncontrolledDropdown,
  Label,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from "reactstrap";
import AdvanceTimeLine from "../Home/AdvanceTimeLine";
import PartsList from "./PartsList";

const DocumentsTab = () => {
  const [modal_add, setModalList] = useState(false);
  const [modal_add_machine, setModalListmachine] = useState(false);

  const tog_add = ()=>{
    setModalList(!modal_add)
  }

  const tog_add_machine = ()=>{
    setModalListmachine(!modal_add_machine)
  }

  return (
    <React.Fragment>
      <Row lg={12}>
        <Col lg={5}>
          <Card style={{ minHeight: "600px" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Project Overview</h4>
            </CardHeader>
            <CardBody>
              <div className="d-flex align-items-center mt-3 mb-3">
                <p className="fw-bold mb-0 me-2">Project ID: </p>
                <span className="text-muted fs-13">PRJ001</span>
              </div>
              <div className="d-flex align-items-center mt-3 mb-3">
                <p className="fw-bold mb-0 me-2">Project Name: </p>
                <span className="text-muted fs-13">Widget Production</span>
              </div>
              <div className="d-flex align-items-center mt-3 mb-3">
                <p className="fw-bold mb-0 me-2">Order Quantity: </p>
                <span className="text-muted fs-13">1000</span>
              </div>
              <div className="d-flex align-items-center mt-3 mb-3">
                <p className="fw-bold mb-0 me-2">Quantity Produced: </p>
                <span className="text-muted fs-13">250</span>
              </div>
              <div className="d-flex align-items-center mt-3 mb-3">
                <p className="fw-bold mb-0 me-2">Pending Order: </p>
                <span className="text-muted fs-13">750</span>
              </div>
              <div className="align-items-center mt-3 mb-3">
                <p className="fw-bold mb-0 me-2">Pending Status: </p>
                <p className="text-danger mb-0 me-2">Delayed by 2 days</p>
                <p className="fw-bold mb-0 me-2">
                  Additional hours required to catch up: 16
                </p>
                <div className="d-flex align-items-center">
                  <p className="fw-bold mb-0 me-2">Estimated completion: </p>
                  <span className="text-danger fs-13 ">+2 days</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

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
      </Row>

      <Row lg={12}>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Project Timeline</h4>
            </CardHeader>
            <CardBody>
              {/* <Col lg={12}> */}
                <div className="d-flex align-items-center">
                <Col lg={4}>
                  <div className="fw-bold mb-0 me-3">
                    <Label htmlFor="exampleInputdate" className="form-label">Start Date</Label>
                    <Input type="date" className="form-control" id="exampleInputdate" />
                  </div>
                  </Col>
                <Col lg={4}>
                  <div className="fw-bold mb-0 me-3">
                    <Label htmlFor="exampleInputdate" className="form-label"> Estimated End Date </Label>
                    <Input type="date" className="form-control" id="exampleInputdate" />
                  </div>
                  </Col>
                <Col lg={4}>
                  <div className="fw-bold mb-0 me-3">
                    <Label htmlFor="exampleInputdate" className="form-label"> Estimated Duration </Label>
                    <Input type="date" className="form-control" id="exampleInputdate" />
                  </div>
                </Col>
                </div>
              {/* </Col> */}
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row lg={12}>
        <Col lg={4}>
           <PartsList/>
        </Col>




        <Col lg={4}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Operator Assignment</h4>
              <div className="d-flex justify-content-sm-start mt-2">
                <div className="search-box ">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Filter Operators..."
                  />
                  <i className="ri-search-line search-icon"></i>
                </div>
              </div>
            </CardHeader>
            <CardBody>
            <div className="table-responsive table-card mb-1">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Person ID</th>
              <th>Skill Set</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                <td>Jhon Doe</td>
                <td>P001</td>
                <td>VMC Local, Lathe</td>
                <td>
                <td><Button className="bg-info">Assign</Button></td>
                </td>
              </tr>
              <tr>
                <td>Jane Smith</td>
                <td>P002</td>
                <td>Milling, Lathe</td>
                <td>
                <td><Button className="bg-info">Assign</Button></td>
                </td>
              </tr>
              <tr>
                <td>Bob Johnson</td>
                <td>P003</td>
                <td>VMC Local, Milling</td>
                <td>
                <td><Button className="bg-info">Assign</Button></td>
                </td>
              </tr>

          </tbody>
        </table>
            </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row lg={12}>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Schedule & Allocation Summary</h4>
            </CardHeader>
            <CardBody>
            <div className="table-responsive table-card mt-3 mb-1">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>Part</th>
              <th>Machine</th>
              <th>Operator</th>
              <th>Planned Hours</th>
              <th>Actual Hours</th>
              <th>Order Quantity</th>
              <th>Estimated Completion</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                <td>--</td>
                <td>--</td>
                <td>--</td>
                <td>40</td>
                <td>2880</td>
                <td>1000</td>
                <td>12/12/2024</td>
                <td><Button className="bg-success">Edit</Button></td>
              </tr>
          </tbody>
        </table>
            </div>

            </CardBody>
          </Card>
        </Col>
      </Row>


      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add Parts List</ModalHeader>
        <ModalBody>
          <form >

            <div className="mb-3">
              <label htmlFor="partname" className="form-label">
                Part Name
              </label>
              <input type="text" className="form-control" name="partname" />
              </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                Required
              </label>
              <input type="number" className="form-control" name="Required" />
            </div>
            <div className="mb-3">
              <label htmlFor="Produced" className="form-label">
                 Produced
              </label>
              <input type="number" className="form-control" name="Produced" />
            </div>
            <ModalFooter>
              <Button type="submit" className="bg-success">
                Add
              </Button>
              <Button type="button" color="secondary" >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      <Modal isOpen={modal_add_machine} toggle={tog_add_machine}>
        <ModalHeader toggle={tog_add_machine}>Add Machine Allocation</ModalHeader>
        <ModalBody>
          <form >

            <div className="mb-3">
              <label htmlFor="partname" className="form-label">
                Part Name
              </label>
              <input type="text" className="form-control" name="partname" />
              </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                 select
              </label>
              <select className="form-select" aria-label=".form-select-sm example">
                    <option >Select</option>
                    <option defaultValue="1">Lathe 01</option>
                    <option defaultValue="2">Lathe 02</option>
                    <option defaultValue="3">Lathe 03</option>
                    <option defaultValue="4">Lathe 04</option>
                    <option defaultValue="5">Lathe 05</option>
              </select> 
            </div>
            <ModalFooter>
              <Button type="submit" className="bg-success">
                Add
              </Button>
              <Button type="button" color="secondary" >
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default DocumentsTab;
