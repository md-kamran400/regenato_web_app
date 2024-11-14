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
} from "reactstrap";
import { Link } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const ManufacuringStatic = ({ partDetails }) => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [shipmentData, setShipmentData] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipmentvars, setshipmentvars] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedShipment, setselectedShipment] = useState(null);
  const [editId, setEditId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    hourlyRate: "",
    totalRate: "",
  });

  // Toggles for modals
  const tog_add = () => {
    // Generate the next ID based on the existing data
    let nextId = "E1"; // Default if there's no previous data
    if (shipmentData.length > 0) {
      const lastId = shipmentData[shipmentData.length - 1].categoryId;
      const lastNumber = parseInt(lastId.substring(1)); // Extract numeric part of the ID
      nextId = `E${lastNumber + 1}`; // Increment the numeric part
    }

    // Set the formData with the new ID
    setFormData({
      categoryId: nextId,
      name: "",
      hourlyRate: "",
      totalRate: "",
    });

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
        categoryId: item.id,
        name: item.name,
        hourlyRate: item.hourlyRate,
        totalRate: item.totalRate,
      });
      setEditId(item._id); // Set the ID of the item being edited
    } else {
      setFormData({
        categoryId: "",
        name: "",
        hourlyRate: "",
        totalRate: "",
      });
      setEditId(null); // Reset the ID if no item is selected
    }
    setModalEdit(!modal_edit);
  };

  const fetchShipmentData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://regenato-web-app-backend.onrender.com/api/parts/${partDetails._id}/manufacturingVariablesstactics`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setShipmentData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching shipment data:", error);
    } finally {
      setLoading(false);
    }
  }, [partDetails?._id]); // Add partDetails._id as a dependency

  // Fetch data when partDetails changes
  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchShipmentData();
    }
  }, [partDetails, fetchShipmentData]);

  //   fetch snipment variable
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const response = await fetch(
          `https://regenato-web-app-backend.onrender.com/api/manufacturingStatics`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setshipmentvars(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };

    fetchShipment();
  }, []);

  const handleAutocompleteChange = (event, newValue) => {
    setselectedShipment(newValue);

    if (newValue) {
      // Find the selected item in shipmentvars array
      const selectedItem = shipmentvars.find(
        (item) => item.name === newValue.name
      );

      if (selectedItem) {
        // Set the form data with the selected item values
        setFormData({
          name: newValue.name,
          hourlyRate: selectedItem.hourlyRate,
          totalRate: selectedItem.totalRate,
        });
      }
    } else {
      // Clear form data if nothing is selected
      setFormData({
        name: "",
        hourlyRate: "",
        totalRate: "",
      });
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `https://regenato-web-app-backend.onrender.com/api/parts/${partDetails._id}/manufacturingVariablesstactics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

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
        hourlyRate: "",
        totalRate: "",
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
        `https://regenato-web-app-backend.onrender.com/api/parts/${partDetails._id}/manufacturingVariablesstactics/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            totalRate: formData.totalRate, // Ensure totalRate is included in the request
          }),
        }
      );

      // Check if the request was successful
      if (response.ok) {
        // Refresh the page after successful PUT request
        await fetchShipmentData();
      } else {
        throw new Error(`Network response was not ok`);
      }

      setFormData({
        categoryId: "",
        name: "",
        hourlyRate: "",
        totalRate: "", // Reset totalRate to empty string
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
        `https://regenato-web-app-backend.onrender.com/api/parts/${partDetails._id}/manufacturingVariablesstactics/${_id}`,
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
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  // Calculate total cost
  const ShipmentTotalCost = shipmentData.reduce(
    (total, item) => total + Number(item.hourlyRate || 0),
    0
  );

  return (
    <React.Fragment>
      {/* <Row>
                <Col lg={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">Shipment Variables</h4>
                        </CardHeader>
                        <CardBody> */}

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

      {/* Table */}
      <div className="table-responsive table-card mt-3 mb-1">
        <table className="table align-middle table-nowrap" id="customerTable">
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
              <th>Total Rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="list form-check-all">
            {shipmentData.length > 0 ? (
              shipmentData.map((item) => (
                <tr key={item._id}>
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
                  <td>{item.hourlyRate}</td>
                  <td>{item.totalRate}</td>
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
                  No Shipment Variables Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* </CardBody>
                    </Card>
                </Col>
            </Row> */}

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
              <Autocomplete
                options={shipmentvars}
                getOptionLabel={(option) => option.name}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Manufacturing Variable"
                    variant="outlined"
                  />
                )}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="hourlyRate-field" className="form-label">
                Hourly Rate (INR)
              </label>
              <input
                type="number"
                id="hourlyRate-field"
                className="form-control"
                name="hourlyRate"
                placeholder="Enter Hourly Rate"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="totalRate-field" className="form-label">
                Total Rate
              </label>
              <input
                type="number"
                id="totalRate-field"
                className="form-control"
                name="totalRate"
                placeholder="Enter Total Rate"
                value={formData.totalRate}
                onChange={handleChange}
                required
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
        <ModalHeader toggle={tog_edit}>Edit Shipment Variables</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
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
              <label htmlFor="hourlyRate" className="form-label">
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyRate" className="form-label">
                Total Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="totalRate"
                value={formData.totalRate}
                onChange={handleChange}
                required
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Update
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
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

export default ManufacuringStatic;

// export default ManufacuringStatic
