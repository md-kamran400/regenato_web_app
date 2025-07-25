import debounce from "lodash.debounce";
import React, { useState, useCallback, useEffect, memo } from "react"; //add parts list
import { FaEdit } from "react-icons/fa";
// import "../project.css";
import Checkbox from "@mui/material/Checkbox";
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
import CircularProgress from "@mui/material/CircularProgress";
import { FiEdit } from "react-icons/fi";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { FiSettings } from "react-icons/fi";
import RawMaterial from "./ExpandFolders/RawMaterial";
import Shipment from "./ExpandFolders/Shipment";
import Overheads from "./ExpandFolders/Overheads";
import { Link, useParams } from "react-router-dom";
import { MdOutlineDelete } from "react-icons/md";
import Manufacturing from "./ExpandFolders/Manufacturing";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from "react-toastify";
import HoursPlanningTab from "../HoursPlanningTab";
import HoursPlanningCard from "../HoursPlanningCard";
import { PartListHrPlan } from "../HoursPlanningFolder/TestingPartAllocation/PartListHrPlan";

// Add these styles at the top of the file after the imports
const styles = {
  partNameWithImage: {
    position: "relative",
    display: "inline-block",
  },
  partImageTooltip: {
    display: "none",
    position: "absolute",
    zIndex: 1000,
    backgroundColor: "white",
    padding: "5px",
    borderRadius: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    top: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginTop: "5px",
  },
  partNameWithImageHover: {
    "&:hover .part-image-tooltip": {
      display: "block",
    },
  },
};

// Add this CSS to your existing styles
const partNameWithImageStyle = {
  position: "relative",
  display: "inline-block",
};

const partImageTooltipStyle = {
  display: "none",
  position: "absolute",
  zIndex: 1000,
  backgroundColor: "white",
  padding: "5px",
  borderRadius: "4px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  top: "100%",
  left: "50%",
  transform: "translateX(-50%)",
  marginTop: "5px",
};

