import React, { useEffect, useState } from "react";
import {
  Row,
  Button,
  Input,
  Modal,
  Label,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { toast } from "react-toastify";

export const Assmeblies = () => {
  const [ListData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAssmebly, seteditAssmebly] = useState({});
  const [newAssemblyName, setNewAssemblyName] = useState("");
  const [newAssemblyNumber, setNewAssemblyNumber] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [itemToDuplicate, setItemToDuplicate] = useState(null);

  const toggleDeleteModal = (item) => {
    setDeleteModal(!deleteModal);
    setItemToDelete(item); // Pass the subAssembly to the delete modal
  };

  const toggleDuplicateModal = (item) => {
    setDuplicateModalOpen(!duplicateModalOpen);
    setItemToDuplicate(item);
  };

  const fetchSubAssemblies = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/assmebly`
      );
      const data = await response.json();
      setListData(data);
    } catch (error) {
      console.error("Error fetching sub-assemblies:", error);
    }
  };

  useEffect(() => {
    fetchSubAssemblies();
  }, []);

  const handleAddPart = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/assmebly`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            AssemblyName: newAssemblyName,
            AssemblyNumber: newAssemblyNumber,
          }),
        }
      );
      const data = await response.json();
      setListData([...ListData, data]);
      toast.success("Records Added Successfully");
      setIsModalOpen(false);
      setNewAssemblyName("");
      setNewAssemblyNumber("");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (subAssembly) => {
    seteditAssmebly(subAssembly);
    setIsEditModalOpen(true);
  };

  const handleEdit = async () => {
    try {
      const { _id } = editAssmebly;
      const { AssemblyName, AssemblyNumber } = editAssmebly;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/assmebly/${_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ AssemblyName, AssemblyNumber }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update sub-assembly");
      }

      const updatedSubAssembly = await response.json();

      // Update the list with the edited item
      setListData(
        ListData.map((item) =>
          item._id === _id ? { ...item, AssemblyName, AssemblyNumber } : item
        )
      );

      toast.success("Sub-assembly updated successfully");
      setIsEditModalOpen(false);
      seteditAssmebly({});
    } catch (error) {
      console.error("Error updating sub-assembly:", error);
      toast.error("Failed to update sub-assembly");
    }
  };

  const handlePartDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { _id } = itemToDelete;
      // Send DELETE request to remove the sub-assembly
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/assmebly/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete sub-assembly");
      }
      // Update the local state
      setListData((prevData) =>
        prevData.filter((subAssembly) => subAssembly._id !== _id)
      );
      toast.success("Sub-assembly deleted successfully");
      setDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting sub-assembly:", error);
      toast.error("Failed to delete sub-assembly");
    }
  };

  const handleSearch = () => {
    if (searchTerm) {
      const filteredData = ListData.filter((item) =>
        item.AssemblyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setListData(filteredData);
    } else {
      fetchSubAssemblies();
    }
  };

  const handleDuplicate = async () => {
    if (!itemToDuplicate) return;
    try {
      const { _id } = itemToDuplicate;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/assmebly/duplicate/${_id}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate sub-assembly");
      }

      const duplicatedSubAssembly = await response.json();

      // Update the local state
      setListData([...ListData, duplicatedSubAssembly]);

      toast.success("Sub-assembly duplicated successfully");
      setDuplicateModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error duplicating sub-assembly:", error);
      toast.error("Failed to duplicate sub-assembly");
    }
  };

  // const formatTime = (time) => {
  //   if (time === 0) {
  //     return 0;
  //   }

  //   let result = "";

  //   const hours = Math.floor(time);
  //   const minutes = Math.round((time - hours) * 60);

  //   if (hours > 0) {
  //     result += `${hours}h `;
  //   }

  //   if (minutes > 0 || (hours === 0 && minutes !== 0)) {
  //     result += `${minutes}m`;
  //   }

  //   return result.trim();
  // };

  const formatTime = (time) => {
    if (time === 0) {
      return "0 m";
    }
  
    const totalMinutes = Math.round(time * 60); // Convert hours to minutes
    return `${totalMinutes} m`;
  };
  return (
    <React.Fragment>
      <div className="">
        <Row className="g-4 mb-3">
          <div className="col-sm-auto">
            <div>
              <Button
                color="success"
                className="add-btn me-1"
                id="create-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <i className="ri-add-line align-bottom me-1"></i> Add Assembly
              </Button>
              
            </div>
          </div>
          <div className="col-sm-7 ms-auto">
            <div className="d-flex justify-content-sm-end gap-2">
              <div className="d-flex search-box ms-2 col-sm-7">
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i
                  className="ri-search-line search-icon ml-2"
                  style={{ marginTop: "-1px" }}
                ></i>
              </div>
            </div>
          </div>
        </Row>

        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ fontWeight: "bold" }}>Assembly Name</th>
              <th style={{ fontWeight: "bold" }}>Assembly ID</th>
              <th style={{ fontWeight: "bold" }}>Total Cost</th>
              <th style={{ fontWeight: "bold" }}>Total Hours</th>
              <th style={{ fontWeight: "bold" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {ListData.map((assembly, index) => (
              <tr key={index}>
                <td>
                  <Link
                    to={`/singleAssembly/${assembly._id}`}
                    className="text-body text-primary"
                    style={{ color: "#007bff", textDecoration: "none" }}
                    state={{ AssemblyName: assembly.AssemblyName }}
                  >
                    {assembly.AssemblyName}
                  </Link>
                </td>
                <td>{assembly.AssemblyNumber}</td>
                <td>{Math.ceil(assembly.costPerUnit || 0)}</td>
                <td>{formatTime(assembly.timePerUnit || 0)}</td>
                <td>
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="button"
                      className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                    >
                      <FeatherIcon icon="more-horizontal" className="icon-sm" />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem
                        onClick={() => toggleDeleteModal(assembly)}
                      >
                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                        Remove
                      </DropdownItem>

                      <DropdownItem
                        onClick={() => toggleDuplicateModal(assembly)}
                      >
                        <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                        Duplicate
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => handleEditClick(assembly)}
                      >
                        <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                        Edit
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Add Sub Assembly
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            <Label for="AssemblyName">Sub Assembly Name</Label>
            <Input
              type="text"
              id="AssemblyName"
              placeholder="Enter sub assembly name"
              value={newAssemblyName}
              onChange={(e) => setNewAssemblyName(e.target.value)}
            />
          </div>

          <div className="form-group mt-3">
            <Label for="AssemblyNumber">Sub Assembly Number</Label>
            <Input
              type="text"
              id="AssemblyNumber"
              placeholder="Enter sub assembly number"
              value={newAssemblyNumber}
              onChange={(e) => setNewAssemblyNumber(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddPart}>
            Add
          </Button>{" "}
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} toggle={() => setIsEditModalOpen(false)}>
        <ModalHeader>
          <Button color="close" onClick={() => setIsEditModalOpen(false)}>
            &times;
          </Button>
          Edit Sub Assembly
        </ModalHeader>
        <ModalBody>
          <Label>Sub Assembly Name</Label>
          <Input
            value={editAssmebly.AssemblyName}
            onChange={(e) =>
              seteditAssmebly({
                ...editAssmebly,
                AssemblyName: e.target.value,
              })
            }
          />
          <Label>Sub Assembly Number</Label>
          <Input
            value={editAssmebly.AssemblyNumber}
            onChange={(e) =>
              seteditAssmebly({
                ...editAssmebly,
                AssemblyNumber: e.target.value,
              })
            }
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleEdit}>
            Update
          </Button>
          <Button color="secondary" onClick={() => setIsEditModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* delete modal */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
        <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete the sub-assembly{" "}
          <strong>{itemToDelete?.AssemblyName}</strong>?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handlePartDelete}>
            Delete
          </Button>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* modal for duplicate creation */}
      <Modal
        isOpen={duplicateModalOpen}
        toggle={() => setDuplicateModalOpen(!duplicateModalOpen)}
      >
        <ModalHeader toggle={() => setDuplicateModalOpen(false)}>
          Confirm Duplication
        </ModalHeader>
        <ModalBody>
          Are you sure you want to duplicate the sub-assembly{" "}
          <strong>{itemToDuplicate?.AssemblyName}</strong>?
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button
            color="secondary"
            onClick={() => setDuplicateModalOpen(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};
