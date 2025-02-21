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
import { toast } from "react-toastify";
import Select from "react-select";

const UsersListVariable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [usersData, setUserdata] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processOptions, setProcessOptions] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    processName: [],
    // shifts: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "shifts") {
      setFormData({
        ...formData,
        [name]: value === "" ? 0 : parseInt(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Toggles for modals
  const tog_add = () => {
    setModalList(!modal_add);
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const handleProcessClick = (index) => {
    setIsModalOpen(!isModalOpen);
    setExpandedRow(isModalOpen ? null : index);
    setCurrentItem(usersData[index]);
  };

  // Function to toggle 'Edit' modal
  const tog_edit = (item) => {
    setEditData(item);
    setFormData({
      categoryId: item?.categoryId || "",
      name: item?.name || "",
      processName: item?.processName || [],
    });
    setModalEdit(!modal_edit);
  };

  const fetchusersData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setUserdata(data); // Set the fetched data to state
    } catch (error) {
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  }, []);

  useEffect(() => {
    fetchusersData();
  }, [fetchusersData]);

  // Handle form input changes
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  const fetchProcessNames = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
      );
      if (!response.ok) throw new Error("Failed to fetch process names");
      const data = await response.json();
      setProcessOptions(
        data.map((item) => ({ label: item.name, value: item.name }))
      );
    } catch (error) {
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    fetchProcessNames();
  }, [fetchProcessNames]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData({ ...formData, [name]: value });
  // };

  const handleProcessChange = (selectedOptions) => {
    setFormData({
      ...formData,
      processName: selectedOptions.map((option) => option.value),
    });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setPosting(true);
  //   setError(null);
  //   try {
  //     const method = editData ? "PUT" : "POST";
  //     const url = editData
  //       ? `${process.env.REACT_APP_BASE_URL}/api/userVariable/${editData._id}`
  //       : `${process.env.REACT_APP_BASE_URL}/api/userVariable`;

  //     const response = await fetch(url, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(formData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.message || "Network error");
  //     }
  //     toast.success(
  //       editData
  //         ? "Record Updated successfully!"
  //         : "Records Added successfully!"
  //     );
  //     setFormData({ categoryId: "", name: "", processName: [] });
  //     editData ? tog_edit() : tog_add();
  //     await fetchusersData();
  //   } catch (error) {
  //     toast.error(error.message || "An error occurred");
  //   } finally {
  //     setPosting(false);
  //   }
  // };

  // Handle delete action
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    const dataToSubmit = {
      ...formData,
      shifts: parseInt(formData.shifts), // Ensure `shifts` is a number
    };

    try {
      const method = editData ? "PUT" : "POST";
      const url = editData
        ? `${process.env.REACT_APP_BASE_URL}/api/userVariable/${editData._id}`
        : `${process.env.REACT_APP_BASE_URL}/api/userVariable`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Network error");
      }
      toast.success(
        editData
          ? "Record Updated successfully!"
          : "Records Added successfully!"
      );
      setFormData({ categoryId: "", name: "", processName: [], shifts: 0 });
      editData ? tog_edit() : tog_add();
      await fetchusersData();
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchusersData(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <React.Fragment>
      {/* General Variable */}
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Users Variables</h4>
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
                        <th>ID</th>
                        <th>Name</th>
                        <th>Process Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody className="list form-check-all">
                      {usersData.length > 0 ? (
                        usersData.map((item, index) => (
                          <tr key={item.id}>
                            <td>{item.categoryId}</td>
                            <td>{item.name}</td>

                            <td>
                              <span onClick={() => handleProcessClick(index)}>
                                {item.processName.length > 1 ? (
                                  <span
                                    style={{
                                      color: "#007bff",
                                      textDecoration: "none",
                                    }}
                                  >
                                    {item.processName[0]} ...{""}
                                  </span>
                                ) : (
                                  item.processName.join(", ")
                                )}
                              </span>
                            </td>
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
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal isOpen={modal_add} toggle={tog_add} centered>
        <ModalHeader toggle={tog_add}>Add Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Category ID</label>
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
              <label className="form-label">Name</label>
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
              <label className="form-label">Process Name</label>
              <Select
                isMulti
                options={processOptions}
                value={processOptions.filter((option) =>
                  formData.processName.includes(option.value)
                )}
                onChange={handleProcessChange}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                  }),
                }}
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
      <Modal isOpen={modal_edit} toggle={tog_edit} centered>
        <ModalHeader toggle={tog_edit}>Edit Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Category ID</label>
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
              <label className="form-label">Name</label>
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
              <label className="form-label">Process Name</label>
              <Select
                isMulti
                options={processOptions}
                value={processOptions.filter((option) =>
                  formData.processName?.includes(option.value)
                )}
                onChange={handleProcessChange}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                    color: "black",
                  }),
                  singleValue: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  multiValueLabel: (provided) => ({
                    ...provided,
                    color: "black",
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: "white",
                  }),
                }}
              />
            </div>
            

            <ModalFooter>
              <Button color="secondary" onClick={tog_edit} disabled={posting}>
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Updating..." : "Update Variable"}
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

      {/* Modal for displaying all process names */}
      <Modal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(!isModalOpen)}
        centered
      >
        <ModalHeader toggle={() => setIsModalOpen(!isModalOpen)}>
          Process Names
        </ModalHeader>
        <ModalBody>
          <ol>
            {currentItem &&
              currentItem.processName.map((processName, index) => (
                <li key={index}>{processName}</li>
              ))}
          </ol>
        </ModalBody>
        <ModalFooter>
          <Button color="success" onClick={() => setIsModalOpen(!isModalOpen)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default UsersListVariable;
