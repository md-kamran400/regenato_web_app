// react imports
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

// third party impprts
import { Link } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  ModalFooter,
  Row,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  Button,
  ListGroup,
  ListGroupItem,
  Dropdown,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";
import "./project.css";

import { Puff } from "react-loader-spinner";

// component import
import DeleteModal from "../../../Components/Common/DeleteModal";
import PaginatedList from "../Pagination/PaginatedList";

const List = () => {
  const [modal_list, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [modal_category, setModal_category] = useState(false);
  const [projectListsData, setprojectListsData] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state

  // loader
  const [isLoading, setIsLoading] = useState(true);
  const [newprojectName, setNewprojectName] = useState(""); // For storing new part name
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [timePerUnit, setTimePerUnit] = useState(0);
  const [stockPOQty, setStockPOQty] = useState(0);
  const [posting, setPosting] = useState(false);
  const [totalCountCost, setTotalCostCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null); // State for handling errors
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [projectType, setProjectType] = useState("");
  const itemsPerPage = 25;
  const [formData, setFormData] = useState({
    projectName: "",
    costPerUnit: "",
    timePerUnit: "",
    stockPOQty: "",
  });

  console.log("hlsfhj");
  // totalCountstring
  const handleSingleProjectTotalCount = (newTotal) => {
    setTotalCostCount(newTotal);
  };

  const toggleModal = () => {
    setModalList(!modal_list);
  };

  // function to toggle edit the modal
  const toggleEditModal = (item = null) => {
    if (item) {
      // Pre-fill the modal with data from the selected item
      setFormData({
        projectName: item.projectName,
        costPerUnit: item.costPerUnit,
        timePerUnit: item.timePerUnit,
        stockPOQty: item.stockPOQty,
      });
      setEditId(item._id); // Save the ID for the PUT request
    } else {
      // Clear form data if no item is selected
      setFormData({
        projectName: "",
        costPerUnit: 0,
        timePerUnit: 0,
        stockPOQty: 0,
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const toggleModalCategory = () => {
    setModal_category(!modal_category);
  };
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setprojectListsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered and Paginated Data
  const filteredData = projectListsData.filter((item) =>
    item.projectName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle adding a new part
  const handleAddPart = async () => {
    if (newprojectName.trim() !== "" && projectType !== "") {
      const newPart = {
        projectName: newprojectName,
        costPerUnit: 0,
        timePerUnit: 0,
        stockPoQty: 0,
        projectType: projectType,
      };
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newPart),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add the part");
        }

        const addedPart = await response.json();
        setprojectListsData((prevData) => [...prevData, addedPart]);
        toast.success("Part added successfully!");
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setNewprojectName("");
        setProjectType("");
        toggleModal();
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${editId}`,
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
        await fetchData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }
      setFormData({
        projectName: "",
        costPerUnit: "",
        timePerUnit: "",
        stockPOQty: "",
      });
      toggleEditModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // handleing the deletion functionlaity
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchData(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  const activebtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };
  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => handleDeleteProjectList()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Row className="g-4 mb-3">
        <div className="col-sm-auto">
          <div>
            <Button className="btn btn-success" onClick={toggleModal}>
              <i className="ri-add-line align-bottom me-1"></i> Add New
            </Button>
          </div>
        </div>
        <div className="col-sm-7 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2">
            <div className="search-box ms-2 col-sm-7">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </div>
        </div>
      </Row>

      <>
        {isLoading && (
          <div className="loader-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost per Unit</th>
              <th>Total Hours</th>
              <th>On Hand</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index}>
                <td style={{ color: "blue", textDecoration: "underline" }}>
                  <Link
                    to={`/projectSection/${item._id}`}
                    className="text-body"
                  >
                    {item.projectName}
                  </Link>
                </td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="button"
                      className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                    >
                      <FeatherIcon icon="more-horizontal" className="icon-sm" />
                    </DropdownToggle>

                    <DropdownMenu className="dropdown-menu-end">
                      <DropdownItem onClick={() => toggleEditModal(item)}>
                        <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                        Edit
                      </DropdownItem>
                      <div className="dropdown-divider"></div>
                      <DropdownItem
                        href="#"
                        onClick={() => {
                          setSelectedId(item._id);
                          tog_delete();
                        }}
                      >
                        <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                        Remove
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
      </>
      {/* Modal for adding a new item */}
      <Modal isOpen={modal_list} toggle={toggleModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal}>
          {" "}
          Add Project{" "}
        </ModalHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPart();
          }}
        >
          <ModalBody>
            <div className="mb-3">
              <label htmlFor="parts-field" className="form-label">
                Project Name
              </label>
              <input
                type="text"
                id="parts-field"
                className="form-control"
                placeholder="Enter Name"
                value={newprojectName}
                onChange={(e) => setNewprojectName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="project-type" className="form-label">
                Select Type
              </label>
              <Input
                type="select"
                id="project-type"
                className="form-control"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                required
              >
                <option value="">Select a type</option>
                <option value="External PO">External PO</option>
                <option value="Internal PO">Internal PO</option>
                <option value="PO Type 1">PO Type 1</option>
                <option value="PO Type 2">PO Type 2</option>
              </Input>
            </div>
            <Button type="submit" color="primary">
              Add Project
            </Button>
          </ModalBody>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modal_edit} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>Edit Part</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="projectName" className="form-label">
                Name
              </label>
              <Input
                type="text"
                id="projectName"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="costPerUnit" className="form-label">
                Cost Per Unit
              </label>
              <Input
                type="number"
                id="costPerUnit"
                value={formData.costPerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPerUnit: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="timePerUnit" className="form-label">
                Total Hours
              </label>
              <Input
                type="number"
                id="timePerUnit"
                value={formData.timePerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timePerUnit: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stockPOQty" className="form-label">
                On Hand
              </label>
              <Input
                type="number"
                id="stockPOQty"
                value={formData.stockPOQty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockPOQty: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Update
              </Button>
              <Button type="button" color="secondary" onClick={toggleEditModal}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* delete modal */}
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
    </React.Fragment>
  );
};

export default List;
