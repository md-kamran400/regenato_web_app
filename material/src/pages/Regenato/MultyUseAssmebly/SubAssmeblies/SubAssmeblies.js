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
import PaginatedList from "../../Pagination/PaginatedList";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { toast } from "react-toastify";
import "./subAssemblies.css"
export const SubAssmeblies = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [ListData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubAssemblyData, setEditSubAssemblyData] = useState({});
  const [newSubAssemblyName, setNewSubAssemblyName] = useState("");
  const [newSubAssemblyNumber, setNewSubAssemblyNumber] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [itemToDuplicate, setItemToDuplicate] = useState(null);
  const [totalPage, setTotalPages] = useState(1);

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
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly`
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

  // In SubAssmeblies.js

  // In SubAssmeblies.js

  const handleAddPart = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subAssemblyName: newSubAssemblyName,
            SubAssemblyNumber: newSubAssemblyNumber,
          }),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text(); // Get the error message from the response
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setListData([...ListData, data]);
      toast.success("Records Added Successfully");
      setIsModalOpen(false);
      setNewSubAssemblyName("");
      setNewSubAssemblyNumber("");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleEditClick = (subAssembly) => {
    setEditSubAssemblyData(subAssembly);
    setIsEditModalOpen(true);
  };

  const handleEdit = async () => {
    try {
      const { _id } = editSubAssemblyData;
      const { subAssemblyName, SubAssemblyNumber } = editSubAssemblyData;

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ subAssemblyName, SubAssemblyNumber }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update sub-assembly");
      }

      const updatedSubAssembly = await response.json();

      // Update the list with the edited item
      setListData(
        ListData.map((item) =>
          item._id === _id
            ? { ...item, subAssemblyName, SubAssemblyNumber }
            : item
        )
      );

      toast.success("Sub-assembly updated successfully");
      setIsEditModalOpen(false);
      setEditSubAssemblyData({});
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
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}`,
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

  const totalPages = Math.ceil(ListData.length / itemsPerPage);
  const paginatedData = ListData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    if (searchTerm) {
      const filteredData = ListData.filter((item) =>
        item.subAssemblyName.toLowerCase().includes(searchTerm.toLowerCase())
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
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/duplicate/${_id}`,
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
                <i className="ri-add-line align-bottom me-1"></i> Add Sub
                Assembly
              </Button>
            </div>
          </div>
          <div className="col-sm-7 ms-auto">
            <div className="d-flex justify-content-sm-end gap-2">
              <div className="d-flex search-box ms-2 col-sm-4">
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

        <table className="table table-striped vertical-lines horizontals-lines">
          <thead style={{backgroundColor:'#f3f4f6'}}>
            <tr>
              <th style={{ fontWeight: "bold" }}>Sub-Assembly Name</th>
              <th style={{ fontWeight: "bold" }}>Sub-Assembly ID</th>
              <th style={{ fontWeight: "bold" }}>Total Cost (INR)</th>
              <th style={{ fontWeight: "bold" }}>Total Hours</th>
              <th style={{ fontWeight: "bold" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData?.map((subAssembly, index) => (
              <tr key={index}>
                <td>
                  <Link
                    to={`/singleSubAssembly/${subAssembly._id}`}
                    className="text-body text-primary"
                    style={{ color: "#007bff", textDecoration: "none" }}
                    state={{ subAssemblyName: subAssembly.subAssemblyName }}
                  >
                    {subAssembly.subAssemblyName}
                  </Link>
                </td>
                <td>{subAssembly.SubAssemblyNumber}</td>
                <td>{Math.ceil(subAssembly.costPerUnit || 0)}</td>
                <td>{formatTime(subAssembly.timePerUnit || 0)}</td>
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
                        onClick={() => toggleDeleteModal(subAssembly)}
                      >
                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                        Remove
                      </DropdownItem>

                      <DropdownItem
                        onClick={() => toggleDuplicateModal(subAssembly)}
                      >
                        <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                        Duplicate
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => handleEditClick(subAssembly)}
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

        <PaginatedList
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Add Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Add Sub Assembly
        </ModalHeader>
        <ModalBody>
          <div className="form-group">
            <Label for="subAssemblyName">Sub Assembly Name</Label>
            <Input
              type="text"
              id="subAssemblyName"
              placeholder="Enter sub assembly name"
              value={newSubAssemblyName}
              onChange={(e) => setNewSubAssemblyName(e.target.value)}
            />
          </div>

          <div className="form-group mt-3">
            <Label for="subAssemblyNumber">Sub Assembly Number</Label>
            <Input
              type="text"
              id="subAssemblyNumber"
              placeholder="Enter sub assembly number"
              value={newSubAssemblyNumber}
              onChange={(e) => setNewSubAssemblyNumber(e.target.value)}
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
            value={editSubAssemblyData.subAssemblyName}
            onChange={(e) =>
              setEditSubAssemblyData({
                ...editSubAssemblyData,
                subAssemblyName: e.target.value,
              })
            }
          />
          <Label>Sub Assembly Number</Label>
          <Input
            value={editSubAssemblyData.SubAssemblyNumber}
            onChange={(e) =>
              setEditSubAssemblyData({
                ...editSubAssemblyData,
                SubAssemblyNumber: e.target.value,
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
          <strong>{itemToDelete?.subAssemblyName}</strong>?
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
          <strong>{itemToDuplicate?.subAssemblyName}</strong>?
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
