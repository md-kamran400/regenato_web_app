import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Row,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import RmVariable from "./RmVariable";
import ManufacturingVariable from "./ManufacturingVariable";
import ShipmentVariable from "./ShipmentVariable";
import OverheadsVariable from "./OverheadsVariable";
import { useParams } from "react-router-dom";
import GeneralVariable from "./GeneralVariable";

const SinglePart = () => {
  const [modal_category, setModal_category] = useState(false);
  const { _id } = useParams();
  const [partDetails, setPartDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleModalCategory = () => {
    setModal_category(!modal_category);
  };

  useEffect(() => {
    const fetchPartDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4040/api/parts/${_id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setPartDetails(data);
      } catch (error) {
        console.error("Error fetching part details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartDetails();
  }, [_id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!partDetails) {
    return <div>No details found for this part.</div>;
  }

  //  calculating the manufacturing the total hours count
  const manufacturingTotalCountHours =
    partDetails?.manufacturingVariables?.reduce(
      (total, item) => total + Number(item.hours || 0),
      0
    );

  // Calculating totals using updated partDetails field names
  const rmTotalCount = partDetails?.rmVariables?.reduce(
    (total, item) => total + Number(item.totalRate || 0),
    0
  );
  const manufacturingTotalCount = partDetails?.manufacturingVariables?.reduce(
    (total, item) => total + Number(item.totalRate || 0),
    0
  );
  const shipmentTotalCount = partDetails?.shipmentVariables?.reduce(
    (total, item) => total + Number(item.hourlyRate || 0),
    0
  );

  // Calculate total cost without profit
  const totalCost = rmTotalCount + manufacturingTotalCount + shipmentTotalCount;

  // Calculate overheads percentage
  const overheadPercentage = partDetails?.overheadsAndProfits?.reduce(
    (total, item) => total + Number(item.percentage || 0),
    0
  );

  const overheadsTotalCount = partDetails?.overheadsAndProfits?.reduce(
    (total, item) => total + Number(item.totalRate || 0),
    0
  );
  // Calculate profit using overhead percentage
  const profit = (totalCost * overheadPercentage) / 100;

  // Final cost per unit including profit
  const costPerUnitAvg = totalCost + profit;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title={`Part (${partDetails.partName})`}
            pageTitle={`Part (${partDetails.partName})`}
          />

          <Row>
            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle
                      tag="a"
                      className="text-reset dropdown-btn"
                      href="#"
                    >
                      <span className="text-muted fs-18">
                        <i className="mdi mdi-dots-vertical"></i>
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <i
                        className="mdi mdi-alpha-p-box-outline"
                        style={{ fontSize: "33px" }}
                      ></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Part Name</h6>
                    <span className="text-muted fs-13">
                      {partDetails.partName}
                    </span>{" "}
                    {/* Display part name */}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className="card-height-100">
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle
                      tag="a"
                      className="text-reset dropdown-btn"
                      href="#"
                    >
                      <span className="text-muted fs-18">
                        <i className="mdi mdi-dots-vertical"></i>
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <i
                        className="mdi mdi-alpha-c-box-outline"
                        style={{ fontSize: "33px" }}
                      ></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Cost Per Unit:</h6>
                    <span className="text-muted fs-13">{costPerUnitAvg}</span>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle
                      tag="a"
                      className="text-reset dropdown-btn"
                      href="#"
                    >
                      <span className="text-muted fs-18">
                        <i className="mdi mdi-dots-vertical"></i>
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <i
                        className="mdi mdi-alpha-t-box-outline"
                        style={{ fontSize: "33px" }}
                      ></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Time Per Unit:</h6>
                    <span className="text-muted fs-13">
                      {manufacturingTotalCountHours}
                    </span>{" "}
                    {/* Display time per unit */}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle
                      tag="a"
                      className="text-reset dropdown-btn"
                      href="#"
                    >
                      <span className="text-muted fs-18">
                        <i className="mdi mdi-dots-vertical"></i>
                      </span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <i
                        className="mdi mdi-alpha-s-box-outline"
                        style={{ fontSize: "33px" }}
                      ></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Stock / PO Qty:</h6>
                    <span className="text-muted fs-13">
                      {partDetails.stockPOQty}
                    </span>{" "}
                    {/* Display stock quantity */}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="mb-4 pb-2 flex">
            <Button
              style={{ backgroundColor: "#9C27B0" }}
              onClick={toggleModalCategory}
              className="add-btn me-1"
              id="create-btn"
            >
              <i className="ri-add-line align-bottom me-1"></i> Choose Category
            </Button>
            <Button className="add-btn me-1 bg-success" id="create-btn">
              <i className="ri-add-line align-bottom me-1"></i> Add Template
            </Button>
          </div>
          <GeneralVariable partDetails={partDetails} />

          {/* RM Variables */}
          <Card>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-0">RM Variables</h4>
                    <hr
                      style={{
                        height: "2px",
                        border: "0px",
                        backgroundImage:
                          "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
                      }}
                    />
                    <div className="d-flex align-items-center mt-3 mb-3">
                      <p className="fw-bold mb-0 me-2">Total Cost:</p>
                      <span className="text-muted fs-13">{rmTotalCount}</span>
                    </div>
                    <RmVariable partDetails={partDetails} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Manufacturing Variables */}
          <Card>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-0">Manufacturing Variables</h4>
                    <hr
                      style={{
                        height: "2px",
                        border: "0px",
                        backgroundImage:
                          "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
                      }}
                    />
                    <div className="d-flex align-items-center mt-3 mb-3">
                      <p className="fw-bold mb-0 me-2">Total Cost:</p>
                      <span className="text-muted fs-13">
                        {manufacturingTotalCount}
                      </span>
                    </div>
                    <ManufacturingVariable partDetails={partDetails} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Shipment */}
          <Card>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-0">Shipment</h4>
                    <hr
                      style={{
                        height: "2px",
                        border: "0px",
                        backgroundImage:
                          "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
                      }}
                    />
                    <div className="d-flex align-items-center mt-3 mb-3">
                      <p className="fw-bold mb-0 me-2">Total Cost:</p>
                      <span className="text-muted fs-13">
                        {shipmentTotalCount}
                      </span>
                    </div>
                    <ShipmentVariable partDetails={partDetails} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Overheads and Profit */}
          <Card>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-0">Overheads and Profit</h4>
                    <hr
                      style={{
                        height: "2px",
                        border: "0px",
                        backgroundImage:
                          "linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0))",
                      }}
                    />
                    <div className="d-flex align-items-center mt-3 mb-3">
                      <p className="fw-bold mb-0 me-2">Total Cost:</p>
                      <span className="text-muted fs-13">
                        {overheadsTotalCount}
                      </span>
                    </div>
                    <OverheadsVariable partDetails={partDetails} />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Card>
        </Container>
      </div>

      <Modal isOpen={modal_category} toggle={toggleModalCategory} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModalCategory}>
          Choose Category
        </ModalHeader>
        <ModalBody>
          <Button color="success" className="add-btn mt-3">
            <i className="ri-add-line align-bottom me-1"></i> Add
          </Button>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default SinglePart;
