import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import "./project.css";
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
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PaginatedList from "../Pagination/PaginatedList";
import { useCalculation } from "../../../Components/context/CalculationContext";
const categories = [{ name: "Make" }, { name: "Purchase" }];

const List = () => {
  const [selectedPartId, setSelectedPartId] = useState(
    localStorage.getItem("selectedPartId")
  );
  const [partType, setPartType] = useState("");
  //   const [modal_category, setModal_category] = useState(false);
  const [modal_list, setModalList] = useState(false);
  // const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [newPartId, setNewPartId] = useState("");
  const [filterType, setFilterType] = useState("");
  const [newPartName, setNewPartName] = useState(""); // For storing new part name
  const [newCodeName, setnewCodeName] = useState(""); // For storing new part name
  const [newclientNumber, setnewclientNumber] = useState(""); // For storing new part name
  const [listData, setListData] = useState([]); // Local state to store project list
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
  const [modal_duplicate, setModalDuplicate] = useState(false); // For duplicate modal
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
  const [totalPage, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    partName: "",
    costPerUnit: "",
    timePerUnit: "",
    stockPOQty: "",
  });

  const toggleModal = () => {
    setModalList(!modal_list);
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
        partsCalculations: [...item.partsCalculations],
      });
    }
    setModalDuplicate(!modal_duplicate);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch parts");
      }
      const data = await response.json();
      setListData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // const fetchData = useCallback(async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const params = new URLSearchParams();
  //     if (filterType !== "") {
  //       params.append("partType", filterType);
  //     }
  //     params.append("page", currentPage);
  //     params.append("limit", itemsPerPage);

  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/api/parts?${params.toString()}`
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch parts");
  //     }
  //     const data = await response.json();
  //     if (!data || !data.results) {
  //       setListData([]);
  //       setCurrentPage(1);
  //       setTotalPages(1);
  //     } else {
  //       setListData(data.results);
  //       setCurrentPage(data.page);
  //       setTotalPages(Math.ceil(data.total / itemsPerPage));
  //     }
  //   } catch (err) {
  //     setError(err.message);
  //     setListData([]);
  //     setCurrentPage(1);
  //     // setTotalPages(1);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [filterType, currentPage, itemsPerPage]);

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

  // useEffect(() => {
  //   fetchData();
  // }, [filterType]);

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
  const handlePartClick = (id) => {
    setSelectedPartId(id);
    localStorage.setItem("selectedPartId", id);
  };

  // const filteredData = listData.filter((item) =>
  //   item.partName.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const filteredData = useMemo(() => {
    if (!listData) return [];
    return listData.filter(
      (item) =>
        item.partName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterType === "" || item.partType === filterType)
    );
  }, [listData, searchTerm, filterType]);

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

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setnewCodeName(inputValue === "" ? "-" : inputValue);
  };

  // const handleAddPart = async () => {
  //   // Extract only the numeric part of the ID
  //   const numericId = newPartId.replace(/[^-\d]/g, "");

  //   const newPart = {
  //     id: numericId,
  //     partName: newPartName,
  //     clientNumber: newclientNumber,
  //     codeName: newCodeName || "",
  //     costPerUnit: 0,
  //     timePerUnit: 0,
  //     stockPOQty: stockPOQty || 0,
  //   };

  //   try {
  //     const response = await fetch(
  //       `${process.env.REACT_APP_BASE_URL}/api/parts`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(newPart),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to add part");
  //     }

  //     // If the request is successful, refresh the list data
  //     await fetchData();

  //     // Reset form fields
  //     setNewPartId("");
  //     setNewPartName("");
  //     setnewCodeName("");
  //     setnewclientNumber("");
  //     setCostPerUnit(0);
  //     setTimePerUnit(0);
  //     setStockPOQty(0);

  //     // Close the modal
  //     toggleModal(false);

  //     toast.success("Records added successfully!");
  //   } catch (error) {
  //     console.error("Error adding part:", error);
  //     toast.error("Failed to add part. Please try again.");
  //   }
  // };

  const handleAddPart = async () => {
    // Extract only the numeric part of the ID
    const numericId = newPartId.replace(/[^-\d]/g, "");

    // for expection in make
    // const newPart = {
    //   id: numericId,
    //   partName: newPartName,
    //   clientNumber: newclientNumber,
    //   codeName: partType === "Make" ? newCodeName : "",
    //   costPerUnit: partType === "Make" ? costPerUnit : parseFloat(costPerUnit),
    //   timePerUnit: timePerUnit || 0,
    //   stockPOQty: stockPOQty || 0,
    //   partType: partType,
    //   totalCost: partType === "Purchase" ? parseFloat(totalCost) : 0,
    //   totalQuantity: partType === "Purchase" ? parseFloat(totalQuantity) : 0,
    // };

    const newPart = {
      id: numericId,
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
        `${process.env.REACT_APP_BASE_URL}/api/parts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPart),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add part");
      }

      // If the request is successful, refresh the list data
      await fetchData();

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
        await fetchData(); // Refetch the data to update the table
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
            partsCalculations: duplicatePartData.partsCalculations,
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

      // Refresh the parts list and close the modal
      await fetchData();
      setModalDuplicate(false);

      toast.success("Duplicate part created successfully!");
    } catch (error) {
      console.error("Error creating duplicate:", error.message);
      toast.error(error.message);
    }
  };

  // Calculate totals for each part
  // const partTotals = listData.reduce((acc, part) => {
  //   // console.log("Processing item:", part.id);

  //   const rmTotal = part.rmVariables.reduce(
  //     (sum, item) => sum + Number(item.totalRate || 0),
  //     0
  //   );
  //   const manufacturingTotal = part.manufacturingVariables.reduce(
  //     (sum, item) => sum + Number(item.totalRate || 0),
  //     0
  //   );
  //   const shipmentTotal = part.shipmentVariables.reduce(
  //     (sum, item) => sum + Number(item.hourlyRate || 0),
  //     0
  //   );
  //   const overheadsTotal = part.overheadsAndProfits.reduce(
  //     (sum, item) => sum + Number(item.totalRate || 0),
  //     0
  //   );

  //   acc[part.id] = {
  //     rmTotal,
  //     manufacturingTotal,
  //     shipmentTotal,
  //     overheadsTotal,
  //     totalCost: (acc[part.id]?.totalCost || 0) + part.costPerUnit,
  //     costPerUnitAvg:
  //       rmTotal + manufacturingTotal + shipmentTotal + overheadsTotal, // Calculate avg
  //     manufacturingHours: part.manufacturingVariables.reduce(
  //       (sum, item) => sum + Number(item.hours || 0),
  //       0
  //     ),
  //   };

  //   return acc;
  // }, {});

  // Object.entries(partTotals).forEach(([partId, totals]) => {
  // console.log(`Part ${partId}:`);
  // console.log("RM Total:", totals.rmTotal);
  // console.log("Manufacturing Total:", totals.manufacturingTotal);
  // console.log("Shipment Total:", totals.shipmentTotal);
  // console.log("Overheads Total:", totals.overheadsTotal);
  // console.log("Cost Per Unit Avg:", totals.costPerUnitAvg);
  // });

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
      await fetchData(); // Refetch the data to update the table
      toast.success("Records Deleted Successfully");
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // const singlePartId = localStorage.getItem("selectedPartId" || "");

  // useEffect(() => {
  //   const handlePartClick = async () => {
  //     // localStorage.getItem("selectedPartId", id);
  //     try {
  //       const response = await fetch(
  //         `${process.env.REACT_APP_BASE_URL}/api/parts/${singlePartId}`
  //       );
  //       if (!response.ok) throw new Error("Failed to fetch part");
  //       const data = await response.json();
  //       setListData([data]); // Displays only the selected part
  //     } catch (err) {
  //       console.error(err.message);
  //     }
  //   };
  //   handlePartClick();
  // }, []);

  const clearSelection = () => {
    setSelectedPartId(null);
    localStorage.removeItem("selectedPartId");
    fetchData(); // Re-fetch the entire list
  };

  const formatTime = (time) => {
    if (time === 0) {
      return 0;
    }

    let result = "";

    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (days > 0) result += `${days}d `;
      if (remainingHours > 0) result += `${remainingHours}h `;
      if (minutes > 0) result += `${minutes}m`;

      return result.trim();
    }

    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim();
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
        <div className="col-sm-auto">
          <div>
            <Button
              color="success"
              className="add-btn me-1"
              onClick={toggleModal}
              id="create-btn"
            >
              <i className="ri-add-line align-bottom me-1"></i> Add Part
            </Button>
          </div>
        </div>
        <div className="col-sm-7 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2 align-items-center">
            <div className="search-box ms-1 col-sm-5 d-flex align-items-center">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ width: "20rem", height: "40px" }}
              />
              <i
                className="ri-search-line search-icon ml-2"
                style={{ marginTop: "-1px" }}
              ></i>
            </div>
            {/* <div className="col-sm-auto">
              <FormControl style={{ width: "15rem", height: "40px" }}>
                <InputLabel
                  id="demo-simple-select-label"
                  style={{ marginTop: "-6px" }}
                >
                  Filter by Part Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={filterType}
                  onChange={handleFilterChange}
                  label="Filter by Part Type"
                  style={{ height: "40px" }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Make">Make</MenuItem>
                  <MenuItem value="Purchase">Purchase</MenuItem>
                </Select>
              </FormControl>
            </div> */}
            <div className="col-sm-auto">
              <FormControl style={{ width: "15rem", height: "40px" }}>
                <InputLabel
                  id="demo-simple-select-label"
                  style={{ marginTop: "-6px" }}
                >
                  Filter by Part Type
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1); // Reset to page 1 when applying a new filter
                  }}
                  label="Filter by Part Type"
                  style={{ height: "40px" }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="Make">Make</MenuItem>
                  <MenuItem value="Purchase">Purchase</MenuItem>
                </Select>
              </FormControl>
            </div>
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
        <table className="table table-striped">
          {/* <thead>
            <tr>
              <th>Name</th>
              <th>Part Type</th>
              <th>Drawing Number</th>
              <th>Client Number</th>
              <th>Cost per Unit</th>
              <th>Total Hours</th>

              <th>Actions</th>
            </tr>
          </thead> */}
          <thead>
            <tr>
              <th>Name</th>
              <th>Part Type</th>
              <th>Drawing Number</th>
              <th>Client Number</th>
              <th>Cost per Unit</th>
              <th>Total Hours</th>
              <th>Total Cost</th>
              <th>Total Quantity</th>
              {/* {partType === "Purchase" && (
                <>
                  <th>Total Cost</th>
                  <th>Total Quantity</th>
                </>
              )} */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* {paginatedData.map((item, index) => (
              <tr key={index}>
                <td
                  onClick={() => handlePartClick(item._id)}
                >
                  <Link
                    to={`/singlepart/${item._id}`}
                    style={{ color: "red" }}
                    className="text-body"
                  >
                    {item.partName.trim()} {item.codeName}
                  </Link>
                </td>
                <td>{item.partType || "-"}</td>
                <td>{item.id}</td>
                <td>{item.clientNumber}</td>
                <td>{Math.ceil(item.costPerUnit)}</td>
                <td>{formatTime(item.timePerUnit || 0)}</td>
                <td>
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="button"
                      className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                    >
                      <FeatherIcon icon="more-horizontal" className="icon-sm" />
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
            ))} */}
            {paginatedData.map((item, index) => (
              <tr key={index}>
                <td>
                  {item.partType === "Make" ? (
                    <Link
                      to={`/singlepart/${item._id}`}
                      style={{ color: "red", cursor:'pointer' }}
                      className="text-body"
                      onClick={() => handlePartClick(item._id)}
                    >
                      {item.partName.trim()} {item.codeName}
                    </Link>
                  ) : (
                    <span style={{cursor:'no-drop'}}>
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
                {/* {item.partType === "Purchase" && (
                  <>
                    <td>{item.totalCost}</td>
                    <td>{item.totalQuantity}</td>
                  </>
                )} */}
                {/* On Hand column */}
                <td>
                  <UncontrolledDropdown direction="start">
                    <DropdownToggle
                      tag="button"
                      className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                    >
                      <FeatherIcon icon="more-horizontal" className="icon-sm" />
                    </DropdownToggle>
                    <DropdownMenu className="dropdown-menu-end">
                      {/* <div className="dropdown-divider"></div> */}
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

        {/* Pagination */}
        <PaginatedList
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </>
      {/* Modal for adding a new item */}
      {/* <Modal isOpen={modal_list} toggle={toggleModal} centered>
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
              <label htmlFor="category" className="form-label">
                Part Type
              </label>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choose Category"
                    variant="outlined"
                  />
                )}
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

            <Button type="submit" color="success" className="add-btn me-1">
              <i className="ri-add-line align-bottom me-1"></i> Add
            </Button>
          </ModalBody>
        </form>
      </Modal> */}
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
    </React.Fragment>
  );
};

export default List;
