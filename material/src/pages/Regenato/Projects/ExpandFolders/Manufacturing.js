import React, { useState, useEffect, useCallback } from 'react';
import "./Matarials.css";
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

const Manufacturing = ({ partName, manufacturingVariables, projectId, partId }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [backupVariables, setBackupVariables] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [manufacturingData, setManufacturingData] = useState([]);
  const [updatedManufacturingVariables, setUpdatedManufacturingVariables] = useState(
    manufacturingVariables.map(item => ({
      ...item,
      totalRate: item.totalRate || 0,
    }))
  );

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
      setFormData({
        name: "",
        hours: "",
        hourlyRate: "",
        totalRate: "",
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };
    // Form state
    const [formData, setFormData] = useState({
      name: "",
      hours: "",
      hourlyRate: "",
      totalRate: "",
    });


    // const fetchManufacturingVariables = async () => {
    //   try {
    //     const response = await fetch(
    //       `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/manufacturingVariables`,
    //       {
    //         method: "GET",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );
        
    //     if (response.ok) {
    //       const data = await response.json();
    //       return data.map(item => ({
    //         ...item,
    //         totalRate: item.totalRate || 0,
    //       }));
    //     } else {
    //       throw new Error("Failed to fetch manufacturing variables");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching manufacturing variables:", error);
    //     return [];
    //   }
    // };


    const fetchManufacturingData = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/manufacturingVariables`,
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setManufacturingData(data);
        console.log("Set manufacturing data:", data); // Add this line
      } catch (error) {
        console.error("Error fetching manufacturingVariables data:", error);
      } finally {
        setLoading(false);
      }
    }, [partId?._id]);

    useEffect(() => {
      if (partId && partId._id) {
        fetchManufacturingData();
      }
    }, [partId, fetchManufacturingData]);

  // Handle input change
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

  // Save changes
const handleEditSubmit = async (e) => {
  e.preventDefault();
  setPosting(true);
  setError(null);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/manufacturingVariables/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          totalRate: formData.hourlyRate * formData.hours,
        }),
      }
    );
    
    if (response.ok) {
      // Fetch updated data after successful PUT request
      await fetchManufacturingData();
      // Reset form data
      setFormData({
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

  // Render editable cells

  return (
    <div className="manufacturing-container">
      <h5 className="section-title">🔧 Manufacturing Variables for {partName}</h5>
      <table className="table align-middle table-nowrap" striped bordered hover size="sm">
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
          {manufacturingVariables.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.hours}</td>
              <td>{item.hourlyRate}</td>
              <td>{item.totalRate}</td>
              <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success edit-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#showModal"
                        onClick={() => tog_edit(item)}
                      >
                        Edit
                      </button>
                      {/* <button
                        className="btn btn-sm btn-danger remove-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteRecordModal"
                        onClick={() => {
                          setSelectedId(item._id);
                          tog_delete();
                        }}
                      >
                        Remove
                      </button> */}
                    </div>
            </tr>
          ))}
        </tbody>
      </table>
            {/* Edit modal */}
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
    </div>
  );
};

export default Manufacturing;