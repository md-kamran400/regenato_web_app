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
import RawMaterial from "../ExpandFolders/RawMaterial";
import Shipment from "../ExpandFolders/Shipment";
import Overheads from "../ExpandFolders/Overheads";
import { useParams } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import Manufacturing from "../ExpandFolders/Manufacturing";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";

const OuterSubAssmebly = ({ subAssemblyItem, updatesubAssemblyItems }) => {
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
  const [subAssemblyItems, setSubAssemblyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
        console.log("items data of parts lists", data);
      } catch (error) {
        console.error("Error fetching parts list items:", error);
        // You might want to handle the error, e.g., show an error message to the user
      }
    };

    fetchPartsListItems();
  }, [_id, subAssemblyItem]);

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

  const tog_delete = (_id) => {
    setModalDelete(!modal_delete);
    setSelectedId(_id);
  };

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
      console.log(
        "hello wrold this is my data of re fetching",
        data.partsListItems
      );
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
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst/${subAssemblyItem._id}/items`,
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
      const updatedsubAssemblyItemItems = [
        ...(subAssemblyItem.partsListItems || []),
        newPart,
      ];
      const updatedsubAssemblyItem = {
        ...subAssemblyItem,
        partsListItems: updatedsubAssemblyItemItems,
      };

      // Update parent component state
      updatesubAssemblyItems(updatedsubAssemblyItem);

      setModalAdd(false);
      setIsLoading(false);

      // Reset form
      setSelectedPartData(null);
      setCostPerUnit("");
      setTimePerUnit("");
      setQuantity(0);
      setDetailedPartData({});
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to add part. Please try again.");
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

  const updateManufacturingVariable = (updatedVariable) => {
    setPartDetails((prevData) => {
      const updatedAllProjects = prevData.allProjects.map((project) => {
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

  const handleDelete = async (partId) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/delete-part`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partId }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchProjectDetails(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // duplicate
  // const handleDuplicate = async () => {
  //   setConfirmDuplicateModal(false);
  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/duplicate`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to duplicate project");
  //     }

  //     const duplicatedProject = await response.json();
  //     console.log("Duplicated project:", duplicatedProject);

  //     // Refresh the project details
  //     await fetchProjectDetails();

  //     // Show success message
  //     toast.success("Project successfully duplicated!");
  //   } catch (error) {
  //     console.error("Error duplicating project:", error);
  //     toast.error("Failed to duplicate project. Please try again.");
  //   }
  // };

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
        style={{ boxSizing: "border-box", borderTop: "5px solid red" }}
      >
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="button-group flex justify-content-between align-items-center">
                  <h4 style={{ fontWeight: "600" }}>
                    {subAssemblyItem.subAssemblyListName}
                  </h4>
                  <UncontrolledDropdown direction="left">
                    <DropdownToggle
                      tag="button"
                      className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                    >
                      <FeatherIcon icon="more-horizontal" className="icon-sm" />
                    </DropdownToggle>

                    <DropdownMenu className="dropdown-menu-start">
                      <DropdownItem
                        href="#"
                        // onClick={(e) => {
                        //   e.preventDefault();
                        //   setConfirmDuplicateModal(true);
                        // }}
                      >
                        <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                        Duplicate
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
                            <td className="parent_partName">
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
                                <span>
                                  <FiEdit size={20} />
                                </span>
                                <span onClick={() => tog_delete(item._id)}>
                                  <MdOutlineDelete size={25} />
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
                                    rmVariables={item.rmVariables || {}}
                                    projectId={_id}
                                    partId={item._id}
                                  />
                                  <Manufacturing
                                    partName={item.partName}
                                    manufacturingVariables={
                                      item.manufacturingVariables || []
                                    }
                                    projectId={_id}
                                    partId={item._id}
                                    onUpdateVariable={
                                      updateManufacturingVariable
                                    }
                                    onTotalCountUpdate={() => {}}
                                  />

                                  <Shipment
                                    partName={item.partName}
                                    shipmentVariables={
                                      item.shipmentVariables || []
                                    }
                                    projectId={_id}
                                    partId={item._id}
                                  />
                                  <Overheads
                                    partName={item.partName}
                                    overheadsAndProfits={
                                      item.overheadsAndProfits
                                    }
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

        {/* <Modal
        isOpen={confirmDuplicateModal}
        toggle={() => setConfirmDuplicateModal(false)}
      >
        <ModalHeader toggle={() => setConfirmDuplicateModal(false)}>
          Confirm Duplication
        </ModalHeader>
        <ModalBody>
          Are you sure you want to duplicate this project? This action cannot be
          undone.
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => setConfirmDuplicateModal(false)}
          >
            Cancel
          </Button>
          <Button color="primary" onClick={handleDuplicate}>
            Confirm Duplication
          </Button>
        </ModalFooter>
      </Modal> */}

        <Modal isOpen={modalAdd} toggle={toggleAddModal}>
          <ModalHeader toggle={toggleAddModal}>
            Add sub Assembly List
          </ModalHeader>
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
              <UncontrolledAccordion defaultOpen="1">
                {/* Raw Materials Accordion */}
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
                                      ? { ...item, hourlyRate: e.target.value }
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
                    {detailedPartData.shipmentVariables?.map((ship, index) => (
                      <FormGroup
                        key={ship._id}
                        className="accordion-item-custom"
                      >
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
                                    ? { ...item, hourlyRate: e.target.value }
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
                                      ? { ...item, percentage: e.target.value }
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
                  !selectedPartData || !costPerUnit || !timePerUnit || !quantity
                }
              >
                Add
              </Button>
            </form>
          </ModalBody>
        </Modal>

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
      </Col>
    </>
  );
};

export default OuterSubAssmebly;
