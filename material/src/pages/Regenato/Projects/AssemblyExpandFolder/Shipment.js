import React, { useState } from "react";
import "./Matarials.css";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const Shipment = ({
  partName,
  shipmentVariables,
  projectId,
  partId,
  itemId,
  assemblyId,
  source,
  shipmentUpdate,
}) => {
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hourlyRate: "",
    totalRate: "",
  });

  const [updatedShipmentVariables, setUpdatedShipmentVariables] = useState(
    shipmentVariables.map((ship) => ({
      ...ship,
      totalRate: ship.totalRate || 0,
    }))
  );

  // Toggle edit modal
  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
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
      // Calculate totalRate using hourlyRate
      if (name === "hourlyRate") {
        updatedFormData.totalRate = parseFloat(value || 0);
      }
      return updatedFormData;
    });
  };


  const getApiEndpoint = (id) => {
    if (source === "subAssemblyPartsLists") {
      return `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/assemblyPartsLists/${assemblyId}/subAssemblyPartsLists/${partId}/items/${itemId}/shipmentVariables/${id}`;
    } else if (source === "assemblyMultyPartsList") {
      return `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/assemblyPartsLists/${assemblyId}/assemblyMultyPartsList/${partId}/items/${itemId}/shipmentVariables/${id}`;
    }
    throw new Error("Invalid source");
  };

  
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
          hourlyRate: parseFloat(formData.hourlyRate),
          totalRate: parseFloat(formData.totalRate),
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update shipment variable");
      }
  
      const updatedData = await response.json();
      setUpdatedShipmentVariables((prevVariables) =>
        prevVariables.map((ship) =>
          ship._id === updatedData._id ? updatedData : ship
        )
      );
      shipmentUpdate(updatedData)
      toast.success("Shipment variable updated successfully");
      setModalEdit(false);
      resetForm();
    } catch (error) {
      console.error("Error updating shipment variable:", error);
      setError(error.message);
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
        throw new Error(errorData.message || "Failed to delete shipment variable");
      }
  
      // Update the local state to remove the deleted item
      setUpdatedShipmentVariables((prevVariables) =>
        prevVariables.filter((ship) => ship._id !== deleteId)
      );

      const updateData = await response.json();
      shipmentUpdate(updateData)
  
      toast.success("Shipment variable deleted successfully");
      setModalDelete(false);
    } catch (error) {
      console.error("Error deleting shipment variable:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };
  

  return (
    <div className="shipment-container">
      <h5 className="section-title">
        <TbTruckDelivery /> Shipment Variables for {partName}
      </h5>
      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Hourly Rate</th>
            <th>Total Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {updatedShipmentVariables.map((ship, index) => (
            <tr key={index}>
              <td>{ship.name}</td>
              <td>{ship.hourlyRate}</td>
              <td>{ship.totalRate}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-success edit-item-btn"
                  onClick={() => tog_edit(ship)}
                >
                  <FaEdit /> Edit
                </button>
                {/* <button className="btn btn-sm btn-danger remove-item-btn"  onClick={() => tog_delete(ship._id)}>
                  <MdDelete /> Remove
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>Edit Shipment Variables</ModalHeader>
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

export default Shipment;
