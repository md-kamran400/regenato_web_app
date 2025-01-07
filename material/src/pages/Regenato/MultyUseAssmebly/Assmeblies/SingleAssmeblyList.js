import React from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Table,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { MdOutlineDelete } from "react-icons/md";
import FeatherIcon from "feather-icons-react";

const dummyPartList = [
  { _id: "1", partName: "Part 1", costPerUnit: 100, quantity: 50 },
  { _id: "2", partName: "Part 2", costPerUnit: 200, quantity: 30 },
  { _id: "3", partName: "Part 3", costPerUnit: 150, quantity: 40 },
];

const dummySubAssemblyList = [
  {
    _id: "1",
    partName: "Sub Assembly List 1",
    costPerUnit: 100,
    timePerUnit: 2,
    quantity: 500,
    totalCost: 50000,
    totalMachiningHours: 1000,
  },
  {
    _id: "2",
    partName: "Sub Assembly List 2",
    costPerUnit: 200,
    timePerUnit: 3,
    quantity: 300,
    totalCost: 60000,
    totalMachiningHours: 900,
  },
  {
    _id: "3",
    partName: "Sub Assembly List 3",
    costPerUnit: 150,
    timePerUnit: 2.5,
    quantity: 400,
    totalCost: 60000,
    totalMachiningHours: 1000,
  },
];

const SingleAssmeblyList = () => {
  const [partModal, setPartModal] = React.useState(false);
  const [subAssemblyModal, setSubAssemblyModal] = React.useState(false);

  const togglePartModal = () => setPartModal(!partModal);
  const toggleSubAssemblyModal = () => setSubAssemblyModal(!subAssemblyModal);

  return (
    <div className="p-4">
      <Row>
        <Col
          xs="12"
          style={{
            boxSizing: "border-box",
            borderTop: "20px solid rgb(75, 56, 179)",
            borderRadius: "5px",
            marginBottom: "2rem",
          }}
        >
          <Card className="p-3">
            <CardBody
              style={{
                boxSizing: "border-box",
                borderTop: "20px solid rgb(69, 203, 133)",
                borderRadius: "5px",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  padding: "5px 10px 0px 10px",
                  borderRadius: "3px",
                }}
                className="button-group flex justify-content-between align-items-center"
              >
                <div>
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      fontWeight: "600",
                    }}
                  >
                    <li style={{ fontSize: "25px", marginBottom: "5px" }}>
                      Part List 1
                    </li>

                    <li style={{ fontSize: "19px" }}>
                      <span class="badge bg-success-subtle text-success mb-3">
                        Parts
                      </span>
                    </li>
                    <Button
                      color="success"
                      className="add-btn"
                      // onClick={toggleAddModal}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Parts
                    </Button>
                  </ul>
                </div>
                <UncontrolledDropdown direction="left">
                  <DropdownToggle
                    tag="button"
                    className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                  >
                    <FeatherIcon
                      style={{ fontWeight: "600" }}
                      icon="more-horizontal"
                      className="icon-sm"
                    />
                  </DropdownToggle>

                  <DropdownMenu className="dropdown-menu-start">
                    <DropdownItem href="#">
                      <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                      Edit
                    </DropdownItem>

                    <DropdownItem href="#">
                      <i className="ri-delete-bin-6-line align-bottom me-2 text-muted"></i>{" "}
                      Delete
                    </DropdownItem>

                    <div className="dropdown-divider"></div>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>

              <Table responsive className="part-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cost Per Unit</th>
                    <th>Quantity</th>
                    <th>Total Cost</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dummyPartList.map((item) => (
                    <tr key={item._id}>
                      <td>{item.partName}</td>
                      <td>{item.costPerUnit}</td>
                      <td>{item.quantity}</td>
                      <td>{item.costPerUnit * item.quantity}</td>
                      <td className="action-cell">
                        <span style={{ color: "red", cursor: "pointer" }}>
                          <MdOutlineDelete size={25} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>

            <CardBody
              style={{
                boxSizing: "border-box",
                borderTop: "20px solid rgb(240, 101, 72)",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  padding: "5px 10px 0px 10px",
                  borderRadius: "3px",
                }}
                className="button-group flex justify-content-between align-items-center"
              >
                <div>
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      fontWeight: "600",
                    }}
                  >
                    <li style={{ fontSize: "25px", marginBottom: "5px" }}>
                      Sub Assembly List 1
                    </li>

                    <li style={{ fontSize: "19px" }}>
                      <span class="badge bg-danger-subtle text-danger">
                        Sub Assmebly
                      </span>
                    </li>
                  </ul>
                  <Button
                    color="danger"
                    className="add-btn"
                    // onClick={toggleAddModal}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add Sub
                    Assembly
                  </Button>
                </div>

                <UncontrolledDropdown direction="left">
                  <DropdownToggle
                    tag="button"
                    className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                  >
                    <FeatherIcon
                      style={{ fontWeight: "600" }}
                      icon="more-horizontal"
                      className="icon-sm"
                    />
                  </DropdownToggle>

                  <DropdownMenu className="dropdown-menu-start">
                    <DropdownItem href="#">
                      <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                      Edit
                    </DropdownItem>

                    <DropdownItem href="#">
                      <i className="ri-delete-bin-6-line align-bottom me-2 text-muted"></i>{" "}
                      Delete
                    </DropdownItem>

                    <div className="dropdown-divider"></div>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>

              <Table responsive className="sub-assembly-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Cost Per Unit</th>
                    <th>Time Per Unit</th>
                    <th>Quantity</th>
                    <th>Total Cost</th>
                    <th>Total Machining Hours</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dummySubAssemblyList.map((item) => (
                    <tr key={item._id}>
                      <td>{item.partName}</td>
                      <td>{item.costPerUnit}</td>
                      <td>{item.timePerUnit}</td>
                      <td>{item.quantity}</td>
                      <td>{item.totalCost}</td>
                      <td>{item.totalMachiningHours}</td>
                      <td className="action-cell">
                        <span style={{ color: "red", cursor: "pointer" }}>
                          <MdOutlineDelete size={25} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={partModal} toggle={togglePartModal} size="lg">
        <ModalHeader toggle={togglePartModal}>Add Part</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="partName">Part Name</Label>
            <Input id="partName" type="text" />
          </FormGroup>
          <FormGroup>
            <Label for="costPerUnit">Cost Per Unit</Label>
            <Input id="costPerUnit" type="number" step="0.01" />
          </FormGroup>
          <FormGroup>
            <Label for="quantity">Quantity</Label>
            <Input id="quantity" type="number" />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={togglePartModal}>
            Save
          </Button>{" "}
          <Button color="secondary" onClick={togglePartModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={subAssemblyModal}
        toggle={toggleSubAssemblyModal}
        size="lg"
      >
        <ModalHeader toggle={toggleSubAssemblyModal}>
          Add Sub Assembly
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="subAssemblyName">Sub Assembly Name</Label>
            <Input id="subAssemblyName" type="text" />
          </FormGroup>
          <FormGroup>
            <Label for="costPerUnit">Cost Per Unit</Label>
            <Input id="costPerUnit" type="number" step="0.01" />
          </FormGroup>
          <FormGroup>
            <Label for="timePerUnit">Time Per Unit</Label>
            <Input id="timePerUnit" type="number" />
          </FormGroup>
          <FormGroup>
            <Label for="quantity">Quantity</Label>
            <Input id="quantity" type="number" />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={toggleSubAssemblyModal}>
            Save
          </Button>{" "}
          <Button color="secondary" onClick={toggleSubAssemblyModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default SingleAssmeblyList;
