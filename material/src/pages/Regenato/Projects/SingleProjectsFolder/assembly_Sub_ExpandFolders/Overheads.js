import React, { useState, useEffect } from "react";
import "./Matarials.css";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Overheads = ({
  partName,
  overheadsAndProfits,
  projectId,
  partId,
  assemblyId,
  subAssemblyId,
  onUpdatePrts,
  quantity,
}) => {
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    percentage: "",
    totalRate: "",
  });

  // State to store updated overheads
  const [updatedOverheads, setUpdatedOverheads] = useState([]);

  // useEffect to update local state when overheadsAndProfits prop changes
  useEffect(() => {
    setUpdatedOverheads(
      overheadsAndProfits.map((overhead) => ({
        ...overhead,
        totalRate: overhead.totalRate || 0,
      }))
    );
  }, [overheadsAndProfits]);

  // Toggle edit modal
  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        percentage: item.percentage,
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
      percentage: "",
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
      // Recalculate totalRate based on percentage
      if (name === "percentage") {
        updatedFormData.totalRate = parseFloat(value || 0);
      }
      return updatedFormData;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    try {
      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/assemblyList/${assemblyId}/subassemblies/${subAssemblyId}/partsListItems/${partId}/overheadsAndProfits/${editId}`;
      console.log("🚀 PUT Request to:", endpoint);

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          hourlyRate: parseFloat(formData.hourlyRate),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update shipment variable"
        );
      }

      const updatedData = await response.json();
      onUpdatePrts(updatedData);

      toast.success("Overheads variable updated successfully");
      setModalEdit(false);
      resetForm();
    } catch (error) {
      console.error("❌ Error updating Overheads variable:", error);
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
      const endpoint = getApiEndpoint(deleteId);
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete raw material");
      }

      const updatedData = await response.json();
      onUpdatePrts(updatedData);

      toast.success("Records deleted successfully");
      setModalDelete(false);
    } catch (error) {
      console.error("Error deleting raw material:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="overheads-container">
      <h5 className="section-title">💰 Overheads and Profits for {partName}</h5>
      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Percentage</th>
            <th>Total Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {updatedOverheads.map((overhead, index) => (
            <tr key={index}>
              <td>{overhead.name}</td>
              <td>{overhead.percentage}%</td>
              <td>{Math.ceil(overhead.totalRate * quantity)}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-success edit-item-btn"
                  onClick={() => tog_edit(overhead)}
                >
                  <FaEdit /> Edit
                </button>
                {/* <button
                  className="btn btn-sm btn-danger remove-item-btn"
                  onClick={() => tog_delete(overhead._id)}
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
        <ModalHeader toggle={tog_edit}>Edit Overheads and Profits</ModalHeader>
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
              <label htmlFor="percentage" className="form-label">
                Percentage
              </label>
              <input
                type="number"
                className="form-control"
                name="percentage"
                value={Math.round(formData.percentage)}
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modal_delete} toggle={tog_delete}>
        <ModalHeader toggle={tog_delete}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this raw material?
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

export default Overheads;
