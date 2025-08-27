import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
// import "./project.css";
import { toast } from "react-toastify";

const ManufacturingVariable = ({
  partDetails,
  onTotalCountUpdate,
  onTotalCountUpdateHours,
}) => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [modal_static_add, setModalstatic_add] = useState(false);
  const [manufacturingData, setManufacturingData] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manufacturingVariables, setmanufacturingVariables] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [shipmentvars, setshipmentvars] = useState([]);
  const [manufacturingCounthour, setmanufacturingCounthours] = useState(0);
  const [manufacturingCount, setmanufacturingCount] = useState(null);
  const [selectedShipment, setselectedShipment] = useState(null);
  const [SelectedManufacuturingVariable, setSelectedManufacuturingVariable] =
    useState(null);
  const [selectedOptionEdit, setSelectedOptionEdit] = useState("");
  const [inputValueEdit, setInputValueEdit] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null);
  const [unit, setUnit] = useState("minutes");

  const [subMachineOptions, setSubMachineOptions] = useState([]);

  // Form state
  // const [formData, setFormData] = useState({
  //   categoryId: "",
  //   name: "",
  //   times:"",
  //   "time-hours": "",
  //   "time-minutes": "",
  //   hours: "",
  //   hourlyRate: "",
  //   totalRate: "",
  // });

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    times: "",
    hours: "",
    hourlyRate: "",
    totalRate: "",
    isSpecialday: false, // Add this
    SpecialDayTotalMinutes: 0, // Add this
  });

  // Toggles for modals

  const getNextCategoryId = (existingIds) => {
    let nextId = "C1";

    if (existingIds && existingIds.length > 0) {
      const sortedIds = existingIds.sort();
      const lastId = sortedIds[sortedIds.length - 1];

      if (/^C\d+$/.test(lastId)) {
        const numberMatch = lastId.match(/\d+/);
        if (numberMatch) {
          const lastNumber = parseInt(numberMatch[0], 10);
          nextId = `C${lastNumber + 1}`;
        }
      }
    }

    return nextId;
  };

  const tog_add = () => {
    // setModalList(!modal_add);
    const allIds = [
      ...manufacturingData.map((item) => item.categoryId),
      ...shipmentvars.map((item) => item.categoryId),
    ];
    const nextId = getNextCategoryId(allIds);

    setFormData({
      categoryId: nextId,
      name: "",
      hours: "",
      hourlyRate: "",
      totalRate: "",
      isSpecialday: false, // Add this
      SpecialDayTotalMinutes: 0,
    });

    setModalList(!modal_add); // Open the modal
  };

  const tog_static_vairbale = () => {
    setFormData({
      categoryId: "",
      name: "",
      times: "",
      hours: 0,
      hourlyRate: 0,
      totalRate: 0,
    });
    setModalstatic_add(!modal_static_add);
  };

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  // const tog_edit = (item = null) => {
  //   if (item) {
  //     setFormData({
  //       categoryId: item.categoryId,
  //       name: item.name,
  //       hours: item.hours,
  //       hourlyRate: item.hourlyRate,
  //       totalRate: item.totalRate,
  //     });
  //     setEditId(item._id);
  //   } else {
  //     setFormData({
  //       categoryId: "",
  //       name: "",
  //       hours: "",
  //       hourlyRate: "",
  //       totalRate: "",
  //     });
  //     setEditId(null);
  //   }
  //   setModalEdit(!modal_edit);
  // };

  //   useEffect(() => {

  const tog_edit = (item = null) => {
  if (item) {
    const hours = parseFloat(item.hours);
    let selectedOption = "hours";
    let inputValue = hours.toString();

    if (hours >= 24) {
      selectedOption = "days";
      inputValue = (hours / 24).toString();
    } else if (hours < 1) {
      selectedOption = "minutes";
      inputValue = (hours * 60).toString();
    }

    // Find the manufacturing variable to get its subcategories
    const selectedVariable = manufacturingVariables.find(
      v => v.categoryId === item.categoryId
    );
    
    setSubMachineOptions(selectedVariable?.subCategories || []);

    setFormData({
      ...item,
      hours: hours.toFixed(2),
      isSpecialday: item.isSpecialday || false,
      SpecialDayTotalMinutes: item.SpecialDayTotalMinutes || 0,
    });
    setSelectedOptionEdit(selectedOption);
    setInputValueEdit(inputValue);
    setEditId(item._id);
  } else {
    setFormData({
      categoryId: "",
      name: "",
      hours: "",
      hourlyRate: "",
      totalRate: "",
      isSpecialday: false,
      SpecialDayTotalMinutes: 0,
    });
    setEditId(null);
  }
  setModalEdit(!modal_edit);
};

  const fetchManufacturingData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/manufacturingVariables`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Received manufacturing data:", data); // Add this line
      setManufacturingData(data);
      console.log("Set manufacturing data:", manufacturingData); // Add this line
    } catch (error) {
      console.error("Error fetching manufacturingVariables data:", error);
    } finally {
      setLoading(false);
    }
  }, [partDetails?._id]);

  // Fetch data when partDetails changes
  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchManufacturingData();
    }
  }, [partDetails, fetchManufacturingData]);

  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchManufacturingData();
    }
  }, [partDetails, fetchManufacturingData]);

  // If you want to ensure the data is sorted even after local updates:
  // useEffect(() => {
  //   const sortedData = [...manufacturingData].sort((a, b) => {
  //     const numA = parseInt(a.categoryId.replace(/\D/g, "")) || 0;
  //     const numB = parseInt(b.categoryId.replace(/\D/g, "")) || 0;
  //     return numA - numB;
  //   });

  //   // Only update if the order actually changed
  //   if (JSON.stringify(sortedData) !== JSON.stringify(manufacturingData)) {
  //     setManufacturingData(sortedData);
  //   }
  // }, [manufacturingData]);

  useEffect(() => {
    const total = manufacturingData.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );
    setmanufacturingCount(total);
    console.log(total);

    // Call the callback function to update the parent component
    onTotalCountUpdate(total);
  }, [manufacturingData]);

  useEffect(() => {
    const total = manufacturingData.reduce(
      (sum, item) => sum + Number(item.hours || 0),
      0
    );
    setmanufacturingCounthours(total);
    console.log(total);

    // Call the callback function to update the parent component
    onTotalCountUpdateHours(total);
  }, [manufacturingData]);

  const totalRate = formData.hourlyRate * formData.hours;

  // Add this state variable

  // Modify handleAutocompleteChange to populate sub-machine options
  const handleAutocompleteChange = (event, newValue) => {
    setSelectedManufacuturingVariable(newValue);
    if (newValue) {
      setSubMachineOptions(newValue.subCategories || []);
      setFormData((prevFormData) => ({
        ...prevFormData,
        categoryId: newValue.categoryId,
        name: newValue.name,
        hourlyRate: newValue.hourlyrate,
        SubMachineName: "",
        isSpecialday: newValue.isSpecialday || false, // Add this
        SpecialDayTotalMinutes: newValue.SpecialDayTotalMinutes || 0, // Add this
        totalRate:
          (newValue.hourlyrate || 0) * (parseFloat(prevFormData.hours) || 0),
      }));
    } else {
      setSubMachineOptions([]);
    }
  };
  // Add handler for sub-machine selection
  const handleSubMachineChange = (event, newValue) => {
    if (newValue) {
      setFormData((prev) => ({
        ...prev,
        SubMachineName: newValue.name,
        hourlyRate: newValue.hourlyRate, // Sub-machine's hourlyRate
        totalRate: (newValue.hourlyRate || 0) * (parseFloat(prev.hours) || 0),
      }));
    }
  };

  useEffect(() => {
    const fetchRmVariables = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setmanufacturingVariables(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };

    fetchRmVariables();
  }, []);

  //   fetch snipment variable
  useEffect(() => {
    const fetchShipment = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setshipmentvars(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };

    fetchShipment();
  }, []);

  const handleAutocompleteChangestatic = (event, newValue) => {
    setselectedShipment(newValue);
    if (newValue) {
      const selectedItem = shipmentvars.find(
        (item) => item.name === newValue.name
      );

      if (selectedItem) {
        setFormData({
          categoryId: newValue.categoryId,
          name: newValue.name,
          times: selectedItem.times,
          hours: parseFloat(selectedItem.hours) || 0,
          hourlyRate: parseFloat(selectedItem.hourlyRate) || 0,
          totalRate: 0, // Set totalRate to 0 initially
        });
      }
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    const selectedOption = document.getElementById("time-select").value;

    if (selectedOption === "day") {
      const hours = parseFloat(inputValue) * 24;
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: hours.toFixed(2),
        totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
          2
        ),
        times: `${inputValue} ${selectedOption}`,
      }));
    } else if (selectedOption === "hours") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: inputValue,
        totalRate: (
          parseFloat(inputValue) * parseFloat(prevFormData.hourlyRate || 0)
        ).toFixed(2),
        times: `${inputValue} ${"hr"}`,
      }));
    } else if (selectedOption === "minutes") {
      const hours = parseFloat(inputValue) / 60;
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: hours.toFixed(2),
        totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
          2
        ),
        times: `${inputValue} ${"min"}`,
      }));
    }

    setInputValue(inputValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };

      if (name === "hourlyRate") {
        const validHours = parseFloat(updatedFormData.hours) || 0;
        const validHourlyRate = parseFloat(value) || 0;
        updatedFormData.totalRate = (validHours * validHourlyRate).toFixed(2);
      } else if (name === "totalRate") {
        const validTotalRate = parseFloat(value) || 0;
        const validHours = parseFloat(updatedFormData.hours) || 0;
        updatedFormData.hourlyRate = (validTotalRate / validHours).toFixed(2);
      }

      return updatedFormData;
    });
  };

  const handleSelectChangeEdit = (e) => {
    const selectedOption = e.target.value;
    setInputValueEdit("");
    setFormData((prevFormData) => ({
      ...prevFormData,
      hours: "",
    }));

    if (selectedOption !== "") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: "0.00",
      }));
    }
  };

  const handleInputChangeEdit = (e) => {
    const inputValue = e.target.value;
    const selectedOption = document.getElementById("time-select-edit").value;

    if (selectedOption === "days") {
      const hours = parseFloat(inputValue) * 24;
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: hours.toFixed(2),
        totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
          2
        ),
        times: `${inputValue} ${"day"}`,
      }));
    } else if (selectedOption === "hours") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: inputValue,
        totalRate: (
          parseFloat(inputValue) * parseFloat(prevFormData.hourlyRate || 0)
        ).toFixed(2),
        times: `${inputValue} ${"hr"}`,
      }));
    } else if (selectedOption === "minutes") {
      const hours = parseFloat(inputValue) / 60;
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: hours.toFixed(2),
        totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
          2
        ),
        times: `${inputValue} ${"min"}`,
      }));
    }

    setInputValueEdit(inputValue);
  };

  const handleSelectChange = (e) => {
    const selectedOption = e.target.value;
    setInputValue("");
    setFormData((prevFormData) => ({
      ...prevFormData,
      hours: "",
    }));

    if (selectedOption !== "") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: "0.00",
      }));
    }
  };

  const handleChangeStatic = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
      if (name === "totalRate") {
        updatedFormData.totalRate = parseFloat(value);
      }
      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    // Prepare the payload with proper type conversion
    const payload = {
      categoryId: formData.categoryId,
      name: formData.name,
      SubMachineName: formData.SubMachineName || "",
      times: formData.times || `${formData.hours} hr`,
      hours: Number(formData.hours),
      hourlyRate: Number(formData.hourlyRate),
      totalRate: Number(formData.totalRate),
      isSpecialday: Boolean(formData.isSpecialday), // Ensure boolean type
      SpecialDayTotalMinutes: formData.isSpecialday ? Number(Math.round(formData.hours*60)) : 0,
    };
    console.log(payload);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/manufacturingVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Refresh the data after successful submission
      await fetchManufacturingData();

      // Reset form
      setFormData({
        categoryId: "",
        name: "",
        SubMachineName: "",
        times: "",
        hours: "",
        hourlyRate: "",
        totalRate: "",
        isSpecialday: false,
        SpecialDayTotalMinutes: 0,
      });

      toast.success("Manufacturing variable added successfully!");
      setModalList(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setPosting(false);
    }
  };

  // Add the handleReorder function
  const handleReorder = async (variableId, direction) => {
    try {
      setPosting(true);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/manufacturing-reorder`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ variableId, direction }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reorder variables");
      }

      const result = await response.json();

      // Update the local state with the new order
      setManufacturingData(result.manufacturingVariables);

      toast.success("Variables reordered successfully");
    } catch (error) {
      console.error("Error reordering variables:", error);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Handle form submission for editing a variable (PUT request)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/manufacturingVariables/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            totalRate: formData.hourlyRate * formData.hours, // Recalculate totalRate here
            // isSpecialday: e.target.checked,
            isSpecialday: formData.isSpecialday,
            SpecialDayTotalMinutes: e.target.checked ? formData.SpecialDayTotalMinutes : 0,
          }),
        }
      );
      if (response.ok) {
        await fetchManufacturingData();
        setFormData({
          categoryId: "",
          name: "",
          hours: "",
          hourlyRate: "",
          totalRate: "",
        });
        toast.success("Records Edited Successfully");
        setModalEdit(false); // Close the edit modal
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };
  // Handle delete action
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/manufacturingVariables/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchManufacturingData(); // Refetch the data to update the table
      toast.success("Records Deleted Successfully");
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Render loading state or error if any
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Calculate total rate based on fetched data
  const manufacturingtotalCount = manufacturingData.reduce(
    (total, item) => total + Number(item.totalRate),
    0
  );

  // Calculate Total Rate
  const calculateTotalRate = (hours, hourlyRate) => {
    const validHours = parseFloat(hours) || 0;
    const validHourlyRate = parseFloat(hourlyRate) || 0;
    return (validHours * validHourlyRate).toFixed(2); // Multiply and return
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
  return (
    <React.Fragment>
      <Row className="g-4 mb-3">
        <Col className="col-sm-auto">
          <div>
            <Button color="success" className="add-btn me-1" onClick={tog_add}>
              <i className="ri-add-line align-bottom me-1"></i> Add
            </Button>
            <Button
              color="success"
              className="add-btn me-1"
              onClick={tog_static_vairbale}
            >
              <i className="ri-add-line align-bottom me-1"></i>Add Unit Cost
            </Button>
          </div>
        </Col>
        <Col className="col-sm">
          <div className="d-flex justify-content-sm-end">
            <div className="search-box ms-2">
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <div className="table-responsive table-card mt-3 mb-1">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="table align-middle table-nowrap">
            <thead className="table-light">
              <tr>
                {/* <th style={{ width: "50px" }}>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </th> */}
                <th>ID</th>
                <th>Name</th>
                <th>Special Machine</th>
                {/* <th>Time</th> */}
                <th>Minutes (M)</th>
                <th>Hourly Rate (INR)</th>
                <th>Total Rate</th>
                <th>Batch Process</th>
                <th>Action</th>
                <th>Reorder</th>
              </tr>
            </thead>
            <tbody>
              {manufacturingData.map((item, index) => (
                <tr key={item._id}>
                  {/* <td>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </td> */}
                  <td>{item.categoryId}</td>
                  <td>{item.name}</td>
                  <td>{item.SubMachineName || "N/A"}</td>
                  {/* <td>{item.times || "-"}</td> */}
                  <td>{formatTime(item.hours)}</td>
                  <td>{item.hourlyRate}</td>
                  <td>{Math.round(item.totalRate)}</td>
                  <td>{item.isSpecialday ? "YES" : "NO"}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success edit-item-btn"
                        // data-bs-toggle="modal"
                        // data-bs-target="#showModal"
                        onClick={() => tog_edit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger remove-item-btn"
                        // data-bs-toggle="modal"
                        // data-bs-target="#deleteRecordModal"
                        onClick={() => {
                          setSelectedId(item._id);
                          tog_delete();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </td>

                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleReorder(item._id, "up")}
                        disabled={index === 0 || posting}
                      >
                        ↑
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleReorder(item._id, "down")}
                        disabled={
                          index === manufacturingData.length - 1 || posting
                        }
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="noresult" style={{ display: "none" }}>
          <div className="text-center">
            <lord-icon
              src="https://cdn.lordicon.com/msoeawqm.json"
              trigger="loop"
              style={{ width: "75px", height: "75px" }}
            ></lord-icon>
            <h5 className="mt-2">Sorry! No Result Found</h5>
            <p className="text-muted mb-0">
              We couldn't find any results for your search.
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add Manufacturing Variables</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={manufacturingVariables}
                getOptionLabel={(option) =>
                  `${option.categoryId} - ${option.name}`
                }
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Manufacturing Variables"
                    variant="outlined"
                  />
                )}
              />
            </div>

            {/* Sub Machine Selection */}
            {subMachineOptions.length > 0 && (
              <div className="mb-3">
                <label htmlFor="subMachine" className="form-label">
                  Specify Machine
                </label>
                <Autocomplete
                  options={subMachineOptions}
                  getOptionLabel={(option) =>
                    `${option.subcategoryId} - ${option.name}`
                  }
                  onChange={handleSubMachineChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Specify Machine"
                      variant="outlined"
                      // required={subMachineOptions.length > 0}
                    />
                  )}
                />
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="time-select">Time</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="time-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`Enter ${selectedOption} value`}
                  // disabled={!selectedOption}
                />
                <select
                  id="time-select"
                  onChange={(e) => {
                    handleSelectChange(e);
                    setSelectedOption(e.target.value);
                  }}
                  value={selectedOption}
                  className="form-select"
                >
                  <option value="">-- Select --</option>
                  <option value="day">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
            </div>

            <div className="mb-3" style={{ display: "none" }}>
              <label htmlFor="hours" className="form-label">
                Hours
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="hours"
                  value={formData.hours}
                  readOnly
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyRate" className="form-label">
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="hourlyRate"
                value={formData.hourlyRate || ""}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  name="totalRate"
                  value={formData.totalRate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* isSpecialday checkbox */}
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isSpecialday"
                checked={formData.isSpecialday || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isSpecialday: e.target.checked
                  })
                }
              />
              <label className="form-check-label" htmlFor="isSpecialday">
                Batch Process (Set Fixed Time for all Quantities)
              </label>
            </div>

            {/* Conditional SpecialDayTotalMinutes input */}
            {/* {formData.isSpecialday && (
              <div className="mb-3">
                <label htmlFor="SpecialDayTotalMinutes" className="form-label">
                  Total Days
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="SpecialDayTotalMinutes"
                  min="0"
                  value={formData.SpecialDayTotalMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      SpecialDayTotalMinutes: e.target.value,
                    })
                  }
                  required={formData.isSpecialday}
                />
              </div>
            )} */}
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Add
              </Button>
              <Button type="button" color="secondary" onClick={tog_add}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* static modal add */}
      <Modal isOpen={modal_static_add} toggle={tog_static_vairbale} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_static_vairbale}>
          {formData.id ? "Edit Unit Cost" : "Add Unit Cost"}
        </ModalHeader>
        <ModalBody>
          <form className="tablelist-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={shipmentvars}
                getOptionLabel={(option) =>
                  `${option.categoryId} - ${option.name}`
                }
                onChange={handleAutocompleteChangestatic}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Manufacturing Variable"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="time-select">Time</label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control"
                  id="time-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`Enter ${selectedOption} value`}
                />
                <select
                  id="time-select"
                  onChange={(e) => {
                    handleSelectChange(e);
                    setSelectedOption(e.target.value);
                  }}
                  value={selectedOption}
                  className="form-select"
                >
                  <option value="">-- Select --</option>
                  <option value="day">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate-field" className="form-label">
                Total Rate
              </label>
              <input
                type="number"
                id="totalRate-field"
                className="form-control"
                name="totalRate"
                placeholder="Enter Total Rate"
                value={formData.totalRate}
                onChange={handleChangeStatic}
                required
              />
            </div>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={tog_static_vairbale}
                disabled={posting}
              >
                Cancel
              </Button>
              <Button color="success" type="submit" disabled={posting}>
                {posting ? "Adding..." : "Add Variable"}
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

     {/* edit  modal */}
    <Modal isOpen={modal_edit} toggle={tog_edit}>
      <ModalHeader toggle={tog_edit}>
        Edit Manufacturing Variables
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleEditSubmit}>
          <div className="mb-3">
            <label htmlFor="categoryId" className="form-label">
              Category ID
            </label>
            <input
              type="text"
              className="form-control"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
            />
          </div>
          
           <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Name
        </label>
        <Autocomplete
          options={manufacturingVariables}
          getOptionLabel={(option) =>
            `${option.categoryId} - ${option.name}`
          }
          onChange={(event, newValue) => {
            handleAutocompleteChange(event, newValue);
            // Update the sub-machine options when name changes
            setSubMachineOptions(newValue?.subCategories || []);
          }}
          value={manufacturingVariables.find(item => item.categoryId === formData.categoryId) || null}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Manufacturing Variables"
              variant="outlined"
            />
          )}
        />
      </div>

      {/* Sub Machine Selection - Always show this, even if empty */}
      <div className="mb-3">
        <label htmlFor="subMachine" className="form-label">
          Specify Machine
        </label>
        <Autocomplete
          options={subMachineOptions}
          getOptionLabel={(option) =>
            `${option.subcategoryId} - ${option.name}`
          }
          onChange={handleSubMachineChange}
          value={subMachineOptions.find(item => item.name === formData.SubMachineName) || null}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Specify Machine"
              variant="outlined"
            />
          )}
          disabled={subMachineOptions.length === 0}
        />
      </div>

          <div className="mb-3">
            <label htmlFor="time-select">Time</label>
            <div className="input-group">
              <input
                type="number"
                className="form-control"
                id="time-input-edit"
                value={inputValueEdit}
                onChange={handleInputChangeEdit}
                placeholder={`Enter ${selectedOptionEdit} value`}
              />

              <select
                id="time-select-edit"
                onChange={(e) => {
                  handleSelectChangeEdit(e);
                  setSelectedOptionEdit(e.target.value);
                }}
                value={selectedOptionEdit}
                className="form-select"
              >
                <option value="">-- Select --</option>
                <option value="days">Days</option>
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="hours" className="form-label">
              Hours
            </label>
            <input
              type="number"
              className="form-control"
              name="hours"
              value={Math.round(formData.hours)}
              readOnly
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="hourlyRate" className="form-label">
              Hourly Rate
            </label>
            <input
              type="number"
              className="form-control"
              name="hourlyRate"
              value={Math.round(formData.hourlyRate || "")}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="totalRate" className="form-label">
              Total Rate
            </label>
            <input
              type="number"
              className="form-control"
              name="totalRate"
              value={Math.round(formData.totalRate)}
              readOnly
              required
            />
          </div>
          {/* isSpecialday checkbox */}
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isSpecialday"
              checked={formData.isSpecialday || false}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isSpecialday: e.target.checked,
                  // SpecialDayTotalMinutes: e.target.checked ? formData.SpecialDayTotalMinutes : 0,
                })
              }
            />
            <label className="form-check-label" htmlFor="isSpecialday">
              Special Day Calculation
            </label>
          </div>

          <ModalFooter>
            <Button type="submit" color="primary" disabled={posting}>
              Update
            </Button>
            <Button type="button" color="secondary" onClick={tog_edit}>
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </ModalBody>
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
    </React.Fragment>
  );
};

export default ManufacturingVariable;