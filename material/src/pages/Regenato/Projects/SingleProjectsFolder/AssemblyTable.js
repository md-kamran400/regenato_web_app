import React, { useState, useCallback, useEffect } from "react"; //add assembly
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
import FeatherIcon from "feather-icons-react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FiSettings } from "react-icons/fi";
import RawMaterial from "../ExpandFolders/RawMaterial";
import Shipment from "../ExpandFolders/Shipment";
import Overheads from "../ExpandFolders/Overheads";
import { useParams } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import Manufacturing from "../ExpandFolders/Manufacturing";
import SubAssemblyTable from "./SubAssemblyTable";
import AssmblyMultyPart from "./AssmblyMultyPart";
import { ToastContainer, toast } from "react-toastify"; // Add this import

const AssemblyTable = ({ assemblypartsList }) => {
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
  const [refetchManufacturing, setRefetchManufacturing] = useState(false);
  const [rawMaterialInput, setRawMaterialInput] = useState("");
  const [manufacturingInput, setManufacturingInput] = useState("");
  const [shipmentInput, setShipmentInput] = useState("");
  const [overheadsProfitInput, setOverheadsProfitInput] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectType, setprojectType] = useState("");
  const [partId, setPartId] = useState("");
  const [partsListItems, setPartsListsItems] = useState([]);
  const [assemblyItems, setAssemblyItems] = useState([]);

  const [subAssemblyItems, setSubAssemblyItems] = useState([]);
  const [partsAssmeblyItems, setpartsAssmeblyItems] = useState([]);

  const [modalAddSubassembly, setModalAddSubassembly] = useState(false);
  const [modalAddPartAssmebly, setModalAddPartAssmebly] = useState(false);

  // duplicate creationf for assmebly
  const [existingSubAssemblyLists, setExistingSubAssemblyLists] = useState([]);
  const [selectedSubAssemblyList, setSelectedSubAssemblyList] = useState(null);
  const [isAddingNewSubAssembly, setIsAddingNewSubAssembly] = useState(false);

  // Add this state to handle the existing assembly multi parts lists
  const [existingAssemblyMultyPartsLists, setExistingAssemblyMultyPartsLists] =
    useState([]);
  const [selectedAssemblyMultyPartsList, setSelectedAssemblyMultyPartsList] =
    useState(null);
  const [isAddingNewAssemblyMultyParts, setIsAddingNewAssemblyMultyParts] =
    useState(false);

  const [subAssemblyListName, setSubAssemblyListName] = useState("");
  const [assemblyMultyPartsListName, setassemblyMultyPartsListName] =
    useState("");

  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({
    assemblyListName: "",
    // partsListItems: [],
  });

  const [machinesTBU, setMachinesTBU] = useState({});

  // Function to fetch existing sub assembly lists
  const fetchExistingSubAssemblyLists = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/subAssemblyPartsLists`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setExistingSubAssemblyLists(data);
      } else {
        console.error(
          "Expected an array of sub-assembly lists, but received:",
          data
        );
        setExistingSubAssemblyLists([]);
      }
    } catch (error) {
      console.error("Error fetching existing sub assembly lists:", error);
      setExistingSubAssemblyLists([]);
    }
  }, [_id, existingSubAssemblyLists]);

  useEffect(() => {
    fetchExistingSubAssemblyLists();
  }, [fetchExistingSubAssemblyLists]);

  // Function to fetch existing assembly multi parts lists
  const fetchExistingAssemblyMultyPartsLists = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/assemblyMultyPartsList`
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setExistingAssemblyMultyPartsLists(data);
      } else {
        console.error(
          "Expected an array of assembly multi parts lists, but received:",
          data
        );
        setExistingAssemblyMultyPartsLists([]);
      }
    } catch (error) {
      console.error(
        "Error fetching existing assembly multi parts lists:",
        error
      );
      setExistingAssemblyMultyPartsLists([]);
    }
  }, [_id, existingAssemblyMultyPartsLists]);

  // Add this useEffect to fetch the lists when the component mounts
  useEffect(() => {
    fetchExistingAssemblyMultyPartsLists();
  }, [fetchExistingAssemblyMultyPartsLists]);

  const toggleAddModalsubAssembly = () => {
    setModalAddSubassembly(!modalAddSubassembly);
  };
  const toggleAddModalPartAssembly = () => {
    setModalAddPartAssmebly(!modalAddPartAssmebly);
  };

  useEffect(() => {
    setSubAssemblyItems(assemblypartsList.subAssemblyPartsLists || []);
  }, [assemblypartsList]);

  useEffect(() => {
    setpartsAssmeblyItems(assemblypartsList.assemblyMultyPartsList || []);
  }, [assemblypartsList]);

  const tog_delete = (_id) => {
    setModalDelete(!modal_delete);
    setSelectedId(_id);
  };

  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };

  const toggleEditModal = (editMode, assemblyId) => {
    if (editMode && Array.isArray(assemblypartsList)) {
      const assemblyToEdit = assemblypartsList.find(
        (item) => item._id === assemblyId
      );

      if (assemblyToEdit) {
        setEditData({
          assemblyListName: assemblyToEdit.assemblyListName,
          partsListItems: assemblyToEdit.partsListItems || [],
        });
      } else {
        console.warn("Assembly not found for ID:", assemblyId);
      }
    } else {
      console.warn("assemblypartsList is not an array:", assemblypartsList);
      setEditData({ assemblyListName: "", partsListItems: [] });
    }

    setEditModal(!editModal);
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

  // for parts
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

  // for parts
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

  // for projects
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

  // for projects
  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setProjectName(data.projectName || "");
      setprojectType(data.projectType || "");
      setPartsListsItems(data.partsLists || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // useEffect(() => {
  //   setSubAssemblyItems(assemblypartsList.subAssemblyPartsLists || []);
  // }, [assemblypartsList]);

  const handleSubmit = async (event) => {
    event.preventDefault();

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
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setError("Failed to add part. Please try again.");
        await fetchProjectDetails();
        return;
      }
      const newPart = await response.json();
      await fetchProjectDetails();
      setListData((prevData) => [...prevData, newPart]);
      setModalAdd(false);
    } catch (error) {
      console.error("Error submitting part:", error);
      setError("Failed to add part. Please try again.");
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

  const handleDelete = async (partId) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete part");
      }

      const updatedProject = await response.json();
      updatePartsLists(updatedProject);
      setModalDelete(false);
      toast.success("Part deleted successfully");
    } catch (error) {
      console.error("Error deleting part:", error);
      toast.error("Failed to delete part. Please try again.");
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update assembly list");
      }

      const updatedData = await response.json();
      // Update local state with the new data
      setAssemblyItems((prevItems) =>
        prevItems.map((item) =>
          item._id === assemblypartsList._id ? updatedData : item
        )
      );

      toggleEditModal(false);
      toast.success("Assembly updated successfully!");
    } catch (error) {
      console.error("Error updating assembly:", error);
      toast.error("Failed to update assembly. Please try again.");
    }
  };

  // Move this useCallback declaration outside of any functions or conditions
  // const handleSubmitAssemblyParts = useCallback(
  //   async ({ subAssemblyListName }) => {
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyPartsLists`,
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ subAssemblyListName }),
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Failed to add new assembly list");
  //       }

  //       const addedAssemblyList = await response.json();

  //       setSubAssemblyItems((prevAssemblyLists) => [
  //         ...prevAssemblyLists,
  //         addedAssemblyList,
  //       ]);

  //       setSubAssemblyListName("");
  //       setModalAddSubassembly(false);
  //     } catch (error) {
  //       console.error("Error adding new assembly list:", error);
  //       setError("Failed to add new assembly list. Please try again.");
  //     }
  //   },
  //   [_id]
  // );

  // Now, use handleSubmitAssemblyParts in your component

  // updating function

  const handleSubAssemblyUpdate = (updatedSubAssembly) => {
    setSubAssemblyItems((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  };

  const handleMultySubAssemblyUpdate = (updatedSubAssembly) => {
    setpartsAssmeblyItems((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  };

  const handleSubmitSubAssembly = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/subAssemblyPartsLists`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subAssemblyListName: subAssemblyListName,
            assemblyId: assemblypartsList._id, // Add this line
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add new assembly list");
      }

      const addedAssemblyList = await response.json();
      // Update local state immediately
      setSubAssemblyItems((prevAssemblyLists) => [
        ...prevAssemblyLists,
        addedAssemblyList,
      ]);
      setSubAssemblyListName("");
      setModalAddSubassembly(false);

      // Refetch the data to ensure we have the latest information
      const updatedResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/subAssemblyPartsLists`
      );
      const updatedData = await updatedResponse.json();
      setSubAssemblyItems(updatedData);
    } catch (error) {
      console.error("Error adding new assembly list:", error);
      setError("Failed to add new assembly list. Please try again.");
    }
  };

  const handleMultySubmitpartsAssmebly = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/assemblyMultyPartsList`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assemblyMultyPartsListName: assemblyMultyPartsListName,
            assemblyId: assemblypartsList._id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, data: ${errorData}`
        );
      }

      const addedAssemblyList = await response.json();
      setpartsAssmeblyItems((prevAssemblyLists) => [
        ...prevAssemblyLists,
        addedAssemblyList,
      ]);
      setassemblyMultyPartsListName("");
      setModalAddPartAssmebly(false);

      // Refetch the data to ensure we have the latest information
      const updatedResponse = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/assemblyMultyPartsList`
      );
      const updatedData = await updatedResponse.json();
      setpartsAssmeblyItems(updatedData);
    } catch (error) {
      console.error("Error adding new assembly list:", error);
      setError("Failed to add new assembly list. Please try again.");
    }
  };

  // Function to duplicate an existing sub assembly list
  const handleDuplicateSubAssembly = async (listId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/subAssemblyPartsLists/${listId}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const error = await response.text();
        console.error("Duplicate API Error:", error);
        throw new Error("Failed to duplicate sub-assembly");
      }
      const duplicatedList = await response.json();
      console.log("Duplicated Sub-assembly:", duplicatedList); // Add this log
      setSubAssemblyItems((prevLists) => [...prevLists, duplicatedList]);
    } catch (error) {
      console.error("Error duplicating sub-assembly:", error);
      setError("Failed to duplicate sub-assembly. Please try again.");
    }
  };

  // Function to handle duplicate assembly multi parts list
  const handleDuplicateAssemblyMultyParts = async (listId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/assemblyMultyPartsList/${listId}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to duplicate assembly multi parts list");
      }
      const duplicatedList = await response.json();
      console.log("Duplicated Assembly Multi Parts:", duplicatedList);
      setpartsAssmeblyItems((prevLists) => [...prevLists, duplicatedList]);
    } catch (error) {
      console.error("Error duplicating assembly multi parts:", error);
      setError("Failed to duplicate assembly multi parts. Please try again.");
    }
  };

  return (
    <Col
      lg={12}
      style={{ boxSizing: "border-box", borderTop: "5px solid blue" }}
    >
      <Row>
        <Col lg={12}>
          <Card>
            <CardBody>
              <div className="button-group flex justify-content-between align-items-center">
                <h4 style={{ fontWeight: "600" }}>
                  {assemblypartsList.assemblyListName}
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
                      onClick={(e) => {
                        e.preventDefault();
                        toggleEditModal(true, assemblypartsList._id); // Pass assembly ID
                      }}
                    >
                      <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                      Edit
                    </DropdownItem>

                    <DropdownItem
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        tog_delete("delete", assemblypartsList._id);
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
                  className="add-btn"
                  onClick={toggleAddModalPartAssembly}
                  style={{ backgroundColor: "#8E24AA", color: "white" }}
                >
                  <i className="ri-add-line align-bottom me-1"></i> Add Part
                  List
                </Button>
                <Button
                  color="danger"
                  className="add-btn"
                  onClick={toggleAddModalsubAssembly}
                  style={{ backgroundColor: "#0097A7", color: "white" }}
                >
                  <i className="ri-add-line align-bottom me-1"></i> Add Sub
                  Assembly
                </Button>
              </div>

              {/* calling my component of sub assmebly  */}
              {Array.isArray(subAssemblyItems) &&
              subAssemblyItems.length > 0 ? (
                subAssemblyItems.map((subAssemblyItem, index) => (
                  <div key={index} className="parts-list">
                    <SubAssemblyTable
                      key={index}
                      subAssemblyItems={subAssemblyItem}
                      assemblyId={assemblypartsList._id}
                      onUpdateSubAssembly={handleSubAssemblyUpdate}
                    />
                  </div>
                ))
              ) : (
                <div>No sub-assemblies available.</div>
              )}

              {Array.isArray(partsAssmeblyItems) &&
              partsAssmeblyItems.length > 0 ? (
                partsAssmeblyItems.map((partsAssmeblyItem, index) => (
                  <div key={index} className="parts-list">
                    <AssmblyMultyPart
                      key={index}
                      partsAssmeblyItems={partsAssmeblyItem}
                      assemblyId={assemblypartsList._id}
                      onUpdateSubAssembly={handleMultySubAssemblyUpdate}
                    />
                  </div>
                ))
              ) : (
                <div>No sub-Parts assembly available.</div>
              )}

              {/* <div className="table-wrapper">
                <table className="project-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleRowClickParts("name")}>Name</th>
                      <th>Cost Per Unit</th>
                      <th>Machining Hours</th>
                      <th>Quantity</th>
                      <th>Total Cost</th>
                      <th>Total Machining Hours</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assemblypartsList.partsListItems.map((item) => (
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
                            {item.partName} ({item.Uid})
                          </td>
                          <td>
                            {item.costPerUnit !== undefined
                              ? item.costPerUnit.toFixed(2)
                              : "N/A"}
                          </td>
                          <td>
                            {item.timePerUnit !== undefined
                              ? item.timePerUnit.toFixed(2)
                              : "N/A"}
                          </td>
                          <td>
                            {item.quantity !== undefined
                              ? item.quantity
                              : "N/A"}
                          </td>
                          <td>
                            {(item.costPerUnit * item.quantity).toFixed(2)}
                          </td>
                          <td>
                            {(item.timePerUnit * item.quantity).toFixed(2)}
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
                                  onUpdateVariable={updateManufacturingVariable}
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
                                  overheadsAndProfits={item.overheadsAndProfits}
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>  */}
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
                              overheadsAndProfits: prev.overheadsAndProfits.map(
                                (item, idx) =>
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
      {/* <ToastContainer /> */}

      <Modal isOpen={editModal} toggle={() => toggleEditModal(false)}>
        <ModalHeader toggle={() => toggleEditModal(false)}>
          Edit Assembly
        </ModalHeader>
        <ModalBody>
          <form onSubmit={(e) => handleEditSubmit(e)}>
            <div className="form-group">
              <Label for="assemblyListName">Assembly List Name</Label>
              <Input
                type="text"
                id="assemblyListName"
                value={editData.assemblyListName} //partsListName
                onChange={(e) =>
                  setEditData({ ...editData, assemblyListName: e.target.value })
                }
                required
              />
            </div>
            <ModalFooter>
              <Button color="primary" type="submit">
                Save Changes
              </Button>
              <Button color="secondary" onClick={() => toggleEditModal(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* modle for sub assembly */}
      <Modal isOpen={modalAddSubassembly} toggle={toggleAddModalsubAssembly}>
        <ModalHeader toggle={toggleAddModalsubAssembly}>
          Add/Duplicate Sub Assembly List
        </ModalHeader>
        <ModalBody>
          <form onSubmit={(e) => handleSubmitSubAssembly(e.preventDefault())}>
            <div className="form-group">
              <Label for="subAssemblyListName">Sub Assembly List Name</Label>
              <div className="d-flex flex-column">
                <div className="mb-3">
                  <Input
                    className="mt-2"
                    type="text"
                    id="subAssemblyListName"
                    placeholder="New Sub Assembly List Name"
                    value={subAssemblyListName}
                    onChange={(e) => setSubAssemblyListName(e.target.value)}
                    required
                  />
                </div>
                <Button
                  color="primary"
                  onClick={() => {
                    handleSubmitSubAssembly();
                    setSubAssemblyListName("");
                  }}
                >
                  Add New Sub Assembly
                </Button>
                <h3 className="text-center mt-3 mb-3">OR</h3>

                <Label for="subAssemblyListName">
                  Duplicate From Existing List
                </Label>
                <div className="mt-1">
                  <select
                    style={{ width: "410px" }}
                    className="form-select"
                    value={selectedSubAssemblyList}
                    onChange={(e) => {
                      setSelectedSubAssemblyList(e.target.value);
                      setIsAddingNewSubAssembly(false);
                    }}
                  >
                    <option value="">Select Existing Sub Assembly List</option>
                    {Array.isArray(existingSubAssemblyLists) &&
                    existingSubAssemblyLists.length > 0 ? (
                      existingSubAssemblyLists.map((list) => (
                        <option key={list._id} value={list._id}>
                          {list.subAssemblyListName}
                        </option>
                      ))
                    ) : (
                      <option>No existing sub-assembly lists available</option>
                    )}
                  </select>
                </div>
                <Button
                  color="success"
                  className="mt-3"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDuplicateSubAssembly(selectedSubAssemblyList);
                  }}
                >
                  Duplicate Sub Assembly
                </Button>
              </div>
            </div>
            <ModalFooter>
              <Button color="secondary" onClick={toggleAddModalsubAssembly}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Update the modal for adding/duplicating assembly multi parts list */}
      <Modal isOpen={modalAddPartAssmebly} toggle={toggleAddModalPartAssembly}>
        <ModalHeader toggle={toggleAddModalPartAssembly}>
          Add/Duplicate Assembly Multi Parts List
        </ModalHeader>
        <ModalBody>
          <form
            onSubmit={(e) => handleMultySubmitpartsAssmebly(e.preventDefault())}
          >
            <div className="form-group">
              <Label for="partsListName">
                Add Assembly Multi Parts List Name
              </Label>
              <div className="d-flex flex-column">
                <div className="mb-3">
                  <Input
                    className="mt-2"
                    type="text"
                    id="assemblyMultyPartsListName"
                    placeholder="New Assembly Multi Parts List Name"
                    value={assemblyMultyPartsListName}
                    onChange={(e) =>
                      setassemblyMultyPartsListName(e.target.value)
                    }
                    required
                  />
                </div>
                <Button
                  color="primary"
                  onClick={() => {
                    handleMultySubmitpartsAssmebly();
                    setassemblyMultyPartsListName("");
                  }}
                >
                  Add New Assembly Multi Parts
                </Button>
                <h3 className="text-center mt-3 mb-3">OR</h3>

                <Label for="partsListName">
                  Duplicate From Existing Assembly Multi Parts List
                </Label>
                <div className="mt-1">
                  <select
                    style={{ width: "410px" }}
                    className="form-select"
                    value={selectedAssemblyMultyPartsList}
                    onChange={(e) => {
                      setSelectedAssemblyMultyPartsList(e.target.value);
                      setIsAddingNewAssemblyMultyParts(false);
                    }}
                  >
                    <option value="">
                      Select Existing Assembly Multi Parts List
                    </option>
                    {Array.isArray(existingAssemblyMultyPartsLists) &&
                    existingAssemblyMultyPartsLists.length > 0 ? (
                      existingAssemblyMultyPartsLists.map((list) => (
                        <option key={list._id} value={list._id}>
                          {list.assemblyMultyPartsListName}
                        </option>
                      ))
                    ) : (
                      <option>
                        No existing assembly multi parts lists available
                      </option>
                    )}
                  </select>
                </div>
                <Button
                  color="success"
                  className="mt-3"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDuplicateAssemblyMultyParts(
                      selectedAssemblyMultyPartsList
                    );
                  }}
                >
                  Duplicate Assembly Multi Parts
                </Button>
              </div>
            </div>
            <ModalFooter>
              <Button color="secondary" onClick={toggleAddModalPartAssembly}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </Col>
  );
};

export default AssemblyTable;
