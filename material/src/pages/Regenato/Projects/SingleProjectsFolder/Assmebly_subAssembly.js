import React, { useState, useCallback, useEffect, memo } from "react"; //add parts list
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
import { MdOutlineDelete } from "react-icons/md";
import FeatherIcon from "feather-icons-react";
import { useParams } from "react-router-dom";
import RawMaterial from "./assembly_Sub_ExpandFolders/RawMaterial";
import Manufacturing from "./assembly_Sub_ExpandFolders/Manufacturing";
import Shipment from "./assembly_Sub_ExpandFolders/Shipment";
import Overheads from "./assembly_Sub_ExpandFolders/Overheads";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FiSettings } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
const Assmebly_subAssembly = ({
  projectId,
  subAssembly,
  assemblyId,
  onupdateAssmebly,
}) => {
  // console.log("sub assmenly id", subAssembly._id);
  console.log("sub project id", projectId);
  // console.log("assembly id", assemblyId);
  // console.log("sub assmenly main id", subAssembly);
  const { _id } = useParams();
  const location = useLocation();
  const subAssemblyName = location.state?.subAssemblyName || "";
  const [subAssemblyList, setsubAssemblyList] = useState([]);
  const [modalAdd, setModalAdd] = useState(false);
  const [partsListItems, setPartsListItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partsData, setPartsData] = useState([]);
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
  const [projectName, setProjectName] = useState("");
  const [partId, setPartId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeName, setCodeName] = useState("");
  // const [editModal, setEditModal] = useState(false);
  const [editQuantityModal, setEditQuantityModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsLoading(false);
    };
    fetchData();
  }, [_id]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const payload = {
      partId: selectedPartData?.id || null,
      partName: selectedPartData?.partName || "",
      codeName: codeName.trim(),
      costPerUnit: Number(costPerUnit) || 0,
      timePerUnit: Number(timePerUnit) || 0,
      quantity: Number(quantity) || 0,
      rmVariables: detailedPartData.rmVariables || [],
      manufacturingVariables: detailedPartData.manufacturingVariables || [],
      shipmentVariables: detailedPartData.shipmentVariables || [],
      overheadsAndProfits: detailedPartData.overheadsAndProfits || [],
    };
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/assemblyList/${assemblyId}/subAssemblies/${subAssembly._id}/partsListItems`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add part. Please check your input.");
      }
      const { data: newPart } = await response.json();
      // Update the parts list in the state directly
      setPartsListItems((prevItems) => [...prevItems, newPart]);
      //   Optionally, call fetchSubAssembly to refresh all data
      onupdateAssmebly(newPart);
      // Reset form and state

      setModalAdd(false);
      setSelectedPartData(null);
      setCostPerUnit("");
      setTimePerUnit("");
      setQuantity(0);
      setDetailedPartData({});
      toast.success("Part Add successfully");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add part. Please try again.");
      setError(error.message || "Failed to add part. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePart = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/assemblyList/${assemblyId}/subAssemblies/${subAssembly._id}/partsListItems/${itemToDelete._id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete part");
      }
      const data = await response.json();
      setPartsListItems((prevItems) =>
        prevItems.filter((item) => item._id !== itemToDelete._id)
      );
      onupdateAssmebly(data);
      setDeleteModal(false);
      setItemToDelete(null);
      toast.success("Part Add Delete SuccessFully");
    } catch (error) {
      toast.error("Error deleting part");
      console.error("Error deleting part:", error);
    }
  };

  const formatTime = (time) => {
    if (time === 0) {
      return 0;
    }

    let result = "";

    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    if (hours > 0) {
      result += `${hours}h `;
    }

    if (minutes > 0 || (hours === 0 && minutes !== 0)) {
      result += `${minutes}m`;
    }

    return result.trim();
  };

  const handleEditQuantity = (item) => {
    setItemToEdit(item);
    setEditQuantityModal(true);
  };
  
  const handleSubmitEditQuantity = async () => {
    if (!itemToEdit) return;
  
    try {
      const response = await fetch(
        `/api/defpartproject/projects/${projectId}/assemblyList/${assemblyId}/subAssemblies/${subAssembly._id}/partsListItems/${itemToEdit._id}`,
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
      setPartsListItems((prevItems) =>
        prevItems.map((item) =>
          item._id === itemToEdit._id
            ? { ...item, quantity: data.quantity }
            : item
        )
      );
  
      toast.success("Quantity updated successfully");
      setEditQuantityModal(false);
      onupdateAssmebly(data)
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  return (
    <>
      <div style={{ padding: "1.5rem" }}>
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
                <CardBody key={subAssembly._id}>
                  <div
                    style={{
                      padding: "5px 10px 0px 10px",
                      borderRadius: "3px",
                    }}
                    className="button-group flex justify-content-between align-items-center"
                  >
                    <ul
                      style={{
                        listStyleType: "none",
                        padding: 0,
                        fontWeight: "600",
                      }}
                    >
                      <li style={{ fontSize: "25px", marginBottom: "5px" }}>
                        {subAssembly.subAssemblyName}
                      </li>

                      <li style={{ fontSize: "19px" }}>
                        <span class="badge bg-danger-subtle text-danger">
                          Sub Assmebly
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
                        <DropdownItem href="#">
                          <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                          Edit
                        </DropdownItem>

                        <DropdownItem href="#">
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
                        {isLoading ? (
                          <tr>
                            <td colSpan={8} className="text-center">
                              <div
                                className="spinner-border text-primary"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Loading...
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          subAssembly.partsListItems &&
                          subAssembly.partsListItems.map((item) => (
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
                                  style={{
                                    cursor: "pointer",
                                    color: "#64B5F6",
                                  }}
                                  className="parent_partName"
                                >
                                  {item.partName} ({item.Uid || ""}){" "}
                                  {item.codeName || ""}
                                </td>
                                <td>
                                  {parseFloat(item.costPerUnit || 0).toFixed(2)}
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
                                      <FaEdit />-
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  {(
                                    parseFloat(item.costPerUnit || 0) *
                                    parseInt(item.quantity || 0)
                                  ).toFixed(2)}
                                </td>
                                <td>
                                  {formatTime(
                                    parseFloat(item.timePerUnit || 0) *
                                      parseInt(item.quantity || 0)
                                  )}
                                </td>

                                <td className="action-cell">
                                  <div className="action-buttons">
                                    {/* <span>
                                        <FiEdit size={20} />
                                      </span> */}
                                    <span
                                      style={{
                                        color: "red",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <MdOutlineDelete
                                        size={25}
                                        onClick={() => {
                                          setDeleteModal(true);
                                          setItemToDelete(item);
                                        }}
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

                                      <RawMaterial
                                        partName={item.partName}
                                        rmVariables={item.rmVariables || []}
                                        // projectId={_id}
                                        subAssembly={subAssembly}
                                        projectId={projectId}
                                        partId={item._id} //shai h
                                        assemblyId={assemblyId}
                                        subAssemblyId={subAssembly._id}
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={onupdateAssmebly}
                                        quantity={item.quantity}
                                      />

                                      <Manufacturing
                                        partName={item.partName}
                                        manufacturingVariables={
                                          item.manufacturingVariables || []
                                        }
                                        subAssembly={subAssembly}
                                        projectId={projectId}
                                        partId={item._id} //shai h
                                        assemblyId={assemblyId}
                                        subAssemblyId={subAssembly._id}
                                        quantity={item.quantity}
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={onupdateAssmebly}
                                      />

                                      <Shipment
                                        partName={item.partName}
                                        shipmentVariables={
                                          item.shipmentVariables || []
                                        }
                                        quantity={item.quantity}
                                        projectId={projectId}
                                        partId={item._id} //shai h
                                        assemblyId={assemblyId}
                                        subAssemblyId={subAssembly._id}
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={onupdateAssmebly}
                                      />
                                      <Overheads
                                        partName={item.partName}
                                        quantity={item.quantity}
                                        projectId={projectId}
                                        partId={item._id} //shai h
                                        assemblyId={assemblyId}
                                        subAssemblyId={subAssembly._id}
                                        overheadsAndProfits={
                                          item.overheadsAndProfits
                                        }
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={onupdateAssmebly}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </div>

      <Modal isOpen={modalAdd} toggle={toggleAddModal}>
        <ModalHeader toggle={toggleAddModal}>Add sub Assembly List</ModalHeader>
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
              <Input
                className="form-control"
                type="number"
                id="timePerUnit"
                value={Number(timePerUnit).toFixed(2) || "0.00"}
                onChange={(e) => setTimePerUnit(e.target.value)}
                required
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
                    setQuantity(inputValue === "" ? 0 : parseInt(inputValue));
                  }
                }}
                required
              />
            </div>
            {/* <UncontrolledAccordion defaultOpen="1">
              
              <AccordionItem>
                <AccordionHeader targetId="1">Raw Materials</AccordionHeader>
                <AccordionBody
                  accordionId="1"
                  className="accordion-body-custom"
                >
                  {detailedPartData.rmVariables?.map((rm, index) => (
                    <FormGroup key={rm._id} className="accordion-item-custom">
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
                        <Label className="accordion-label">{man.name}</Label>
                        <Input
                          type="number"
                          className="accordion-input"
                          value={man.hours || ""}
                          onChange={(e) =>
                            setDetailedPartData((prev) => ({
                              ...prev,
                              manufacturingVariables:
                                prev.manufacturingVariables.map((item, idx) =>
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
                                prev.manufacturingVariables.map((item, idx) =>
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

              <AccordionItem>
                <AccordionHeader targetId="3">
                  Shipment Variable
                </AccordionHeader>
                <AccordionBody accordionId="3">
                  {detailedPartData.shipmentVariables?.map((ship, index) => (
                    <FormGroup key={ship._id} className="accordion-item-custom">
                      <Label className="accordion-label">{ship.name}</Label>
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
                  ))}
                </AccordionBody>
              </AccordionItem>

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
                              overheadsAndProfits: prev.overheadsAndProfits.map(
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
            </UncontrolledAccordion> */}
            <Button
              type="submit"
              color="primary"
              disabled={
                !selectedPartData || !costPerUnit || !timePerUnit || !quantity
              }
            >
              Add
            </Button>
          </form>
        </ModalBody>
      </Modal>
      {/* Add this modal component */}
      <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
        <ModalHeader toggle={() => setDeleteModal(false)}>
          Confirm Delete
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete this part: {itemToDelete?.partName}?
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="danger" onClick={handleDeletePart}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>

      {/* edit the quanityt  */}
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
    </>
  );
};

export default Assmebly_subAssembly;
