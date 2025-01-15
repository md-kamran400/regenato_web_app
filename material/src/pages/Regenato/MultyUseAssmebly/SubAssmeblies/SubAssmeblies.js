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

export const SubAssmeblies = () => {
  const [ListData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubAssemblyData, setEditSubAssemblyData] = useState({});
  const [newSubAssemblyName, setNewSubAssemblyName] = useState("");
  const [newSubAssemblyNumber, setNewSubAssemblyNumber] = useState("");

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
      const data = await response.json();
      setListData([...ListData, data]);
      toast.success("Records Added Successfully");
      setIsModalOpen(false);
      setNewSubAssemblyName("");
      setNewSubAssemblyNumber("");
    } catch (error) {
      console.error("Error adding part:", error);
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

  return (
    <React.Fragment>
      <div className="p-3">
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
              <th style={{ fontWeight: "bold" }}>Sub-Assembly Name</th>
              <th style={{ fontWeight: "bold" }}>Sub-Assembly Number</th>
              <th style={{ fontWeight: "bold" }}>Total Cost</th>
              <th style={{ fontWeight: "bold" }}>Total Hours</th>
              <th style={{ fontWeight: "bold" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {ListData.map((subAssembly, index) => (
              <tr key={index}>
                <td>
                  <Link
                    to={`/regenato-single-subAssmebly`}
                    className="text-body text-primary"
                    style={{ color: "#007bff", textDecoration: "none" }}
                  >
                    {subAssembly.subAssemblyName}
                  </Link>
                </td>
                <td>{subAssembly.SubAssemblyNumber}</td>
                <td>--</td>
                <td>--</td>
                <td>
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="button"
                      className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                    >
                      <FeatherIcon icon="more-horizontal" className="icon-sm" />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem>
                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                        Remove
                      </DropdownItem>
                      <DropdownItem>
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
    </React.Fragment>
  );
};
