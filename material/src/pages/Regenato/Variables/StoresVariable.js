import React, { useEffect, useState } from "react";
import axios from "axios";
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
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit } from "react-icons/fa";
import { MdOutlineDelete } from "react-icons/md";

const StoresVariable = () => {
  const [storeData, setStoreData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    Name: [],
    location: [],
  });
  const [posting, setPosting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modal_delete, setModal_delete] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    items: [],
  });

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable`
      );
      setStoreData(response.data);
      generateNextId(response.data);
    } catch (error) {
      console.error("Error fetching store data:", error);
    }
  };

  const generateNextId = (data) => {
    if (data.length === 0) {
      setFormData((prev) => ({ ...prev, categoryId: "ST1" }));
      return;
    }
    const lastStore = data[data.length - 1];
    const lastId = lastStore.categoryId;
    const match = lastId.match(/ST(\d+)/);

    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      setFormData((prev) => ({ ...prev, categoryId: `ST${nextNumber}` }));
    } else {
      setFormData((prev) => ({ ...prev, categoryId: "ST1" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNameChange = (e) => {
    // const names = e.target.value.split(",").map((name) => name.trim());
   const names = e.target.value.split(",").map((name) => name.trim());
    setFormData((prev) => ({
      ...prev,
      Name: names,
    }));
  };

  const handleLocationChange = (e) => {
    const locations = e.target.value.split(",").map((loc) => loc.trim());
    setFormData((prev) => ({
      ...prev,
      location: locations,
    }));
  };

  const showItemsModal = (title, items) => {
    setModalContent({
      title,
      items: Array.isArray(items) ? items : [items],
    });
    setViewModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable`,
        formData
      );
      toast.success("Store variable added successfully!");
      fetchStoreData();
      setModalOpen(false);
      setFormData({
        categoryId: "",
        Name: [],
        location: [],
      });
    } catch (error) {
      console.error("Error adding store variable:", error);
      toast.error("Failed to add store variable.");
    }
    setPosting(false);
  };

  const handleDelete = async (id) => {
    setSelectedId(id);
    setModal_delete(true);
  };

  const deleteRecord = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable/${selectedId}`
      );
      toast.success("Store variable deleted successfully!");
      fetchStoreData();
      setSelectedId(null);
      setModal_delete(false);
    } catch (error) {
      console.error("Error deleting store variable:", error);
      toast.error("Failed to delete store variable.");
    }
  };

  const handleEdit = (store) => {
    setSelectedStore(store);
    setFormData({
      categoryId: store.categoryId,
      Name: store.Name,
      location: store.location,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/storesVariable/${selectedStore._id}`,
        formData
      );
      toast.success("Store variable updated successfully!");
      fetchStoreData();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating store variable:", error);
      toast.error("Failed to update store variable.");
    }
    setPosting(false);
  };

  const getFirstName = (store) => {
    if (!store.Name || store.Name.length === 0) return "-";
    return store.Name[0];
  };

  const getFirstLocation = (store) => {
    if (!store.location || store.location.length === 0) return "-";
    return store.location[0];
  };

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Stores</h4>
            </CardHeader>
            <CardBody>
              <Row className="g-4 mb-3">
                <Col className="col-sm-auto">
                  <Button
                    color="success"
                    className="add-btn me-1"
                    onClick={() => {
                      generateNextId(storeData);
                      setModalOpen(true);
                    }}
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add
                  </Button>
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
                <table className="table align-middle table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Names</th>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeData?.length > 0 ? (
                      storeData?.map((store) => (
                        <tr key={store._id}>
                          <td>{store.categoryId}</td>
                          <td>
                            {store?.Name?.length > 1 ? (
                              <span
                                style={{
                                  color: "#007bff",
                                  textDecoration: "none",
                                }}
                                color="link"
                                onClick={() =>
                                  showItemsModal("Names", store.Name)
                                }
                                className="p-0"
                              >
                                {getFirstName(store)} ...
                              </span>
                            ) : (
                              getFirstName(store)
                            )}
                          </td>
                          <td>
                            {store?.location?.length > 1 ? (
                              <span
                                style={{
                                  color: "#007bff",
                                  textDecoration: "none",
                                }}
                                color="link"
                                onClick={() =>
                                  showItemsModal("Locations", store.location)
                                }
                                className="p-0"
                              >
                                {getFirstLocation(store)} ...
                              </span>
                            ) : (
                              getFirstLocation(store)
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                className="btn btn-sm btn-success edit-item-btn"
                                onClick={() => handleEdit(store)}
                              >
                                <FaEdit size={15} />
                              </Button>
                              <Button
                                className="btn btn-sm btn-danger remove-item-btn"
                                onClick={() => handleDelete(store._id)}
                                disabled={posting}
                              >
                                <MdOutlineDelete size={17} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        toggle={() => setModalOpen(!modalOpen)}
        centered
        size="m"
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          <h5 className="modal-title">Add Store</h5>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label className="form-label">ID</Label>
                  <Input
                    type="text"
                    name="categoryId"
                    value={formData.categoryId}
                    readOnly
                    className="form-control bg-light"
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup className="mb-3">
              <Label className="form-label">Names</Label>
              <Input
                type="text"
                name="Name"
                value={formData.Name} 
                onChange={handleNameChange}
                placeholder="Enter names"
                className="form-control"
              />
            </FormGroup>

            <FormGroup className="mb-3">
              <Label className="form-label">Locations</Label>
              <Input
                type="text"
                name="location"
                value={formData.location} 
                onChange={handleLocationChange}
                placeholder="Enter locations"
                className="form-control"
              />
            </FormGroup>

            <ModalFooter className="border-top-0 pt-3">
              <Button
                color="light"
                onClick={() => setModalOpen(false)}
                disabled={posting}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={posting}
                className="px-4"
              >
                {posting ? "Adding..." : "Add Store"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        toggle={() => setEditModalOpen(!editModalOpen)}
        centered
        size="m"
      >
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          <h5 className="modal-title">Edit Store</h5>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleUpdate}>
            <Row>
              <Col md={12}>
                <FormGroup className="mb-3">
                  <Label className="form-label">ID</Label>
                  <Input
                    type="text"
                    name="categoryId"
                    value={formData.categoryId}
                    readOnly
                    className="form-control bg-light"
                  />
                </FormGroup>
              </Col>
            </Row>

            <FormGroup className="mb-3">
              <Label className="form-label">Names </Label>
              <Input
                type="text"
                name="Name"
                value={formData.Name}
                onChange={handleNameChange}
                placeholder="Enter names "
                className="form-control"
              />
            </FormGroup>

            <FormGroup className="mb-3">
              <Label className="form-label">Locations</Label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleLocationChange}
                placeholder="Enter locations"
                className="form-control"
              />
            </FormGroup>

            <ModalFooter className="border-top-0 pt-3">
              <Button
                color="light"
                onClick={() => setEditModalOpen(false)}
                disabled={posting}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={posting}
                className="px-4"
              >
                {posting ? "Updating..." : "Update Store"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={modal_delete}
        toggle={() => setModal_delete(!modal_delete)}
        centered
      >
        <ModalHeader
          className="bg-light p-3"
          toggle={() => setModal_delete(!modal_delete)}
        >
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
          <Button color="danger" onClick={deleteRecord} disabled={posting}>
            {posting ? "Deleting..." : "Yes! Delete It"}
          </Button>
          <Button
            color="secondary"
            onClick={() => setModal_delete(false)}
            disabled={posting}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* View Items Modal */}
      <Modal
        isOpen={viewModalOpen}
        toggle={() => setViewModalOpen(false)}
        centered
      >
        <ModalHeader toggle={() => setViewModalOpen(false)}>
          {modalContent.title}
        </ModalHeader>
        <ModalBody>
          <ol>
            {modalContent.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default StoresVariable;
