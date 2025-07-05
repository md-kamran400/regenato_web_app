import React, { useState } from "react";
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

const AddProductionOrderModal = ({ isOpen, toggle, onSuccess }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    projectType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: formData.projectName,
            projectType: formData.projectType,
            costPerUnit: 0,
            timePerUnit: 0,
            stockPoQty: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add production order");
      }

      const addedProject = await response.json();
      onSuccess(addedProject);
      toast.success("Production Order added successfully!");

      // Reset form and close modal
      setFormData({
        projectName: "",
        projectType: "",
      });
      toggle();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader className="bg-light p-3" toggle={toggle}>
        Add Production Order
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="mb-3">
            <label htmlFor="projectName" className="form-label">
              Production Order Name
            </label>
            <Input
              type="text"
              id="projectName"
              name="projectName"
              placeholder="Enter Name"
              value={formData.projectName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="projectType" className="form-label">
              Select Type
            </label>
            <Input
              type="select"
              id="projectType"
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a type</option>
              <option value="External PO">External PO</option>
              <option value="Internal PO">Internal PO</option>
            </Input>
          </div>
        </ModalBody>
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
                Adding...
              </>
            ) : (
              "Add Production Order"
            )}
          </Button>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddProductionOrderModal;
