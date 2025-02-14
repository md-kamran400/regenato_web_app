import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  ModalFooter,
  Row,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  ListGroup,
  ListGroupItem,
  Dropdown,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import "../project.css";
import BreadCrumb from "../../../../Components/Common/BreadCrumb";

const AllocationList = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projectListsData, setprojectListsData] = useState([]);
  const [error, setError] = useState(null); // State for handling errors

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setprojectListsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatTime = (time) => {
    if (time === "-" || isNaN(time)) {
      return "-";
    }

    if (time === 0) {
      return "-";
    }

    const totalMinutes = Math.round(time * 60); // Convert hours to minutes
    return `${totalMinutes} m`;
  };
  return (
    <React.Fragment>
      <>
        {isLoading && (
          <div className="loader-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </>

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th
                  className="sticky-col"
                  style={{ backgroundColor: "rgb(228, 228, 228)", }} >
                 Part Name
                </th>
               
              </tr>
            </thead>
            {/* <tbody>
              {projectListsData.map((item, index) => (
                <tr key={index}>
                  <td
                    className="sticky-col"
                    style={{
                      color: "blue",
                      backgroundColor: "rgb(255, 255, 255)",
                    }}
                  >
                    <Link to={`/regenato-allocation/${item._id}`}>
                      {item.projectName}
                    </Link>
                  </td>

                  <td>
                    {new Date(item.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td>
                    {new Date(item.createdAt).toISOString().split("T")[0]}
                  </td>
                  <td>{item.projectType}</td>

                  <td className="sticky-col">
                    <UncontrolledDropdown direction="start">
                      <DropdownToggle
                        tag="button"
                        className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                      >
                        <FeatherIcon
                          icon="more-horizontal"
                          className="icon-sm"
                        />
                      </DropdownToggle>

                      <DropdownMenu className="dropdown-menu-end">
                        <DropdownItem href="#">
                          <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                          Remove
                        </DropdownItem>
                        <DropdownItem href="#">
                          <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                          Duplicate
                        </DropdownItem>
                        <DropdownItem href="#">
                          <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                          Edit
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </td>
                </tr>
              ))}
            </tbody> */}
          </table>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AllocationList;


