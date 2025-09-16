import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Col,
  Row,
  Spinner,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import debounce from "lodash.debounce";

const AddProductionOrderWithPart = ({ isOpen, toggle, onSuccess,existingProjects  }) => {
  const [poFormData, setPoFormData] = useState({
    projectName: "",
    projectType: "",
    partName: "",
    partQuantity: "",
    partsCodeId: "",
  });

  const [parts, setParts] = useState([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  //  Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setPage(1);
      fetchParts(1, value);
    }, 300),
    []
  );

  const fetchParts = async (pageNumber = 1, search = "") => {
    setIsLoadingParts(true);
    try {
      const response = await fetch(
        `${
          process.env.REACT_APP_BASE_URL
        }/api/parts?page=${pageNumber}&limit=25&search=${encodeURIComponent(
          search
        )}`
      );
      const result = await response.json();
      const newParts = result.data.map((part) => ({
        value: part.id,
        label: `${part.partName} (${part.id})`,
      }));

      setParts((prev) =>
        pageNumber === 1 ? newParts : [...prev, ...newParts]
      );
      setHasMore(newParts.length > 0);
    } catch (error) {
      toast.error("Failed to load parts");
    } finally {
      setIsLoadingParts(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchParts(1, searchTerm);
    }
  }, [isOpen]);

  const handlePoFormChange = (e) => {
    const { name, value } = e.target;
    setPoFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartSelect = (selectedOption) => {
    if (!selectedOption) {
      setPoFormData((prev) => ({
        ...prev,
        partName: "",
        partsCodeId: "",
      }));
    } else {
      setPoFormData((prev) => ({
        ...prev,
        partName: selectedOption.label,
        partsCodeId: selectedOption.value,
      }));
    }
  };

  const handleInputChange = (inputValue) => {
    setSearchTerm(inputValue);
    setPage(1);
    debouncedSearch(inputValue);
    return inputValue;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //  check duplicate by name
    const exists = existingProjects.some(
      (p) => p.projectName.toLowerCase() === poFormData.projectName.trim().toLowerCase()
    );
    if (exists) {
      toast.error("PO is already added!");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/production_with_parts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectName: poFormData.projectName,
            projectType: poFormData.projectType,
            selectedPartId: poFormData.partsCodeId,
            selectedPartName: poFormData.partName,
            partQuantity: Number(poFormData.partQuantity),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to add the production order");

      const addedPo = await response.json();
      onSuccess(addedPo);
      toast.success("Production Order with Part added successfully!");

      // Reset form
      setPoFormData({
        projectName: "",
        projectType: "",
        partName: "",
        partQuantity: "",
        partsCodeId: "",
      });
      toggle();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="lg">
      <ModalHeader className="bg-light p-3" toggle={toggle}>
        Add Production Order with Part
      </ModalHeader>
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label htmlFor="po-name" className="form-label">
                  Production Order Name
                </label>
                <input
                  type="text"
                  id="po-name"
                  name="projectName"
                  className="form-control"
                  placeholder="Enter PO Name"
                  value={poFormData.projectName}
                  onChange={handlePoFormChange}
                  required
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <label htmlFor="po-type" className="form-label">
                  PO Type
                </label>
                <select
                  id="po-type"
                  name="projectType"
                  className="form-control"
                  value={poFormData.projectType}
                  onChange={handlePoFormChange}
                  required
                >
                  <option value="">Select a type</option>
                  <option value="External PO">External PO</option>
                  <option value="Internal PO">Internal PO</option>
                </select>
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className="mb-3">
                <label htmlFor="part-select" className="form-label">
                  Part Name
                </label>
                <Select
                  id="part-select"
                  options={parts}
                  isLoading={isLoadingParts}
                  onChange={handlePartSelect}
                  placeholder="Search and select a part"
                  isClearable
                  onInputChange={handleInputChange}
                  onMenuScrollToBottom={() => {
                    if (hasMore && !isLoadingParts) {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      fetchParts(nextPage, searchTerm);
                    }
                  }}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: "38px",
                      height: "38px",
                    }),
                    dropdownIndicator: (provided) => ({
                      ...provided,
                      padding: "4px",
                    }),
                  }}
                />
              </div>
            </Col>

            <Col md={6}>
              <div className="mb-3">
                <label htmlFor="part-quantity" className="form-label">
                  Quantity
                </label>
                <input
                  type="number"
                  id="part-quantity"
                  name="partQuantity"
                  className="form-control"
                  placeholder="Enter Quantity"
                  value={poFormData.partQuantity}
                  onChange={handlePoFormChange}
                  min="1"
                  required
                />
              </div>
            </Col>
          </Row>
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
                <span>Adding...</span>
              </>
            ) : (
              "Add Production Order"
            )}
          </Button>
          <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default AddProductionOrderWithPart;
