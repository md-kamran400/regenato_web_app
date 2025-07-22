import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import { Spinner } from "reactstrap";
import { RiDeleteBin6Line } from "react-icons/ri";
// import "./projectParts.css";

import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  Button,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
// import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PaginatedList from "../Pagination/PaginatedList";
import Select from "react-select";

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: "20rem",
    height: "40px",
    overflow: "hidden", // Prevents height increase
  }),
  valueContainer: (provided) => ({
    ...provided,
    overflowX: "auto", // Allow horizontal scrolling
    whiteSpace: "nowrap",
    flexWrap: "nowrap", // Prevents wrapping
  }),
  multiValue: (provided) => ({
    ...provided,
    display: "inline-flex",
    maxWidth: "150px", // Limit the display size
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
};
const partTypeOptions = [
  { value: "Make", label: "Make" },
  { value: "Purchase", label: "Purchase" },
];

const categories = [{ name: "Make" }, { name: "Purchase" }];
import { FaSort } from "react-icons/fa";

const List = () => {
  const [selectedPartId, setSelectedPartId] = useState(
    localStorage.getItem("selectedPartId")
  );
  const [initialLoad, setInitialLoad] = useState(true);
  const [partType, setPartType] = useState("");
  //   const [modal_category, setModal_category] = useState(false);
  const [modal_list, setModalList] = useState(false);
  const [modal_listExel, setModalListExel] = useState(false);
  // const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [newPartId, setNewPartId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [newPartName, setNewPartName] = useState(""); // For storing new part name
  const [newCodeName, setnewCodeName] = useState(""); // For storing new part name
  const [newclientNumber, setnewclientNumber] = useState(""); // For storing new part name
  const [listData, setListData] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State for handling errors
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [costPerUnit, setCostPerUnit] = useState(null);
  const [timePerUnit, setTimePerUnit] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [stockPOQty, setStockPOQty] = useState(0);
  const [posting, setPosting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [modal_duplicate, setModalDuplicate] = useState(false);
  const [duplicatePartData, setDuplicatePartData] = useState({
    partName: "",
    id: "",
  });
  const [selectedPart, setSelectedPart] = useState(null); // Holds the part to duplicate
  const [modal_edit, setModalEdit] = useState(false);
  const [editPartId, setEditPartId] = useState(null);
  const [editPartName, setEditPartName] = useState("");
  const [editDrawingNumber, setEditDrawingNumber] = useState("");
  const [editClientNumber, setEditClientNumber] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [formData, setFormData] = useState({
    partName: "",
    costPerUnit: "",
    timePerUnit: "",
    stockPOQty: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [warningModal, setWarningModal] = useState(false);
  const [warningData, setWarningData] = useState("");
  const [missingCategoryData, setmissingCategoryData] = useState("");

  // select delete
  const [sortedData, setSortedData] = useState([]); // Data sorted for display
  const [sortOrder, setSortOrder] = useState(null); // 'asc' for ascending, 'desc' for descending, null for default
  const [selectedRows, setSelectedRows] = useState([]); // Tracks selected rows
  const [selectAll, setSelectAll] = useState(false);

  const toggleModal = () => {
    setModalList(!modal_list);
  };

  const toggleModalUpload = () => {
    setModalListExel(!modal_listExel);
  };

  const handleFilterChange = (event) => {
    setFilterType(event.target.value);
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const toggleDuplicateModal = (item) => {
    if (item) {
      setSelectedPart(item); // Save the original part data for duplication
      setDuplicatePartData({
        partName: `${item.partName}2`, // Append '2' to the part name
        id: "", // Leave the new ID empty for user input
        costPerUnit: item.costPerUnit,
        clientNumber: item.clientNumber,
        codeName: item.codeName,
        timePerUnit: item.timePerUnit,
        stockPOQty: item.stockPOQty,
        generalVariables: [...item.generalVariables],
        rmVariables: [...item.rmVariables], // Deep clone nested arrays
        manufacturingVariables: [...item.manufacturingVariables],
        shipmentVariables: [...item.shipmentVariables],
        overheadsAndProfits: [...item.overheadsAndProfits],
        partType: item.partType,
      });
    }
    setModalDuplicate(!modal_duplicate);
  };

  const fetchData = useCallback(
    async (forceRefresh = false, page = currentPage) => {
      setLoading(true);
      setError(null);
      try {
        if (forceRefresh) {
          sessionStorage.removeItem("cachedPartsData");
        }

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts?filterType=${filterType}&page=${page}&limit=${itemsPerPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch parts");
        }
        const { data, pagination } = await response.json();

        setListData(data || []);
        setTotalPages(pagination?.pages || 1);
      } catch (err) {
        setError(err.message);
        setListData([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    },
    [filterType, currentPage, itemsPerPage]
  );

  const fetchSearchOptions = useCallback(
    debounce(async (inputValue) => {
      if (!inputValue) {
        setSearchOptions([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts?search=${inputValue}&limit=20`
        );
        const result = await response.json();
        const formatted = result.data.map((project) => ({
          value: `${project.partName} (${project.id})`,
          label: `${project.partName} (${project.id})`,
          partName: project.partName,
          drawingNumber: project.id,
        }));
        setSearchOptions(formatted);
      } catch (error) {
        console.error("Search fetch failed:", error);
        setSearchOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedPartId) {
      fetchData();
      fetchSelectedPart();
      clearSelection();
      return;
    } else {
      fetchData();
    }
  }, [selectedPartId]);

  useEffect(() => {
    setSortedData(listData);
  }, [listData]);

  // New function to fetch a single part
  const fetchSelectedPart = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${selectedPartId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch selected part");
      }
      const data = await response.json();
      setListData([data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Use this function when a part is clicked
  // const handlePartClick = (id) => {
  //   setSelectedPartId(id);
  //   localStorage.setItem("selectedPartId", id);
  // };

  const handleSortByDate = () => {
    let sorted;

    if (sortOrder === "asc") {
      // Sort in descending order
      sorted = [...listData].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setSortOrder("desc");
    } else {
      // Default to ascending order
      sorted = [...listData].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setSortOrder("asc");
    }

    setListData(sorted);
  };

  const filteredData = (listData || []).filter((item) => {
    // If no search term, return all items that match the filter type
    if (searchTerm.length === 0) {
      return filterType === "" || item.partType === filterType;
    }

    // Check if any search term matches either partName or drawingNumber
    const matchesSearch = searchTerm.some(
      (term) =>
        item.partName?.toLowerCase().includes(term.partName.toLowerCase()) ||
        item.id?.toLowerCase().includes(term.drawingNumber.toLowerCase())
    );

    // Also check the filter type
    const matchesFilter = filterType === "" || item.partType === filterType;

    return matchesSearch && matchesFilter;
  });

  // const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  // const paginatedData = filteredData.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Reset searchTerm when input is cleared
    setCurrentPage(1); // Reset to the first page
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchData(false, page); // Fetch data for the new page
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setnewCodeName(inputValue === "" ? "-" : inputValue);
  };

  const handleSearchChange = async (selectedOptions) => {
    const searchValues = selectedOptions
      ? selectedOptions.map((opt) => ({
          partName: opt.partName,
          drawingNumber: opt.drawingNumber,
        }))
      : [];

    setSearchTerm(searchValues);
    setCurrentPage(1);

    if (searchValues.length === 0) {
      // If search is cleared, fetch normal paginated data again
      fetchData(true);
      return;
    }

    try {
      // Construct query to fetch specific parts
      const queryParams = searchValues
        .map((term) => `search=${term.drawingNumber}`)
        .join("&");

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts?${queryParams}`
      );

      const result = await response.json();
      setListData(result.data || []);
      setTotalPages(1); // Because we only show selected result(s)
    } catch (error) {
      console.error("Failed to fetch selected search data:", error);
      toast.error("Failed to load search result");
    }
  };

  const partOptions = (listData || []).map((project) => ({
    value: `${project.partName} (${project.id})`, // Combine name and ID for display
    label: `${project.partName} (${project.id})`, // Display both in dropdown
    partName: project.partName,
    drawingNumber: project.id,
  }));

  const handleAddPart = async () => {
    // Use the ID as entered by the user, preserving dashes and formatting
    const newPart = {
      id: newPartId, // <-- preserve formatting
      partName: newPartName,
      clientNumber: newclientNumber,
      codeName: newCodeName || "",
      costPerUnit: costPerUnit || 0,
      timePerUnit: timePerUnit || 0,
      stockPOQty: stockPOQty || 0,
      partType: partType,
      totalCost: totalCost || 0,
      totalQuantity: totalQuantity || 0,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`, //""
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPart),
        }
      );

      if (!response.ok) {
        // Check for duplicate key error
        const data = await response.json();
        if (data.message && data.message.includes("duplicate key error")) {
          toast.error("A part with this Drawing Number already exists.");
          return;
        }
        throw new Error("Failed to add part");
      }

      // Force refresh the data
      sessionStorage.removeItem("cachedPartsData");
      await fetchData(true);

      // Reset form fields
      setNewPartId("");
      setNewPartName("");
      setnewCodeName("");
      setnewclientNumber("");
      setCostPerUnit(0);
      setTimePerUnit(0);
      setStockPOQty(0);
      setPartType("");
      setTotalCost(0);
      setTotalQuantity(0);

      // Close the modal
      toggleModal(false);

      toast.success("Records added successfully!");
    } catch (error) {
      console.error("Error adding part:", error);
      toast.error("Failed to add part. Please try again.");
    }
  };

  const toggleEditModal = (item) => {
    if (item) {
      setEditPartId(item._id);
      setEditPartName(item.partName);
      setEditDrawingNumber(item.id);
      setEditClientNumber(item.clientNumber);
    }
    setModalEdit(!modal_edit);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${editPartId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            partName: editPartName,
            id: editDrawingNumber,
            clientNumber: editClientNumber,
          }),
        }
      );

      if (response.ok) {
        // Force refresh the data
        sessionStorage.removeItem("cachedPartsData");
        await fetchData(true);
        toast.success("Records updated successfully!");
        toggleEditModal();
      } else {
        throw new Error("Failed to update part");
      }
    } catch (error) {
      console.error("Error updating part:", error);
      toast.error("Failed to update part. Please try again.");
    }
  };

  // creating handleDuplicate
  const handleCreateDuplicate = async () => {
    try {
      console.log("Duplicate Part Data:", duplicatePartData);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: duplicatePartData.id,
            partName: duplicatePartData.partName,
            clientNumber: duplicatePartData.clientNumber,
            codeName: duplicatePartData.codeName, //code name new added here
            costPerUnit: duplicatePartData.costPerUnit,
            timePerUnit: duplicatePartData.timePerUnit,
            stockPOQty: duplicatePartData.stockPOQty,
            generalVariables: duplicatePartData.generalVariables,
            rmVariables: duplicatePartData.rmVariables,
            manufacturingVariables: duplicatePartData.manufacturingVariables,
            shipmentVariables: duplicatePartData.shipmentVariables,
            overheadsAndProfits: duplicatePartData.overheadsAndProfits,
            partType: duplicatePartData.partType,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error Response:", errorText);
        throw new Error(
          `Failed to create duplicate part. Response: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Duplicate Part Created:", result);

      // Force refresh the data
      sessionStorage.removeItem("cachedPartsData");
      await fetchData(true);
      setModalDuplicate(false);

      toast.success("Duplicate part created successfully!");
    } catch (error) {
      console.error("Error creating duplicate:", error.message);
      toast.error(error.message);
    }
  };

  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      // Clear the cache and force a fresh fetch
      sessionStorage.removeItem("cachedPartsData");
      await fetchData(true); // Force refresh
      toast.success("Records Deleted Successfully");
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    return () => {
      // Clear the selection when component unmounts
      localStorage.removeItem("selectedPartId");
      setSelectedPartId(null);
      // Clear cache when component unmounts
      sessionStorage.removeItem("cachedPartsData");
    };
  }, []);

  // Modify the clearSelection function to be more thorough
  const clearSelection = useCallback(() => {
    setSelectedPartId(null);
    localStorage.removeItem("selectedPartId");
    fetchData(); // Re-fetch the entire list
  }, [fetchData]);

  // Modify the handlePartClick to include a way to clear selection
  const handlePartClick = useCallback(
    (id) => {
      if (id === selectedPartId) {
        clearSelection();
      } else {
        setSelectedPartId(id);
        localStorage.setItem("selectedPartId", id);
      }
    },
    [selectedPartId, clearSelection]
  );

  const formatTime = (time) => {
    if (time === 0) {
      return "0 m";
    }

    const totalMinutes = Math.round(time * 60); // Convert hours to minutes
    return `${totalMinutes} m`;
  };

  const handleRemoveFile = () => {
    console.log("Removing file...");
    setUploadedFile(null); // Clear the uploaded file
    console.log("File removed:", uploadedFile);
  };

  // const handleUpload = async () => {
  //   if (uploadedFile) {
  //     setIsUploading(true);
  //     try {
  //       const formData = new FormData();
  //       formData.append("file", uploadedFile);

  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/parts/uploadexcel`,
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //         await fetchData();
  //       }

  //       const data = await response.json();
  //       // console.log("Upload response:", data);
  //       await fetchData();

  //       toast.success("File uploaded successfully!");
  //       setUploadedFile(null); // Reset the uploaded file after successful upload
  //       toggleModalUpload();
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //       toast.error("Failed to upload file. Please try again.");
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   } else {
  //     toast.error("Please select a file to upload");
  //   }
  // };

  // const handleUpload = async () => {
  // // do the excel post here as well
  // };
  // const handleUpload = async () => {
  //   if (uploadedFile) {
  //     setIsUploading(true);
  //     try {
  //       const formData = new FormData();
  //       formData.append("file", uploadedFile);

  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/parts/uploadexcel`,
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       );

  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }

  //       const data = await response.json();

  //       // Handle warning or success
  //       if (data.duplicateCount > 0) {
  //         setWarningData(data.duplicateIds.join(", "));
  //         setmissingCategoryData(data.missingCategoryIds.join(", "));
  //         setWarningModal(true);
  //       } else {
  //         toast.success("File uploaded successfully!");
  //       }

  //       // Fetch updated data
  //       await fetchData();

  //       setUploadedFile(null); // Reset the uploaded file after successful upload
  //       toggleModalUpload(); // Close the upload modal automatically
  //       toast.success("File uploaded successfully!");
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //       toast.error("Failed to upload file. Please try again.");
  //     } finally {
  //       setIsUploading(false);
  //     }
  //   } else {
  //     toast.error("Please select a file to upload");
  //   }
  // };

  // Modify handleUpload to clear cache after successful upload

  const handleUpload = async () => {
    if (uploadedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", uploadedFile);

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts/uploadexcel`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // Handle warning or success
        if (data.duplicateCount > 0) {
          setWarningData(data.duplicateIds.join(", "));
          setmissingCategoryData(data.missingCategoryIds.join(", "));
          setWarningModal(true);
        } else {
          toast.success("File uploaded successfully!");
        }

        // Clear cache and fetch updated data
        sessionStorage.removeItem("cachedPartsData");
        await fetchData(true);

        setUploadedFile(null); // Reset the uploaded file after successful upload
        toggleModalUpload(); // Close the upload modal automatically
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error("Failed to upload file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
      toast.error("Please select a file to upload");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      setUploadedFile(file);
    } else {
      alert("Only Excel files (.xlsx, .xls) are allowed.");
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/vnd.ms-excel" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    ) {
      setUploadedFile(file);
    } else {
      alert("Only Excel files (.xlsx, .xls) are allowed.");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // select dlete

  // Handles "Select All" checkbox
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(!selectAll ? listData.map((item) => item._id) : []);
  };

  // Handles individual checkbox selection
  const handleRowSelect = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Handles delete functionality
  // const handleDeleteSelect = async () => {
  //   if (selectAll) {
  //     // Delete all parts
  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/api/parts`,
  //       {
  //         method: "DELETE",
  //       }
  //     );
  //     if (!response.ok) throw new Error("Failed to delete all parts");
  //     toast.success("All parts deleted successfully");
  //   } else {
  //     // Delete selected parts
  //     const deletePromises = selectedRows.map((_id) =>
  //       fetch(`${process.env.REACT_APP_BASE_URL}/api/parts/${_id}`, {
  //         method: "DELETE",
  //       })
  //     );
  //     await Promise.all(deletePromises);
  //     toast.success("Selected parts deleted successfully");
  //   }
  //   // Refresh data
  //   fetchData();
  //   setSelectedRows([]);
  //   setSelectAll(false);
  //   setShowDeleteModal(false);
  // };

  // Modify handleDeleteSelect (bulk delete) to clear cache

  const handleDeleteSelect = async () => {
    try {
      if (selectAll) {
        // Delete all parts
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to delete all parts");
        toast.success("All parts deleted successfully");
      } else {
        // Delete selected parts
        const deletePromises = selectedRows.map((_id) =>
          fetch(`${process.env.REACT_APP_BASE_URL}/api/parts/${_id}`, {
            method: "DELETE",
          })
        );
        await Promise.all(deletePromises);
        toast.success("Selected parts deleted successfully");
      }
      // Clear cache and refresh data
      sessionStorage.removeItem("cachedPartsData");
      await fetchData(true); // Force refresh
      setSelectedRows([]);
      setSelectAll(false);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
      <DeleteModal
        show={false}
        onDeleteClick={() => {}}
        onCloseClick={() => {}}
      />
      <Row className="g-4 mb-3">
        {/* Buttons Section - Will stack on small screens */}
        <div className="col-12 col-md-auto d-flex flex-wrap gap-2 mb-2 mb-md-0">
          <Button
            color="success"
            className="add-btn"
            onClick={toggleModal}
            id="create-btn"
          >
            <i className="ri-add-line align-bottom me-1"></i> Add Part
          </Button>

          <Button
            color="success"
            className="add-btn"
            onClick={toggleModalUpload}
            id="create-btn"
          >
            <i className="ri-add-line align-bottom me-1"></i> Upload Excel
          </Button>
        </div>

        {/* Search and Filter Section - Will stack on small screens */}
        <div className="col-12 col-md-7 ms-md-auto">
          <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center">
            {/* Search Box - Full width on small screens */}
            <div className="flex-grow-1">
              <Select
                options={searchOptions}
                isMulti
                isClearable
                placeholder="Search by name or drawing number..."
                onChange={handleSearchChange}
                onInputChange={(inputValue) => {
                  fetchSearchOptions(inputValue);
                  return inputValue; // prevents [object Promise]
                }}
                getOptionLabel={(option) =>
                  `${option.partName} (${option.drawingNumber})`
                }
                getOptionValue={(option) => option.value}
                styles={{
                  ...customStyles,
                  control: (provided) => ({
                    ...provided,
                    width: "100%",
                    minWidth: "150px",
                    height: "40px",
                    overflow: "hidden",
                  }),
                }}
              />
            </div>

            {/* Part Type Filter - Full width on small screens */}
            <div className="flex-grow-1">
              <Select
                options={partTypeOptions}
                isClearable
                placeholder="Select Part Type"
                onChange={(selectedOption) => {
                  if (selectedOption) {
                    setFilterType(selectedOption.value);
                  } else {
                    setFilterType("");
                  }
                }}
                styles={{
                  ...customStyles,
                  control: (provided) => ({
                    ...provided,
                    width: "100%", // Full width on small screens
                    minWidth: "100px", // Minimum width
                    height: "40px",
                    overflow: "hidden",
                  }),
                }}
              />
            </div>

            {/* Delete Button - Aligns to the end */}
            {selectedRows.length > 0 && (
              <div className="d-flex justify-content-end">
                <Button
                  color="danger"
                  className="d-flex align-items-center gap-2 shadow"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <RiDeleteBin6Line size={20} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Row>
      {/* {loading && <p>Loading...</p>} */}
      {error && <p>Error: {error}</p>}
      <>
        {loading && (
          <div className="loader-overlay">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            className="table table-striped vertical-lines horizontals-lines"
            style={{
              border: "2px solid black",
              minWidth: "1000px",
              width: "100%",
            }}
          >
            <thead style={{ backgroundColor: "#f3f4f6" }}>
              <tr>
                <th
                  style={{
                    cursor: "pointer",
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#f3f4f6",
                    zIndex: 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th style={{ cursor: "pointer", minWidth: "100px" }}>
                  <span style={{ marginLeft: "5px", marginRight: "10px" }}>
                    Date
                  </span>
                  <FaSort size={15} onClick={handleSortByDate} />
                </th>
                <th>Name</th>
                <th>Part Type</th>
                <th>Drawing Number</th>
                <th>Client Number</th>
                <th>Cost per Unit</th>
                <th>Total Hours</th>
                <th>Total Cost (INR) </th>
                <th>Total Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody style={{ border: "2px solid black" }}>
              {filteredData?.map((item, index) => (
                <tr key={index} style={{ border: "2px solid black" }}>
                  <td
                    style={{
                      position: "sticky",
                      left: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(item._id)}
                      onChange={() => handleRowSelect(item._id)}
                    />
                  </td>
                  <td>
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    {item.partType === "Make" ? (
                      <Link
                        to={`/singlepart/${item._id}`}
                        style={{ color: "red", cursor: "pointer" }}
                        className="text-body"
                        onClick={() => handlePartClick(item._id)}
                      >
                        {item.partName.trim()} {item.codeName}
                      </Link>
                    ) : (
                      <span style={{ cursor: "no-drop" }}>
                        {item.partName.trim()} {item.codeName}
                      </span>
                    )}
                  </td>
                  <td>{item.partType || "-"}</td>
                  <td>{item.id}</td>
                  <td>{item.clientNumber}</td>
                  <td>{Math.ceil(item.costPerUnit)}</td>
                  <td>{formatTime(item.timePerUnit || 0)}</td>
                  <td>{item.totalCost}</td>
                  <td>{item.totalQuantity}</td>
                  <td>
                    <UncontrolledDropdown direction="start">
                      <DropdownToggle
                        tag="button"
                        className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                      >
                        <FeatherIcon
                          icon="more-horizontal"
                          className="icon-sm"
                        />
                      </DropdownToggle>
                      <DropdownMenu className="dropdown-menu-end">
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
                        <DropdownItem
                          href="#"
                          onClick={() => toggleDuplicateModal(item)}
                        >
                          <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                          Duplicate
                        </DropdownItem>
                        <DropdownItem onClick={() => toggleEditModal(item)}>
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

        {/* Pagination */}
        <PaginatedList
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </>

      <Modal isOpen={modal_list} toggle={toggleModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal}>
          {" "}
          Add Part{" "}
        </ModalHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPart();
          }}
        >
          <ModalBody>
            <div className="mb-3 mt-3">
              <label htmlFor="part-type" className="form-label">
                Part Type
              </label>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choose Part Type"
                    variant="outlined"
                  />
                )}
                onChange={(e, value) => setPartType(value?.name)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="parts-id" className="form-label">
                Drawing Number
              </label>
              <Input
                type="text"
                className="form-control"
                placeholder="Enter Drawing Number (e.g, 48A47015099)"
                value={newPartId}
                onChange={(e) => setNewPartId(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="parts-name" className="form-label">
                Common Name
              </label>
              <input
                type="text"
                id="parts-name"
                className="form-control"
                placeholder="Enter Name"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="client-number" className="form-label">
                Client Number
              </label>
              <input
                type="text"
                id="client-number"
                className="form-control"
                placeholder="Enter Client Number"
                value={newclientNumber}
                onChange={(e) => setnewclientNumber(e.target.value)}
              />
            </div>
            {partType === "Make" && (
              <>
                <div className="mb-3">
                  <label htmlFor="code-name" className="form-label">
                    Code Name
                  </label>
                  <input
                    type="text"
                    id="code-name"
                    className="form-control"
                    placeholder="Enter Code Name"
                    value={newCodeName}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* {partType === "Purchase" && (
              <>
                <div className="mb-3">
                  <label htmlFor="total-cost" className="form-label">
                    Total Cost
                  </label>
                  <input
                    type="number"
                    id="total-cost"
                    className="form-control"
                    placeholder="Enter Total Cost"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="total-quantity" className="form-label">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    id="total-quantity"
                    className="form-control"
                    placeholder="Enter Total Quantity"
                    value={totalQuantity}
                    onChange={(e) => setTotalQuantity(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="cost-per-unit" className="form-label">
                    Cost per Unit
                  </label>
                  <input
                    type="number"
                    id="cost-per-unit"
                    className="form-control"
                    placeholder="Enter Cost per Unit"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                  />
                </div>
              </>
            )} */}
            {partType === "Purchase" && (
              <>
                <div className="mb-3">
                  <label htmlFor="cost-per-unit" className="form-label">
                    Cost per Unit
                  </label>
                  <input
                    type="number"
                    id="cost-per-unit"
                    className="form-control"
                    placeholder="Enter Cost per Unit"
                    value={costPerUnit}
                    onChange={(e) => {
                      setCostPerUnit(e.target.value);
                      if (totalQuantity > 0) {
                        setTotalCost(
                          parseFloat(e.target.value) * totalQuantity
                        );
                      }
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="total-cost" className="form-label">
                    Total Cost
                  </label>
                  <input
                    type="number"
                    id="total-cost"
                    className="form-control"
                    placeholder="Enter Total Cost"
                    value={totalCost}
                    onChange={(e) => {
                      setTotalCost(e.target.value);
                      if (totalQuantity > 0) {
                        setCostPerUnit(
                          parseFloat(e.target.value) / totalQuantity
                        );
                      }
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="total-quantity" className="form-label">
                    Total Quantity
                  </label>
                  <input
                    type="number"
                    id="total-quantity"
                    className="form-control"
                    placeholder="Enter Total Quantity"
                    value={totalQuantity}
                    onChange={(e) => {
                      setTotalQuantity(e.target.value);
                      if (totalCost > 0) {
                        setCostPerUnit(
                          parseFloat(totalCost) / parseFloat(e.target.value)
                        );
                      }
                    }}
                  />
                </div>
              </>
            )}

            <Button type="submit" color="success" className="add-btn me-1">
              <i className="ri-add-line align-bottom me-1"></i> Add
            </Button>
          </ModalBody>
        </form>
      </Modal>

      <Modal
        isOpen={modal_duplicate}
        toggle={() => setModalDuplicate(false)}
        centered
      >
        <ModalHeader toggle={() => setModalDuplicate(false)}>
          Duplicate Part
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label htmlFor="duplicate-part-name" className="form-label">
              Part Name
            </label>
            <Input
              type="text"
              id="duplicate-part-name"
              className="form-control"
              value={duplicatePartData.partName}
              onChange={(e) =>
                setDuplicatePartData({
                  ...duplicatePartData,
                  partName: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="duplicate-part-id" className="form-label">
              Part ID
            </label>
            <Input
              type="text"
              id="duplicate-part-id"
              className="form-control"
              placeholder="Enter a unique ID"
              value={duplicatePartData.id}
              onChange={(e) =>
                setDuplicatePartData({
                  ...duplicatePartData,
                  id: e.target.value,
                })
              }
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateDuplicate}>
            Create Duplicate
          </Button>
          <Button color="secondary" onClick={() => setModalDuplicate(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

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

      {/* edit modal */}
      <Modal isOpen={modal_edit} toggle={toggleEditModal} centered>
        <ModalHeader toggle={toggleEditModal}>Edit Part</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="edit-part-name" className="form-label">
                Part Name
              </label>
              <input
                type="text"
                id="edit-part-name"
                className="form-control"
                value={editPartName}
                onChange={(e) => setEditPartName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit-drawing-number" className="form-label">
                Drawing Number
              </label>
              <input
                type="text"
                id="edit-drawing-number"
                className="form-control"
                value={editDrawingNumber}
                onChange={(e) => setEditDrawingNumber(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit-client-number" className="form-label">
                Client Number
              </label>
              <input
                type="text"
                id="edit-client-number"
                className="form-control"
                value={editClientNumber}
                onChange={(e) => setEditClientNumber(e.target.value)}
                required
              />
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" type="submit" onClick={handleEditSubmit}>
            Update
          </Button>
          <Button color="secondary" onClick={toggleEditModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* EXCEL MODAL FOR UPLAODING THE EXCEL  */}
      <Modal isOpen={modal_listExel} toggle={toggleModalUpload} centered>
        <ModalHeader toggle={toggleModalUpload}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <lord-icon
              src="https://cdn.lordicon.com/gsqxdxog.json"
              trigger="loop"
              colors="primary:#f7b84b,secondary:#f06548"
              style={{ width: "50px", height: "50px" }}
            ></lord-icon>
            <h5
              className="modal-title"
              style={{
                marginLeft: "-4rem",
                fontWeight: "bold",
                color: "#333",
              }}
            >
              Upload Excel File
              {duplicateCount > 0 && (
                <span style={{ color: "red", marginLeft: "10px" }}>
                  ({duplicateCount} duplicates found)
                </span>
              )}
            </h5>
          </div>
        </ModalHeader>

        <ModalBody>
          <div style={{ textAlign: "center", paddingBottom: "16px" }}>
            <h5 style={{ fontSize: "18px", color: "#444" }}>
              Drag and drop or click to upload
            </h5>
            <p style={{ fontSize: "14px", color: "#777" }}>
              Only Excel files (.xlsx, .xls) are allowed
            </p>
          </div>
          <div
            style={{
              border: dragOver ? "2px solid #007bff" : "2px dashed #ccc",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              backgroundColor: dragOver ? "#eaf4ff" : "#f9f9f9",
              cursor: "pointer",
              transition: "background-color 0.3s, border-color 0.3s",
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
              }}
            />
            <i
              className="ri-upload-cloud-2-line"
              style={{
                fontSize: "48px",
                color: dragOver ? "#007bff" : "#bbb",
              }}
            ></i>
            <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
              Drop file here or click to upload
            </p>
          </div>
          {uploadedFile && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#f8f8f8",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <div>
                <h6
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  Selected File:
                </h6>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <i
                    className="ri-file-excel-2-line"
                    style={{
                      marginRight: "10px",
                      fontSize: "24px",
                      color: "#28a745",
                    }}
                  ></i>
                  <span style={{ color: "#555" }}>{uploadedFile.name}</span>
                  <button
                    type="button"
                    className="btn btn-link"
                    style={{
                      marginLeft: "auto",
                      color: "#d9534f",
                      textDecoration: "none",
                      fontSize: "14px",
                    }}
                    onClick={handleRemoveFile}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModalBody>
        <ModalFooter
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {/* <Button
            color="secondary"
            onClick={toggleModalUpload}
            style={{
              backgroundColor: "#6c757d",
              borderColor: "#6c757d",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Cancel
          </Button> */}
          <Button
            color="primary"
            onClick={() => handleUpload()}
            style={{
              backgroundColor: "#007bff",
              borderColor: "#007bff",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
            disabled={!uploadedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Spinner className="small-spinner" size="xs" color="light" />
                &nbsp; Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </ModalFooter>
      </Modal>

      {/* warnind modal for uplaoding the duplicate id for excel */}
      <Modal
        isOpen={warningModal}
        toggle={() => setWarningModal(false)}
        centered
      >
        <ModalHeader toggle={() => setWarningModal(false)}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <i
              className="ri-error-warning-line"
              style={{ color: "#f0ad4e", marginRight: "8px" }}
            ></i>
            Warning
          </span>
        </ModalHeader>
        <ModalBody
          style={{
            maxHeight: "400px", // Fixed height
            overflowY: "auto", // Scrollable if content exceeds height
          }}
        >
          <h5 style={{ color: "#555" }}>Upload Partially Successful</h5>
          {warningData && (
            <>
              <p style={{ color: "#555", marginTop: "1rem" }}>
                Duplicate IDs skipped:
              </p>
              <ol style={{ paddingLeft: "1.5rem", color: "#333" }}>
                {warningData.split(", ").map((id, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    {id}
                  </li>
                ))}
              </ol>
            </>
          )}
          {missingCategoryData && (
            <>
              <p style={{ color: "#555", marginTop: "1rem" }}>
                Variables missing from Database:
              </p>
              <ol style={{ paddingLeft: "1.5rem", color: "#333" }}>
                {missingCategoryData.split(", ").map((id, index) => (
                  <li key={index} style={{ marginBottom: "0.5rem" }}>
                    {id}
                  </li>
                ))}
              </ol>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setWarningModal(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* delete all modal  */}
      <Modal
        isOpen={showDeleteModal}
        toggle={() => setShowDeleteModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowDeleteModal(false)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          Are you sure you want to delete the selected parts?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDeleteSelect}>
            Delete
          </Button>
          <Button color="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default List;
