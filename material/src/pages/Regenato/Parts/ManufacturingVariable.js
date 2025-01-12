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
import "./project.css";

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

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    "time-hours": "",
    "time-minutes": "",
    hours: "",
    hourlyRate: "",
    totalRate: "",
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
    });

    setModalList(!modal_add); // Open the modal
  };

  // function for add static modal add
  const tog_static_vairbale = () => {
    // const allIds = [
    //   ...manufacturingData.map((item) => item.categoryId),
    //   ...shipmentvars.map((item) => item.categoryId),
    // ];
    // const nextId = getNextCategoryId(allIds);

    setFormData({
      categoryId: "",
      name: "",
      totalRate: "",
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

      setFormData({
        ...item,
        hours: hours.toFixed(2),
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

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedManufacuturingVariable(newValue);
    if (newValue) {
      setFormData((prevFormData) => {
        const updatedFormData = {
          ...prevFormData,
          categoryId: newValue.categoryId,
          name: newValue.name,
          hourlyRate: newValue.hourlyrate,
          // Calculate totalRate based on hours and selected hourlyRate
          totalRate:
            (newValue.hourlyrate || 0) * (parseFloat(prevFormData.hours) || 0),
        };
        return updatedFormData;
      });
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
          totalRate: newValue.totalRate,
        });
      } else {
        setFormData({
          categoryId: newValue.categoryId,
          name: newValue.name,
          totalRate: "",
        });
      }
    } else {
      setFormData({
        categoryId: "",
        name: "",
        totalRate: "",
      });
    }
  };

  // Handle form input changes
  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   setFormData((prevFormData) => {
  //     const updatedFormData = {
  //       ...prevFormData,
  //       [name]: value,
  //     };

  //     if (name === "time-hours" || name === "time-minutes") {
  //       const hours = parseFloat(updatedFormData["time-hours"] || 0);
  //       const minutes = parseFloat(updatedFormData["time-minutes"] || 0);
  //       const totalHours = hours + minutes / 60;

  //       updatedFormData.hours = totalHours.toFixed(2);

  //       // Calculate totalRate using the newly calculated hours and the current hourlyRate
  //       const validHourlyRate = parseFloat(updatedFormData.hourlyRate) || 0;
  //       updatedFormData.totalRate = (totalHours * validHourlyRate).toFixed(2);
  //     }

  //     if (name === "hourlyRate") {
  //       const validHours = parseFloat(updatedFormData.hours) || 0;
  //       const validHourlyRate = parseFloat(updatedFormData.hourlyRate) || 0;
  //       updatedFormData.totalRate = (validHours * validHourlyRate).toFixed(2);
  //     }

  //     console.log(`Updated formData:`, updatedFormData);

  //     return updatedFormData;
  //   });
  // };

  // const handleInputChange = (e) => {
  //   const inputValue = e.target.value;
  //   const selectedOption = document.getElementById("time-select").value;

  //   if (selectedOption === "days") {
  //     const hours = parseFloat(inputValue) * 24;
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       hours: hours.toFixed(2),
  //       totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
  //         2
  //       ),
  //     }));
  //   } else if (selectedOption === "hours") {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       hours: inputValue,
  //       totalRate: (
  //         parseFloat(inputValue) * parseFloat(prevFormData.hourlyRate || 0)
  //       ).toFixed(2),
  //     }));
  //   } else if (selectedOption === "minutes") {
  //     const hours = parseFloat(inputValue) / 60;
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       hours: hours.toFixed(2),
  //       totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
  //         2
  //       ),
  //     }));
  //   }

  //   setInputValue(inputValue);
  // };

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
      }));
    } else if (selectedOption === "hours") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: inputValue,
        totalRate: (
          parseFloat(inputValue) * parseFloat(prevFormData.hourlyRate || 0)
        ).toFixed(2),
      }));
    } else if (selectedOption === "minutes") {
      const hours = parseFloat(inputValue) / 60;
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: hours.toFixed(2),
        totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
          2
        ),
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
      }));
    } else if (selectedOption === "hours") {
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: inputValue,
        totalRate: (
          parseFloat(inputValue) * parseFloat(prevFormData.hourlyRate || 0)
        ).toFixed(2),
      }));
    } else if (selectedOption === "minutes") {
      const hours = parseFloat(inputValue) / 60;
      setFormData((prevFormData) => ({
        ...prevFormData,
        hours: hours.toFixed(2),
        totalRate: (hours * parseFloat(prevFormData.hourlyRate || 0)).toFixed(
          2
        ),
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
    console.log("Changing", name, "to", value);

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/manufacturingVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchManufacturingData();
        setFormData({
          categoryId: "",
          name: "",
          hours: 1,
          hourlyRate: "",
          totalRate: "",
        });
        setModalList(false); // Close the normal add modal
        setModalstatic_add(false); // Close the static add modal
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      setError(error.message);
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

  // Handle unit change (Hours to Minutes or vice-versa)
  // const handleUnitChange = (e) => {
  //   const newUnit = e.target.value;
  //   let convertedHours = parseFloat(formData.hours) || 0;

  //   if (newUnit === "minutes" && unit === "hours") {
  //     convertedHours *= 60; // Convert Hours to Minutes
  //   } else if (newUnit === "hours" && unit === "minutes") {
  //     convertedHours /= 60; // Convert Minutes to Hours
  //   }

  //   setUnit(newUnit);

  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     hours: convertedHours.toFixed(2),
  //     totalRate: calculateTotalRate(convertedHours, prevFormData.hourlyRate),
  //   }));
  // };

  // Calculate Total Rate
  const calculateTotalRate = (hours, hourlyRate) => {
    const validHours = parseFloat(hours) || 0;
    const validHourlyRate = parseFloat(hourlyRate) || 0;
    return (validHours * validHourlyRate).toFixed(2); // Multiply and return
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
                <th>Hours (h)</th>
                <th>Hourly Rate (INR)</th>
                <th>Total Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {manufacturingData.map((item) => (
                <tr key={item.id}>
                  {/* <td>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </td> */}
                  <td>{item.categoryId}</td>
                  <td>{item.name}</td>
                  <td>{item.hours}</td>
                  <td>{item.hourlyRate}</td>
                  <td>{item.totalRate}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success edit-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#showModal"
                        onClick={() => tog_edit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger remove-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteRecordModal"
                        onClick={() => {
                          setSelectedId(item._id);
                          tog_delete();
                        }}
                      >
                        Remove
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

      {/* previous Add modal */}
      {/* <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add Manufacturing Variables</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={manufacturingVariables}
                getOptionLabel={(option) => option.name}
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
            <div>
              <label htmlFor="time-select">Select Time Unit:</label>
              <select
                id="time-select"
                onChange={handleSelectChange}
                value={selectedOption}
              >
                <option value="">-- Select --</option>
                <option value="day">Day</option>
                <option value="hours">Hours</option>
                <option value="minutes">Minutes</option>
              </select>

              {selectedOption && (
                <div>
                  <label htmlFor="time-input">
                    Enter Value for {selectedOption}:
                  </label>
                  <input
                    type="number"
                    id="time-input"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={`Enter ${selectedOption} value`}
                  />
                </div>
              )}
          </div>

            <div className="mb-3">
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
                  readOnly
                  required
                />
              </div>
            </div>
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
      </Modal> */}

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
                getOptionLabel={(option) => option.name}
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

            <div className="mb-3">
              <label htmlFor="time-select">Time</label>
              <div className="input-group">
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
                <input
                  type="number"
                  className="form-control"
                  id="time-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`Enter ${selectedOption} value`}
                />
              </div>
            </div>

            <div className="mb-3">
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
            {/* <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChangeStatic}
                required
              />
            </div> */}
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={shipmentvars}
                getOptionLabel={(option) => option.name}
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

              <input
                type="number "
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* <div className="mb-3">
              <label htmlFor="hours" className="form-label">
                Enter Time
              </label>
              <div class="time-input">
                <input
                  type="number"
                  min="0"
                  max="24"
                  placeholder="00"
                  name="time-hours"
                  value={formData["time-hours"]}
                  onChange={handleChange}
                  required
                />
                <h2>:</h2>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="00"
                  name="time-minutes"
                  value={formData["time-minutes"]}
                  onChange={handleChange}
                  required
                />
              </div>
              <div class="time-labels">
                <span>Hour</span>
                <span>Minute</span>
              </div>
            </div> */}
            <div className="mb-3">
              <label htmlFor="time-select">Time</label>
              <div className="input-group">
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
                <input
                  type="number"
                  className="form-control"
                  id="time-input-edit"
                  value={inputValueEdit}
                  onChange={handleInputChangeEdit}
                  placeholder={`Enter ${selectedOptionEdit} value`}
                />
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
                value={formData.hours}
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
                value={formData.hourlyRate || ""}
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
                value={formData.totalRate}
                readOnly
                required
              />
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
