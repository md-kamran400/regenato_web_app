import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Matarials.css";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const Manufacturing = ({
  partName,
  manufacturingVariables,
  projectId,
  partId,
  itemId,
  source,
  assemblyId,
  manufatcuringUpdate,
}) => {
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hours: "",
    hourlyRate: "",
    totalRate: "",
  });

  const [updatedManufacturingVariables, setUpdatedManufacturingVariables] =
    useState(
      manufacturingVariables.map((item) => ({
        ...item,
        totalRate: item.totalRate || 0,
      }))
    );

  // Sync with new manufacturing variables
  useEffect(() => {
    setUpdatedManufacturingVariables(
      manufacturingVariables.map((item) => ({
        ...item,
        totalRate: item.totalRate || 0,
      }))
    );
  }, [manufacturingVariables]);

  // Toggle edit modal
  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        hours: item.hours,
        hourlyRate: item.hourlyRate,
        totalRate: item.totalRate,
      });
      setEditId(item._id);
    } else {
      resetForm();
    }
    setModalEdit(!modal_edit);
  };

  const tog_delete = (id = null) => {
    setDeleteId(id);
    setModalDelete(!modal_delete);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      hours: "",
      hourlyRate: "",
      totalRate: "",
    });
    setEditId(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
      // Calculate totalRate using the updated hourlyRate and hours
      if (name === "hourlyRate" || name === "hours") {
        updatedFormData.totalRate =
          (parseFloat(updatedFormData.hourlyRate) || 0) *
          (parseFloat(updatedFormData.hours) || 0);
      }

      return updatedFormData;
    });
  };


  const getApiEndpoint = (id) => {
    if (source === "subAssemblyPartsLists") {
      return `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/assemblyPartsLists/${assemblyId}/subAssemblyPartsLists/${partId}/items/${itemId}/manufacturingVariables/${id}`;
    } else if (source === "assemblyMultyPartsList") {
      return `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/assemblyPartsLists/${assemblyId}/assemblyMultyPartsList/${partId}/items/${itemId}/manufacturingVariables/${id}`;
    }
    throw new Error("Invalid source");
  };

  // Submit edited data
  // const handleEditSubmit = async (e) => {
  //   e.preventDefault();
  //   setPosting(true);
  //   setError(null);

  //   try {
  //     const endpoint = getApiEndpoint();
  //     const response = await fetch(endpoint, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         name: formData.name,
  //         hours: parseFloat(formData.hours),
  //         hourlyRate: parseFloat(formData.hourlyRate),
  //         totalRate: parseFloat(formData.totalRate),
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.message || "Failed to update manufacturing variable"
  //       );
  //     }

  //     const updatedData = await response.json();
  //     onUpdateVariable(updatedData); // Notify parent about the update
  //     toast.success("Raw material updated successfully");
  //     setModalEdit(false);
  //     resetForm();
  //   } catch (error) {
  //     console.error("Error updating manufacturing variable:", error);
  //     setError(error.message);
  //     toast.error(error.message);
  //   } finally {
  //     setPosting(false);
  //   }
  // };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
  
    try {
      const endpoint = getApiEndpoint(editId); // Pass editId here
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          hours: parseFloat(formData.hours),
          hourlyRate: parseFloat(formData.hourlyRate),
          totalRate: parseFloat(formData.totalRate),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update manufacturing variable");
      }
  
      const updatedData = await response.json();
      manufatcuringUpdate(updatedData); // Notify parent about the update

      toast.success("Records updated successfully");
      setModalEdit(false);
      resetForm();
    } catch (error) {
      console.error("Error updating manufacturing variable:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };
  

  const handleDelete = async () => {
    setPosting(true);
    setError(null);
  
    try {
      const endpoint = getApiEndpoint(deleteId); // Pass deleteId here
      const response = await fetch(endpoint, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete manufacturing variable");
      }

      const updatedData = await response.json();
      manufatcuringUpdate(updatedData); // Notify parent about the update
  
      toast.success("Records deleted successfully");
      setModalDelete(false);
    } catch (error) {
      console.error("Error deleting manufacturing variable:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };
  

  return (
    <div className="manufacturing-container">
      <h5 className="section-title">
        🔧 Manufacturing Variables for {partName}
      </h5>
      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Hours</th>
            <th>Hourly Rate</th>
            <th>Total Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {updatedManufacturingVariables.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.hours}</td>
              <td>{item.hourlyRate}</td>
              <td>{item.totalRate}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-success edit-item-btn"
                  onClick={() => tog_edit(item)}
                >
                  Edit
                </button>
                {/* <button
                  className="btn btn-sm btn-danger remove-item-btn"
                  onClick={() => tog_delete(item._id)}
                >
                  Remove
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>
          Edit Manufacturing Variables
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
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
            {error && <div className="alert alert-danger">{error}</div>}
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                {posting ? "Updating..." : "Update"}
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* hadndel delete */}
      <Modal isOpen={modal_delete} toggle={tog_delete}>
        <ModalHeader toggle={tog_delete}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this manufacturing variable?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete} disabled={posting}>
            {posting ? "Deleting..." : "Delete"}
          </Button>
          <Button color="secondary" onClick={tog_delete}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Manufacturing;
