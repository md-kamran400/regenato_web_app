import React, { useState, useCallback, useEffect } from "react";
import "../project.css";
import {
  Card,
  Button,
  CardBody,
  Col,
  Row,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Label,
  FormGroup,
  UncontrolledAccordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { FiEdit } from "react-icons/fi";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FiSettings } from "react-icons/fi";
import RawMaterial from "./OutersubassemblyexFolders/RawMaterial";
import Shipment from "./OutersubassemblyexFolders/Shipment";
import Overheads from "./OutersubassemblyexFolders/Overheads";
import { useParams } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import Manufacturing from "./OutersubassemblyexFolders/Manufacturing";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";

const OuterSubAssmebly = React.memo(
  ({
    subAssemblyItem,
    projectId,
    onUpdatePrts,
    subAssemblyId,
    setSubAssemblyItems,
  }) => {
    const { _id } = useParams();
    const [modalAdd, setModalAdd] = useState(false);
    const [modal_delete, setModalDelete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [partsData, setPartsData] = useState([]);
    const [partDetails, setPartDetails] = useState([]);
    const [listData, setListData] = useState([]);
    const [posting, setPosting] = useState(false);
    // Assuming parts array is populated
    const [quantity, setQuantity] = useState(0);
    const [parts, setParts] = useState([]);
    const [selectedPartData, setSelectedPartData] = useState(parts[0]);
    const [manufacturingVariables, setManufacturingVariables] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [costPerUnit, setCostPerUnit] = useState("");
    const [timePerUnit, setTimePerUnit] = useState("");
    const [detailedPartData, setDetailedPartData] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [projectType, setprojectType] = useState("");
    const [partId, setPartId] = useState("");
    const [partsListItems, setPartsListsItems] = useState([]);
    const [partsDisplay, setPartsDisplay] = useState([]);
    const [assemblyItems, setAssemblyItems] = useState([]);
    // const [subAssemblyItems, setSubAssemblyItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [partsListItemsUpdated, setPartsListItemsUpdated] = useState(false);
    const [codeName, setCodeName] = useState("");
    const [editModal, setEditModal] = useState(false);
    // const [editModal, setEditModal] = useState(false);
    const [subAssemblyName, setsubAssemblyName] = useState("");
    const [selectedPartsList, setSelectedPartsList] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [editQuantityModal, setEditQuantityModal] = useState(false);

    //for setting icons
    const [modalOpenId, setModalOpenId] = useState(null);

    const tog_delete = () => {
      setModalDelete(!modal_delete);
    };

    const toggleModal = (item) => {
      setModalOpenId((prevId) => (prevId === item._id ? null : item._id));
    };

    const toggleDeleteModal = (item) => {
      setDeleteModal(!deleteModal);
      setItemToDelete(item);
    };

    const toggleEditModal = (partsList) => {
      setEditModal(!editModal);
      setSelectedPartsList(partsList);
    };
    useEffect(() => {
      if (editModal && selectedPartsList) {
        setsubAssemblyName(selectedPartsList.subAssemblyName);
      }
    }, [editModal, selectedPartsList]);

    const handleDelete = async () => {
      try {
        const response = await fetch(
          ` ${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/subAssemblyListFirst/${subAssemblyItem._id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete part");
        }

        const updatedProject = await response.json();
        // updatePartsLists(updatedProject);
        onUpdatePrts(updatedProject);
        setModalDelete(false);
        toast.success("Records Deleted Successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete Records. Please try again.");
      }
    };

    const handleSubAssemblyPartDelete = async () => {
      if (!itemToDelete) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/subAssembly/${subAssemblyItem._id}/part/${itemToDelete._id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete sub-assembly part");
        }

        const updatedProject = await response.json();
        onUpdatePrts(updatedProject);
        setDeleteModal(false);
        setItemToDelete(null);
        toast.success("Records Deleted Duccessfully");
      } catch (error) {
        console.error("Error deleting sub-assembly part:", error);
        toast.error("Failed to delete Records. Please try again.");
      }
    };

    const handleEdit = async (e) => {
      e.preventDefault();
      const subAssemblyName = e.target.subAssemblyName.value;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/subAssemblyListFirst/${subAssemblyItem._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ subAssemblyName }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        onUpdatePrts(data);
        toast.success("Records Updated Successfully");
        toggleEditModal(false);
      } catch (error) {
        console.error("Error updating parts list:", error);
        // Handle the error (e.g., show an error message to the user)
      }
    };

    const [machinesTBU, setMachinesTBU] = useState({});
    // duplicate creation useState

    // fetching
    useEffect(() => {
      const fetchPartsListItems = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst/${subAssemblyItem._id}/items`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setPartsListsItems(data);
        } catch (error) {
          console.error("Error fetching parts list items:", error);
        }
      };

      fetchPartsListItems();
    }, [_id, subAssemblyItem, partsListItemsUpdated]);

    // Add this useEffect to reset the partsListItemsUpdated state
    useEffect(() => {
      setPartsListItemsUpdated(false);
    }, [partsListItemsUpdated]);

    const toggleAddModal = () => {
      setModalAdd(!modalAdd);
    };

    useEffect(() => {
      const fetchParts = async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts`
        );
        const data = await response.json();
        setParts(data);
      };

      const fetchManufacturingVariables = async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
        );
        const data = await response.json();
        setManufacturingVariables(data);

        setMachinesTBU((prev) => ({
          ...prev,
          ...data.reduce((acc, item) => ({ ...acc, [item.name]: 6 }), {}),
        }));
      };

      fetchParts();
      fetchManufacturingVariables();
    }, []);

    const fetchData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setListData(data);
        setPartsData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const fetchDetailedPartData = useCallback(async (partName) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts`
        );
        const data = await response.json();
        const partData = data.find((part) => part.partName === partName);
        if (partData) {
          setDetailedPartData(partData);
        } else {
          setDetailedPartData({});
        }
      } catch (error) {
        console.error("Error fetching detailed part data:", error);
        setDetailedPartData({});
      }
    }, []);

    useEffect(() => {
      if (selectedPartData && selectedPartData.partName) {
        fetchDetailedPartData(selectedPartData.partName);
      } else {
        setDetailedPartData({});
      }
    }, [selectedPartData, fetchDetailedPartData]);

    useEffect(() => {
      if (selectedPartData && selectedPartData.partName) {
        setDetailedPartData(selectedPartData);
      } else {
        setDetailedPartData({});
      }
    }, [selectedPartData]);
    // In the handleAutocompleteChange function

    const handleAutocompleteChange = (event, newValue) => {
      if (newValue) {
        const selectedPart = parts.find(
          (part) => part.partName === newValue.partName
        );
        if (selectedPart) {
          setSelectedPartData(selectedPart);
          setDetailedPartData({ ...selectedPart });
          setCostPerUnit(selectedPart.costPerUnit || "");
          setTimePerUnit(selectedPart.timePerUnit || "");
          setQuantity(1);
          setPartId(selectedPart.id || "");
          setCodeName(selectedPart.codeName || "");
        } else {
          setSelectedPartData(null);
          setDetailedPartData({});
          setCostPerUnit("");
          setTimePerUnit("");
          setQuantity(0);
          setPartId("");
          setCodeName("");
        }
      } else {
        setSelectedPartData(null);
        setDetailedPartData({});
        setCostPerUnit("");
        setTimePerUnit("");
        setQuantity(0);
        setPartId("");
        setCodeName("");
      }
    };

    const fetchProjectDetails = useCallback(async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
        );
        const data = await response.json();
        setProjectName(data.projectName || "");
        setprojectType(data.projectType || "");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, [_id]);

    useEffect(() => {
      fetchProjectDetails();
    }, [fetchProjectDetails]);

    const PartsTableFetch = useCallback(async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists`
        );
        const data = await response.json();
        setPartsDisplay(data.partsListItems || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, [_id]);

    useEffect(() => {
      PartsTableFetch();
    }, [PartsTableFetch]);

    const handleSubmit = async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      const payload = {
        partName: selectedPartData.partName,
        codeName: codeName,
        costPerUnit: Number(costPerUnit),
        timePerUnit: Number(timePerUnit),
        quantity: Number(quantity),
        rmVariables: selectedPartData.rmVariables || [],
        manufacturingVariables: selectedPartData.manufacturingVariables || [],
        shipmentVariables: selectedPartData.shipmentVariables || [],
        overheadsAndProfits: selectedPartData.overheadsAndProfits || [],
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/subAssemblyListFirst/${subAssemblyItem._id}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add part");
        }

        const newPart = await response.json();
        onUpdatePrts(newPart);
        setModalAdd(false);
        toast.success("Part added successfully");
      } catch (error) {
        console.error("Error adding part:", error);
        toast.error("Failed to add part. Please try again.");
      } finally {
        setIsSubmitting(false);
        setIsLoading(false);
      }
    };

    const handleEditQuantity = (item) => {
      setItemToEdit(item);
      setEditQuantityModal(true);
    };

    const handleSubmitEditQuantity = async () => {
      if (!itemToEdit) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/subAssembly/${subAssemblyItem._id}/part/${itemToEdit._id}/`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: itemToEdit.quantity }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update quantity");
        }
        const data = await response.json();
        setSubAssemblyItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemToEdit._id
              ? { ...item, quantity: data.quantity }
              : item
          )
        );
        onUpdatePrts(data);

        toast.success("Quantity updated successfully");
        setEditQuantityModal(false);
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("Failed to update quantity. Please try again.");
      }
    };

    if (loading)
      return (
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );

    if (error) return <div>Error: {error}</div>;

    // Toggle function for expanding/collapsing the row
    const handleRowClickParts = async (rowId, partName) => {
      setExpandedRowId(expandedRowId === rowId ? null : rowId);

      const matchingPart = parts.find((part) => part.partName === partName);
      if (matchingPart) {
        await fetchDetailedPartData(partName); // Fetch data for the selected part
      } else {
        console.error("Part not found in parts list.");
        setDetailedPartData({}); // Clear data if not found
      }
    };

    const updateManufacturingVariable = (updatedVariable) => {
      setPartDetails((prevData) => {
        const updatedAllProjects = prevData.allProjects?.map((project) => {
          if (project._id === updatedVariable.projectId) {
            return {
              ...project,
              manufacturingVariables: project.manufacturingVariables.map(
                (variable) => {
                  if (variable._id === updatedVariable._id) {
                    return updatedVariable;
                  }
                  return variable;
                }
              ),
            };
          }
          return project;
        });
        return {
          ...prevData,
          allProjects: updatedAllProjects,
        };
      });
    };

    const formatTime = (time) => {
      if (time === 0) {
        return "0 m";
      }

      const totalMinutes = Math.round(time * 60); // Convert hours to minutes
      return `${totalMinutes} m`;
    };

    return (
      <>
        {isLoading && (
          <div className="loader-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <Col
          lg={12}
          style={{
            boxSizing: "border-box",
            borderTop: "20px solid rgb(240, 101, 72)",
            borderRadius: "5px",
          }}
        >
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div
                    style={{
                      width: "100%",
                      padding: "5px 10px 0px 10px",
                      borderRadius: "3px",
                    }}
                    className="button-group flex justify-content-between align-items-center"
                    // danger primary
                  >
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        fontWeight: "600",
                      }}
                    >
                      <li style={{ fontSize: "25px", marginBottom: "5px" }}>
                        {subAssemblyItem.subAssemblyName}
                      </li>

                      <li style={{ fontSize: "19px" }}>
                        <span class="badge bg-danger-subtle text-danger">
                          Sub Assembly
                        </span>
                      </li>
                    </ul>

                    <UncontrolledDropdown direction="left">
                      <DropdownToggle
                        tag="button"
                        className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                      >
                        <FeatherIcon
                          style={{ fontWeight: "600" }}
                          icon="more-horizontal"
                          className="icon-sm"
                        />
                      </DropdownToggle>

                      <DropdownMenu className="dropdown-menu-start">
                        <DropdownItem
                          href="#"
                          onClick={() => toggleEditModal(subAssemblyItem)}
                        >
                          <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                          Edit
                        </DropdownItem>

                        <DropdownItem
                          href="#"
                          onClick={() => {
                            setSelectedId(subAssemblyItem._id);
                            tog_delete();
                          }}
                        >
                          <i className="ri-delete-bin-6-line align-bottom me-2 text-muted"></i>{" "}
                          Delete
                        </DropdownItem>

                        <div className="dropdown-divider"></div>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </div>
                  <div className="button-group">
                    <Button
                      color="danger"
                      className="add-btn"
                      onClick={toggleAddModal}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Part
                    </Button>
                  </div>

                  <div className="table-wrapper">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th onClick={() => handleRowClickParts("name")}>
                            Name
                          </th>
                          <th>Cost Per Unit</th>
                          <th>Machining Hours</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Total Machining Hours</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subAssemblyItem.partsListItems?.map((item) => (
                          <React.Fragment key={item._id}>
                            <tr
                              onClick={() =>
                                handleRowClickParts(item._id, item.partName)
                              }
                              className={
                                expandedRowId === item._id ? "expanded" : ""
                              }
                            >
                              <td
                                style={{ cursor: "pointer", color: "#64B5F6" }}
                                className="parent_partName"
                              >
                                {item.partName} ({item.Uid || ""}){" "}
                                {item.codeName || ""}
                              </td>
                              <td>
                                {Math.round(parseFloat(item.costPerUnit || 0))}
                              </td>
                              <td>{formatTime(item.timePerUnit || 0)}</td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "60%",
                                  }}
                                >
                                  {parseInt(item.quantity || 0)}
                                  <button
                                    className="btn btn-sm btn-success edit-item-btn"
                                    onClick={() => handleEditQuantity(item)}
                                  >
                                    <FaEdit />
                                  </button>
                                </div>
                              </td>
                              <td>
                                {Math.round(
                                  parseFloat(item.costPerUnit || 0) *
                                    parseInt(item.quantity || 0)
                                )}
                              </td>
                              <td>
                                {formatTime(
                                  parseFloat(item.timePerUnit || 0) *
                                    parseInt(item.quantity || 0)
                                )}
                              </td>

                              <td className="action-cell">
                                <div className="action-buttons">
                                  <span
                                    style={{
                                      color: "blue",
                                      cursor: "pointer",
                                      marginRight: "2px",
                                    }}
                                  >
                                    <FiSettings
                                      size={20}
                                      onClick={() => toggleModal(item)}
                                      className={`settings-icon ${
                                        modalOpenId === item._id ? "rotate" : ""
                                      }`}
                                    />
                                  </span>
                                  <span
                                    style={{ color: "red", cursor: "pointer" }}
                                  >
                                    <MdOutlineDelete
                                      size={25}
                                      onClick={() => toggleDeleteModal(item)}
                                    />
                                  </span>
                                </div>
                              </td>
                            </tr>

                            {modalOpenId === item._id && (
                              <Modal
                                isOpen={true}
                                toggle={() => setModalOpenId(null)}
                                style={{ maxWidth: "80%" }}
                              >
                                <ModalHeader
                                  toggle={() => setModalOpenId(null)}
                                >
                                  <h5
                                    className="mb-3 d-flex align-items-center"
                                    style={{
                                      fontWeight: "bold",
                                      color: "#333",
                                    }}
                                  >
                                    <FiSettings
                                      style={{
                                        fontSize: "1.2rem",
                                        marginRight: "10px",
                                        color: "#2563eb",
                                        fontWeight: "bold",
                                      }}
                                    />
                                    {item.partName}
                                  </h5>
                                </ModalHeader>
                                <ModalBody>
                                  <div>
                                    <div style={{ marginBottom: "20px" }}>
                                      <RawMaterial
                                        partName={item.partName}
                                        rmVariables={item.rmVariables || []}
                                        projectId={projectId}
                                        partId={item._id}
                                        subAssemblyId={subAssemblyId}
                                        rawMatarialsUpdate={onUpdatePrts}
                                        quantity={item.quantity}
                                      />
                                    </div>
                                    <div style={{ marginBottom: "20px" }}>
                                      <Manufacturing
                                        partName={item.partName}
                                        manufacturingVariables={
                                          item.manufacturingVariables || []
                                        }
                                        projectId={projectId}
                                        partId={item._id}
                                        subAssemblyId={subAssemblyId}
                                        manufatcuringUpdate={onUpdatePrts}
                                        quantity={item.quantity}
                                      />
                                    </div>
                                    <div style={{ marginBottom: "20px" }}>
                                      <Shipment
                                        partName={item.partName}
                                        shipmentVariables={
                                          item.shipmentVariables || []
                                        }
                                        projectId={projectId}
                                        partId={item._id}
                                        subAssemblyId={subAssemblyId}
                                        shipmentUpdate={onUpdatePrts}
                                        quantity={item.quantity}
                                      />
                                    </div>
                                    <div>
                                      <Overheads
                                        partName={item.partName}
                                        overheadsAndProfits={
                                          item.overheadsAndProfits || []
                                        }
                                        projectId={projectId}
                                        partId={item._id}
                                        subAssemblyId={subAssemblyId}
                                        overHeadsUpdate={onUpdatePrts}
                                        quantity={item.quantity}
                                      />
                                    </div>
                                  </div>
                                </ModalBody>
                              </Modal>
                            )}

                            {/* {expandedRowId === item._id && (
                              <tr className="details-row">
                                <td colSpan={6}>
                                  <div className="details-box">
                                    <h5
                                      className="mb-3 d-flex align-items-center"
                                      style={{
                                        fontWeight: "bold",
                                        color: "#333",
                                      }}
                                    >
                                      <FiSettings
                                        style={{
                                          fontSize: "1.2rem",
                                          marginRight: "10px",
                                          color: "#2563eb",
                                          fontWeight: "bold",
                                        }}
                                      />
                                      {item.partName}
                                    </h5>


                                    <RawMaterial
                                      partName={item.partName}
                                      rmVariables={item.rmVariables || []}
                                      projectId={projectId}
                                      partId={item._id}
                                      subAssemblyId={subAssemblyId}
                                      rawMatarialsUpdate={onUpdatePrts}
                                      quantity={item.quantity}
                                    />

                                    <Manufacturing
                                      partName={item.partName}
                                      manufacturingVariables={
                                        item.manufacturingVariables || []
                                      }
                                      projectId={projectId}
                                      partId={item._id}
                                      subAssemblyId={subAssemblyId}
                                      manufatcuringUpdate={onUpdatePrts}
                                      quantity={item.quantity}
                                    />

                                    <Shipment
                                      partName={item.partName}
                                      shipmentVariables={
                                        item.shipmentVariables || []
                                      }
                                      projectId={projectId}
                                      partId={item._id}
                                      subAssemblyId={subAssemblyId}
                                      shipmentUpdate={onUpdatePrts}
                                      quantity={item.quantity}
                                    />
                                    <Overheads
                                      partName={item.partName}
                                      overheadsAndProfits={
                                        item.overheadsAndProfits || []
                                      }
                                      projectId={projectId}
                                      partId={item._id}
                                      subAssemblyId={subAssemblyId}
                                      overHeadsUpdate={onUpdatePrts}
                                      quantity={item.quantity}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )} */}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Modal isOpen={modalAdd} toggle={toggleAddModal}>
            <ModalHeader toggle={toggleAddModal}>Add Part</ModalHeader>
            <ModalBody>
              <form onSubmit={handleSubmit}>
                <Autocomplete
                  options={parts}
                  getOptionLabel={(option) =>
                    `${option.partName} - ${option.id}`
                  }
                  onChange={handleAutocompleteChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Part"
                      variant="outlined"
                      // required
                    />
                  )}
                />
                <div className="form-group" style={{ display: "none" }}>
                  <Label for="partId" className="form-label">
                    Part ID
                  </Label>
                  <Input
                    className="form-control"
                    type="text"
                    id="partId"
                    value={partId}
                    onChange={(e) => setPartId(e.target.value)}
                    // required
                  />
                </div>
                <div className="form-group" style={{ display: "none" }}>
                  <Label for="codeName" className="form-label">
                    Code Name
                  </Label>
                  <Input
                    className="form-control"
                    type="text"
                    id="codeName"
                    value={codeName}
                    onChange={(e) => setCodeName(e.target.value)}
                    // required
                  />
                </div>
                <div className="form-group" style={{ display: "none" }}>
                  <Label for="costPerUnit" className="form-label">
                    Cost Per Unit
                  </Label>
                  <Input
                    className="form-control"
                    type="number"
                    step="any"
                    id="costPerUnit"
                    value={Math.round(costPerUnit)}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                    // required
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                <div className="form-group" style={{ display: "none" }}>
                  <Label for="timePerUnit" className="form-label">
                    Time Per Unit
                  </Label>
                  <Input
                    className="form-control"
                    type="number"
                    step="any"
                    id="timePerUnit"
                    value={Math.round(timePerUnit)}
                    onChange={(e) => setTimePerUnit(e.target.value)}
                    // required
                    onWheel={(e) => e.target.blur()}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                <div className="form-group">
                  <Label for="quantity" className="form-label">
                    Quantity
                  </Label>
                  <Input
                    className="form-control"
                    type="number"
                    id="quantity"
                    value={quantity.toString()}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === "" || /^\d+$/.test(inputValue)) {
                        setQuantity(
                          inputValue === "" ? 0 : parseInt(inputValue)
                        );
                      }
                    }}
                    required
                  />
                </div>
                <div style={{ display: "none" }}>
                  <UncontrolledAccordion defaultOpen="1">
                    {/* Raw Materials Accordion */}
                    <AccordionItem>
                      <AccordionHeader targetId="1">
                        Raw Materials
                      </AccordionHeader>
                      <AccordionBody
                        accordionId="1"
                        className="accordion-body-custom"
                      >
                        {detailedPartData.rmVariables?.map((rm, index) => (
                          <FormGroup
                            key={rm._id}
                            className="accordion-item-custom"
                          >
                            <Label className="accordion-label">{rm.name}</Label>
                            <Input
                              type="number"
                              className="accordion-input"
                              value={rm.netWeight || ""}
                              onChange={(e) =>
                                setDetailedPartData((prev) => ({
                                  ...prev,
                                  rmVariables: prev.rmVariables.map(
                                    (item, idx) =>
                                      idx === index
                                        ? { ...item, netWeight: e.target.value }
                                        : item
                                  ),
                                }))
                              }
                              placeholder="Enter net weight"
                            />
                            <Input
                              type="number"
                              className="accordion-input"
                              value={rm.pricePerKg || ""}
                              onChange={(e) =>
                                setDetailedPartData((prev) => ({
                                  ...prev,
                                  rmVariables: prev.rmVariables.map(
                                    (item, idx) =>
                                      idx === index
                                        ? {
                                            ...item,
                                            pricePerKg: e.target.value,
                                          }
                                        : item
                                  ),
                                }))
                              }
                              placeholder="Enter price per kg"
                            />
                            <p className="accordion-total-rate">
                              Total Rate: {rm.totalRate}
                            </p>
                          </FormGroup>
                        ))}
                      </AccordionBody>
                    </AccordionItem>

                    {/* Manufacturing Variable Accordion */}
                    <AccordionItem>
                      <AccordionHeader targetId="2">
                        Manufacturing Variable
                      </AccordionHeader>
                      <AccordionBody accordionId="2">
                        {detailedPartData.manufacturingVariables?.map(
                          (man, index) => (
                            <FormGroup
                              key={man._id}
                              className="accordion-item-custom"
                            >
                              <Label className="accordion-label">
                                {man.name}
                              </Label>
                              <Input
                                type="number"
                                className="accordion-input"
                                value={man.hours || ""}
                                onChange={(e) =>
                                  setDetailedPartData((prev) => ({
                                    ...prev,
                                    manufacturingVariables:
                                      prev.manufacturingVariables.map(
                                        (item, idx) =>
                                          idx === index
                                            ? { ...item, hours: e.target.value }
                                            : item
                                      ),
                                  }))
                                }
                                placeholder="Enter hours"
                              />
                              <Input
                                type="number"
                                className="accordion-input"
                                value={man.times || ""}
                                onChange={(e) =>
                                  setDetailedPartData((prev) => ({
                                    ...prev,
                                    manufacturingVariables:
                                      prev.manufacturingVariables.map(
                                        (item, idx) =>
                                          idx === index
                                            ? { ...item, times: e.target.value }
                                            : item
                                      ),
                                  }))
                                }
                                placeholder="Enter Times"
                              />
                              <Input
                                type="number"
                                className="accordion-input"
                                value={man.hourlyRate || ""}
                                onChange={(e) =>
                                  setDetailedPartData((prev) => ({
                                    ...prev,
                                    manufacturingVariables:
                                      prev.manufacturingVariables.map(
                                        (item, idx) =>
                                          idx === index
                                            ? {
                                                ...item,
                                                hourlyRate: e.target.value,
                                              }
                                            : item
                                      ),
                                  }))
                                }
                                placeholder="Enter hourly rate"
                              />
                              <p className="accordion-total-rate">
                                Total Rate: {man.totalRate}
                              </p>
                            </FormGroup>
                          )
                        )}
                      </AccordionBody>
                    </AccordionItem>

                    {/* Shipment Variable Accordion */}
                    <AccordionItem>
                      <AccordionHeader targetId="3">
                        Shipment Variable
                      </AccordionHeader>
                      <AccordionBody accordionId="3">
                        {detailedPartData.shipmentVariables?.map(
                          (ship, index) => (
                            <FormGroup
                              key={ship._id}
                              className="accordion-item-custom"
                            >
                              <Label className="accordion-label">
                                {ship.name}
                              </Label>
                              <Input
                                type="number"
                                className="accordion-input"
                                value={ship.hourlyRate || ""}
                                onChange={(e) =>
                                  setDetailedPartData((prev) => ({
                                    ...prev,
                                    shipmentVariables:
                                      prev.shipmentVariables.map((item, idx) =>
                                        idx === index
                                          ? {
                                              ...item,
                                              hourlyRate: e.target.value,
                                            }
                                          : item
                                      ),
                                  }))
                                }
                                placeholder="Enter hourly rate"
                              />
                              <p className="accordion-total-rate">
                                Total Rate: {ship.hourlyRate}
                              </p>
                            </FormGroup>
                          )
                        )}
                      </AccordionBody>
                    </AccordionItem>

                    {/* Overheads and Profit Accordion */}
                    <AccordionItem>
                      <AccordionHeader targetId="4">
                        Overheads and Profit
                      </AccordionHeader>
                      <AccordionBody accordionId="4">
                        {detailedPartData.overheadsAndProfits?.map(
                          (overhead, index) => (
                            <FormGroup
                              key={overhead._id}
                              className="accordion-item-custom"
                            >
                              <Label className="accordion-label">
                                {overhead.name}
                              </Label>
                              <Input
                                type="number"
                                className="accordion-input"
                                value={overhead.percentage || ""}
                                onChange={(e) =>
                                  setDetailedPartData((prev) => ({
                                    ...prev,
                                    overheadsAndProfits:
                                      prev.overheadsAndProfits.map(
                                        (item, idx) =>
                                          idx === index
                                            ? {
                                                ...item,
                                                percentage: e.target.value,
                                              }
                                            : item
                                      ),
                                  }))
                                }
                                placeholder="Enter percentage"
                              />
                              <p className="accordion-total-rate">
                                Total Rate: {overhead.totalRate}
                              </p>
                            </FormGroup>
                          )
                        )}
                      </AccordionBody>
                    </AccordionItem>
                  </UncontrolledAccordion>
                </div>

                <Button
                  style={{ marginLeft: "19rem" }}
                  type="submit"
                  color="primary"
                  disabled={!selectedPartData || !quantity || isSubmitting}
                >
                  {isSubmitting ? "Add" : "Add Parts"}
                </Button>
              </form>
            </ModalBody>
          </Modal>

          <Modal isOpen={modal_delete} toggle={tog_delete}>
            <ModalHeader toggle={tog_delete}>Confirm Delete</ModalHeader>
            <ModalBody>Are you sure you want to delete this part?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={handleDelete}>
                Delete
              </Button>
              <Button color="secondary" onClick={tog_delete}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={deleteModal} toggle={() => toggleDeleteModal(null)}>
            <ModalHeader toggle={() => toggleDeleteModal(null)}>
              Confirm Deletion
            </ModalHeader>
            <ModalBody>
              Are you sure you want to delete "{itemToDelete?.partName}" from
              the sub-assembly list?
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={handleSubAssemblyPartDelete}>
                Delete
              </Button>
              <Button color="secondary" onClick={() => toggleDeleteModal(null)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={editModal} toggle={() => toggleEditModal(false)}>
            <ModalHeader toggle={() => toggleEditModal(false)}>
              Edit Sub-Assembly
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <Label for="subAssemblyName">Sub-Assembly List Name</Label>
                  <Input
                    type="text"
                    id="subAssemblyName"
                    name="subAssemblyName"
                    defaultValue={subAssemblyName}
                    required
                  />
                </div>
                <ModalFooter>
                  <Button color="primary" type="submit">
                    Save Changes
                  </Button>
                  <Button
                    color="secondary"
                    onClick={() => toggleEditModal(false)}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </form>
            </ModalBody>
          </Modal>

          {/* for edit the quantity */}
          <Modal
            isOpen={editQuantityModal}
            toggle={() => setEditQuantityModal(false)}
          >
            <ModalHeader toggle={() => setEditQuantityModal(false)}>
              Edit Quantity
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmitEditQuantity();
                }}
              >
                <Input
                  type="number"
                  value={itemToEdit?.quantity || 0}
                  onChange={(e) =>
                    setItemToEdit({
                      ...itemToEdit,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <Button type="submit" color="primary" className="mt-3">
                  Update Quantity
                </Button>
              </form>
            </ModalBody>
          </Modal>
        </Col>
      </>
    );
  }
);
export default OuterSubAssmebly;
