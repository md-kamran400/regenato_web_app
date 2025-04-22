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
import Select from "react-select";

const InhchargeVariable = () => {
  const [inchargeData, setInchargeData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    processeName: [],
    processess: [],
    operators: [],
  });
  const [posting, setPosting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modal_delete, setModal_delete] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedIncharge, setSelectedIncharge] = useState(null);
  const [manufacturingProcesses, setManufacturingProcesses] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);
  const [subProcessOptions, setSubProcessOptions] = useState([]);
  const [usersList, setUsersList] = useState([]); // New state for users

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    items: [],
  });

  useEffect(() => {
    fetchInchargeData();
    fetchManufacturingProcesses();
    fetchOperators();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/userManagement/users`
      );
      // Filter out admin users and only keep incharge users
      const inchargeUsers = response.data.filter(
        (user) => user.role === "incharge"
      );
      setUsersList(inchargeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    }
  };

  const fetchInchargeData = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/inchargeVariable`
      );
      setInchargeData(response.data);
      generateNextId(response.data);
    } catch (error) {
      console.error("Error fetching incharge data:", error);
      toast.error("Failed to fetch incharge data.");
    }
  };

  const fetchManufacturingProcesses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
      );
      setManufacturingProcesses(response.data);
    } catch (error) {
      console.error("Error fetching manufacturing processes:", error);
      toast.error("Failed to fetch manufacturing processes.");
    }
  };

  const fetchOperators = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/userVariable`
      );
      setOperatorsList(response.data);
    } catch (error) {
      console.error("Error fetching operators:", error);
      toast.error("Failed to fetch operators.");
    }
  };

  const generateNextId = (data) => {
    if (data.length === 0) {
      setFormData((prev) => ({ ...prev, categoryId: "IN1" }));
      return;
    }
    const lastIncharge = data[data.length - 1];
    const lastId = lastIncharge.categoryId;
    const match = lastId.match(/IN(\d+)/);

    if (match) {
      const nextNumber = parseInt(match[1]) + 1;
      setFormData((prev) => ({ ...prev, categoryId: `IN${nextNumber}` }));
    } else {
      setFormData((prev) => ({ ...prev, categoryId: "IN1" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProcessChange = (selectedOptions) => {
    const selectedProcessNames = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];
    setFormData((prev) => ({
      ...prev,
      processeName: selectedProcessNames,
      processess: [],
    }));

    // Update sub-process options for all selected processes
    if (selectedOptions && selectedOptions.length > 0) {
      const allSubProcesses = [];
      selectedOptions.forEach((option) => {
        const selectedProcess = manufacturingProcesses.find(
          (p) => p.name === option.value
        );
        if (selectedProcess) {
          selectedProcess.subCategories.forEach((sub) => {
            if (!allSubProcesses.some((sp) => sp.value === sub.name)) {
              allSubProcesses.push({
                value: sub.name,
                label: sub.name,
              });
            }
          });
        }
      });
      setSubProcessOptions(allSubProcesses);
    } else {
      setSubProcessOptions([]);
    }
  };

  const handleSubProcessChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      processess: selectedOptions
        ? selectedOptions.map((option) => option.value)
        : [],
    }));
  };

  const handleOperatorsChange = (selectedOptions) => {
    setFormData((prev) => ({
      ...prev,
      operators: selectedOptions
        ? selectedOptions.map((option) => ({
            name: option.value.name,
            categoryId: option.value.categoryId,
          }))
        : [],
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
        `${process.env.REACT_APP_BASE_URL}/api/inchargeVariable`,
        formData
      );
      toast.success("Incharge variable added successfully!");
      fetchInchargeData();
      setModalOpen(false);
      setFormData({
        categoryId: "",
        name: "",
        processeName: [],
        processess: [],
        operators: [],
      });
    } catch (error) {
      console.error("Error adding incharge variable:", error);
      toast.error("Failed to add incharge variable.");
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
        `${process.env.REACT_APP_BASE_URL}/api/inchargeVariable/${selectedId}`
      );
      toast.success("Incharge variable deleted successfully!");
      fetchInchargeData();
      setSelectedId(null);
      setModal_delete(false);
    } catch (error) {
      console.error("Error deleting incharge variable:", error);
      toast.error("Failed to delete incharge variable.");
    }
  };

  const handleEdit = (incharge) => {
    setSelectedIncharge(incharge);
    setFormData({
      categoryId: incharge.categoryId,
      name: incharge.name,
      processeName: incharge.processeName,
      processess: incharge.processess,
      operators: incharge.operators,
    });

    // Set sub-process options for the selected process
    const selectedProcess = manufacturingProcesses.find(
      (p) => p.name === incharge.processeName
    );
    if (selectedProcess) {
      const options = selectedProcess.subCategories.map((sub) => ({
        value: sub.name,
        label: sub.name,
      }));
      setSubProcessOptions(options);
    }

    setEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/inchargeVariable/${selectedIncharge._id}`,
        formData
      );
      toast.success("Incharge variable updated successfully!");
      fetchInchargeData();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating incharge variable:", error);
      toast.error("Failed to update incharge variable.");
    }
    setPosting(false);
  };

  // Prepare options for select components
  const processOptions = manufacturingProcesses.map((process) => ({
    value: process.name,
    label: process.name,
  }));

  const userOptions = usersList.map((user) => ({
    value: user.employeeId,
    label: `${user.name} - ${user.employeeId}`,
  }));

  // Update the operatorOptions to include both name and categoryId
  const operatorOptions = operatorsList.map((operator) => ({
    value: {
      name: operator.name,
      categoryId: operator.categoryId,
    },
    label: `${operator.categoryId} - ${operator.name}`,
  }));

  const selectedSubProcesses = formData.processess.map((process) => ({
    value: process,
    label: process,
  }));

  const selectedProcesses = formData.processeName.map((process) => ({
    value: process,
    label: process,
  }));

  // Update the selectedOperators to match the new structure
  const selectedOperators = formData.operators.map((operator) => ({
    value: operator,
    label: `${operator.categoryId} - ${operator.name}`,
  }));

  return (
    <React.Fragment>
      <ToastContainer position="top-right" autoClose={3000} />
      <Row>
        <Col lg={12}>
          <Card style={{ marginBottom: "10rem" }}>
            <CardHeader>
              <h4 className="card-title mb-0">Incharge Variables</h4>
            </CardHeader>
            <CardBody>
              <Row className="g-4 mb-3">
                <Col className="col-sm-auto">
                  <Button
                    color="success"
                    className="add-btn me-1"
                    onClick={() => {
                      generateNextId(inchargeData);
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
                      <th>Name</th>
                      <th>Process Name</th>

                      <th>Operators</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inchargeData.length > 0 ? (
                      inchargeData.map((incharge) => (
                        <tr key={incharge._id}>
                          <td>{incharge.categoryId}</td>
                          <td>{incharge.name}</td>
                          <td>
                            {incharge.processeName.length > 1 ? (
                              <Button
                                color="link"
                                onClick={() =>
                                  showItemsModal(
                                    "Process Names",
                                    incharge.processeName
                                  )
                                }
                                className="p-0"
                              >
                                {incharge.processeName.length} processes
                              </Button>
                            ) : (
                              incharge.processeName[0] || "-"
                            )}
                          </td>

                          <td>
                            {incharge.operators.length > 1 ? (
                              <Button
                                color="link"
                                onClick={() =>
                                  showItemsModal(
                                    "Operators",
                                    incharge.operators.map((op) =>
                                      typeof op === "string"
                                        ? op
                                        : `${op.categoryId} - ${op.name}`
                                    )
                                  )
                                }
                                className="p-0"
                              >
                                {incharge.operators.length} operators
                              </Button>
                            ) : (
                              incharge.operators
                                .map((op) =>
                                  typeof op === "string"
                                    ? op
                                    : `${op.categoryId} - ${op.name}`
                                )
                                .join(", ") || "-"
                            )}
                          </td>

                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                className="btn btn-sm btn-success edit-item-btn"
                                onClick={() => handleEdit(incharge)}
                              >
                                <FaEdit size={15} />
                              </Button>
                              <Button
                                className="btn btn-sm btn-danger remove-item-btn"
                                onClick={() => handleDelete(incharge._id)}
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
        size="lg"
      >
        <ModalHeader toggle={() => setModalOpen(!modalOpen)}>
          Add Incharge Variable
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>ID</Label>
              <Input
                type="text"
                name="categoryId"
                value={formData.categoryId}
                readOnly
              />
            </FormGroup>

            <FormGroup>
              <Label>Name</Label>
              <Select
                options={userOptions}
                value={userOptions.find(
                  (option) => option.value === formData.name
                )}
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: selectedOption ? selectedOption.value : "",
                  }))
                }
                placeholder="Select Employee"
                isSearchable
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Process Name</Label>
              <Select
                options={processOptions}
                value={selectedProcesses}
                onChange={handleProcessChange}
                isMulti
                placeholder="Select Process"
                isSearchable
                required
              />
            </FormGroup>

            {/* <FormGroup>
              <Label>Processes</Label>
              <Select
                options={subProcessOptions}
                value={selectedSubProcesses}
                onChange={handleSubProcessChange}
                isMulti
                placeholder="Select Sub-Processes"
                isDisabled={formData.processeName.length === 0}
              />
            </FormGroup> */}

            <FormGroup>
              <Label>Operators</Label>
              <Select
                options={operatorOptions}
                value={selectedOperators}
                onChange={handleOperatorsChange}
                isMulti
                placeholder="Select Operators"
                isSearchable
              />
            </FormGroup>

            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setModalOpen(false)}
                disabled={posting}
              >
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Adding..." : "Add Incharge"}
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
        size="lg"
      >
        <ModalHeader toggle={() => setEditModalOpen(!editModalOpen)}>
          Edit Incharge Variable
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleUpdate}>
            <FormGroup>
              <Label>ID</Label>
              <Input
                type="text"
                name="categoryId"
                value={formData.categoryId}
                readOnly
              />
            </FormGroup>

            <FormGroup>
              <Label>Name</Label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Process Name</Label>
              <Select
                options={processOptions}
                value={processOptions.find(
                  (option) => option.value === formData.processeName
                )}
                onChange={handleProcessChange}
                placeholder="Select Process"
                isSearchable
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Processes</Label>
              <Select
                options={subProcessOptions}
                value={selectedSubProcesses}
                onChange={handleSubProcessChange}
                isMulti
                placeholder="Select Sub-Processes"
                isDisabled={!formData.processeName}
              />
            </FormGroup>

            <FormGroup>
              <Label>Operators</Label>
              <Select
                options={operatorOptions}
                value={selectedOperators}
                onChange={handleOperatorsChange}
                isMulti
                placeholder="Select Operators"
                isSearchable
              />
            </FormGroup>

            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setEditModalOpen(false)}
                disabled={posting}
              >
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Updating..." : "Update"}
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

export default InhchargeVariable;
