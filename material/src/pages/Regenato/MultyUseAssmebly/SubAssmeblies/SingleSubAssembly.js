import React, { useState, useCallback, useEffect, memo } from "react"; //add parts list
import {
  Card,
  Button,
  CardBody,
  Col,
  Row,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { MdOutlineDelete } from "react-icons/md";
import FeatherIcon from "feather-icons-react";

const SingleSubAssembly = () => {
  const partsListItems = [
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

  return (
    <>
      <div style={{ padding: "1.5rem" }}>
        <Col
          lg={12}
          style={{
            boxSizing: "border-box",
            borderTop: "20px solid rgb(240, 101, 72)",
            borderRadius: "5px",
          }}
        >
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div
                    style={{
                      padding: "5px 10px 0px 10px",
                      borderRadius: "3px",
                    }}
                    className="button-group flex justify-content-between align-items-center"
                  >
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

                  <div className="button-group">
                    <Button
                      color="danger"
                      className="add-btn"
                      // onClick={toggleAddModal}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Sub Assembly
                    </Button>
                  </div>

                  <div className="table-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th
                          // onClick={() => handleRowClickParts("name")}
                          >
                            Name
                          </th>
                          <th>Cost Per Unit</th>
                          <th>Machining Hours</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Total Machining Hours</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partsListItems.map((item) => (
                          <tr key={item._id}>
                            <td>{item.partName}</td>
                            <td>{item.costPerUnit}</td>
                            <td>{item.timePerUnit}</td>
                            <td>{item.quantity}</td>
                            <td>{item.totalCost}</td>
                            <td>{item.totalMachiningHours}</td>
                            <td className="action-cell">
                              <div className="action-buttons">
                                <span
                                  style={{ color: "red", cursor: "pointer" }}
                                >
                                  <MdOutlineDelete size={25} />
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </div>
    </>
  );
};

export default SingleSubAssembly;
