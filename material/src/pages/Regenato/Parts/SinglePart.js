import React, { useState, useEffect } from "react"; 
import { Button, Container, Row, Card, CardBody, Col, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import RmVariable from "./RmVariable";
import ManufacturingVariable from "./ManufacturingVariable";
import ShipmentVariable from "./ShipmentVariable";
import OverheadsVariable from "./OverheadsVariable";
import { useParams } from "react-router-dom"; // Import useParams to get route parameters
import GeneralVariable from "./GeneralVariable";

const SinglePart = () => {
  const { _id } = useParams(); // Use _id from the route parameters
  const [partDetails, setPartDetails] = useState(null); // State to hold part details
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [error, setError] = useState(null); // State for error handling

  useEffect(() => {
    const fetchPartDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4040/api/parts/${_id}`);
        
        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        
        const data = await response.json();
        setPartDetails(data);
        console.log(data)
      } catch (error) {
        console.error("Error fetching part details:", error);
        setError(error.message); // Update error state
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchPartDetails(); // Fetch details when the component mounts
  }, [_id]); // Fetch details when the component mounts or _id changes

  if (loading) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  if (error) {
    return <div>Error: {error}</div>; // Show error message if fetching fails
  }

  if (!partDetails) {
    return <div>No details found for this part.</div>; // Handle case where no details are found
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title={`Part (${partDetails.partName})`} pageTitle={`Part (${partDetails.partName})`} />

          <Row>
            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle tag="a" className="text-reset dropdown-btn" href="#">
                      <span className="text-muted fs-18"><i className="mdi mdi-dots-vertical"></i></span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <i className="mdi mdi-alpha-p-box-outline" style={{ fontSize: '33px' }}></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Part Name</h6>
                    <span className="text-muted fs-13">{partDetails.partName}</span> {/* Display part name */}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle tag="a" className="text-reset dropdown-btn" href="#">
                      <span className="text-muted fs-18"><i className="mdi mdi-dots-vertical"></i></span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <i className="mdi mdi-alpha-c-box-outline" style={{ fontSize: '33px' }}></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Cost Per Unit:</h6>
                    <span className="text-muted fs-13">{partDetails.costPerUnit}</span> 
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle tag="a" className="text-reset dropdown-btn" href="#">
                      <span className="text-muted fs-18"><i className="mdi mdi-dots-vertical"></i></span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <i className="mdi mdi-alpha-t-box-outline" style={{ fontSize: '33px' }}></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Time Per Unit:</h6>
                    <span className="text-muted fs-13">{partDetails.timePerUnit}</span> {/* Display time per unit */}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
                  <UncontrolledDropdown className="float-end">
                    <DropdownToggle tag="a" className="text-reset dropdown-btn" href="#">
                      <span className="text-muted fs-18"><i className="mdi mdi-dots-vertical"></i></span>
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>Favorite</DropdownItem>
                      <DropdownItem>Apply Now</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                  <div className="mb-4 pb-2">
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <i className="mdi mdi-alpha-s-box-outline" style={{ fontSize: '33px' }}></i>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fs-15 fw-bold mb-0">Stock / PO Qty:</h6>
                    <span className="text-muted fs-13">{partDetails.stockPOQty}</span> {/* Display stock quantity */}
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <div className="mb-4 pb-2 flex">
            <Button style={{ backgroundColor: "#9C27B0" }} className="add-btn me-1" id="create-btn">
              <i className="ri-add-line align-bottom me-1"></i> Add Category
            </Button>

            <Button className="add-btn me-1 bg-success" id="create-btn">
              <i className="ri-add-line align-bottom me-1"></i> Add Template
            </Button>

          </div>
          <GeneralVariable partDetails={partDetails}/>
          <RmVariable partDetails={partDetails} />
          <ManufacturingVariable partDetails={partDetails} />
          <ShipmentVariable partDetails={partDetails}/>
          <OverheadsVariable partDetails={partDetails}/>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default SinglePart;
