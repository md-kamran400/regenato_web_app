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
import RawMaterial from "./ExpandFolders/RawMaterial";
import Manufacturing from "./ExpandFolders/Manufacturing";
import Shipment from "./ExpandFolders/Shipment";
import Overheads from "./ExpandFolders/Overheads";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FiSettings } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import { BsFillClockFill } from "react-icons/bs";
import { HiMiniCurrencyDollar } from "react-icons/hi2";
import "./subAssemblies.css";
import { TbCoinRupee } from "react-icons/tb";
import { LuClock3 } from "react-icons/lu";
import { LiaRupeeSignSolid } from "react-icons/lia";
const SingleSubAssembly = () => {
  const { _id } = useParams();

  const location = useLocation();
  const subAssemblyName = location.state?.subAssemblyName || "";

  const [subAssemblyList, setsubAssemblyList] = useState([]);
  const [modalAdd, setModalAdd] = useState(false);
  // const [partsListItems, setPartsListsItems] = useState([]);
  const [partsListItems, setPartsListItems] = useState([]);
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
  const [partsDisplay, setPartsDisplay] = useState([]);
  const [assemblyItems, setAssemblyItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [partsListItemsUpdated, setPartsListItemsUpdated] = useState(false);
  const [codeName, setCodeName] = useState("");
  const [editModal, setEditModal] = useState(false);
  // const [editModal, setEditModal] = useState(false);
  const [subAssemblyListName, setsubAssemblyListName] = useState("");
  const [selectedPartsList, setSelectedPartsList] = useState(null);

  const [editQuantityModal, setEditQuantityModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

  const [totalCost, setTotalCost] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };

  // const fetchSubAssemblyData = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}`
  //     );
  //     const data = await response.json();
  //     setsubAssemblyList(data);
  //     setProjectName(data.subAssemblyListFirst);
  //     console.log(data);
  //   } catch (error) {
  //     console.error("Error fetching sub-assemblies:", error);
  //   }
  // };
  // useEffect(() => {
  //   fetchSubAssemblyData();
  // }, []);

  const fetchSubAssembly = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}`
      );
      const data = await response.json();
      setsubAssemblyList(data);
      setProjectName(data.subAssemblyListFirst);
      setPartsListItems(data.partsListItems || []); // Set to empty array if undefined
      console.log("partListItems", data.partsListItems);
      console.log(data);
    } catch (error) {
      console.error("Error fetching sub-assemblies:", error);
      setPartsListItems([]); // Set to empty array if there's an error
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchSubAssembly();
      setIsLoading(false);
    };
    fetchData();
  }, [_id]);

  // useEffect(() => {
  //   const fetchPartsListItems = async () => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}/subAssemblyListFirst/${subAssemblyList._id}/items`
  //       );
  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }
  //       const data = await response.json();
  //       setPartsListsItems(data);
  //     } catch (error) {
  //       console.error("Error fetching parts list items:", error);
  //     }
  //   };

  //   fetchPartsListItems();
  // }, [_id]);

  useEffect(() => {
    const fetchParts = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`
      );
      const result = await response.json();

      // Check if response has data array
      const partsArray = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
        ? result.data
        : [];

      setParts(partsArray);
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
        console.log(partData);
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
      partsCodeId: selectedPartData?.id || "",
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
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}/partsListItems`,
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

      // Optionally, call fetchSubAssembly to refresh all data
      await fetchSubAssembly();

      // Reset form and state
      setModalAdd(false);
      setSelectedPartData(null);
      setCostPerUnit("");
      setTimePerUnit("");
      setQuantity(0);
      setDetailedPartData({});
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "Failed to add part. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const calculateTotals = () => {
      const newTotalCost = partsListItems.reduce(
        (acc, item) =>
          acc +
          parseFloat(item.costPerUnit || 0) * parseInt(item.quantity || 0),
        0
      );
      const newTotalHours = partsListItems.reduce(
        (acc, item) =>
          acc +
          parseFloat(item.timePerUnit || 0) * parseInt(item.quantity || 0),
        0
      );

      setTotalCost(newTotalCost);
      setTotalHours(formatTime(newTotalHours));
    };

    calculateTotals();
  }, [partsListItems]);

  const handleDeletePart = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}/parts/${itemToDelete._id}`,
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
      setDeleteModal(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Error deleting part:", error);
      // Handle error (e.g., show an error message to the user)
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
  const handleEditQuantity = (item) => {
    setItemToEdit(item);
    setEditQuantityModal(true);
  };

  const handleSubmitEditQuantity = async () => {
    if (!itemToEdit) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${_id}/parts/${itemToEdit._id}`,
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
      await fetchSubAssembly();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  console.log("Main value of pats list ", partsListItems);

  return (
    <>
      <div style={{ padding: "1.5rem" }}>
        <Col
          lg={12}
          style={{
            boxSizing: "border-box",
            boxShadow:
              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            borderRadius: "3px",
            marginBottom: "20px",
          }}
        >
          <div class="card ribbon-box  shadow-none mb-lg-0">
            <div class="card-body">
              <div class="ribbon ribbon-danger ribbon-shape">Sub Assembly</div>
            </div>
          </div>
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div
                    style={{
                      padding: "10px 15px",
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "start",
                        gap: "70px",
                      }}
                    >
                      {/* Name & Sub Assembly Label */}
                      <div>
                        <ul
                          style={{
                            listStyleType: "none",
                            padding: 0,
                            fontWeight: "600",
                          }}
                        >
                          <li style={{ fontSize: "22px", marginBottom: "5px" }}>
                            {subAssemblyName}
                          </li>
                          <li>
                            <span
                              className="badge bg-danger-subtle text-danger"
                              style={{ fontSize: "18px" }}
                            >
                              Sub Assembly
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* Total Cost & Total Hours in Parallel */}
                      <div
                        style={{
                          display: "flex",
                          gap: "40px",
                          marginTop: "5px",
                        }}
                      >
                        {/* Total Cost */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#6c757d",
                            fontWeight: "bold",
                          }}
                        >
                          <TbCoinRupee size={22} />
                          <h3 style={{ fontSize: "16px", margin: "0 5px" }}>
                            Total Cost:
                          </h3>
                          <span style={{ fontSize: "14px" }}>
                            {Math.round(totalCost)}
                          </span>
                        </div>

                        {/* Total Hours */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            color: "#6c757d",
                            fontWeight: "bold",
                          }}
                        >
                          <LuClock3 size={19} />
                          <h3 style={{ fontSize: "16px", margin: "0 5px" }}>
                            Total Hours:
                          </h3>
                          <span style={{ fontSize: "14px" }}>{totalHours}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Section (Dropdown) */}
                    <UncontrolledDropdown direction="left">
                      <DropdownToggle
                        tag="button"
                        className="btn btn-link text-muted p-1 shadow-none"
                      >
                        <FeatherIcon
                          icon="more-horizontal"
                          className="icon-sm"
                        />
                      </DropdownToggle>

                      <DropdownMenu className="dropdown-menu-end">
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

                  <div className="button-group mt-3">
                    <Button
                      color="success"
                      className="add-btn"
                      onClick={toggleAddModal}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Part
                    </Button>
                  </div>

                  <div className="table-wrapper table table-striped vertical-lines horizontals-lines">
                    <table className="project-table">
                      <thead style={{ backgroundColor: "#f3f4f6" }}>
                        <tr>
                          <th onClick={() => handleRowClickParts("name")}>
                            Name
                          </th>
                          <th>
                            <span>
                              <LiaRupeeSignSolid size={18} />{" "}
                            </span>
                            Cost Per Unit
                          </th>
                          <th>Machining Hours</th>
                          <th>Quantity</th>
                          <th>Total Cost (INR)</th>
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
                          partsListItems &&
                          partsListItems.map((item) => (
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
                                  {item.partName} ({item.partsCodeId || ""}){" "}
                                  {/* {item.codeName || ""} */}
                                </td>
                                <td>
                                  <span>
                                    <LiaRupeeSignSolid size={18} />{" "}
                                  </span>
                                  {Math.round(
                                    parseFloat(item.costPerUnit || 0)
                                  )}
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
                                <tr>
                                  <td colSpan={7}>
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
                                        projectId={_id}
                                        partId={item._id}
                                        subAssemblyId={_id}
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={fetchSubAssembly}
                                        quantity={item.quantity}
                                      />

                                      <Manufacturing
                                        partName={item.partName}
                                        manufacturingVariables={
                                          item.manufacturingVariables || []
                                        }
                                        partId={item._id}
                                        quantity={item.quantity}
                                        subAssemblyId={_id}
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={fetchSubAssembly}
                                      />

                                      <Shipment
                                        partName={item.partName}
                                        shipmentVariables={
                                          item.shipmentVariables || []
                                        }
                                        partId={item._id}
                                        quantity={item.quantity}
                                        subAssemblyId={_id}
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={fetchSubAssembly}
                                      />
                                      <Overheads
                                        partName={item.partName}
                                        projectId={_id}
                                        partId={item._id}
                                        quantity={item.quantity}
                                        subAssemblyId={_id}
                                        overheadsAndProfits={
                                          item.overheadsAndProfits
                                        }
                                        source="subAssemblyListFirst"
                                        onUpdatePrts={fetchSubAssembly}
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
              getOptionLabel={(option) =>
                // option.partName || ""
                `${option.partName} - ${option.id}`
              }
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
                required
              />
            </div>

            {/* <div className="form-group">
              <Label for="codeName" className="form-label">
                Code Name
              </Label>
              <Input
                className="form-control"
                type="text"
                id="codeName"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value)}
              />
            </div> */}

            <div className="form-group" style={{ display: "none" }}>
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

            <div className="form-group" style={{ display: "none" }}>
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

export default SingleSubAssembly;
