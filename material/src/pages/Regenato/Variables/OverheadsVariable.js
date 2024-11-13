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
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Link } from "react-router-dom";
import Flatpickr from "react-flatpickr";

const OverheadsVariable = () => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [overheadsData, setOverheadsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion
  // Toggles for modals
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    percentage: "",
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
        percentage: item.percentage,
      });
      setEditId(item._id); // Set the ID of the item being edited
    } else {
      setFormData({
        categoryId: "",
        name: "",
        percentage: "",
      });
      setEditId(null); // Reset the ID if no item is selected
    }
    setModalEdit(!modal_edit);
  };

  // Fetch data from the API
  // useEffect(() => {
  //     const fetchOverheads = async () => {
  //         try {
  //             const response = await fetch('https://regenato-web-app-1.onrender.com/api/overheadsAndProfit');
  //             if (!response.ok) throw new Error('Network response was not ok');
  //             const data = await response.json();
  //             setOverheadsData(data);
  //         } catch (err) {
  //             setError(err.message);
  //         } finally {
  //             setLoading(false);
  //         }
  //     };

  //     fetchOverheads();
  // }, []);

  const fetchOverheads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://regenato-web-app-1.onrender.com/api/overheadsAndProfit"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setOverheadsData(data); // Set the fetched data to state
    } catch (error) {
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  }, []);

  useEffect(() => {
    fetchOverheads();
  }, [fetchOverheads]);

  // Calculate total cost
  // const totalCost = shipmentData.reduce((total, item) => total + item.percentage, 0);

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
      const response = await fetch(
        `https://regenato-web-app-1.onrender.com/api/overheadsAndProfit`,
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
        await fetchOverheads();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      await fetchOverheads();
      setFormData({
        categoryId: "",
        name: "",
        percentage: "",
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
        `https://regenato-web-app-1.onrender.com/api/overheadsAndProfit/${editId}`,
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
        await fetchOverheads();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      setFormData({
        categoryId: "",
        name: "",
        percentage: "",
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
        `https://regenato-web-app-1.onrender.com/api/overheadsAndProfit/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchOverheads(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Calculate total rate
  // const totalRate = overheadsData.reduce((total, item) => total + item.totalrate, 0);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Overheads and profits</h4>
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

                {/* <div className="d-flex align-items-center mt-3">
                                    <p className="fw-bold mb-0 me-2">Total Cost :</p>
                                    <p className="fw-bold mb-0 me-2">{totalRate.toFixed(2)}</p> 
                                </div> */}
                <div className="table-responsive table-card mt-3 mb-1">
                  {loading ? (
                    <p>Loading...</p>
                  ) : error ? (
                    <p>Error: {error}</p>
                  ) : (
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
                          <th className="sort" data-sort="customer_name">
                            ID
                          </th>
                          <th className="sort" data-sort="name">
                            Name
                          </th>
                          <th className="sort" data-sort="percentage">
                            Percentage (%)
                          </th>
                          {/* <th className="sort" data-sort="total-rate">Total Rate (INR)</th> */}
                          <th className="sort" data-sort="action">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="list form-check-all">
                        {overheadsData.map((item) => (
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
                            <td className="customer_name">{item.categoryId}</td>
                            <td className="customer_name">{item.name}</td>
                            <td className="customer_name">{item.percentage}</td>
                            {/* <td className="customer_name">{item.totalrate}</td> */}
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
                        ))}
                      </tbody>
                    </table>
                  )}
                  <div className="noresult" style={{ display: "none" }}>
                    <div className="text-center">
                      <lord-icon
                        src="https://cdn.lordicon.com/msoeawqm.json"
                        trigger="loop"
                        colors="primary:#121331,secondary:#08a88a"
                        style={{ width: "75px", height: "75px" }}
                      ></lord-icon>
                      <h5 className="mt-2">Sorry! No Result Found</h5>
                      <p className="text-muted mb-0">
                        We've searched more than 150+ Orders We did not find any
                        orders for your search.
                      </p>
                    </div>
                  </div>
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
        <ModalHeader>Add overheads And Profit</ModalHeader>
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
              <label htmlFor="percentage-field" className="form-label">
                Hourly Rate (INR)
              </label>
              <input
                type="number"
                id="percentage-field"
                className="form-control"
                name="percentage"
                placeholder="Enter Hourly Rate"
                value={formData.percentage}
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
        <ModalHeader toggle={tog_edit}>Edit Overheads And Profit</ModalHeader>
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
              <label htmlFor="percentage" className="form-label">
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="percentage"
                value={formData.percentage}
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

export default OverheadsVariable;
