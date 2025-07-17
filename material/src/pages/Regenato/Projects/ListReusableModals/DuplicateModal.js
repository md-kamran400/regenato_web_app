import React, { useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
} from "reactstrap";
import { toast } from "react-toastify";

const DuplicateModal = ({ isOpen, toggle, project, onSuccess }) => {
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    if (!project?._id) return;
    setIsDuplicating(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${project._id}/duplicate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate project");
      }

      const duplicatedProject = await response.json();
      onSuccess(duplicatedProject);
      toast.success("Project duplicated successfully!");
      toggle();
    } catch (error) {
      toast.error(`Error duplicating project: ${error.message}`);
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>Duplicate Project</ModalHeader>
      <ModalBody>
        <div className="mt-2 text-center">
          <lord-icon
            src="https://cdn.lordicon.com/wloilxuq.json"
            trigger="loop"
            colors="primary:#405189,secondary:#0ab39c"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon>
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Confirm Duplication</h4>
            <p className="text-muted mx-4 mb-0">
              You are about to create a copy of project:{" "}
              <strong>{project?.projectName}</strong>. All project data will be
              duplicated.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={handleDuplicate} disabled={isDuplicating}>
          {isDuplicating ? (
            <>
              <Spinner
                  size="sm"
                  style={{
                    width: "1rem",
                    height: "1rem",
                    borderWidth: "0.15em",
                  }}
                />
              Duplicating...
            </>
          ) : (
            "Confirm Duplicate"
          )}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DuplicateModal;