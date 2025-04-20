import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  CardHeader,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { ToastContainer, toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const UserHandle = () => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    employeeId: "",
  });

  const toggleModal = () => {
    setModalList(!modal_add);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      employeeId: "",
    }); // Reset form when closed
  };

  const toggleDeleteModal = (user) => {
    setSelectedUser(user);
    setModalDelete(!modalDelete);
  };

  const toggleModal_edit = () => {
    setModalEdit(!modal_edit);
  };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userManagement/users`
      );
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userManagement/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      fetchUserData(); // Refresh user list
      toggleModal(); // Close modal
      toast.success("User Add successfully!");
    } catch (error) {
      toast.error("Failed to Add User !");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userManagement/users/${selectedUser._id}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      fetchUserData(); // Refresh user list
      toggleDeleteModal();
      toast.success("User Deleted successfully!");
    } catch (error) {
      toast.error("Failed to Delete User !");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData(user);
    toggleModal_edit();
  };

  const handleUpdateUser = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userManagement/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (response.ok) {
        fetchUserData();
        toggleModal_edit();
        toast.success("User Details Update successfully!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <div>
      <Col>
        <div style={{ marginTop: "25px" }} className="p-2">
          <BreadCrumb title="Users List" pageTitle="Users" />
        </div>
        <Card>
          <CardHeader>
            <Row className="g-4 mb-3">
              <div className="col-sm-auto d-flex">
                <Button color="success" className="me-1" onClick={toggleModal}>
                  <i className="ri-add-line me-1"></i> Add User
                </Button>
              </div>
            </Row>
          </CardHeader>
          <CardBody>
            <div className="table-responsive p-3">
              <table className="table table-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>{user.employeeId}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <Button
                          className="bg-success me-2"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          className="bg-danger"
                          onClick={() => toggleDeleteModal(user)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Add User Modal */}
      <Modal isOpen={modal_add} toggle={toggleModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal}>
          Add User
        </ModalHeader>
        <form onSubmit={handleAddUser}>
          <ModalBody>
            <div className="mb-3">
              <label className="form-label">Employee ID</label>
              <input
                type="text"
                name="employeeId"
                className="form-control"
                placeholder="Enter ID"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Enter Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Enter Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-control"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Select Role</label>
              <Input
                type="select"
                name="role"
                className="form-control"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="">Select a Role</option>
                {/* <option value="production">Production</option> */}
                <option value="admin">Admin</option>
                {/* <option value="finance">Finance</option> */}
                <option value="incharge">Incharge</option>
              </Input>
            </div>
            <Button type="submit" color="primary" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </ModalBody>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalDelete} toggle={() => toggleDeleteModal(null)}>
        <ModalHeader
          className="bg-light p-3"
          toggle={() => toggleDeleteModal(null)}
        >
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete {selectedUser?.name}?</p>
          <Button
            color="danger"
            onClick={handleDeleteUser}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
          <Button
            color="secondary"
            onClick={() => toggleDeleteModal(null)}
            className="ms-2"
          >
            Cancel
          </Button>
        </ModalBody>
      </Modal>

      <Modal isOpen={modal_edit} toggle={toggleModal_edit} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal_edit}>
          Edit User
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">ID</label>
            <Input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <Input
              type="select"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="production">Production</option>
              <option value="admin">Admin</option>
              <option value="finance">Finance</option>
              <option value="incharge">Incharge</option>
            </Input>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="position-relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <span
                className="position-absolute top-50 end-0 translate-middle-y me-3"
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <Button color="primary" onClick={handleUpdateUser}>
            Update User
          </Button>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default UserHandle;
