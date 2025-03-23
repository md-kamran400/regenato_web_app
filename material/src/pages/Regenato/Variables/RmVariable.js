import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

const RmVariable = () => {
  const [modal_list, setModalList] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [RmtableData, setRmtableData] = useState([]); // State to hold fetched data
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State for handling errors
  const [posting, setPosting] = useState(false); // State to manage posting state
  const [editId, setEditId] = useState(null); // State for tracking the ID of the item being edited
  const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion

  // Handle delete action
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/rmvariable/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchData(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    netweight: "",
    price: "",
    totalrate: "",
  });

  // Function to toggle 'Add' modal
  const tog_list = () => {
    setModalList(!modal_list);
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
        price: item.price,
      });
      setEditId(item._id); // Set the ID of the item being edited
    } else {
      setFormData({
        categoryId: "",
        name: "",
        price: "",
      });
      setEditId(null); // Reset the ID if no item is selected
    }
    setModalEdit(!modal_edit);
  };

  // Fetch data from the API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/rmvariable`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setRmtableData(data); // Set the fetched data to state
    } catch (error) {
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for adding a new variable
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/rmvariable`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Send the form data
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }

      // Display success toast
      toast.success("Records Added successfully!");
      await fetchData();
      setFormData({ categoryId: "", name: "", price: "" });
      tog_list(); // Close the modal
    } catch (error) {
      setError(
        error.message ||
          error.response.data.message ||
          "An unknown error occurred"
      );

      // Display error toast
      toast.error(
        error.message ||
          error.response.data.message ||
          "An unknown error occurred"
      );
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
        `${process.env.REACT_APP_BASE_URL}/api/rmvariable/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), // Send the updated form data
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchData();
      setFormData({ categoryId: "", name: "", price: "" });
      tog_edit(); // Close the edit modal
    } catch (error) {
      setError(error.message); // Set error message
    } finally {
      setPosting(false);
    }
  };

  // Render loading state or error if any
  if (loading) {
    return (
      <div>
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* General variable */}
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Raw Material Variables</h4>
            </CardHeader>
            <CardBody>
              <div className="listjs-table" id="customerList">
                <Row className="g-4 mb-3">
                  <Col className="col-sm-auto">
                    <div>
                      <Button
                        color="success"
                        className="add-btn me-1"
                        onClick={tog_list}
                        id="create-btn"
                      >
                        <i className="ri-add-line align-bottom me-1"></i> Add
                      </Button>
                      {/* <Button className="btn btn-soft-danger">
                                                <i className="ri-delete-bin-2-line"></i>
                                            </Button> */}
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

                <div className="table-responsive table-card mt-3 mb-1">
                  <table
                    className="table align-middle table-nowrap"
                    id="customerTable"
                  >
                    <thead className="table-light">
                      <tr>
                        <th className="sort" data-sort="id">
                          ID
                        </th>
                        <th className="sort" data-sort="name">
                          Name
                        </th>
                        <th className="sort" data-sort="price">
                          Price (INR/Kg)
                        </th>
                        <th className="sort" data-sort="action">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      {RmtableData.map((item) => (
                        <tr key={item._id}>
                          <td className="customer_name">{item.categoryId}</td>
                          <td className="customer_name">{item.name}</td>
                          <td className="customer_name">{item.price}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <div className="edit">
                                <button
                                  className="btn btn-sm btn-success edit-item-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#showModal"
                                  onClick={() => tog_edit(item)}
                                >
                                  <FaEdit size={15} />
                                </button>
                              </div>
                              <div className="remove">
                                <button
                                  className="btn btn-sm btn-danger remove-item-btn"
                                  data-bs-toggle="modal"
                                  data-bs-target="#deleteRecordModal"
                                  onClick={() => {
                                    setSelectedId(item._id);
                                    tog_delete();
                                  }}
                                >
                                  <MdOutlineDelete size={17} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Edit modal */}
                <Modal isOpen={modal_edit} toggle={tog_edit} centered>
                  <ModalHeader className="bg-light p-3" toggle={tog_edit}>
                    Edit Raw Material Variable
                  </ModalHeader>
                  <form onSubmit={handleEditSubmit}>
                    <ModalBody>
                      <div className="mb-3">
                        <label htmlFor="categoryId" className="form-label">
                          ID
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="categoryId"
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                          Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="price" className="form-label">
                          Price (INR/Kg)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                        />
                      </div>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="success" type="submit" disabled={posting}>
                        {posting ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        color="secondary"
                        onClick={tog_edit}
                        disabled={posting}
                      >
                        Cancel
                      </Button>
                    </ModalFooter>
                  </form>
                </Modal>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Modal for adding new variables */}
      <Modal isOpen={modal_list} toggle={tog_list}>
        <ModalHeader toggle={tog_list}>Add Raw Material Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                ID
              </label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                placeholder="Enter ID"
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
                placeholder="Enter Name"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="price" className="form-label">
                Price (INR/Kg)
              </label>
              <input
                type="number"
                className="form-control"
                name="price"
                value={formData.price}
                placeholder="Enter Price"
                onChange={handleChange}
                required
              />
            </div>
            <ModalFooter>
              <Button color="secondary" onClick={tog_list} disabled={posting}>
                Cancel
              </Button>
              <Button type="submit" color="success" disabled={posting}>
                {posting ? "Adding..." : "Add Variable"}
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

export default RmVariable;