const PartsTable = React.memo(
  ({
    partsList,
    partsListID,
    updatePartsLists,
    onAddPart,
    onUpdatePrts,
    // getStatus,
  }) => {
    const userRole = localStorage.getItem("userRole");
    const [selectedParts, setSelectedParts] = useState([]);
    const [selectedPartIds, setSelectedPartIds] = useState(new Set());
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

    const [editQuantityModal, setEditQuantityModal] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);

    const [partsListItemsUpdated, setPartsListItemsUpdated] = useState(false);
    const [codeName, setCodeName] = useState("");

    const [editModal, setEditModal] = useState(false);
    // const [editModal, setEditModal] = useState(false);
    const [partsListName, setPartsListName] = useState("");
    const [selectedPartsList, setSelectedPartsList] = useState(null);
    const toggleAddModal = () => {
      setModalAdd(!modalAdd);
    };
    const [modalOpenId, setModalOpenId] = useState(null);
    const [loadingParts, setLoadingParts] = useState(false);
    const [statusFilter, setStatusFilter] = useState("all");
    // console.log(partsList._id);
    // console.log(updatePartsLists)

    const [open, setOpen] = useState(false);
    const [imageCache, setImageCache] = useState({});

    // const [expandedRowId, setExpandedRowId] = useState(null);

    const [imageLoadErrors, setImageLoadErrors] = useState({});

    const [hoveredImageId, setHoveredImageId] = useState(null);
    const [imageUrls, setImageUrls] = useState({});

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchPartsListItems = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();

        // Update parts list items with proper status
        const updatedItems = data.data.map((item) => {
          const status = item.status || "Not Allocated";
          const statusClass = item.statusClass || "badge bg-info text-white";
          return {
            ...item,
            status,
            statusClass,
          };
        });

        setPartsListsItems(updatedItems);
      } catch (error) {
        console.error("Error fetching parts list items:", error);
      }
    };
    useEffect(() => {
      fetchPartsListItems();
    }, [_id, partsList, partsListItemsUpdated]);

    const fetchPartImage = useCallback(
      async (imagePath, itemId) => {
        try {
          if (!imagePath || imageUrls[itemId]) return null;

          // Check if we've already failed to load this image
          if (imageLoadErrors[itemId]) {
            return null;
          }

          const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items/${itemId}/image`,
            {
              headers: {
                "Cache-Control": "no-cache",
              },
            }
          );

          if (response.ok) {
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            setImageUrls((prev) => ({
              ...prev,
              [itemId]: objectUrl,
            }));

            return objectUrl;
          }

          setImageLoadErrors((prev) => ({
            ...prev,
            [itemId]: true,
          }));

          return null;
        } catch (error) {
          setImageLoadErrors((prev) => ({
            ...prev,
            [itemId]: true,
          }));
          return null;
        }
      },
      [_id, partsList._id, imageUrls, imageLoadErrors]
    );

    // Update the useEffect for image loading
    useEffect(() => {
      const fetchImages = async () => {
        for (const item of partsListItems) {
          if (
            item.image &&
            !imageLoadErrors[item._id] &&
            !imageUrls[item._id]
          ) {
            await fetchPartImage(item.image, item._id);
          }
        }
      };

      fetchImages();
    }, [partsListItems, fetchPartImage]);

    // Cleanup effect
    useEffect(() => {
      return () => {
        Object.values(imageUrls).forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    }, [imageUrls]);

    useEffect(() => {
      setPartsListItemsUpdated(false);
    }, [partsListItemsUpdated]);

    const handlePartsChange = useCallback((event, newValue) => {
      setSelectedParts(newValue);
      setSelectedPartIds(new Set(newValue.map((part) => part.id)));
      setOpen(true); // Keep dropdown open after selection
    }, []);

    useEffect(() => {
      const fetchManufacturingVariables = async () => {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
        );
        const data = await response.json();
        setManufacturingVariables(data);
        // console.log(data);

        // setMachinesTBU((prev) => ({
        //   ...prev,
        //   ...data.reduce((acc, item) => ({ ...acc, [item.name]: 6 }), {}),
        // }));
      };
      fetchManufacturingVariables();
    }, []);

    // useEffect(() => {
    //   const fetchParts = async () => {
    //     const response = await fetch(
    //       `${process.env.REACT_APP_BASE_URL}/api/parts`
    //     );
    //     const data = await response.json();
    //     setParts(data);
    //     // console.log(data);
    //   };

    //   fetchParts();

    // }, []);

    // deleting the part list items
    useEffect(() => {
      fetchParts();
    }, []);

    const fetchParts = async (pageNumber = 1, search = "") => {
      setLoadingParts(true);
      try {
        const response = await fetch(
          `${
            process.env.REACT_APP_BASE_URL
          }/api/parts?page=${pageNumber}&limit=25&search=${encodeURIComponent(
            search
          )}`
        );
        const result = await response.json();
        const newParts = result.data;

        setParts((prev) =>
          pageNumber === 1 ? newParts : [...prev, ...newParts]
        );
        setHasMore(newParts.length > 0);
      } catch (error) {
        console.error("Error fetching parts:", error);
      } finally {
        setLoadingParts(false);
      }
    };

    // Debounced search
    const debouncedSearch = useCallback(
      debounce((value) => {
        setPage(1);
        setParts([]); // clear previous parts
        fetchParts(1, value);
      }, 400),
      []
    );

    // Handle search input
    const handleInputChange = (event, value, reason) => {
      if (reason === "input") {
        setSearchTerm(value);
        debouncedSearch(value);
      }
    };

    // Handle selection
    // const handlePartsChange = (event, newValue) => {
    //   setSelectedPartIds(new Set(newValue.map((part) => part.id)));
    //   // Your logic for selected parts here
    // };

    useEffect(() => {
      if (open) {
        setPage(1);
        fetchParts(1);
      }
    }, [open]);

    const tog_delete = () => {
      setModalDelete(!modal_delete);
    };

    const toggleModal = (item) => {
      setModalOpenId((prevId) => (prevId === item._id ? null : item._id));
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

    const PartsTableFetch = useCallback(async () => {
      try {
        const response = await fetch(
          // `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists`
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists`
        );
        const data = await response.json();
        setPartsDisplay(data.partsListItems || []);
        // console.log(data.partsListItems)
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }, [_id]);

    useEffect(() => {
      PartsTableFetch();
    }, [PartsTableFetch]);

    // const handleSubmit = async (event) => {
    //   event.preventDefault();
    //   setIsLoading(true);

    //   if (selectedParts.length === 0) {
    //     toast.error("Please select at least one part");
    //     setIsLoading(false);
    //     return;
    //   }

    //   try {
    //     const payload = selectedParts.map((part) => ({
    //       partsCodeId: part.id, // ✅ changed here
    //       partName: part.partName,
    //       codeName: part.codeName || "",
    //       costPerUnit: Number(part.costPerUnit || 0),
    //       timePerUnit: Number(part.timePerUnit || 0),
    //       quantity: Number(quantity),
    //       rmVariables: part.rmVariables || [],
    //       manufacturingVariables: part.manufacturingVariables || [],
    //       shipmentVariables: part.shipmentVariables || [],
    //       overheadsAndProfits: part.overheadsAndProfits || [],
    //       image: part.image || null,
    //     }));

    //     const response = await fetch(
    //       `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items`,
    //       {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(payload),
    //       }
    //     );

    //     if (!response.ok) {
    //       throw new Error("Failed to add parts");
    //     }

    //     const data = await response.json();

    //     // Update local state with new parts
    //     setPartsListsItems((prevItems) => [
    //       ...prevItems,
    //       ...data.data.partsListItems,
    //     ]);
    //     onUpdatePrts(data);

    //     setModalAdd(false);
    //     setIsLoading(false);
    //     toast.success(`${selectedParts.length} new records added successfully`);

    //     // Reset form
    //     setSelectedParts([]);
    //     setSelectedPartIds(new Set());
    //     setQuantity(0);

    //     // Update the partsListItemsUpdated state
    //     setPartsListItemsUpdated(true);
    //   } catch (error) {
    //     console.error("Error:", error);
    //     setError("Failed to add parts. Please try again.");
    //     toast.error("Failed to add records. Please try again.");
    //     setIsLoading(false);
    //   }
    // };

    const handleSubmit = async (event) => {
      event.preventDefault();
      setIsLoading(true);

      if (selectedParts.length === 0) {
        toast.error("Please select at least one part");
        setIsLoading(false);
        return;
      }

      try {
        const payload = selectedParts.map((part) => ({
          partsCodeId: part.id,
          partName: part.partName,
          codeName: part.codeName || "",
          costPerUnit: Number(part.costPerUnit || 0),
          timePerUnit: Number(part.timePerUnit || 0),
          quantity: Number(quantity),
          rmVariables: part.rmVariables || [],
          manufacturingVariables: part.manufacturingVariables || [],
          shipmentVariables: part.shipmentVariables || [],
          overheadsAndProfits: part.overheadsAndProfits || [],
          image: part.image || null, // Ensure image is included from the selected part
        }));

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add parts");
        }

        const data = await response.json();

        // Update local state with new parts
        setPartsListsItems((prevItems) => [
          ...prevItems,
          ...data.data.partsListItems,
        ]);
        onUpdatePrts(data);

        setModalAdd(false);
        setIsLoading(false);
        toast.success(`${selectedParts.length} new records added successfully`);

        // Reset form
        setSelectedParts([]);
        setSelectedPartIds(new Set());
        setQuantity(0);

        // Update the partsListItemsUpdated state
        setPartsListItemsUpdated(true);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to add parts. Please try again.");
        toast.error("Failed to add records. Please try again.");
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
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items/${itemToEdit._id}/quantity`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ quantity: itemToEdit.quantity }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update quantity");
        }

        const data = await response.json();
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

        toast.success("Records deleted successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete Records. Please try again.");
      }
    };
    ///projects/:projectId/partsLists/:listId/items/:itemId
    const handlePartDelete = async () => {
      if (!itemToDelete) return;

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items/${itemToDelete._id}`,
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
        toast.success("Records deleted successfully");
      } catch (error) {
        console.error("Error deleting part:", error);
        toast.error("Failed to delete Records. Please try again.");
      }
    };

    //edit
    //  `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}`,
    const handleEdit = async (e) => {
      e.preventDefault();
      const partsListName = e.target.partsListName.value;
      try {
        const response = await fetch(
          // `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsList._id}`,
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}`,
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
        toast.success("Records Edited successfully");
      } catch (error) {
        console.error("Error updating parts list:", error);
        // Handle the error (e.g., show an error message to the user)
        toast.error("Failed to Edited Records. Please try again.");
      }
    };

    const formatTime = (time) => {
      if (time === 0) {
        return "0 m";
      }

      const totalMinutes = Math.round(time * 60); // Convert hours to minutes
      return `${totalMinutes} m`;
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

    const filteredPartsListItems =
      statusFilter === "all"
        ? partsListItems
        : partsListItems.filter((item) => {
            const status = getStatusDisplay(item);
            return status.text === statusFilter;
          });

    return (
      <>
        {isLoading && (
          <div className="loader-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        <div
          className="button-group"
          style={{
            marginTop: "-4.1rem",
            // border: "1px solid",hoursplanningtab
            display: "flex",
            justifyContent: "space-between",
            padding: "0.5rem",
          }}
        >
          {userRole === "admin" && (
            <Button
              color="success"
              className="add-btn"
              onClick={toggleAddModal}
              id="Add_Part_btn"
            >
              <i className="ri-add-line align-bottom me-1"></i>Add Part
            </Button>
          )}
        </div>

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
              <div class="ribbon ribbon-success ribbon-shape">Parts</div>
            </div>
          </div>
          {/* Add the filter select box here */}
          <div
            className="mb-3"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginRight: "5px",
            }}
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
              <option value="Completed">Completed</option> {/* ✅ New Option */}
            </Input>
          </div>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
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
                          <th>Total Cost (INR)</th>
                          <th>Total Machining Hours</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPartsListItems?.map((item) => {
                          return (
                            <React.Fragment key={item._id}>
                              <tr>
                                <td
                                  onClick={() =>
                                    handleRowClickParts(item._id, item.partName)
                                  }
                                  className={
                                    expandedRowId === item._id ? "expanded" : ""
                                  }
                                  style={{
                                    cursor: "pointer",
                                    color: "#64B5F6",
                                    position: "relative",
                                  }}
                                >
                                  <div
                                    className="part-name-with-image"
                                    style={{
                                      position: "relative",
                                      display: "inline-block",
                                    }}
                                    onMouseEnter={() =>
                                      setHoveredImageId(item._id)
                                    }
                                    onMouseLeave={() => setHoveredImageId(null)}
                                  >
                                    {item.partName} ({item.partsCodeId || ""})
                                    {item.image &&
                                      hoveredImageId === item._id && (
                                        <div
                                          style={{
                                            position: "absolute",
                                            zIndex: 1000,
                                            backgroundColor: "white",
                                            padding: "12px",
                                            borderRadius: "12px",
                                            boxShadow:
                                              "0 10px 25px rgba(0, 0, 0, 0.15)",
                                            top: "100%",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            marginTop: "8px",
                                            display: "block",
                                            animation: "fadeIn 0.2s ease-out",
                                            border: "1px solid #f0f0f0",
                                            width: "220px",
                                            transition: "all 0.2s ease",
                                            marginLeft: "2.5rem",
                                          }}
                                        >
                                          <div
                                            style={{
                                              position: "relative",
                                              paddingBottom: "100%",
                                              borderRadius: "8px",
                                              overflow: "hidden",
                                              marginBottom: "8px",
                                              backgroundColor: "#f9f9f9",
                                            }}
                                          >
                                            <img
                                              src={`${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsList._id}/items/${item._id}/image`}
                                              alt={item.partName}
                                              style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                transition:
                                                  "transform 0.3s ease",
                                              }}
                                              onMouseEnter={(e) =>
                                                (e.currentTarget.style.transform =
                                                  "scale(1.05)")
                                              }
                                              onMouseLeave={(e) =>
                                                (e.currentTarget.style.transform =
                                                  "scale(1)")
                                              }
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                                setImageLoadErrors((prev) => ({
                                                  ...prev,
                                                  [item._id]: true,
                                                }));
                                              }}
                                            />
                                          </div>

                                          <div
                                            style={{
                                              display: "flex",
                                              flexDirection: "column",
                                              gap: "6px",
                                              padding: "0 4px",
                                            }}
                                          >
                                            <div
                                              style={{
                                                fontWeight: "600",
                                                fontSize: "15px",
                                                color: "#222",
                                                textAlign: "center",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                              }}
                                            >
                                              {item.partName}
                                            </div>
                                            <div
                                              style={{
                                                fontSize: "13px",
                                                color: "#555",
                                                textAlign: "center",
                                                backgroundColor: "#f5f5f5",
                                                padding: "4px 8px",
                                                borderRadius: "12px",
                                                display: "inline-block",
                                                alignSelf: "center",
                                              }}
                                            >
                                              ID: {item.partsCodeId || "N/A"}
                                            </div>
                                          </div>

                                          {/* Optional: Add a small arrow at the top */}
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: "-8px",
                                              left: "50%",
                                              transform: "translateX(-50%)",
                                              width: 0,
                                              height: 0,
                                              borderLeft:
                                                "8px solid transparent",
                                              borderRight:
                                                "8px solid transparent",
                                              borderBottom: "8px solid white",
                                              filter:
                                                "drop-shadow(0 -2px 2px rgba(0,0,0,0.1))",
                                            }}
                                          />
                                        </div>
                                      )}
                                  </div>
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
                                <td>{Math.round(item.costPerUnit || 0)}</td>
                                <td>{formatTime(item.timePerUnit || 0)}</td>
                                <td>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      width: "80%",
                                      gap: "8px",
                                    }}
                                  >
                                    {parseInt(item.quantity || 0)}
                                    <button
                                      className="btn btn-sm btn-success edit-item-btn "
                                      onClick={() => handleEditQuantity(item)}
                                    >
                                      <FaEdit />
                                    </button>
                                  </div>
                                </td>

                                <td>
                                  {Math.ceil(
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
                                        marginLeft: "3px",
                                      }}
                                    >
                                      <MdOutlineDelete
                                        size={25}
                                        onClick={() => toggleDeleteModal(item)}
                                      />
                                    </span>
                                  </div>
                                </td>
                              </tr>

                              {expandedRowId === item._id && (
                                <tr>
                                  <td colSpan="8">
                                    <PartListHrPlan
                                      partName={item.partName}
                                      partsCodeId={item.partsCodeId}
                                      partId={item.id}
                                      manufacturingVariables={
                                        item.manufacturingVariables || []
                                      }
                                      quantity={item.quantity}
                                      porjectID={_id}
                                      partID={partsListID}
                                      partListItemId={item._id}
                                      partManufacturingVariables={
                                        item.manufacturingVariables
                                      } // Add this line
                                      onUpdateAllocaitonStatus={() => {
                                        fetchPartsListItems(); // Refresh the data
                                      }}
                                    />
                                  </td>
                                </tr>
                              )}
                              {modalOpenId === item._id && (
                                <Modal
                                  isOpen={true}
                                  toggle={() => setModalOpenId(null)}
                                  centered // This centers the modal vertically
                                  size="xl" // Makes the modal extra large
                                  style={{
                                    maxWidth: "90%", // Adjust this as needed
                                    margin: "0 auto", // Centers horizontally
                                    left: "auto", // Reset any left positioning
                                    right: "auto", // Reset any right positioning
                                  }}
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
                                  <ModalBody
                                    style={{
                                      overflowX: "auto",
                                      padding: "1.5rem", // Added padding for better spacing
                                    }}
                                  >
                                    <div className="container-fluid">
                                      <Row>
                                        <Col xs={12}>
                                          <div style={{ marginBottom: "20px" }}>
                                            <RawMaterial
                                              partName={item.partName}
                                              rmVariables={item.rmVariables}
                                              projectId={_id}
                                              partId={partsList._id}
                                              itemId={item._id}
                                              source="partList"
                                              rawMatarialsUpdate={onUpdatePrts}
                                              quantity={item.quantity}
                                            />
                                          </div>
                                        </Col>

                                        <Col xs={12}>
                                          <div style={{ marginBottom: "20px" }}>
                                            <Manufacturing
                                              partName={item.partName}
                                              manufacturingVariables={
                                                item.manufacturingVariables ||
                                                []
                                              }
                                              projectId={_id}
                                              partId={partsList._id}
                                              itemId={item._id}
                                              onUpdateVariable={
                                                updateManufacturingVariable
                                              }
                                              source="partList"
                                              manufatcuringUpdate={onUpdatePrts}
                                              quantity={item.quantity}
                                            />
                                          </div>
                                        </Col>

                                        <Col xs={12}>
                                          <div style={{ marginBottom: "20px" }}>
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
                                              quantity={item.quantity}
                                            />
                                          </div>
                                        </Col>

                                        <Col xs={12}>
                                          <div>
                                            <Overheads
                                              partName={item.partName}
                                              overheadsAndProfits={
                                                item.overheadsAndProfits || []
                                              }
                                              projectId={_id}
                                              partId={partsList._id}
                                              itemId={item._id}
                                              source="partList"
                                              overHeadsUpdate={onUpdatePrts}
                                              quantity={item.quantity}
                                            />
                                          </div>
                                        </Col>
                                      </Row>
                                    </div>
                                  </ModalBody>
                                  <ModalFooter>
                                    <Button
                                      color="secondary"
                                      onClick={() => setModalOpenId(null)}
                                    >
                                      Close
                                    </Button>
                                  </ModalFooter>
                                </Modal>
                              )}
                            </React.Fragment>
                          );
                        })}
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
              <form onSubmit={handleSubmit} id="addPartForm">
                <Autocomplete
                  multiple
                  open={open}
                  onOpen={() => {
                    setOpen(true);
                    if (parts.length === 0) {
                      setPage(1);
                      fetchParts(1, searchTerm);
                    }
                  }}
                  onClose={() => setOpen(false)}
                  options={parts}
                  loading={loadingParts}
                  getOptionLabel={(option) =>
                    option ? `${option.partName} - ${option.id}` : ""
                  }
                  onChange={handlePartsChange}
                  onInputChange={handleInputChange}
                  disableCloseOnSelect
                  ListboxProps={{
                    onScroll: (event) => {
                      const listboxNode = event.currentTarget;
                      const bottom =
                        listboxNode.scrollTop + listboxNode.clientHeight >=
                        listboxNode.scrollHeight - 10;
                      if (bottom && hasMore && !loadingParts) {
                        const nextPage = page + 1;
                        setPage(nextPage);
                        fetchParts(nextPage, searchTerm);
                      }
                    },
                  }}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        style={{ marginRight: 8 }}
                        checked={selectedPartIds.has(option.id)}
                      />
                      {`${option.partName} - ${option.id}`}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Parts"
                      variant="outlined"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingParts && (
                              <CircularProgress color="inherit" size={20} />
                            )}
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

                <div className="form-group mt-4">
                  <Label for="quantity" className="form-label">
                    Quantity (for all selected parts)
                  </Label>
                  <Input
                    className="form-control"
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity.toString()}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === "" || /^\d+$/.test(inputValue)) {
                        const numericValue =
                          inputValue === "" ? 0 : parseInt(inputValue);
                        if (numericValue > 99999) {
                          toast.warning("Maximum quantity is 99999");
                          setQuantity(99999);
                        } else {
                          setQuantity(numericValue);
                        }
                      }
                    }}
                    max="99999"
                    required
                  />
                  {quantity > 99999 && (
                    <small className="text-danger">
                      Maximum quantity is 99999
                    </small>
                  )}
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

                {/* <Button
                  style={{ marginLeft: "22rem" }}
                  type="submit"
                  color="primary"
                  disabled={!selectedPartData || !quantity}
                >
                  Add
                </Button> */}
                <Button
                  // style={{ marginLeft: "18rem" }}
                  type="submit"
                  color="primary"
                  disabled={selectedParts.length === 0 || !quantity}
                >
                  {selectedParts.length > 0
                    ? `Add ${selectedParts.length} Part(s)`
                    : "Add"}
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

          {/* quentitiy edit modal */}
          <Modal
            isOpen={editQuantityModal}
            toggle={() => setEditQuantityModal(false)}
          >
            <ModalHeader toggle={() => setEditQuantityModal(false)}>
              Edit Quantity
            </ModalHeader>
            <ModalBody>
              <form
                onSubmit={(e) => handleSubmitEditQuantity(e)}
                id="editQuantityForm"
              >
                <div className="form-group">
                  <Label htmlFor="editQuantity">New Quantity</Label>
                  <Input
                    type="number"
                    id="editQuantity"
                    name="editQuantity"
                    value={itemToEdit ? itemToEdit.quantity : ""}
                    onChange={(e) =>
                      setItemToEdit({
                        ...itemToEdit,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" type="submit" form="editQuantityForm">
                Update Quantity
              </Button>
              <Button
                color="secondary"
                onClick={() => setEditQuantityModal(false)}
              >
                Cancel
              </Button>
            </ModalFooter>
          </Modal>
        </Col>
      </>
    );
  }
);

export default PartsTable;
