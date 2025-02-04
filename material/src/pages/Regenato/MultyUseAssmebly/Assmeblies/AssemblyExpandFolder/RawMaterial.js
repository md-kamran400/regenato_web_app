import React, { useState } from "react";
import "./Matarials.css";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { CiSettings } from "react-icons/ci";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RawMaterial = ({
  partName,
  rmVariables,
  partId,
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
    netWeight: "",
    pricePerKg: "",
    totalRate: "",
  });

  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        netWeight: item.netWeight,
        pricePerKg: item.pricePerKg,
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

  const resetForm = () => {
    setFormData({
      name: "",
      netWeight: "",
      pricePerKg: "",
      totalRate: "",
    });
    setEditId(null);
  };

  const calculateTotalRate = (netWeight, pricePerKg) => {
    const weight = parseFloat(netWeight) || 0;
    const price = parseFloat(pricePerKg) || 0;
    return Math.round(weight * price + 0.5);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "netWeight" || name === "pricePerKg") {
        const netWeight = name === "netWeight" ? value : prev.netWeight;
        const pricePerKg = name === "pricePerKg" ? value : prev.pricePerKg;
        newData.totalRate = calculateTotalRate(netWeight, pricePerKg);
      }
      return newData;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    console.log("🔍 Debugging IDs:");
    console.log("subAssemblyId:", subAssemblyId);
    console.log("partId:", partId);
    console.log("editId (Raw MatarialVariableId):", editId);

    try {
      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/assmebly/${subAssemblyId}/parts/${partId}/rmVariables/${editId}`;
      console.log("🚀 PUT Request to:", endpoint);

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          netWeight: parseFloat(formData.netWeight),
          pricePerKg: parseFloat(formData.pricePerKg),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update Raw Matarial variable"
        );
      }

      const updatedData = await response.json();
      onUpdatePrts(updatedData);

      toast.success("Raw Matarial variable updated successfully");
      setModalEdit(false);
      resetForm();
    } catch (error) {
      console.error("❌ Error updating Raw Matarial variable:", error);
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

      const updateDeleteData = await response.json();
      onUpdatePrts(updateDeleteData);
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
    <div className="Raw Matarial-container">
      <h5 className="section-title">
        <CiSettings /> Raw Materials Variables for {partName}
      </h5>

      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Net Weight</th>
            <th>Price per Kg</th>
            <th>Total Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rmVariables.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.netWeight * quantity}</td>
              <td>{item.pricePerKg}</td>
              <td>{Math.ceil(item.totalRate * quantity)}</td>
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
          Edit Raw Materials Variables
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
              <label htmlFor="netWeight" className="form-label">
                Net Weight
              </label>
              <input
                type="number"
                className="form-control"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price per Kg
              </label>
              <input
                type="number"
                className="form-control"
                name="pricePerKg"
                value={formData.pricePerKg}
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
              />
            </div>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
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

export default RawMaterial;
