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
import Flatpickr from "react-flatpickr";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const GeneralVariable = ({ partDetails }) => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [generlvariabledata, setgenerlvariabledata] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generalVariables, setGeneralVariables] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedGeneral, setselectedGeneral] = useState(null);
  const [editId, setEditId] = useState(null);
  console.log('Base URL:', process.env.REACT_APP_BASE_URL);


  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    value: "",
  });

  // Toggles for modals
  // Toggles for modals
  const tog_add = () => {
    // Generate the next ID based on the existing data
    // let nextId = "C1"; // Default if there's no previous data
    // if (generlvariabledata.length > 0) {
    //   const lastId = generlvariabledata[generlvariabledata.length - 1].categoryId;
    //   const lastNumber = parseInt(lastId.substring(1)); // Extract numeric part of the ID
    //   nextId = `C${lastNumber + 1}`; // Increment the numeric part
    // }

    // Set the formData with the new ID
    setFormData({
      categoryId: "",
      name: "",
    });

    setModalList(!modal_add); // Open the modal
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        categoryId: item.categoryId,
        name: item.name,
        value: item.value,
      });
      setEditId(item._id);
    } else {
      setFormData({
        categoryId: "",
        name: "",
        value: "",
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };

  const fetchGereralVariable = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/generalVariables`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setgenerlvariabledata(data);
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
      fetchGereralVariable();
    }
  }, [partDetails, fetchGereralVariable]);

  const handleAutocompleteChange = (event, newValue) => {
    setselectedGeneral(newValue);
    if (newValue) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        categoryId: newValue.categoryId,
        name: newValue.name,
      }));
    }
  };

  useEffect(() => {
    const fetchGeneral = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/general`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setGeneralVariables(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };

    fetchGeneral();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/generalVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        await fetchGereralVariable();
      } else {
        throw new Error("Network response was not ok");
      }
      await fetchGereralVariable();
      setFormData({
        categoryId: "",
        name: "",
        value: "",
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
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/generalVariables/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        // Refresh the page after successful POST request
        await fetchGereralVariable();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }
      setFormData({
        categoryId: "",
        name: "",
        value: "",
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
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/generalVariables/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchGereralVariable(); // Refetch the data to update the table
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
    return <div>Error: {error}</div>;
  }

  return (
    <React.Fragment>
      {/* Manufacturing Table */}
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">General Variable</h4>
            </CardHeader>
            <CardBody>
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
                  </div>
                </Col>
                <Col className="col-sm">
                  <div className="d-flex justify-content-sm-end">
                    <div className="search-box ms-2">
                      <input
                        type="text"
                        className="form-control"
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
                ) : (
                  <table className="table align-middle table-nowrap">
                    <thead className="table-light">
                      <tr>
                        {/* <th style={{ width: "50px" }}>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                            />
                          </div>
                        </th> */}
                        <th>ID</th>
                        <th>Name</th>
                        <th>Values</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generlvariabledata.map((item) => (
                        <tr key={item.categoryId}>
                          {/* <td>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                              />
                            </div>
                          </td> */}
                          <td>{item.categoryId}</td>
                          <td>{item.name}</td>
                          <td>{item.value}</td>

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
                      style={{ width: "75px", height: "75px" }}
                    ></lord-icon>
                    <h5 className="mt-2">Sorry! No Result Found</h5>
                    <p className="text-muted mb-0">
                      We couldn't find any results for your search.
                    </p>
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
          Add General Variable
        </ModalHeader>
        <ModalBody>
          <form className="tablelist-form" onSubmit={handleSubmit}>
            <ModalBody>
              
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <Autocomplete
                  options={generalVariables}
                  getOptionLabel={(option) => option.name}
                  onChange={handleAutocompleteChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select General Variable"
                      variant="outlined"
                    />
                  )}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="id-field" className="form-label">
                  ID
                </label>
                <input
                  type="text"
                  id="categoryId-field"
                  className="form-control"
                  placeholder="Enter Category ID"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="value-field" className="form-label">
                  Value
                </label>
                <input
                  type="text"
                  id="value-field"
                  className="form-control"
                  placeholder="Enter Value"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  required
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                className="add-btn me-1"
                onClick={() => setModalList(false)}
              >
                Cancel
              </Button>
              <Button color="success" className="add-btn me-1" type="submit">
                Add
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>Edit General Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
          <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text "
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                ID
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
              <label htmlFor="value" className="form-label">
                Value
              </label>
              <input
                type="text"
                className="form-control"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleChange}
              />
            </div>
            <ModalFooter>
              {" "}
              <Button type="submit" color="primary" disabled={posting}>
                {" "}
                Update
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
                {" "}
                Cancel{" "}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Delete Modal */}
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

export default GeneralVariable;
