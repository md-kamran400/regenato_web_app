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

const DeleteModal = ({ isOpen, toggle, projectId, projectName, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project");
      }

      onSuccess();
      toast.success("Project deleted successfully!");
      toggle();
    } catch (error) {
      toast.error(`Error deleting project: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader className="bg-light p-3" toggle={toggle}>
        Delete Project
      </ModalHeader>
      <ModalBody>
        <div className="mt-2 text-center">
          <lord-icon
            src="https://cdn.lordicon.com/gsqxdxog.json"
            trigger="loop"
            colors="primary:#f7b84b,secondary:#f06548"
            style={{ width: "100px", height: "100px" }}
          ></lord-icon>
          <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
            <h4>Are you sure?</h4>
            <p className="text-muted mx-4 mb-0">
              You are about to delete the project:{" "}
              <strong>{projectName}</strong>. This action cannot be undone.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="danger" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? (
            <>
              <Spinner
                size="sm"
                style={{
                  width: "1rem",
                  height: "1rem",
                  borderWidth: "0.15em",
                }}
              />
              Deleting...
            </>
          ) : (
            "Yes, Delete"
          )}
        </Button>
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteModal;
