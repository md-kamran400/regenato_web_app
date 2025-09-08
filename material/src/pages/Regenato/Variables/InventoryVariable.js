import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

const InventoryVariable = () => {
  const [inventoryData, SetInventoryData] = useState([]);


  useEffect(() => {
    fetchinventoryData();
  }, []);

  const fetchinventoryData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/InventoryVaraible/PostInventoryVaraible`
      );
      SetInventoryData(response.data);
    } catch (error) {
      console.error("Error fetching store data:", error);
    }
  };

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Inventory Tracking</h4>
            </CardHeader>
            <CardBody>
              <Row className="g-4 mb-3">
                <Col className="col-sm">
                  <div className="d-flex justify-content-sm-end">
                    <div className="search-box ms-2">
                      <input
                        type="text"
                        className="form-control search"
                        placeholder="Search..."
                      />
                      <i className="ri-search-line search-icon"></i>
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="table-responsive table-card mt-3 mb-1">
                <table className="table align-middle table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>DocDate</th>
                      <th>ItemCode</th>
                      <th>Dscription</th>
                      <th>Quantity</th>
                      <th>WhsCode</th>
                      <th>FromWhsCod</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData?.length > 0 ? (
                      inventoryData?.map((store) => (
                        <tr key={store._id}>
                          <td>{store.DocDate}</td>
                          <td>{store.ItemCode}</td>
                          <td>{store.Dscription}</td>
                          <td>{store.Quantity}</td>
                          <td>{store.WhsCode}</td>
                          <td>{store.FromWhsCod}</td>
                          
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default InventoryVariable;