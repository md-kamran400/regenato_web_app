// src/components/ExpandFolders/RawMaterial.js
import React, { useState } from 'react';
import "./Matarials.css";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { CiSettings } from "react-icons/ci";
import { getRawMaterialEndpoint } from '../../../../utils/apiEndpoints';

const RawMaterial = ({ partName, rmVariables, projectId, partId }) => {
  const [modal_edit, setModalEdit] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
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
    return (weight * price).toFixed(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'netWeight' || name === 'pricePerKg') {
        const netWeight = name === 'netWeight' ? value : prev.netWeight;
        const pricePerKg = name === 'pricePerKg' ? value : prev.pricePerKg;
        newData.totalRate = calculateTotalRate(netWeight, pricePerKg);
      }
      
      return newData;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    try {
      const endpoint = getRawMaterialEndpoint(projectId, partId, partId, editId);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          netWeight: parseFloat(formData.netWeight),
          pricePerKg: parseFloat(formData.pricePerKg),
          totalRate: parseFloat(formData.totalRate)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update raw material');
      }

      const updatedData = await response.json();
      setModalEdit(false);
      resetForm();

    } catch (error) {
      console.error('Error updating raw material:', error);
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="manufacturing-container">
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
              <td>{item.netWeight}</td>
              <td>{item.pricePerKg}</td>
              <td>{item.totalRate}</td>
              <td>
                <button
                  className="btn btn-sm btn-success edit-item-btn"
                  onClick={() => tog_edit(item)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>
          Edit Raw Materials Variables
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">Net Weight</label>
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
              <label htmlFor="pricePerKg" className="form-label">Price per Kg</label>
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
              <label htmlFor="totalRate" className="form-label">Total Rate</label>
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
                {posting ? 'Updating...' : 'Update'}
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default RawMaterial;
