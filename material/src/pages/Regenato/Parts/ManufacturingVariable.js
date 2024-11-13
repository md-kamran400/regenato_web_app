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

const ManufacturingVariable = ({ partDetails }) => {
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
  const [selectedIdst, setSelectedIdst] = useState(null);
  const [selectedShipment, setselectedShipment] = useState(null);
  const [SelectedManufacuturingVariable, setSelectedManufacuturingVariable] =
    useState(null);
  const [editId, setEditId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
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

  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        categoryId: item.categoryId,
        name: item.name,
        hours: item.hours,
        hourlyRate: item.hourlyRate,
        totalRate: item.totalRate,
      });
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

  //   useEffect(() => {
  const fetchManufacturingData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/manufacturingVariables`
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
          totalRate: (newValue.hourlyrate || 0) * (parseFloat(prevFormData.hours) || 0),
        };
        return updatedFormData;
      });
    }
  };
  

  useEffect(() => {
    const fetchRmVariables = async () => {
      try {
        const response = await fetch(`https://regenato-web-app-1.onrender.com/api/manufacturing`);
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
        const response = await fetch(`https://regenato-web-app-1.onrender.com/api/manufacturing`);
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
      // Calculate totalRate using the updated hourlyRate and hours
      updatedFormData.totalRate =
        (parseFloat(updatedFormData.hourlyRate) || 0) *
        (parseFloat(updatedFormData.hours) || 0);

      return updatedFormData;
    });
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
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/manufacturingVariables`,
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
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/manufacturingVariables/${editId}`,
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
        `https://regenato-web-app-1.onrender.com/api/parts/${partDetails._id}/manufacturingVariables/${_id}`,
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
              <i className="ri-add-line align-bottom me-1"></i> Add Static
              Manufacturing
            </Button>
            <Button className="btn btn-soft-danger">
              <i className="ri-delete-bin-2-line"></i>
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
                <th style={{ width: "50px" }}>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                  </div>
                </th>
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
                  <td>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" />
                    </div>
                  </td>
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

      {/* Add modal */}
      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add Manufacturing Variables</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            {/* <div className="mb-3">
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
            </div> */}
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
              <label htmlFor="hours" className="form-label">
                Hours
              </label>
              <input
                type="number"
                className="form-control"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
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
                value={formData.totalRate || ""} // Ensure it reflects updated calculation
                readOnly
                required
              />
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
          {formData.id
            ? "Edit Manufacturing Static Variables"
            : "Add Manufacturing Static Variables"}
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

      {/* Edit modal */}
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
              {/* <Autocomplete
                options={manufacturingVariables}
                getOptionLabel={(option) => option.name}
                value={SelectedManufacuturingVariable}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Material"
                    variant="outlined"
                  />
                )}
              /> */}
              <input
                type="number "
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
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
                onChange={handleChange}
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
                value={formData.hourlyRate}
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
