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
import { toast } from "react-toastify";

const GeneralVariable = () => {
  const [modalListOpen, setModalListOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [generalData, setGeneralData] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State for handling errors
  const [posting, setPosting] = useState(false); // State to manage posting state
  const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    value: "",
  });

  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        categoryId: item.categoryId || "",
        name: item.name || "",
        value: item.value || "",
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
    setModalEdit((prevState) => !prevState); // Proper toggle
  };

  // Toggles for modals
  const toggleListModal = () => setModalListOpen(!modalListOpen);
  const toggleDeleteModal = () => setModalDeleteOpen(!modalDeleteOpen);

  // Fetch data from API on component mount
  // Fetch data from the API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/general`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setGeneralData(data); // Set the fetched data to state
      console.log(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        `${process.env.REACT_APP_BASE_URL}/api/general`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network response was not ok");
      }

      // Display success toast
      toast.success("Records Added successfully!");

      // Option 1: Re-fetch the entire data
      await fetchData();

      setFormData({ categoryId: "", name: "", value: "" });
      toggleListModal(); // Close the modal
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/general/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        // Refresh the page after successful PUT request
        await fetchData();
      } else {
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
        `${process.env.REACT_APP_BASE_URL}/api/general/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchData(); // Refetch the data to update the table
      toggleDeleteModal(); // Close the modal
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

  // if (error) {
  //   return <div>Error: {error}</div>;
  // }

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
                      onClick={toggleListModal}
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
                        <th>ID</th>
                        <th>Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {generalData?.map((item) => (
                        <tr key={item.id}>
                          <td>{item.categoryId}</td>
                          <td>{item.name}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                className="btn btn-sm btn-success"
                                onClick={() => tog_edit(item)} // Pass item to edit
                              >
                                Edit
                              </Button>

                              <button
                                className="btn btn-sm btn-danger remove-item-btn"
                                data-bs-toggle="modal"
                                data-bs-target="#deleteRecordModal"
                                onClick={() => {
                                  setSelectedId(item._id);
                                  toggleDeleteModal();
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
      <Modal isOpen={modalListOpen} toggle={toggleListModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleListModal}>
          {" "}
          Add General Variable{" "}
        </ModalHeader>
        <ModalBody>
          <form className="tablelist-form" onSubmit={handleSubmit}>
            <ModalBody>
              {/* Hours Field */}
              <div className="mb-3">
                <label htmlFor="id-field" className="form-label">
                  ID
                </label>
                <input
                  type="text"
                  id="id-field"
                  className="form-control"
                  placeholder="Enter ID"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="name-field" className="form-label">
                  Name
                </label>
                <input
                  type="text"
                  id="name-field"
                  className="form-control"
                  placeholder="Enter Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                color="secondary"
                className="add-btn me-1"
                onClick={() => setModalListOpen(false)}
              >
                Cancel
              </Button>
              <Button color="success" className="add-btn me-1" type="submit">
                Add Variable
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
                required
              />
            </div>
            <ModalFooter>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Saving..." : "Save"}
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      <Modal isOpen={modalDeleteOpen} toggle={toggleDeleteModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleDeleteModal}>
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
          <Button
            color="secondary"
            onClick={toggleDeleteModal}
            disabled={posting}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default GeneralVariable;

// export default GeneralVariable
