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

const EditNameModal = ({
  isOpen,
  toggle,
  projectId,
  currentName,
  onSuccess,
}) => {
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNewName(currentName || "");
  }, [currentName]);

  const handleSubmit = async () => {
    if (!newName.trim()) {
      toast.error("Project name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectName: newName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update project name");
      }

      const updatedProject = await response.json();
      onSuccess(updatedProject);
      toast.success("Project name updated successfully!");
      toggle();
    } catch (error) {
      toast.error(`Error updating project name: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Project Name</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <label htmlFor="projectName" className="form-label">
            New Project Name
          </label>
          <Input
            type="text"
            id="projectName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new project name"
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleSubmit} disabled={isSubmitting}>
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
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditNameModal;
