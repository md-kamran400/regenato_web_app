import React, { useState, useCallback, useEffect, useRef } from "react"; //add assembly
// import "../project.css";
import "../projectForProjects.css";
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
import RawMaterial from "./assemblyExpandFolders/RawMaterial";
import Shipment from "./assemblyExpandFolders/Shipment";
import Overheads from "./assemblyExpandFolders/Overheads";
import { useParams } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import Manufacturing from "./assemblyExpandFolders/Manufacturing";
// import SubAssemblyTable from "./SubAssemblyTable";
// import AssmblyMultyPart from "./AssmblyMultyPart";
import { ToastContainer, toast } from "react-toastify"; // Add this import
import { FaEdit } from "react-icons/fa";
import Assmebly_subAssembly from "./Assmebly_subAssembly";
import { AssemblyPartListHoursPlan } from "../HoursPlanningFolder/AssemblyHoursPlanning/Assembly_PartLisHrPlan/AssemblyPartListHoursPlan";
import CircularProgress from "@mui/material/CircularProgress";
const AssemblyTable = React.memo(
  ({
    assemblypartsList,
    onAddPart,
    onUpdatePrts,
    projectId,
    assemblypartsListId,
    setassemblyLists,
    // getStatus, onUpdatePrts
  }) => {
    const userRole = localStorage.getItem("userRole");
    const { _id } = useParams();
    const [modalAdd, setModalAdd] = useState(false);
    const [modal_delete, setModalDelete] = useState(false);
    const [modal_delete_Assembly, setog_delete_assmebly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [partsData, setPartsData] = useState([]);
    const [partDetails, setPartDetails] = useState([]);
    const [listData, setListData] = useState([]);
    const [posting, setPosting] = useState(false);
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
    const [isLoading, setIsLoading] = useState(false);
    const [codeName, setCodeName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [subAssemblyItems, setSubAssemblyItems] = useState([]);
    const [partsAssmeblyItems, setpartsAssmeblyItems] = useState([]);

    const [modalAddSubassembly, setModalAddSubassembly] = useState(false);
    const [modalAddPartAssmebly, setModalAddPartAssmebly] = useState(false);
    const [loadingParts, setLoadingParts] = useState(false);
    // duplicate creationf for assmebly
    const [existingSubAssemblyLists, setExistingSubAssemblyLists] = useState(
      []
    );
    const [selectedSubAssemblyList, setSelectedSubAssemblyList] =
      useState(null);
    const [isAddingNewSubAssembly, setIsAddingNewSubAssembly] = useState(false);

    const [editQuantityModal, setEditQuantityModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    // Add this state to handle the existing assembly multi parts lists
    const [
      existingAssemblyMultyPartsLists,
      setExistingAssemblyMultyPartsLists,
    ] = useState([]);
    const [selectedAssemblyMultyPartsList, setSelectedAssemblyMultyPartsList] =
      useState(null);
    const [isAddingNewAssemblyMultyParts, setIsAddingNewAssemblyMultyParts] =
      useState(false);

    const [subAssemblyListName, setSubAssemblyListName] = useState("");
    const [assemblyMultyPartsListName, setassemblyMultyPartsListName] =
      useState("");

    const [editModal, setEditModal] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    // const [editModal, setEditModal] = useState(false);
    const [AssemblyName, setAssemblyName] = useState("");
    const [selectedPartsList, setSelectedPartsList] = useState(null);

    const [machinesTBU, setMachinesTBU] = useState({});
    const [isFetching, setIsFetching] = useState(false);
    const mountedRef = useRef(false);

    const [modalOpenId, setModalOpenId] = useState(null);

    //optimization for fetching
    const [partsListItemsUpdated, setPartsListItemsUpdated] = useState(false);

    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    const toggleModal = (item) => {
      setModalOpenId((prevId) => (prevId === item._id ? null : item._id));
    };

    const fetchExistingSubAssemblyLists = useCallback(async () => {
      if (isFetching) return; // Prevent multiple concurrent requests
      setIsFetching(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/subAssemblyPartsLists`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          if (mountedRef.current) {
            setExistingSubAssemblyLists(data);
          }
        } else {
          // console.error(
          //   "Expected an array of sub-assembly lists, but received:",
          //   data
          // );
          if (mountedRef.current) {
            setExistingSubAssemblyLists([]);
          }
        }
      } catch (error) {
        console.error("Error fetching existing sub assembly lists:", error);
        if (mountedRef.current) {
          setExistingSubAssemblyLists([]);
        }
      } finally {
        setIsFetching(false);
      }
    }, [_id, assemblypartsList]);

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

    // }, [_id, existingSubAssemblyLists]);

    useEffect(() => {
      fetchExistingSubAssemblyLists();
    }, [fetchExistingSubAssemblyLists, _id, assemblypartsList]);

    useEffect(() => {
      // This will cause a re-render when existingSubAssemblyLists changes
    }, [existingSubAssemblyLists]);

    //  =================  *****************===========

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
    }, [_id]);
    // }, [_id, existingAssemblyMultyPartsLists]);

    // const getStatus = (allocations) => {
    //   if (!allocations || allocations.length === 0)
    //     return {
    //       text: "Not Allocated",
    //       class: "badge bg-info text-white",
    //     };
    //   const allocation = allocations[0].allocations[0];
    //   if (!allocation)
    //     return { text: "Not Allocated", class: "badge bg-info text-white" };

    //   const actualEndDate = new Date(allocation.actualEndDate);
    //   const endDate = new Date(allocation.endDate);

    //   if (actualEndDate.getTime() === endDate.getTime())
    //     return { text: "On Track", class: "badge bg-primary text-white" };
    //   if (actualEndDate > endDate)
    //     return { text: "Delayed", class: "badge bg-danger text-white" };
    //   if (actualEndDate < endDate)
    //     return { text: "Ahead", class: "badge bg-success text-white" };
    //   return { text: "Allocated", class: "badge bg-dark text-white" };
    // };

    // Add this useEffect to fetch the lists when the component mounts
    useEffect(() => {
      fetchExistingAssemblyMultyPartsLists();
    }, [fetchExistingAssemblyMultyPartsLists]);

    // edit work toggling here

    // Function to toggle the edit modal
    const toggleEditModal = (partsList) => {
      setEditModal(!editModal);
      setSelectedPartsList(partsList);
      setAssemblyName(partsList.AssemblyName);
    };
    // AssemblyName
    // useEffect to set partsListName when editModal is opened
    useEffect(() => {
      if (editModal && selectedPartsList) {
        setAssemblyName(selectedPartsList.AssemblyName);
      }
    }, [editModal, selectedPartsList]);

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

    const tog_delete = () => {
      setModalDelete(!modal_delete);
    };

    const tog_delete_assmebly = () => {
      setog_delete_assmebly(!modal_delete_Assembly);
    };

    const toggleAddModal = () => {
      setModalAdd(!modalAdd);
    };

    useEffect(() => {
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
      fetchManufacturingVariables();
    }, []);

    useEffect(() => {
      fetchParts();
    }, []);

    const fetchParts = async () => {
      setLoadingParts(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts`
        );
        const data = await response.json();
        setParts(data);
        console.log(data.id)
      } catch (error) {
        console.error("Error fetching parts:", error);
      } finally {
        setLoadingParts(false);
      }
    };

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
          setCostPerUnit(selectedPart.costPerUnit || "");
          setTimePerUnit(selectedPart.timePerUnit || "");
          setQuantity(1);
          setPartId(selectedPart.partsCodeId || "");
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
        partsCodeId: selectedPartData.partsCodeId || selectedPartData.id || "",
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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/assemblyList/${assemblypartsList._id}/partsListItems`,
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
        onUpdatePrts(newPart);
        await fetchProjectDetails();
        setListData((prevData) => [...prevData, newPart]);
        toast.success("Part Add Successfully");
        setModalAdd(false);
      } catch (error) {
        toast.error("Failed to add part. Please try again.");
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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/assemblyList/${assemblypartsList._id}/partsListItems/${itemToDelete._id}`,
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
        setItemToDelete(null);
        toast.success("Records deleted successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete part. Please try again.");
      }
    };

    const handleEdit = async (e) => {
      e.preventDefault();
      // const AssemblyName = e.target.AssemblyName.value;
      // const AssemblyName = AssemblyName;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/assemblyList/${assemblypartsList._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ AssemblyName }),
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        onUpdatePrts(data);
        toast.success("Assembly Updated Successfully");
        toggleEditModal(false);
      } catch (error) {
        console.error("Error updating parts list:", error);
        // Handle the error (e.g., show an error message to the user)
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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/assemblyList/${assemblypartsList._id}/partsListItems/${itemToEdit._id}`,
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
        setassemblyLists((prevItems) =>
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
          ` ${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblypartsList._id}/assemblyMultyPartsList`,
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
            HTTP`error! status: ${response.status}, data: ${errorData}`
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

    const handleDeleteAssembly = async () => {
      try {
        const response = await fetch(
          ` ${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/assemblyList/${assemblypartsList._id}`,
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
        setog_delete_assmebly(false);
        toast.success("Records Deleted Successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete Records. Please try again.");
      }
    };

    const getStatusDisplay = (item) => {
      // First check if the item has a status from the API
      if (item.status === "Completed") {
        return {
          text: "Completed",
          class: "badge bg-success text-white",
        };
      }

      if (!item.allocations || item.allocations.length === 0) {
        return {
          text: "Not Allocated",
          class: "badge bg-info text-white",
        };
      }

      const process = item.allocations[0];
      if (!process.allocations || process.allocations.length === 0) {
        return {
          text: "Not Allocated",
          class: "badge bg-info text-white",
        };
      }

      const allocation = process.allocations[0];

      // If there's daily tracking data
      if (allocation.dailyTracking && allocation.dailyTracking.length > 0) {
        const lastTracking =
          allocation.dailyTracking[allocation.dailyTracking.length - 1];

        if (lastTracking.dailyStatus === "Delayed") {
          return {
            text: "Delayed",
            class: "badge bg-danger text-white",
          };
        } else if (lastTracking.dailyStatus === "Ahead") {
          return {
            text: "Ahead",
            class: "badge bg-success-subtle text-success",
          };
        } else if (lastTracking.dailyStatus === "On Track") {
          return {
            text: "On Track",
            class: "badge bg-primary text-white",
          };
        }
      }

      // Fallback to the status stored in the item
      return {
        text: item.status || "Not Allocated",
        class: item.statusClass || "badge bg-info text-white",
      };
    };

    return (
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
            <div class="ribbon ribbon-primary ribbon-shape">Assembly</div>
          </div>
        </div>
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
                  className="button-group flex justify-content-between align-items-center "
                >
                  <ul
                    style={{
                      listStyleType: "none",
                      padding: 0,
                      fontWeight: "600",
                    }}
                  >
                    <li style={{ fontSize: "25px", marginBottom: "-15px" }}>
                      {assemblypartsList.AssemblyName}
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
                        onClick={() => toggleEditModal(assemblypartsList)}
                      >
                        <i className="ri-edit-2-line align-bottom me-2 text-muted"></i>{" "}
                        Edit
                      </DropdownItem>

                      <DropdownItem
                        href="#"
                        onClick={() => {
                          setSelectedId(assemblypartsList._id);
                          tog_delete_assmebly();
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
                  {userRole === "admin" && (
                    <Button
                      color="success"
                      className="add-btn"
                      onClick={toggleAddModal}
                    >
                      <i className="ri-add-line align-bottom me-1"></i> Add Part
                    </Button>
                  )}
                </div>

                <div
                  className="mb-3"
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Label for="statusFilter" className="me-2 mt-2">
                    Filter by Status:
                  </Label>
                  <Input
                    type="select"
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: "200px" }}
                  >
                    <option value="all">All Status</option>
                    <option value="Not Allocated">Not Allocated</option>
                    <option value="On Track">On Track</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Ahead">Ahead</option>
                    <option value="Allocated">Allocated</option>
                  </Input>
                </div>

                <div className="table-wrapper">
                  <table className="table table-striped vertical-lines horizontals-lines">
                    <thead style={{ backgroundColor: "#f3f4f6" }}>
                      <tr>
                        <th onClick={() => handleRowClickParts("name")}>
                          Name
                        </th>
                        <th>Status</th>
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
                        assemblypartsList.partsListItems?.map((item) => {
                          return (
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
                                  {(() => {
                                    const status = getStatusDisplay(item);
                                    return (
                                      <span className={`badge ${status.class}`}>
                                        {status.text}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td>
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
                                      width: "80%",
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
                                          modalOpenId === item._id
                                            ? "rotate"
                                            : ""
                                        }`}
                                      />
                                    </span>
                                    <span
                                      style={{
                                        color: "red",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <MdOutlineDelete
                                        size={25}
                                        onClick={() => {
                                          setModalDelete(true);
                                          setItemToDelete(item);
                                        }}
                                      />
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {expandedRowId === item._id && (
                                <tr>
                                  <td colSpan="8">
                                    <AssemblyPartListHoursPlan
                                      partName={item.partName}
                                      partsCodeId={item.partsCodeId}
                                      manufacturingVariables={
                                        item.manufacturingVariables || []
                                      }
                                      quantity={item.quantity}
                                      porjectID={_id}
                                      AssemblyListId={assemblypartsListId}
                                      partListItemId={item._id}
                                      partManufacturingVariables={
                                        item.manufacturingVariables
                                      }
                                      onUpdateAllocaitonStatus={() => {
                                        onUpdatePrts(); // Refresh the data
                                      }}
                                    />
                                  </td>
                                </tr>
                              )}

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
                                        {" "}
                                        <RawMaterial
                                          partName={item.partName}
                                          rmVariables={item.rmVariables || []}
                                          projectId={_id}
                                          partId={item._id}
                                          assemblyId={assemblypartsList._id}
                                          source="subAssemblyListFirst"
                                          onUpdatePrts={onUpdatePrts}
                                          quantity={item.quantity}
                                        />
                                      </div>
                                      <div style={{ marginBottom: "20px" }}>
                                        <Manufacturing
                                          partName={item.partName}
                                          manufacturingVariables={
                                            item.manufacturingVariables || []
                                          }
                                          projectId={_id}
                                          partId={item._id}
                                          assemblyId={assemblypartsList._id}
                                          quantity={item.quantity}
                                          subAssemblyId={_id}
                                          source="subAssemblyListFirst"
                                          onUpdatePrts={onUpdatePrts}
                                        />
                                      </div>
                                      <div style={{ marginBottom: "20px" }}>
                                        <Shipment
                                          partName={item.partName}
                                          shipmentVariables={
                                            item.shipmentVariables || []
                                          }
                                          projectId={_id}
                                          partId={item._id}
                                          assemblyId={assemblypartsList._id}
                                          quantity={item.quantity}
                                          subAssemblyId={_id}
                                          source="subAssemblyListFirst"
                                          onUpdatePrts={onUpdatePrts}
                                        />
                                      </div>
                                      <div>
                                        <Overheads
                                          partName={item.partName}
                                          projectId={_id}
                                          partId={item._id}
                                          assemblyId={assemblypartsList._id}
                                          quantity={item.quantity}
                                          subAssemblyId={_id}
                                          overheadsAndProfits={
                                            item.overheadsAndProfits
                                          }
                                          source="subAssemblyListFirst"
                                          onUpdatePrts={onUpdatePrts}
                                        />
                                      </div>
                                    </div>
                                  </ModalBody>
                                </Modal>
                              )}
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {Array.isArray(assemblypartsList?.subAssemblies) &&
                  assemblypartsList.subAssemblies.length > 0 && (
                    <>
                      {assemblypartsList.subAssemblies.map((subAssembly) => (
                        <Assmebly_subAssembly
                          key={subAssembly._id}
                          projectId={projectId}
                          subAssembly={subAssembly}
                          assemblyId={assemblypartsListId}
                          onupdateAssmebly={onUpdatePrts}
                          // getStatus={getStatus}
                          // onupdateAssmebly={fetchAssembly}
                        />
                      ))}
                    </>
                  )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Modal isOpen={modalAdd} toggle={toggleAddModal}>
          <ModalHeader toggle={toggleAddModal}>Add Part</ModalHeader>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <Autocomplete
                options={parts || []}
                loading={loadingParts}
                getOptionLabel={(option) =>
                  option ? `${option.partName} - ${option.id}` : ""
                }
                onChange={handleAutocompleteChange}
                noOptionsText={
                  loadingParts ? "Loading parts..." : "No parts available"
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Part"
                    variant="outlined"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingParts ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
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
                      setQuantity(inputValue === "" ? 0 : parseInt(inputValue));
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

        <Modal isOpen={editModal} toggle={() => toggleEditModal(false)}>
          <ModalHeader toggle={() => toggleEditModal(false)}>
            Edit Assembly
          </ModalHeader>
          <ModalBody>
            <form onSubmit={(e) => handleEdit(e)}>
              <div className="form-group">
                <Label for="assemblyListName">Assembly List Name</Label>
                {/* <Input
                  type="text"
                  id="assemblyListName"
                  name="assemblyListName"
                  defaultValue={assemblyListName}
                  required
                /> */}
                <Input
                  type="text"
                  id="AssemblyName"
                  name="AssemblyName"
                  value={AssemblyName}
                  onChange={(e) => setAssemblyName(e.target.value)}
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
                      <option value="">
                        Select Existing Sub Assembly List
                      </option>
                      {Array.isArray(existingSubAssemblyLists) &&
                      existingSubAssemblyLists.length > 0 ? (
                        existingSubAssemblyLists.map((list) => (
                          <option key={list._id} value={list._id}>
                            {list.subAssemblyListName}
                          </option>
                        ))
                      ) : (
                        <option>
                          No existing sub-assembly lists available
                        </option>
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
        <Modal
          isOpen={modalAddPartAssmebly}
          toggle={toggleAddModalPartAssembly}
        >
          <ModalHeader toggle={toggleAddModalPartAssembly}>
            Add/Duplicate Assembly Multi Parts List
          </ModalHeader>
          <ModalBody>
            <form
              onSubmit={(e) =>
                handleMultySubmitpartsAssmebly(e.preventDefault())
              }
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

        <Modal isOpen={modal_delete_Assembly} toggle={tog_delete_assmebly}>
          <ModalHeader toggle={tog_delete_assmebly}>Confirm Delete</ModalHeader>
          <ModalBody>Are you sure you want to delete this part?</ModalBody>
          <ModalFooter>
            <Button color="danger" onClick={handleDeleteAssembly}>
              Delete
            </Button>
            <Button color="secondary" onClick={tog_delete_assmebly}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </Col>
    );
  }
);

export default AssemblyTable;
