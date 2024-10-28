import React, { useState, useEffect, useCallback } from "react";
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
  Container,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { Link } from "react-router-dom";

const ShipmentVariable = () => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [shipmentData, setShipmentData] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [shipmentvars, setshipmentvars] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedShipment, setselectedShipment] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    hourlyrate: "",
  });

  // Toggles for modals
  const tog_add = () => {
    setModalList(!modal_add); // Open the modal
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  // Function to toggle 'Edit' modal
  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        categoryId: item.categoryId,
        name: item.name,
        hourlyrate: item.hourlyrate,
      });
      setEditId(item._id); // Set the ID of the item being edited
    } else {
      setFormData({
        categoryId: "",
        name: "",
        hourlyrate: "",
      });
      setEditId(null); // Reset the ID if no item is selected
    }
    setModalEdit(!modal_edit);
  };

  // Fetch data from API
  //   useEffect(() => {
  //     const fetchShipmentData = async () => {
  //       try {
  //         const response = await fetch("http://localhost:4040/api/shipment");
  //         const data = await response.json();
  //         setShipmentData(data); // Update state with fetched data
  //       } catch (error) {
  //         console.error("Error fetching shipment data:", error);
  //       }
  //     };

  //     fetchShipmentData();
  //   }, []);

  const fetchShipmentData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:4040/api/shipment");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setShipmentData(data); // Set the fetched data to state
    } catch (error) {
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  }, []);

  useEffect(() => {
    fetchShipmentData();
  }, [fetchShipmentData]);

  // Calculate total cost
  // const totalCost = shipmentData.reduce((total, item) => total + item.hourlyrate, 0);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:4040/api/shipment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Check if the request was successful
      if (response.ok) {
        // Refresh the page after successful POST request
        await fetchShipmentData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      await fetchShipmentData();
      setFormData({
        categoryId: "",
        name: "",
        hourlyrate: "",
      });
      tog_add();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Handle form submission for editing a variable (PUT request)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/shipment/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      //   if (!response.ok) {
      //     throw new Error("Network response was not ok");
      //   }

      // Check if the request was successful
      if (response.ok) {
        // Refresh the page after successful POST request
        await fetchShipmentData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      setFormData({
        categoryId: "",
        name: "",
        hourlyrate: "",
      });
      tog_edit();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Handle delete action
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/shipment/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchShipmentData(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Render loading state or error if any

  return (
    <React.Fragment>
      {/* General Variable */}
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Shipment Variables</h4>
            </CardHeader>
            <CardBody>
              <div className="listjs-table" id="customerList">
                <Row className="g-4 mb-3">
                  <Col className="col-sm-auto">
                    <div>
                      <Button
                        color="success"
                        className="add-btn me-1"
                        onClick={tog_add}
                        id="create-btn"
                      >
                        <i className="ri-add-line align-bottom me-1"></i> Add
                      </Button>
                      <Button className="btn btn-soft-danger">
                        <i className="ri-delete-bin-2-line"></i>
                      </Button>
                    </div>
                  </Col>
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

                {/* Display total cost */}
                {/* <div className="d-flex align-items-center mt-3">
                                    <p className="fw-bold mb-0 me-2">Total Cost:</p>
                                    <p className="fw-bold mb-0 me-2">{totalCost.toFixed(2)}</p>
                                </div> */}

                <div className="table-responsive table-card mt-3 mb-1">
                  <table
                    className="table align-middle table-nowrap"
                    id="customerTable"
                  >
                    <thead className="table-light">
                      <tr>
                        <th scope="col" style={{ width: "50px" }}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="checkAll"
                              value="option"
                            />
                          </div>
                        </th>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Hourly Rate (INR)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      {shipmentData.length > 0 ? (
                        shipmentData.map((item) => (
                          <tr key={item.id}>
                            <th scope="row">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  name="chk_child"
                                  value="option1"
                                />
                              </div>
                            </th>
                            <td>{item.categoryId}</td>
                            <td>{item.name}</td>
                            <td>{item.hourlyrate}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success edit-item-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#showModal"
                                  onClick={() => tog_edit(item)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-danger remove-item-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteRecordModal"
                                  onClick={() => {
                                    setSelectedId(item._id);
                                    tog_delete();
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            Loading...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end">
                  <div className="pagination-wrap hstack gap-2">
                    <Link className="page-item pagination-prev disabled" to="#">
                      Previous
                    </Link>
                    <ul className="pagination listjs-pagination mb-0"></ul>
                    <Link className="page-item pagination-next" to="#">
                      Next
                    </Link>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal isOpen={modal_add} toggle={tog_add} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_add}>
          {formData.id ? "Edit Shipment Variable" : "Add Shipment Variable"}
        </ModalHeader>
        <ModalBody>
          <form className="tablelist-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="id-field" className="form-label">
                ID
              </label>
              <input
                type="text"
                id="categoryId-field"
                className="form-control"
                name="categoryId"
                placeholder="Enter Category ID"
                value={formData.categoryId}
                onChange={handleChange}
                require
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name-field"
                className="form-control"
                name="name"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                require
              />
            </div>

            <div className="mb-3">
              <label htmlFor="hourlyrate-field" className="form-label">
                Hourly Rate (INR)
              </label>
              <input
                type="number"
                id="hourlyrate-field"
                className="form-control"
                name="hourlyrate"
                placeholder="Enter Hourly Rate"
                value={formData.hourlyrate}
                onChange={handleChange}
                require
              />
            </div>

            <ModalFooter>
              <Button color="secondary" onClick={tog_add} disabled={posting}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Adding..." : "Add Variable"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>Edit Mwnufacturing</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyrate" className="form-label">
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="hourlyrate"
                value={formData.hourlyrate}
                onChange={handleChange}
                required
              />
            </div>
            <ModalFooter>
              <Button color="primary" type="submit" disabled={posting}>
                {posting ? "Saving..." : "Save"}
              </Button>
              <Button color="secondary" onClick={tog_edit} disabled={posting}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={modal_delete} toggle={tog_delete} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_delete}>
          Delete Record
        </ModalHeader>
        <ModalBody>
          <div className="mt-2 text-center">
            <lord-icon
              src="https://cdn.lordicon.com/gsqxdxog.json"
              trigger="loop"
              colors="primary:#f7b84b,secondary:#f06548"
              style={{ width: "100px", height: "100px" }}
            ></lord-icon>
            <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
              <h4>Are you Sure?</h4>
              <p className="text-muted mx-4 mb-0">
                Are you sure you want to remove this record?
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => handleDelete(selectedId)}
            disabled={posting}
          >
            {posting ? "Deleting..." : "Yes! Delete It"}
          </Button>
          <Button color="secondary" onClick={tog_delete} disabled={posting}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default ShipmentVariable;
