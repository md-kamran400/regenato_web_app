import React, { useState, useCallback, useEffect, memo } from "react"; //add parts list
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
import RawMaterial from "../ExpandFolders/RawMaterial";
import Shipment from "../ExpandFolders/Shipment";
import Overheads from "../ExpandFolders/Overheads";
import { useParams } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import Manufacturing from "../ExpandFolders/Manufacturing";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";

const PartsTable = React.memo(
  ({ partsList, partsListID, updatePartsLists, onAddPart, onUpdatePrts }) => {
    const { _id, listId } = useParams();
    const rm = "partsList";
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
    const [isLoading, setIsLoading] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [partsListItemsUpdated, setPartsListItemsUpdated] = useState(false);

    const [editModal, setEditModal] = useState(false);
    // const [editModal, setEditModal] = useState(false);
    const [partsListName, setPartsListName] = useState("");
    const [selectedPartsList, setSelectedPartsList] = useState(null);
    const toggleAddModal = () => {
      setModalAdd(!modalAdd);
    };

    // console.log(partsList._id);
    // console.log(updatePartsLists)

    // fetching
    useEffect(() => {
      const fetchPartsListItems = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}/items`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setPartsListsItems(data);
          // console.log("items data of parts lists", data);
        } catch (error) {
          console.error("Error fetching parts list items:", error);
          // You might want to handle the error, e.g., show an error message to the user
        }
      };

      fetchPartsListItems();
    }, [_id, partsList, partsListItemsUpdated]);

    useEffect(() => {
      setPartsListItemsUpdated(false);
    }, [partsListItemsUpdated]);

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

        // setMachinesTBU((prev) => ({
        //   ...prev,
        //   ...data.reduce((acc, item) => ({ ...acc, [item.name]: 6 }), {}),
        // }));
      };

      fetchParts();
      fetchManufacturingVariables();
    }, []);
    // deleting the part list items
    const tog_delete = () => {
      setModalDelete(!modal_delete);
    };

    // second function for deleteing the parts
    const toggleDeleteModal = (item) => {
      setDeleteModal(!deleteModal);
      setItemToDelete(item);
    };

    // Function to toggle the edit modal
    const toggleEditModal = (partsList) => {
      setEditModal(!editModal);
      setSelectedPartsList(partsList);
    };

    // useEffect to set partsListName when editModal is opened
    useEffect(() => {
      if (editModal && selectedPartsList) {
        setPartsListName(selectedPartsList.partsListName);
      }
    }, [editModal, selectedPartsList]);

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

    const handleAutocompleteChange = (event, newValue) => {
      if (newValue) {
        const selectedPart = parts.find(
          (part) => part.partName === newValue.partName
        );
        if (selectedPart) {
          setSelectedPartData(selectedPart);
          setDetailedPartData({ ...selectedPart });
          setCostPerUnit(
            selectedPart.partsCalculations?.[0]?.AvgragecostPerUnit || ""
          );
          setTimePerUnit(
            selectedPart.partsCalculations?.[0]?.AvgragetimePerUnit || ""
          );
          setQuantity(1);
          setPartId(selectedPart.id || "");
        } else {
          setSelectedPartData(null);
          setDetailedPartData({});
          setCostPerUnit("");
          setTimePerUnit("");
          setQuantity(0);
          setPartId("");
        }
      } else {
        setSelectedPartData(null);
        setDetailedPartData({});
        setCostPerUnit("");
        setTimePerUnit("");
        setQuantity(0);
        setPartId("");
      }
    };

    // const fetchProjectDetails = useCallback(async () => {
    //   try {
    //     const response = await fetch(
    //       `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
    //     );
    //     const data = await response.json();
    //     setProjectName(data.projectName || "");
    //     setprojectType(data.projectType || "");
    //   } catch (error) {
    //     setError(error.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // }, [_id]);

    // useEffect(() => {
    //   fetchProjectDetails();
    // }, [fetchProjectDetails]);

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
      setIsLoading(true);

      const payload = {
        partId: selectedPartData.id,
        partName: selectedPartData.partName,
        costPerUnit: Number(costPerUnit),
        timePerUnit: Number(timePerUnit),
        quantity: Number(quantity),
        rmVariables: detailedPartData.rmVariables || [],
        manufacturingVariables: detailedPartData.manufacturingVariables || [],
        shipmentVariables: detailedPartData.shipmentVariables || [],
        overheadsAndProfits: detailedPartData.overheadsAndProfits || [],
      };

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}/items`,
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

        // Update local state with new part
        setPartsListsItems((prevItems) => [...prevItems, newPart]);

        onUpdatePrts(newPart);

        setModalAdd(false);
        setIsLoading(false);
        toast.success("New Part List Added successfully");
        // Reset form
        setSelectedPartData(null);
        setCostPerUnit("");
        setTimePerUnit("");
        setQuantity(0);
        setDetailedPartData({});

        // Update the partsListItemsUpdated state
        setPartsListItemsUpdated(true);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to add part. Please try again.");
        toast.error("Failed to add part. Please try again.");
      } finally {
        setIsLoading(false);
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

    // const updateManufacturingVariable = (updatedVariable) => {
    //   setPartDetails((prevData) => {
    //     const updatedAllProjects = prevData.allProjects.map((project) => {
    //       if (project._id === updatedVariable.projectId) {
    //         return {
    //           ...project,
    //           manufacturingVariables: project.manufacturingVariables.map(
    //             (variable) => {
    //               if (variable._id === updatedVariable._id) {
    //                 return updatedVariable;
    //               }
    //               return variable;
    //             }
    //           ),
    //         };
    //       }
    //       return project;
    //     });
    //     return {
    //       ...prevData,
    //       allProjects: updatedAllProjects,
    //     };
    //   });
    // };
    const updateManufacturingVariable = (updatedVariable) => {
      setPartDetails((prevData) => {
        const updatedAllProjects = prevData.allProjects?.map((project) => {
          if (project._id === updatedVariable.projectId) {
            return {
              ...project,
              manufacturingVariables: (
                project.manufacturingVariables || []
              ).map((variable) => {
                if (variable._id === updatedVariable._id) {
                  return updatedVariable;
                }
                return variable;
              }),
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

    const handleDelete = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete part");
        }
        const updatedProject = await response.json();
        onUpdatePrts(updatedProject);
        // updatePartsLists(updatedProject);
        setModalDelete(false);

        toast.success("Part deleted successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete part. Please try again.");
      }
    };

    const handlePartDelete = async () => {
      if (!itemToDelete) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}/items/${itemToDelete._id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete part");
        }

        const updatedProject = await response.json();
        onUpdatePrts(updatedProject);
        setDeleteModal(false);
        setItemToDelete(null);
        toast.success("Part deleted successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete part. Please try again.");
      }
    };

    //edit
    //  `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}`,
    const handleEdit = async (e) => {
      e.preventDefault();
      const partsListName = e.target.partsListName.value;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ partsListName }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        onUpdatePrts(data);
        toggleEditModal(false);
        toast.success("Part Edited successfully");
      } catch (error) {
        console.error("Error updating parts list:", error);
        // Handle the error (e.g., show an error message to the user)
        toast.error("Failed to Edited part. Please try again.");
      }
    };

    // console.log(_id);

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
            borderTop: "20px solid rgb(69, 203, 133)",
            borderRadius: "5px",
          }}
        >
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div
                    style={{
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
                        {partsList.partsListName}
                      </li>

                      <li style={{ fontSize: "19px" }}>
                        <span class="badge bg-success-subtle text-success">
                          Parts
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
                        {/* <DropdownItem
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleEditModal(true, partsList._id);
                        }}
                      >
                        <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                        Edit
                      </DropdownItem> */}

                        <DropdownItem
                          href="#"
                          onClick={() => toggleEditModal(partsList)}
                        >
                          <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                          Edit
                        </DropdownItem>

                        <DropdownItem
                          href="#"
                          onClick={() => {
                            setSelectedId(partsList._id);
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
                      color="success"
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
                        {partsListItems.map((item) => (
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
                                {item.partName} ({item.Uid || ""})
                              </td>
                              <td>
                                {parseFloat(item.costPerUnit || 0).toFixed(2)}
                              </td>
                              <td>
                                {parseFloat(item.timePerUnit || 0).toFixed(2)}
                              </td>
                              <td>{parseInt(item.quantity || 0)}</td>
                              <td>
                                {(
                                  parseFloat(item.costPerUnit || 0) *
                                  parseInt(item.quantity || 0)
                                ).toFixed(2)}
                              </td>
                              <td>
                                {(
                                  parseFloat(item.timePerUnit || 0) *
                                  parseInt(item.quantity || 0)
                                ).toFixed(2)}
                              </td>

                              <td className="action-cell">
                                <div className="action-buttons">
                                  {/* <span>
                                    <FiEdit size={20} />
                                  </span> */}
                                  <span style={{color: "red", cursor: "pointer"}}>
                                    <MdOutlineDelete
                                      size={25}
                                      onClick={() => toggleDeleteModal(item)}
                                    />
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {expandedRowId === item._id && (
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
                                    {/* Raw Materials Section */}
                                    {/* <RawMaterial
                                      partName={item.partName}
                                      rmVariables={item.rmVariables || {}}
                                      projectId={_id}
                                      partId={item._id}
                                      source="partList"
                                    /> */}
                                    <RawMaterial
                                      partName={item.partName}
                                      rmVariables={item.rmVariables}
                                      projectId={_id} //project id
                                      partId={partsList._id} // parts List Id
                                      itemId={item._id} //items id
                                      source="partList"
                                      rawMatarialsUpdate={onUpdatePrts}
                                    />

                                    {/* <Manufacturing
                                      partName={item.partName}
                                      manufacturingVariables={
                                        item.manufacturingVariables || []
                                      }
                                      projectId={_id}
                                      partId={partsList._id}
                                      itemId={item._id}
                                      onUpdateVariable={
                                        updateManufacturingVariable
                                      }
                                      onTotalCountUpdate={() => {}}
                                      source="partList"
                                    /> */}
                                    <Manufacturing
                                      partName={item.partName}
                                      manufacturingVariables={
                                        item.manufacturingVariables || []
                                      }
                                      projectId={_id}
                                      partId={partsList._id}
                                      itemId={item._id}
                                      onUpdateVariable={
                                        updateManufacturingVariable
                                      }
                                      source="partList"
                                      manufatcuringUpdate={onUpdatePrts}
                                    />

                                    {/* <Shipment
                                      partName={item.partName}
                                      shipmentVariables={
                                        item.shipmentVariables || []
                                      }
                                      projectId={_id}
                                      partId={item._id}
                                    /> */}
                                    <Shipment
                                      partName={item.partName}
                                      projectId={_id}
                                      partId={partsList._id}
                                      itemId={item._id}
                                      source="partList"
                                      shipmentUpdate={onUpdatePrts}
                                      shipmentVariables={
                                        item.shipmentVariables || []
                                      }
                                    />

                                    <Overheads
                                      partName={item.partName}
                                      overheadsAndProfits={
                                        item.overheadsAndProfits || []
                                      }
                                      projectId={_id}
                                      partId={partsList._id}
                                      itemId={item._id}
                                      source="partList"
                                      // onUpdatePrts={onUpdatePrts}
                                      overHeadsUpdate={onUpdatePrts}
                                    />
                                  </div>
                                </td>
                              </tr>
                            )}
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
                  getOptionLabel={(option) => option.partName || ""}
                  onChange={handleAutocompleteChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Part"
                      variant="outlined"
                      required
                    />
                  )}
                />
                <div className="form-group">
                  <Label for="partId" className="form-label">
                    Part ID
                  </Label>
                  <Input
                    className="form-control"
                    type="text"
                    id="partId"
                    value={partId}
                    onChange={(e) => setPartId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label for="costPerUnit" className="form-label">
                    Cost Per Unit
                  </Label>
                  <Input
                    className="form-control"
                    type="number"
                    id="costPerUnit"
                    value={Number(costPerUnit).toFixed(2) || "0.00"}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label for="timePerUnit" className="form-label">
                    Time Per Unit
                  </Label>
                  <div className="input-group">
                    <Input
                      className="form-control"
                      type="number"
                      id="timePerUnit"
                      value={Number(timePerUnit).toFixed(2) || "0.00"}
                      onChange={(e) => setTimePerUnit(e.target.value)}
                      required
                    />
                    {/* <button
                      className="btn btn-outline-secondary bg-success"
                      style={{ borderRadius: "5px ", color: "white" }}
                      type="button"
                      onClick={() => {
                        const currentHours = parseFloat(timePerUnit);
                        const minutes = currentHours * 60;
                        setTimePerUnit(minutes.toFixed(2));
                      }}
                    >
                      To Min
                    </button> */}
                  </div>
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
                                rmVariables: prev.rmVariables.map((item, idx) =>
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
                                rmVariables: prev.rmVariables.map((item, idx) =>
                                  idx === index
                                    ? { ...item, pricePerKg: e.target.value }
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
                                  shipmentVariables: prev.shipmentVariables.map(
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
                                    prev.overheadsAndProfits.map((item, idx) =>
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
                <Button
                  type="submit"
                  color="primary"
                  disabled={
                    !selectedPartData ||
                    !costPerUnit ||
                    !timePerUnit ||
                    !quantity
                  }
                >
                  Add
                </Button>
              </form>
            </ModalBody>
          </Modal>

          <Modal isOpen={modal_delete} toggle={tog_delete}>
            <ModalHeader toggle={tog_delete}>Confirm Delete</ModalHeader>
            <ModalBody>Are you sure you want to delete this part?</ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={() => handleDelete(selectedId)}>
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
              Are you sure you want to delete "{itemToDelete?.partName}"?
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={handlePartDelete}>
                Delete
              </Button>
              <Button color="secondary" onClick={() => toggleDeleteModal(null)}>
                Cancel
              </Button>
            </ModalFooter>
          </Modal>

          <Modal isOpen={editModal} toggle={() => toggleEditModal(false)}>
            <ModalHeader toggle={() => toggleEditModal(false)}>
              Edit Parts List
            </ModalHeader>
            <ModalBody>
              <form onSubmit={handleEdit}>
                <div className="form-group">
                  <Label for="partsListName">Parts List Name</Label>
                  <Input
                    type="text"
                    id="partsListName"
                    name="partsListName"
                    defaultValue={partsListName}
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
        </Col>
      </>
    );
  }
);

export default PartsTable;
