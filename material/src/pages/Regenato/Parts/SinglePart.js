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
  ModalFooter,
  DropdownItem,
} from "reactstrap";

import BreadCrumb from "../../../Components/Common/BreadCrumb";
import RmVariable from "./RmVariable";
import ManufacturingVariable from "./ManufacturingVariable";
import ShipmentVariable from "./ShipmentVariable";
import OverheadsVariable from "./OverheadsVariable";
import { useParams } from "react-router-dom";
import GeneralVariable from "./GeneralVariable";
import ManufacuringStatic from "./ManufacuringStatic";
import List from "./List";
import { toast } from "react-toastify";

const SinglePart = () => {
  const [modal_category, setModal_category] = useState(false);
  const { _id } = useParams();
  const [partDetails, setPartDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal_add, setModal_add] = useState(false);
  const [editId, setEditId] = useState(null);
  const [AvgragecostPerUnit, setAvgragecostPerUnit] = useState(null);
  const [AvgragetimePerUnit, setAvgragetimePerUnit] = useState(null);
  const [partsCalculations, setPartsCalculations] = useState(null);
  const [rmtotalCount, setrmtotalCount] = useState(0);
  const [manufacturingCount, setmanufacturingCount] = useState(0);
  const [shipmentCount, setshipmentCount] = useState(0);
  const [overheadCount, setoverheadCount] = useState(0);
  const [manufacturingHours, setmanufacturingHours] = useState(0);


  const handlermTotalCountUpdate = (newTotal) => {
    setrmtotalCount(newTotal);
  };
  const handlemanufacturingCountTotalCountUpdate = (newTotal) => {
    setmanufacturingCount(newTotal);
  };
  const handleshipmentCountTotalCountUpdate = (newTotal) => {
    setshipmentCount(newTotal);
  };
  const handleoverheadCountTotalCountUpdate = (newTotal) => {
    setoverheadCount(newTotal);
  };
  const handlemanufacturingCountHoursCountUpdate = (newTotal) => {
    setmanufacturingHours(newTotal);
  };


  const tog_add_calculation = () => {
    setModal_add(!modal_add);
  };

  const toggleModalCategory = () => {
    setModal_category(!modal_category);
  };

  useEffect(() => {
    const fetchPartDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts/${_id}`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setPartDetails(data);

        // Set editId if this is an existing part
        if (data._id !== _id) {
          setEditId(data._id);
        } else {
          setEditId(null);
        }
      } catch (error) {
        console.error("Error fetching part details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartDetails();
  }, [_id]);

  useEffect(() => {
    if (partDetails?.partsCalculations?.length) {
      setPartsCalculations(partDetails.partsCalculations[0]);
    }
  }, [partDetails]);

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
  // const rmTotalCount = partDetails?.rmVariables?.reduce(
  //   (total, item) => total + Number(item.totalRate || 0),
  //   0
  // );
  const manufacturingTotalCount = partDetails?.manufacturingVariables?.reduce(
    (total, item) => total + Number(item.totalRate || 0),
    0
  );
  const shipmentTotalCount = partDetails?.shipmentVariables?.reduce(
    (total, item) => total + Number(item.hourlyRate || 0),
    0
  );

  // useEffect(() => {
  //   const total = rmtotalCount + manufacturingCount + shipmentCount;
  //   setavg_cost_per_unit(total);
  //   console.log(total);
  //   // Call the callback function to update the parent component
  //   onTotalCountUpdate(total);
  // }, [shipmentData]);



  // Calculate total cost without profit
  const totalCost = rmtotalCount + manufacturingCount + shipmentCount;

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
  // const profit = (totalCost * overheadPercentage) / 100;

  // Final cost per unit including profit
  const costPerUnitAvg = totalCost + overheadCount;



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Dynamically determine whether to POST or PUT
      const url =
        partsCalculations && partsCalculations._id
          ? `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/partsCalculations/${partsCalculations._id}`
          : `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/partsCalculations`;

      const method =
        partsCalculations && partsCalculations._id ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          AvgragecostPerUnit: costPerUnitAvg,
          AvgragetimePerUnit: manufacturingHours,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);

        // Update state with new or updated calculation
        setPartDetails(result);

        // Reset editId after successful update
        setEditId(null);
        // alert("Calculation saved successfully!");
        toast.success('Calculation saved successfully ')
      } else {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to save calculation.");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error submitting calculation:", error);
      alert("Error: " + error.message);
    }
  };


  // console.log(typeof costPerUnitAvg)
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            title={`Part ${partDetails.partName} (${partDetails.id})`}
            pageTitle={`Part ${partDetails.partName}`}
          />
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <Button
              className="add-btn me-1 bg-success"
              onClick={tog_add_calculation}
            >
              Finalize Calculation
            </Button>
          </div>
          <Row>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
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
                      {partDetails.partName} ({partDetails.id})
                    </span>{" "}
                    {/* Display part name */}
                  </div>
                  
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className="card-height-100">
                <CardBody>
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
                    <span className="text-muted fs-13">{costPerUnitAvg.toFixed(2)}</span>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col xl={3} ms={6}>
              <Card className={"card-height-100 "}>
                <CardBody>
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
                      {manufacturingHours.toFixed(2)}
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
                      <DropdownItem>Add Stock</DropdownItem>
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
          
          <GeneralVariable partDetails={partDetails} />

          {/* RM Variables */}
          <Card>
            <Row>
              <Col lg={12}>
                <Card>
                  <CardBody>
                    <h4 className="card-title mb-0">Raw Matarial</h4>
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
                      <span className="text-muted fs-13">{rmtotalCount.toFixed(2)}</span>
                    </div>
                    <RmVariable
                      partDetails={partDetails}
                      onTotalCountUpdate={handlermTotalCountUpdate}
                    />
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
                        {manufacturingCount}
                      </span>
                    </div>
                    <ManufacturingVariable partDetails={partDetails} 
                    onTotalCountUpdate={handlemanufacturingCountTotalCountUpdate}
                    onTotalCountUpdateHours={handlemanufacturingCountHoursCountUpdate}/>
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
                        {shipmentCount}
                      </span>
                    </div>
                    <ShipmentVariable partDetails={partDetails} onTotalCountUpdate={handleshipmentCountTotalCountUpdate}/>
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
                        {overheadCount}
                      </span>
                    </div>
                    <OverheadsVariable
                      partDetails={partDetails}
                      totalCost={totalCost}
                      onTotalCountUpdate={handleoverheadCountTotalCountUpdate}
                    />
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

      <Modal isOpen={modal_add} toggle={tog_add_calculation} centered>
        <ModalHeader toggle={tog_add_calculation}>
          {partsCalculations ? "Finalize Calculation" : "Add Calculation"}
        </ModalHeader>
        <ModalBody>
          <p>
            {partsCalculations
              ? "Finalize existing calculation"
              : "Finalize a new calculation"}{" "}
            for {partDetails.partName}
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="costPerUnitAvg" className="form-label">
                Cost Per Unit
              </label>
              <input
                type="number"
                className="form-control"
                id="costPerUnitAvg"
                value={costPerUnitAvg.toFixed(2)}
                onChange={(e) => setAvgragecostPerUnit(Number(e.target.value))}
                readOnly={!!partsCalculations}
              />
            </div>
            <div className="mb-3">
              <label
                htmlFor="manufacturingHours"
                className="form-label"
              >
                Total Hours
              </label>
              <input
                type="number"
                className="form-control"
                id="manufacturingHours"
                value={manufacturingHours.toFixed(2)}
                onChange={(e) => setAvgragetimePerUnit(Number(e.target.value))}
                readOnly={!!partsCalculations}
              />
            </div>
            <Button type="submit" color="success" className="add-btn me-1">
              {partsCalculations ? "Update" : "Add"}
            </Button>
            <Button
              type="button"
              color="secondary"
              onClick={tog_add_calculation}
            >
              Cancel
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default SinglePart;
