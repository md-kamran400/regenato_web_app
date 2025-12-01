import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Input,
} from "reactstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const RoleManagement = () => {
  const [modal_add, setModalAdd] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    roleName: "",
    description: "",
  });

  // Initial roles data (this would come from backend in production)
  const [roles, setRoles] = useState([
    {
      id: 1,
      roleName: "Super Admin",
      description: "Full system access with all permissions",
      userCount: 2,
      isSystem: true,
    },
    {
      id: 2,
      roleName: "Admin",
      description: "Administrative access with most permissions",
      userCount: 5,
      isSystem: true,
    },
    {
      id: 3,
      roleName: "Supervisor",
      description: "Supervisory access with limited permissions",
      userCount: 8,
      isSystem: true,
    },
  ]);

  const toggleModal = () => {
    setModalAdd(!modal_add);
    setFormData({ roleName: "", description: "" });
  };

  const toggleEditModal = (role) => {
    setSelectedRole(role);
    setFormData({
      roleName: role.roleName,
      description: role.description,
    });
    setModalEdit(!modal_edit);
  };

  const toggleDeleteModal = (role) => {
    setSelectedRole(role);
    setModalDelete(!modalDelete);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddRole = (e) => {
    e.preventDefault();
    const newRole = {
      id: roles.length + 1,
      roleName: formData.roleName,
      description: formData.description,
      userCount: 0,
      isSystem: false,
    };
    setRoles([...roles, newRole]);
    toggleModal();
    toast.success("Role added successfully!");
  };

  const handleUpdateRole = () => {
    const updatedRoles = roles.map((role) =>
      role.id === selectedRole.id
        ? { ...role, roleName: formData.roleName, description: formData.description }
        : role
    );
    setRoles(updatedRoles);
    setModalEdit(false);
    toast.success("Role updated successfully!");
  };

  const handleDeleteRole = () => {
    if (selectedRole.isSystem) {
      toast.error("Cannot delete system roles!");
      return;
    }
    const filteredRoles = roles.filter((role) => role.id !== selectedRole.id);
    setRoles(filteredRoles);
    setModalDelete(false);
    toast.success("Role deleted successfully!");
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h5 className="mb-1 fw-semibold">
            <i className="ri-shield-user-line me-2 text-primary"></i>
            Role Management
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
            Define and manage user roles and descriptions
          </p>
        </div>
        <Button size="sm" color="success" onClick={toggleModal}>
          <i className="ri-add-line me-1"></i> Add Role
        </Button>
      </div>

      <Row>
        {roles.map((role) => (
          <Col lg={4} md={6} key={role.id}>
            <Card className="border">
              <CardBody>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h5 className="card-title mb-1">{role.roleName}</h5>
                    {role.isSystem && (
                      <span className="badge bg-info-subtle text-info">
                        System Role
                      </span>
                    )}
                  </div>
                  <div>
                    <Button
                      size="sm"
                      color="light"
                      className="me-1"
                      onClick={() => toggleEditModal(role)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => toggleDeleteModal(role)}
                      disabled={role.isSystem}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
                <p className="text-muted mb-3">{role.description}</p>
                <div className="d-flex align-items-center">
                  <i className="ri-user-line me-2 text-muted"></i>
                  <span className="text-muted">
                    {role.userCount} {role.userCount === 1 ? "user" : "users"}
                  </span>
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Role Modal */}
      <Modal isOpen={modal_add} toggle={toggleModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal}>
          Add New Role
        </ModalHeader>
        <form onSubmit={handleAddRole}>
          <ModalBody>
            <div className="mb-3">
              <label className="form-label">Role Name</label>
              <Input
                type="text"
                name="roleName"
                className="form-control"
                placeholder="Enter role name"
                value={formData.roleName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <Input
                type="textarea"
                name="description"
                className="form-control"
                placeholder="Enter role description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
            <Button type="submit" color="primary">
              Add Role
            </Button>
          </ModalBody>
        </form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal isOpen={modal_edit} toggle={() => setModalEdit(false)} centered>
        <ModalHeader className="bg-light p-3" toggle={() => setModalEdit(false)}>
          Edit Role
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Role Name</label>
            <Input
              type="text"
              name="roleName"
              className="form-control"
              value={formData.roleName}
              onChange={handleChange}
              disabled={selectedRole?.isSystem}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <Input
              type="textarea"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <Button color="primary" onClick={handleUpdateRole}>
            Update Role
          </Button>
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalDelete} toggle={() => setModalDelete(false)}>
        <ModalHeader className="bg-light p-3" toggle={() => setModalDelete(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          {selectedRole?.isSystem ? (
            <p className="text-danger">
              System roles cannot be deleted. They are essential for the application.
            </p>
          ) : (
            <>
              <p>
                Are you sure you want to delete the role{" "}
                <strong>{selectedRole?.roleName}</strong>?
              </p>
              <p className="text-muted">
                This action cannot be undone. Users with this role will need to be
                reassigned.
              </p>
              <Button color="danger" onClick={handleDeleteRole}>
                Delete Role
              </Button>
              <Button
                color="secondary"
                onClick={() => setModalDelete(false)}
                className="ms-2"
              >
                Cancel
              </Button>
            </>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RoleManagement;
