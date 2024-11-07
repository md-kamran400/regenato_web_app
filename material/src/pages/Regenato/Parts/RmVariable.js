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
import { toast } from 'react-toastify';
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const RmVariable = ({ partDetails, setRmTotalCount }) => {
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

  const [formData, setFormData] = useState({
    categoryId: "",
    name: "",
    netWeight: 1, // Default to 1
    pricePerKg: "",
    totalRate: "",
  });

  const tog_add = () => {
    // Find the highest existing ID number
    const maxExistingId = Math.max(...RmtableData.map(item => parseInt(item.categoryId.slice(1))), 0);
    
    // Generate the next ID
    const nextId = `B${maxExistingId + 1}`;
    
    // Set the formData with the new ID
    setFormData({
      categoryId: nextId,
      name: "",
      netWeight: "",
      pricePerKg: "",
      totalRate: "",
    });
    
    // Open the modal
    setModalList(!modal_add);
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
      setEditId(item._id);
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
          ? value * formData.pricePerKg
          : formData.netWeight * formData.pricePerKg,
    }));
  };

  const fetchRmData = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:4040/api/parts/${partDetails._id}/rmVariables`
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

  const rmTotaCost = RmtableData.reduce(
    (total, item) => total + Number(item.totalRate),
    0
  );

  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchRmData();
    }
  }, [partDetails, fetchRmData]);

  useEffect(() => {
    const fetchRmVariables = async () => {
      try {
        const response = await fetch(`http://localhost:4040/api/rmvariable`);
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

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedRmVariable(newValue);
    if (newValue) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: newValue.name,
        pricePerKg: newValue.price,
        totalRate: newValue.price * formData.netWeight,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      if (RmtableData.some(item => item.categoryId === formData.categoryId)) {
        toast.error('ID already exists', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return; // Exit the function early if ID already exists
      }

      const response = await fetch(
        `http://localhost:4040/api/parts/${partDetails._id}/rmVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchRmData();
      setFormData({
        categoryId: "",
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      tog_add();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/parts/${partDetails._id}/rmVariables/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchRmData();
      setFormData({
        categoryId: "",
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      tog_edit();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/parts/${partDetails._id}/rmVariables/${_id}`,
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
        </div>
      </Col>
      <div className="table-responsive table-card mt-3 mb-1">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>Id</th>
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
                    <Button className="btn btn-sm btn-success" onClick={() => tog_edit(item)}>Edit</Button>
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
        <ModalHeader toggle={tog_add}>Add RM Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">Category ID</label>
              <input type="text" className="form-control" name="categoryId" value={formData.categoryId} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete options={rmVariables} getOptionLabel={(option) => option.name} onChange={handleAutocompleteChange} renderInput={(params) => (
                <TextField {...params} label="Select Material" variant="outlined" />
              )}/>
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                Net Weight
              </label>
              <input type="number" className="form-control" name="netWeight" value={formData.netWeight} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price
              </label>
              <input type="number" className="form-control" name="pricePerKg" value={formData.pricePerKg} required />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input type="number" className="form-control" name="totalRate" value={totalRate} readOnly required />
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
        <ModalHeader toggle={tog_edit}>Edit RM Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryId" className="form-label">
                Category ID
              </label>
              <input type="text" className="form-control" name="categoryId" value={formData.categoryId} onChange={handleChange} required/>
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input type="number " className="form-control" id="name" name="name" value={formData.name} onChange={handleChange}/>
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">Net Weight</label>
              <input type="number" className="form-control" name="netWeight" value={formData.netWeight} onChange={handleChange}required/>
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price
              </label>
              <input
                type="number" className="form-control" name="pricePerKg" value={formData.pricePerKg} readOnly required />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input type="number" className="form-control" name="totalRate" value={totalRate} readOnly required />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>Update</Button>
              <Button type="button" color="secondary" onClick={tog_edit}>Cancel</Button>
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
