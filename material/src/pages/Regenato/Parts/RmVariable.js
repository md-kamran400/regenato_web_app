import React, { useCallback, useEffect, useState } from "react";
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
import { toast } from "react-toastify";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const RmVariable = ({
  partDetails,
  onTotalCountUpdate,
  // onUpdatePartDetails,
}) => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [RmtableData, setRmtableData] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rmVariables, setRmVariables] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion
  const [selectedRmVariable, setSelectedRmVariable] = useState(null);
  const [editId, setEditId] = useState(null);
  const [modal_static_add, setModalstatic_add] = useState(false);
  const [modal_static_edit, setModalstatic_edit] = useState(false);
  const [rmTotalCount, setRmTotalCount] = useState(0);

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    netWeight: 1, // Default to 1
    pricePerKg: "",
    totalRate: "",
  });
  const [staticFormData, setStaticFormData] = useState({
    categoryId: "",
    name: "",
    totalRate: "",
  });

  const getNextCategoryId = (existingIds) => {
    let nextId = "B1";

    if (existingIds && existingIds.length > 0) {
      const sortedIds = existingIds.sort();
      const lastId = sortedIds[sortedIds.length - 1];

      if (/^B\d+$/.test(lastId)) {
        const numberMatch = lastId.match(/\d+/);
        if (numberMatch) {
          const lastNumber = parseInt(numberMatch[0], 10);
          nextId = `B${lastNumber + 1}`;
        }
      }
    }

    return nextId;
  };

  const tog_static_edit = (item = null) => {
    if (item) {
      setStaticFormData({
        categoryId: item.categoryId,
        name: item.name,
        totalRate: item.totalRate,
      });
    } else {
      setStaticFormData({
        categoryId: "",
        name: "",
        totalRate: "",
      });
    }
    setModalstatic_edit(!modal_static_edit);
  };

  const tog_add = () => {
    setFormData({
      categoryId: "",
      name: "",
      netWeight: "",
      pricePerKg: "",
      totalRate: "",
    });

    setModalList(!modal_add);
  };

  // const tog_static_add = () => {
  //   setFormData({
  //     categoryId: "",
  //     name: "",
  //     totalRate: "",
  //   });

  //   setModalstatic_add(!modal_static_add);
  // };

  const tog_static_add = () => {
    setFormData({
      categoryId: "",
      name: "",
      netWeight: 0,
      pricePerKg: 0,
      totalRate: 0,
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
        netWeight: item.netWeight,
        pricePerKg: item.pricePerKg,
        totalRate: item.totalRate,
      });
      setEditId(item._id); // Make sure this line is present
    } else {
      setFormData({
        categoryId: "",
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      totalRate:
        name === "netWeight"
          ? Math.round(parseFloat(value) * parseFloat(prevFormData.pricePerKg))
          : Math.round(
              parseFloat(prevFormData.netWeight) *
                parseFloat(prevFormData.pricePerKg)
            ),
    }));
  };

  const fetchRmData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/rmVariables`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      setRmtableData(data);
    } catch (error) {
      console.error("Error fetching RM data:", error);
    }
  }, [partDetails?._id]);

  useEffect(() => {
    const total = RmtableData.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );
    setRmTotalCount(total);
    console.log(total);

    // Call the callback function to update the parent component
    onTotalCountUpdate(total);
  }, [RmtableData]);
  // console.log("rm data totalCost", rmTotaCost);

  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchRmData();
    }
  }, [partDetails, fetchRmData]);

  useEffect(() => {
    const fetchRmVariables = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/rmvariable`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setRmVariables(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };

    fetchRmVariables();
  }, []);

  const totalRate = formData.pricePerKg * formData.netWeight;

 

  const handleAutocompleteChangestatic = (event, newValue) => {
    setSelectedRmVariable(newValue);
    if (newValue) {
      const selectedItem = rmVariables.find(
        (item) => item.name === newValue.name
      );

      if (selectedItem) {
        setStaticFormData({
          categoryId: newValue.categoryId,
          name: newValue.name,
          netWeight: selectedItem.netWeight || 0,
          pricePerKg: selectedItem.pricePerKg || 0,
          totalRate: 0, // Set totalRate to 0 to allow manual input
        });
      } else {
        setStaticFormData({
          categoryId: newValue.categoryId,
          name: newValue.name,
          netWeight: 0,
          pricePerKg: 0,
          totalRate: 0,
        });
      }
    } else {
      setStaticFormData({
        categoryId: "",
        name: "",
        netWeight: 0,
        pricePerKg: 0,
        totalRate: 0,
      });
    }
  };

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedRmVariable(newValue);
    if (newValue) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        categoryId: newValue.categoryId,
        name: newValue.name,
        pricePerKg: newValue.price, // Autofill price, but allow editing
        totalRate: Math.round(
          parseFloat(prevFormData.netWeight || 0) *
            parseFloat(newValue.price || 0)
        ),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    // Calculate totalRate and round it to 2 decimal places
    const roundedTotalRate =
      Math.round(formData.netWeight * formData.pricePerKg * 100) / 100;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/rmVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            name: formData.name,
            netWeight: parseFloat(formData.netWeight), // Ensure it's a number
            pricePerKg: parseFloat(formData.pricePerKg), // Ensure it's a number
            totalRate: roundedTotalRate, // Use the rounded value
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        // Update the partDetails in the parent component
        // onUpdatePartDetails(result);
        // Check if the server returned the correct totalRate
        if (result.totalRate !== roundedTotalRate) {
          console.warn(
            "Server returned different totalRate",
            result.totalRate,
            "vs",
            roundedTotalRate
          );
        }

        await fetchRmData(); // Refetch the data to update the table
        setFormData({
          categoryId: "",
          name: "",
          netWeight: "",
          pricePerKg: "",
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
  const handleSubmitStatic = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/rmVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            categoryId: staticFormData.categoryId,
            name: staticFormData.name,
            netWeight: parseFloat(staticFormData.netWeight) || 0,
            pricePerKg: parseFloat(staticFormData.pricePerKg) || 0,
            totalRate: parseFloat(staticFormData.totalRate) || 0,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        await fetchRmData(); // Refetch the data to update the table
        setStaticFormData({
          categoryId: "",
          name: "",
          netWeight: 0,
          pricePerKg: 0,
          totalRate: 0,
        });
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
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/rmVariables/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            totalRate: Math.round(
              parseFloat(formData.netWeight) * parseFloat(formData.pricePerKg)
            ),
          }),
        }
      );

      if (response.ok) {
        // const result = await response.json();
        // onUpdatePartDetails(result);
        await fetchRmData(); // Refetch the data to update the table
        setFormData({
          categoryId: "",
          name: "",
          netWeight: "",
          pricePerKg: "",
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

  // handle for deleting
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${partDetails._id}/rmVariables/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchRmData(); // Refetch the data to update the table
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };
  return (
    <React.Fragment>
      <Col className="col-sm-auto">
        <div>
          <Button
            onClick={tog_add}
            color="success"
            className="add-btn me-1"
            id="create-btn"
          >
            <i className="ri-add-line align-bottom me-1"></i> Add
          </Button>

          <Button
            onClick={tog_static_add}
            color="success"
            className="add-btn me-1"
            id="create-btn"
          >
            <i className="ri-add-line align-bottom me-1"></i> Add Unit Cost
          </Button>
        </div>
      </Col>
      <div className="table-responsive table-card mt-3 mb-1">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Net Weight (Kg)</th>
              <th>Price (INR/Kg)</th>
              <th>Total rate</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {RmtableData.map((item) => (
              <tr key={item._id}>
                <td>{item.categoryId}</td>
                <td>{item.name}</td>
                <td>{item.netWeight}</td>
                <td>{item.pricePerKg}</td>
                <td>{item.totalRate}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      className="btn btn-sm btn-success"
                      onClick={() => tog_edit(item)}
                    >
                      Edit
                    </Button>
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
      </div>

      {/* Add modal */}
      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add Raw Matarial</ModalHeader>
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
                options={rmVariables}
                getOptionLabel={(option) => option.name}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select RM Variable"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                Net Weight (In KG)
              </label>
              <input
                type="number"
                className="form-control"
                name="netWeight"
                placeholder="Net Weight (In KG)"
                value={formData.netWeight}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price
              </label>
              <input
                type="number"
                className="form-control"
                name="pricePerKg"
                placeholder="Price"
                value={formData.pricePerKg || ""}
                onChange={handleChange} // Allow manual edits
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
                value={totalRate}
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

      {/* static unit coast modal */}
      <Modal isOpen={modal_static_add} toggle={tog_static_add}>
        <ModalHeader toggle={tog_static_add}>Add Unit Cost</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmitStatic}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={rmVariables}
                getOptionLabel={(option) => option.name}
                onChange={handleAutocompleteChangestatic}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select RM Variable"
                    variant="outlined"
                  />
                )}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                ID
              </label>
              <input
                type="text"
                className="form-control"
                name="categoryId"
                placeholder="Enter ID"
                value={staticFormData.categoryId}
                onChange={handleChange}
                required
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
                value={staticFormData.totalRate}
                onChange={(e) => {
                  const newTotalRate = parseFloat(e.target.value);
                  setStaticFormData((prevFormData) => ({
                    ...prevFormData,
                    totalRate: newTotalRate,
                  }));
                }}
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

      {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>Edit Raw Matarial</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                ID
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
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                Net Weight
              </label>
              <input
                type="number"
                className="form-control"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price
              </label>
              <input
                type="number"
                className="form-control"
                name="pricePerKg"
                value={formData.pricePerKg}
                readOnly
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
                onChange={handleChange}
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

export default RmVariable;
