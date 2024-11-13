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
import Flatpickr from "react-flatpickr";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const OverheadsVariable = ({ partDetails, totalCost }) => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [overheadsData, setOverheadsData] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overheadsAndProfit, setoverheadsAndProfit] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectOverheads, setselectOverheads] = useState(null);
  const [editId, setEditId] = useState(null);
  


  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    percentage: "",
    totalRate: "",
  });

  const tog_add = () => {
  
    // Set the formData with the new ID
    setFormData({
      categoryId: "",
      name: "",
      percentage: "",
      totalRate: "",
    });

    setModalList(!modal_add); // Open the modal
  };

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
        totalRate: item.totalRate,
      });
      setEditId(item._id); // Set the ID of the item being edited
    } else {
      setFormData({
        categoryId: "",
        name: "",
        percentage: "",
        totalRate: "",
      });
      setEditId(null); // Reset the ID if no item is selected
    }
    setModalEdit(!modal_edit);
  };
  // Fetch data from the API
  const fetchOverheads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/overheadsAndProfits`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setOverheadsData(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching manufacturingVariables data:", error);
    } finally {
      setLoading(false);
    }
  }, [partDetails?._id]); // Add partDetails._id as a dependency

  // Fetch data when partDetails changes
  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchOverheads();
    }
  }, [partDetails, fetchOverheads]);

  //   const totalRate = formData.hourlyRate * formData.hours;
  const handleAutocompleteChange = (event, newValue) => {
    setselectOverheads(newValue);
    
    // Only update formData if newValue exists
    if (newValue) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        categoryId: newValue.categoryId,
        name: newValue.name,
        percentage: newValue.percentage,
      }));
      
      // Calculate totalRate based on selected value
      const multiplier = newValue.percentage / 100;
      const calculatedTotalRate = (multiplier * totalCost).toFixed(2);
      
      setFormData((prevFormData) => ({
        ...prevFormData,
        totalRate: calculatedTotalRate,
      }));
    }
  };



  // fetch over heads and profits data
  useEffect(() => {
    const fetchOverheadsAndProfits = async () => {
      try {
        const response = await fetch(
          `https://regenato-web-app-1.onrender.com/api/overheadsAndProfit`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setoverheadsAndProfit(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };
    fetchOverheadsAndProfits();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  // In the handleSubmit function, replace lines 152-153 with:

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
  
    try {
      const response = await fetch(
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/overheadsAndProfits`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            name: selectOverheads?.name,
            percentage: formData.percentage,
            totalRate: formData.totalRate,
          }),
        }
      );
  
      if (response.ok) {
        await fetchOverheads();
      } else {
        throw new Error("Network response was not ok");
      }
  
      setFormData({
        categoryId: "",
        name: "",
        percentage: "",
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
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/overheadsAndProfits/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            name: selectOverheads?.name,
            percentage: formData.percentage,
            totalRate: ((formData.percentage / 100) * totalCost).toFixed(2),
          }),
        }
      );
  
      if (response.ok) {
        await fetchOverheads();
      } else {
        throw new Error("Network response was not ok");
      }
  
      setFormData({
        categoryId: "",
        name: "",
        percentage: "",
        totalRate: "",
      });
      tog_edit();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Handle delete action
  // Handle delete action
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/overheadsAndProfits/${_id}`,
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

  // Calculate total cost
  const OverHeadsTotalCount = overheadsData.reduce(
    (total, item) => total + Number(item.totalRate || 0),
    0
  );

  return (
    <React.Fragment>
      {/* General Variable */}
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
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="alert alert-danger">Error: {error}</p>
        ) : (
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
                <th className="sort" data-sort="customer_name">
                  ID
                </th>
                <th className="sort" data-sort="name">
                  Name
                </th>
                <th className="sort" data-sort="percentage">
                  Percentage (%)
                </th>
                <th className="sort" data-sort="total-rate">
                  Total Rate (INR)
                </th>
                <th className="sort" data-sort="action">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="list form-check-all">
              {overheadsData.length > 0 ? (
                overheadsData.map((item) => (
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
                    <td className="customer_name">{item.totalRate}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <div className="edit">
                          <button
                            className="btn btn-sm btn-success edit-item-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#showModal"
                            onClick={() => tog_edit(item)}
                          >
                            Edit
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
                            Remove
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No Overheads and Profits Found
                  </td>
                </tr>
              )}
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
              We've searched more than 150+ Orders We did not find any orders
              for your search.
            </p>
          </div>
        </div>
      </div>

      {/* </CardBody>
                    </Card>
                </Col>
            </Row> */}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add Overheads And Profits</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                value={formData.id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={overheadsAndProfit}
                getOptionLabel={(option) => option.name}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Overheads And Profits"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="percentage" className="form-label">
                Percentage
              </label>
              <input
                type="number"
                className="form-control"
                name="perce"
                value={formData.percentage}
                // readOnly
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="totalRate"
                value={formData.totalRate}
                onChange={handleChange}
                // readOnly
                required
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Add
              </Button>
              <Button type="button" color="secondary" onClick={tog_add}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_edit}>
          Edit Overheads And Profits
        </ModalHeader>
        <form onSubmit={handleEditSubmit}>
          <ModalBody>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                id="categoryId"
                name="icategoryIdd"
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
              <label htmlFor="percentage" className="form-label">
                Percentage
              </label>
              <input
                type="text"
                className="form-control"
                id="percentage"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input
                type="text"
                className="form-control"
                id="totalRate"
                name="totalRate"
                value={formData.totalRate}
                onChange={(e) => {
                  e.preventDefault();
                }}
                readOnly
                required
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit" disabled={posting}>
              {posting ? "Saving..." : "Save"}
            </Button>
            <Button color="secondary" onClick={tog_edit} disabled={posting}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
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
