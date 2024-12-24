import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Button,
  CardBody,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Input,
  CardHeader,
  Label,
  FormGroup,
  UncontrolledAccordion,
  AccordionBody,
  AccordionHeader,
  ModalFooter,
  AccordionItem,
} from "reactstrap";
import { FiEdit } from "react-icons/fi";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Link, useParams } from "react-router-dom";
import AdvanceTimeLine from "../Home/AdvanceTimeLine";
import "./project.css";
import { FiSettings } from "react-icons/fi";
import RawMaterial from "./ExpandFolders/RawMaterial";
import Manufacturing from "./ExpandFolders/Manufacturing";
import Shipment from "./ExpandFolders/Shipment";
import Overheads from "./ExpandFolders/Overheads";
import { MdOutlineDelete } from "react-icons/md";
import AssemblyTable from "./SingleProjectsFolder/AssemblyTable";
import SubAssemblyTable from "./SingleProjectsFolder/SubAssemblyTable";
import PartsTable from "./SingleProjectsFolder/PartsTable";
import OuterSubAssmebly from "./SingleProjectsFolder/OuterSubAssmebly";

const SingeProject = () => {
  const { _id } = useParams();
  const [modalAdd, setModalAdd] = useState(false);
  const [modalAddassembly, setModalAddassembly] = useState(false);
  const [modalAddSubassembly, setModalAddSubassembly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedPartData, setSelectedPartData] = useState(parts[0]);
  const [detailedPartData, setDetailedPartData] = useState({});
  const [projectName, setProjectName] = useState("");
  const [projectType, setprojectType] = useState("");
  const [subAssemblyItems, setSubAssemblyItems] = useState([]);
  const [partsLists, setPartsLists] = useState([]);
  const [assemblyLists, setassemblyLists] = useState([]);
  const [AssemblyListName, setAssemblyListName] = useState("");

  const [partsListName, setPartsListName] = useState("");
  const [subAssemblyListName, setsubAssemblyListName] = useState("");

  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };

  const toggleAddModalAssembly = () => {
    setModalAddassembly(!modalAddassembly);
  };

  const toggleAddModalsubAssembly = () => {
    setModalAddSubassembly(!modalAddSubassembly);
  };
  const handleAddParentPartList = useCallback(() => {
    setModalAdd(true);
  }, []);

  const [showTable, setShowTable] = useState(() => {
    const storedValue = localStorage.getItem("showTable");
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const [showAssemblyTable, setShowAssemblyTable] = useState(() => {
    const storedValue = localStorage.getItem("showAssemblyTable");
    return storedValue ? JSON.parse(storedValue) : false;
  });

  const [showSubAssemblyTable, setShowSubAssemblyTable] = useState(() => {
    const storedValue = localStorage.getItem("showSubAssemblyTable");
    return storedValue ? JSON.parse(storedValue) : false;
  });

  // ... other state declarations ...

  useEffect(() => {
    localStorage.setItem("showTable", JSON.stringify(showTable));
  }, [showTable]);

  useEffect(() => {
    localStorage.setItem(
      "showAssemblyTable",
      JSON.stringify(showAssemblyTable)
    );
  }, [showAssemblyTable]);

  useEffect(() => {
    localStorage.setItem(
      "showSubAssemblyTable",
      JSON.stringify(showSubAssemblyTable)
    );
  }, [showSubAssemblyTable]);

  const handleAddAssembly = useCallback(() => {
    setShowAssemblyTable(true);
  }, []);

  const handleAddSubAssembly = useCallback(() => {
    setShowSubAssemblyTable(true);
  }, []);

  // useEffect(() => {
  //   if (selectedPartData && selectedPartData.partName) {
  //     setDetailedPartData(selectedPartData);
  //   } else {
  //     setDetailedPartData({});
  //   }
  // }, [selectedPartData]);

  const totalCost =
    partDetails.allProjects?.reduce(
      (total, item) => total + item.costPerUnit * item.quantity,
      0
    ) || 0;

  const totalMachiningHours = partDetails.allProjects?.reduce(
    (total, item) => total + Number(item.timePerUnit * item.quantity),
    0
  );

  // fetching and hadleing the fetching and post crud operations for parts list
  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setProjectName(data.projectName || "");
      setprojectType(data.projectType || "");
      setPartsLists(data.partsLists || []);
      setassemblyLists(data.assemblyPartsLists || []);
      setSubAssemblyItems(data.subAssemblyListFirst || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id, partsLists, subAssemblyItems]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handlePartsListUpdate = (updatedSubAssembly) => {
    setPartsLists((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  };

  const handleOuterSubAssmeblyUpdate = (updatedSubAssembly) => {
    setSubAssemblyItems((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  };

  const handleAddNewPartsList = useCallback(
    async (newPartsList) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPartsList),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add new parts list");
        }

        const addedPartsList = await response.json();

        // Update local state immediately
        setPartsLists((prevPartsLists) => [...prevPartsLists, addedPartsList]);

        // Refetch project details to ensure consistency
        await fetchProjectDetails();

        // Reset form fields
        setPartsListName("");

        // Close the modal
        setModalAdd(false);

        // Show success notification (optional)
        // toast.success("New parts list added successfully!");
      } catch (error) {
        console.error("Error adding new parts list:", error);
        setError("Failed to add new parts list. Please try again.");
      }
    },
    [_id]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await handleAddNewPartsList({ partsListName });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleSubmitAssemblyParts = useCallback(
    async ({ assemblyListName }) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assemblyListName }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add new assembly list");
        }

        const addedAssemblyList = await response.json();

        // Update local state
        setassemblyLists((prevAssemblyLists) => [
          ...prevAssemblyLists,
          addedAssemblyList,
        ]);

        // Optionally, reset the form fields
        setAssemblyListName("");

        // Optionally, close the modal
        setModalAddassembly(false);

        // Optionally, show success notification
        // toast.success("New assembly list added successfully!");
      } catch (error) {
        console.error("Error adding new assembly list:", error);
        setError("Failed to add new assembly list. Please try again.");
      }
    },
    [_id]
  );

  const handleSubmitAssembly = async (event) => {
    event.preventDefault();

    try {
      await handleSubmitAssemblyParts({ assemblyListName: AssemblyListName });

      // Clear the input field
      setAssemblyListName("");

      // Close the modal
      setModalAddassembly(false);

      // Optionally, refetch the project details
      await fetchProjectDetails();
    } catch (error) {
      console.error("Error in handleSubmitAssembly:", error);
    }
  };

  const handleAddNewSubAsssmebly = useCallback(
    async (newPartsList) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPartsList),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add new parts list");
        }

        const addedPartsList = await response.json();

        // Update local state immediately
        setSubAssemblyItems((prevPartsLists) => [
          ...prevPartsLists,
          addedPartsList,
        ]);

        // Refetch project details to ensure consistency
        await fetchProjectDetails();

        // Reset form fields
        setsubAssemblyListName("");

        // Close the modal
        setModalAddSubassembly(false);

        // Show success notification (optional)
        // toast.success("New parts list added successfully!");
      } catch (error) {
        console.error("Error adding new parts list:", error);
        setError("Failed to add new parts list. Please try again.");
      }
    },
    [_id]
  );

  const handleSubmitSubAsssmebly = async (event) => {
    event.preventDefault();

    try {
      await handleAddNewSubAsssmebly({ subAssemblyListName });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // fetching and hadleing the fetching and post crud operations for assembly list
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="project-header">
            {/* Left Section */}
            <div className="header-section left">
              <h2 className="project-name">PROJECT DETAILS</h2>
              <h4 className="">{projectName}</h4>
              <p className="po-id">PO ID: PO001</p>
              <p className="po-id">PO Type: {projectType}</p>
            </div>

            {/* Center Section */}
            <div className="header-section center">
              <div className="stats-container">
                <div className="stat-item">
                  <p className="stat-label">Total Cost:</p>
                  <p className="stat-value">{totalCost.toFixed(2)}</p>
                </div>
                <div className="stat-item">
                  <p className="stat-label">
                    <span className="icon">&#128339;</span> Total Machining
                    Hours:
                  </p>
                  <p className="stat-value">{totalMachiningHours}</p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="header-section right">
              <span className="status-badge">In Progress</span>
            </div>
          </div>

          <div className="button-group">
            <Button
              className="add-btn "
              color="success"
              onClick={toggleAddModal}
            >
              <i className="ri-add-line align-bottom me-1"></i> Add Part List
            </Button>
            <Button
              color="primary"
              className="add-btn"
              onClick={toggleAddModalAssembly}
            >
              <i className="ri-add-line align-bottom me-1"></i> Add Assembly
            </Button>
            <Button
              color="danger"
              className="add-btn"
              onClick={toggleAddModalsubAssembly}
            >
              <i className="ri-add-line align-bottom me-1"></i> Add Sub Assembly
            </Button>
          </div>

          {/* showTable */}
          <div className="parts-lists">
            {partsLists.map((partsList, index) => (
              <div key={index} className="parts-list border-top-green">
                <PartsTable
                  partsList={partsList}
                  partsListID={partsLists._id}
                  updatePartsLists={handlePartsListUpdate}
                />
              </div>
            ))}
          </div>

          {/* showTable */}
          <div className="parts-lists">
            {subAssemblyItems.map((subAssemblyItem, index) => (
              <div key={index} className="parts-list">
                <OuterSubAssmebly
                  subAssemblyItem={subAssemblyItem}
                  updatesubAssemblyItems={handleOuterSubAssmeblyUpdate}
                />
              </div>
            ))}
          </div>

          <div className="parts-lists">
            {assemblyLists.map((assemblypartsList, index) => (
              <div key={index} className="parts-list">
                <AssemblyTable
                  assemblypartsList={assemblypartsList}
                  assemblyLists={assemblyLists}
                />
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* modal for parts list  */}
      <Modal isOpen={modalAdd} toggle={toggleAddModal}>
        <ModalHeader toggle={toggleAddModal}>Add Parts List</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <Label for="partsListName">Parts List Name</Label>
              <Input
                type="text"
                id="partsListName"
                value={partsListName}
                onChange={(e) => setPartsListName(e.target.value)}
                required
              />
            </div>
            <ModalFooter>
              <Button color="success" type="submit">
                Add Parts List
              </Button>
              <Button color="secondary" onClick={toggleAddModal}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* modle for assembly */}
      <Modal isOpen={modalAddassembly} toggle={toggleAddModalAssembly}>
        <ModalHeader toggle={toggleAddModalAssembly}>
          Add Assembly List Name
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmitAssembly}>
            <div className="form-group">
              <Label for="AssemblyListName">Assembly List Name</Label>
              <Input
                type="text"
                id="AssemblyListName"
                value={AssemblyListName}
                onChange={(e) => setAssemblyListName(e.target.value)}
                required
              />
            </div>
            <ModalFooter>
              <Button color="success" type="submit">
                Add Parts List
              </Button>
              <Button color="secondary" onClick={toggleAddModalAssembly}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* modal for outer sub assmebly list */}
      <Modal isOpen={modalAddSubassembly} toggle={toggleAddModalsubAssembly}>
        <ModalHeader toggle={toggleAddModalsubAssembly}>
          Add Sub Assembly List
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmitSubAsssmebly}>
            <div className="form-group">
              <Label for="partsListName">Sub Assembly List Name</Label>
              <Input
                type="text"
                id="partsListName"
                value={subAssemblyListName}
                onChange={(e) => setsubAssemblyListName(e.target.value)}
                required
              />
            </div>
            <ModalFooter>
              <Button color="success" type="submit">
                Add Sub Assembly
              </Button>
              <Button color="secondary" onClick={toggleAddModalsubAssembly}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

export default SingeProject;
