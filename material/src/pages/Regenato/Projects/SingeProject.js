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

  // duplicate creation for parts
  const [existingPartsLists, setExistingPartsLists] = useState([]);
  const [selectedPartsList, setSelectedPartsList] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // duplicate creationf for assmebly
  const [existingAssemblyLists, setExistingAssemblyLists] = useState([]);
  const [selectedAssemblyList, setSelectedAssemblyList] = useState(null);
  const [isAddingNewAssembly, setIsAddingNewAssembly] = useState(false);

  const [partsListName, setPartsListName] = useState("");
  // const [subAssemblyListName, setsubAssemblyListName] = useState("");

  //sub assembly part list state
  const [subAssemblyLists, setSubAssemblyLists] = useState([]);
  const [selectedSubAssemblyList, setSelectedSubAssemblyList] = useState(null);
  const [isAddingNewSubAssembly, setIsAddingNewSubAssembly] = useState(false);
  const [subAssemblyListName, setSubAssemblyListName] = useState("");
  const [existingSubAssemblyLists, setExistingSubAssemblyLists] = useState([]);

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

  //sub assembly list
  useEffect(() => {
    const fetchExistingSubAssemblyLists = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst`
        );
        const data = await response.json();
        setExistingSubAssemblyLists(data);
      } catch (error) {
        console.error("Error fetching existing sub-assembly lists:", error);
      }
    };
    fetchExistingSubAssemblyLists();
  }, [_id]);

  const handleAddSubAssembly = useCallback(() => {
    setShowSubAssemblyTable(true);
  }, []);

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
      setSubAssemblyItems(data.subAssemblyListFirst || []); // Update this line
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id, partsLists, subAssemblyItems]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);


  
  // fetching existing part list
  useEffect(() => {
    const fetchExistingPartsLists = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists`
        );
        const data = await response.json();
        setExistingPartsLists(data);
      } catch (error) {
        console.error("Error fetching existing parts lists:", error);
      }
    };
    fetchExistingPartsLists();
  }, [_id, existingPartsLists]);

  // fetchign for assmebly list
  useEffect(() => {
    const fetchExistingAssemblyLists = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists`
        );
        const data = await response.json();
        setExistingAssemblyLists(data);
      } catch (error) {
        console.error("Error fetching existing assembly lists:", error);
      }
    };
    fetchExistingAssemblyLists();
  }, [_id, existingAssemblyLists]);

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
        setPartsLists((prevPartsLists) => [...prevPartsLists, addedPartsList]);
        setPartsListName("");
        setModalAdd(false);
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error adding new parts list:", error);
        setError("Failed to add new parts list. Please try again.");
      }
    },
    [_id, partsLists]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setModalAdd(false); 
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
      if (selectedAssemblyList) {
        await handleDuplicateAssemblyList(selectedAssemblyList);
      } else {
        await handleAddNewAssemblyList({ assemblyListName: AssemblyListName });
      }
      setAssemblyListName("");
      setModalAddassembly(false);
      await fetchProjectDetails();
    } catch (error) {
      console.error("Error in handleSubmitAssembly:", error);
    }finally {
      setAssemblyListName(""); // Reset input field
    }
  };

  const handleAddNewAssemblyList = useCallback(
    async (newAssemblyList) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAssemblyList),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add new assembly list");
        }
        const addedAssemblyList = await response.json();
        setassemblyLists((prevAssemblyLists) => [
          ...prevAssemblyLists,
          addedAssemblyList,
        ]);
        setAssemblyListName("");
        setModalAddassembly(false);
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error adding new assembly list:", error);
        setError("Failed to add new assembly list. Please try again.");
      }
    },
    [_id, assemblyLists]
  );

  const handleAddNewSubAsssmebly = useCallback(
    async (newSubAssemblyList) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSubAssemblyList),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to add new sub-assembly list");
        }
        const addedSubAssemblyList = await response.json();
        setSubAssemblyItems((prevItems) => [
          ...prevItems,
          addedSubAssemblyList,
        ]);
        setSubAssemblyListName("");
        setModalAddSubassembly(false);
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error adding new sub-assembly list:", error);
        setError("Failed to add new sub-assembly list. Please try again.");
      }
    },
    [_id]
  );


  const handleDuplicateSubAssemblyList = useCallback(
    async (subAssemblyListId) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst/${subAssemblyListId}/duplicate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to duplicate sub-assembly list"
          );
        }
        const duplicatedSubAssemblyList = await response.json();
        setSubAssemblyItems((prevItems) => [...prevItems, duplicatedSubAssemblyList]);
        setModalAddSubassembly(false); // Close the sub-assembly modal
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error duplicating sub-assembly list:", error);
        setError("Failed to duplicate sub-assembly list. Please try again.");
      }
    },
    [_id, subAssemblyItems]
  );

  const handleSubmitSubAsssmebly = async (event) => {
    event.preventDefault();

    try {
      await handleAddNewSubAsssmebly({ subAssemblyListName });
      setModalAddSubassembly(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // duplicate creatation for parts list
  const handleDuplicatePartsList = useCallback(
    async (partsListId) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${partsListId}/duplicate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to duplicate parts list");
        }
        const duplicatedPartsList = await response.json();
        setPartsLists((prevPartsLists) => [
          ...prevPartsLists,
          duplicatedPartsList,
        ]);
        setPartsListName("");
        setModalAdd(false);
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error duplicating parts list:", error);
        setError("Failed to duplicate parts list. Please try again.");
      }
    },
    [_id, partsLists]
  );


  const handleDuplicateAssemblyList = useCallback(
    async (assemblyListId) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists/${assemblyListId}/duplicate`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to duplicate assembly list"
          );
        }
        const duplicatedAssemblyList = await response.json();
        setassemblyLists((prevAssemblyLists) => [
          ...prevAssemblyLists,
          duplicatedAssemblyList,
        ]);
        setModalAddassembly(false); // Close modal
        await fetchProjectDetails(); // Refresh the UI with updated data
      } catch (error) {
        console.error("Error duplicating assembly list:", error);
        setError("Failed to duplicate assembly list. Please try again.");
      }
    },
    [_id, assemblyLists]
  );

  // fetching and hadleing the fetching and post crud operations for assembly list
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // console.log(existingSubAssemblyLists);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="project-header">
            {/* Left Section */}
            <div className="header-section left">
              <h2 className="project-name" style={{fontWeight: "bold"}} >PROJECT DETAILS</h2>
              <br/>
              <h4 className="">{projectName}</h4>
              <p className="po-id"> <span style={{fontWeight: "bold"}}>PO Type:</span> {projectType}</p>
            </div>

            {/* Center Section
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
            </div> */}

            {/* Right Section
            <div className="header-section right">
              <span className="status-badge">In Progress</span>
            </div> */}
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
              <div className="d-flex">
                <div className="">
                  <select
                    style={{ width: "410px" }}
                    className="form-select"
                    value={selectedPartsList}
                    onChange={(e) => {
                      setSelectedPartsList(e.target.value);
                      setIsAddingNew(false);
                    }}
                  >
                    <option value="">Select Existing Parts List</option>
                    {existingPartsLists.map((list) => (
                      <option key={list._id} value={list._id}>
                        {list.partsListName}
                      </option>
                    ))}
                  </select>
                </div>
                {/* <div></div> */}
              </div>
              {isAddingNew && (
                <Input
                  className="mt-2"
                  type="text"
                  id="partsListName"
                  placeholder="New Part List Name"
                  value={partsListName}
                  onChange={(e) => setPartsListName(e.target.value)}
                  required
                />
              )}
            </div>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => {
                  setSelectedPartsList(null);
                  setIsAddingNew(true);
                }}
              >
                Add New Part
              </Button>

              <Button
                color="success"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedPartsList) {
                    handleDuplicatePartsList(selectedPartsList);
                  } else {
                    handleAddNewPartsList({ partsListName });
                  }
                }}
              >
                {selectedPartsList ? "Duplicate Part" : "Add Part"}
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
          Add Assembly List
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmitAssembly}>
            <div className="form-group">
              <Label for="AssemblyListName">Assembly List Name</Label>
              <div className="d-flex">
                <div>
                  <select
                    style={{ width: "410px" }}
                    className="form-select"
                    value={selectedAssemblyList}
                    onChange={(e) => {
                      setSelectedAssemblyList(e.target.value);
                      setIsAddingNewAssembly(false);
                    }}
                  >
                    <option value="">Select Existing Assembly List</option>
                    {existingAssemblyLists.map((list) => (
                      <option key={list._id} value={list._id}>
                        {list.assemblyListName}
                      </option>
                    ))}
                  </select>
                </div>
                <div></div>
              </div>
              {isAddingNewAssembly && (
                <Input
                  className="mt-2"
                  type="text"
                  id="AssemblyListName"
                  placeholder="Add New Assembly"
                  value={AssemblyListName}
                  onChange={(e) => setAssemblyListName(e.target.value)}
                  required
                />
              )}
            </div>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => {
                  setSelectedAssemblyList(null);
                  setIsAddingNewAssembly(true);
                }}
              >
                Add New Assembly
              </Button>

              <Button
                color="success"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedAssemblyList) {
                    handleDuplicateAssemblyList(selectedAssemblyList);
                  } else {
                    handleAddNewAssemblyList({
                      assemblyListName: AssemblyListName,
                    });
                  }
                }}
              >
                {selectedAssemblyList ? "Duplicate" : "Add"}
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
              <Label for="subAssemblyListName">Sub Assembly List Name</Label>
              <div className="d-flex">
                <div>
                  <select
                    style={{ width: "410px" }}
                    className="form-select"
                    value={selectedSubAssemblyList}
                    onChange={(e) => {
                      setSelectedSubAssemblyList(e.target.value);
                      setIsAddingNewSubAssembly(false);
                    }}
                  >
                    <option value="">Select Existing Sub Assembly List</option>
                    {subAssemblyItems.map((list) => (
                      <option key={list._id} value={list._id}>
                        {list.subAssemblyListName}
                      </option>
                    ))}
                  </select>
                </div>
                <div></div>
              </div>
              {isAddingNewSubAssembly && (
                <Input
                  className="mt-2"
                  type="text"
                  id="subAssemblyListName"
                  placeholder="Add New Sub Assembly"
                  value={subAssemblyListName}
                  onChange={(e) => setSubAssemblyListName(e.target.value)}
                  required
                />
              )}
            </div>
            <ModalFooter>
              <Button
                color="primary"
                onClick={() => {
                  setSelectedSubAssemblyList(null);
                  setIsAddingNewSubAssembly(true);
                }}
              >
                Add New Sub Assembly
              </Button>
              <Button
                color="success"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (selectedSubAssemblyList) {
                    handleDuplicateSubAssemblyList(selectedSubAssemblyList);
                  } else {
                    handleAddNewSubAsssmebly({ subAssemblyListName });
                  }
                }}
              >
                {selectedSubAssemblyList
                  ? "Duplicate"
                  : "Add"}
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
