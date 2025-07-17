import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";

const EditModal = ({ isOpen, toggle, editId, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    costPerUnit: 0,
    timePerUnit: 0,
    stockPOQty: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        projectName: initialData.projectName || "",
        costPerUnit: initialData.costPerUnit || 0,
        timePerUnit: initialData.timePerUnit || 0,
        stockPOQty: initialData.stockPOQty || 0,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const updatedProject = await response.json();
      onSuccess(updatedProject);
      toast.success("Project updated successfully!");
      toggle();
    } catch (error) {
      toast.error(`Error updating project: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes("PerUnit") || name.includes("Qty") 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Project</ModalHeader>
      <ModalBody>
        {isLoading ? (
          <div className="text-center">
            <Spinner color="primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="projectName" className="form-label">
                Project Name
              </label>
              <Input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="costPerUnit" className="form-label">
                Cost Per Unit (₹)
              </label>
              <Input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="timePerUnit" className="form-label">
                Time Per Unit (hours)
              </label>
              <Input
                type="number"
                id="timePerUnit"
                name="timePerUnit"
                value={formData.timePerUnit}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stockPOQty" className="form-label">
                Stock Quantity
              </label>
              <Input
                type="number"
                id="stockPOQty"
                name="stockPOQty"
                value={formData.stockPOQty}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner
                  size="sm"
                  style={{
                    width: "1rem",
                    height: "1rem",
                    borderWidth: "0.15em",
                  }}
                />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
              <Button color="secondary" onClick={toggle}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalBody>
    </Modal>
  );
};

export default EditModal;