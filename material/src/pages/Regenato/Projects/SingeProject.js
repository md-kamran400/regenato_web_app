import React, { useState, useEffect, useCallback } from "react";
// import Autocomplete from '@mui/material/Autocomplete';
// import TextField from '@mui/material/TextField';
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
import "./projectForProjects.css";
import { FiSettings } from "react-icons/fi";
// import RawMaterial from "./ExpandFolders/RawMaterial";
// import Manufacturing from "./ExpandFolders/Manufacturing";
// import Shipment from "./ExpandFolders/Shipment";
// import Overheads from "./ExpandFolders/Overheads";
import { MdOutlineDelete } from "react-icons/md";
import AssemblyTable from "./SingleProjectsFolder/AssemblyTable";
import SubAssemblyTable from "./SingleProjectsFolder/SubAssemblyTable";
import PartsTable from "./SingleProjectsFolder/PartsTable";
import OuterSubAssmebly from "./SingleProjectsFolder/OuterSubAssmebly";
import { toast } from "react-toastify";

const SingeProject = () => {
  const userRole = localStorage.getItem("userRole");
  const { _id } = useParams();
  const [modalAdd, setModalAdd] = useState(false);
  const [modalAddassembly, setModalAddassembly] = useState(false);
  const [modalAddSubassembly, setModalAddSubassembly] = useState(false);
  const [modalAddAssembly, setModalAddAssembly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState([]);
  const [parts, setParts] = useState([]);
  const [selectedPartData, setSelectedPartData] = useState(parts[0]);
  const [detailedPartData, setDetailedPartData] = useState({});
  const [projectName, setProjectName] = useState("");
  const [projectType, setprojectType] = useState("");

  const [subAssemblyItems, setSubAssemblyItems] = useState([]);
  const [AssemblyItems, setAssemblyItems] = useState([]);

  const [partsLists, setPartsLists] = useState([]); //
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

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // for sub assmebly
  const [allSubAssemblies, setAllSubAssemblies] = useState([]);
  const [selectedSubAssembly, setSelectedSubAssembly] = useState(null);
  const [modalAddSubAssembly, setModalAddSubAssembly] = useState(false);
  const [subAssemblyName, setSubAssemblyName] = useState("");
  const [subAssemblyNumber, setSubAssemblyNumber] = useState("");

  // for assmbely
  const [allAssmebly, setAllAssmebly] = useState([]);
  const [selectedAssmebly, setSelectedAssmebly] = useState(null);
  const [modalAddAssmebly, setModalAddAssmebly] = useState(false);
  const [AssemblyName, setAssmeblyName] = useState("");
  const [AssemblyNumber, setAssmeblyNumber] = useState("");

  useEffect(() => {
    const fetchAllSubAssemblies = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/subAssembly`
        );
        const data = await response.json();
        setAllSubAssemblies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching all sub-assemblies:", error);
        setAllSubAssemblies([]);
      }
    };

    fetchAllSubAssemblies();
  }, []);

  useEffect(() => {
    const fetchAllAssemblies = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/assmebly`
        );
        const data = await response.json();
        setAllAssmebly(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching all sub-assemblies:", error);
        setAllAssmebly([]);
      }
    };

    fetchAllAssemblies();
  }, []);

  // Filter lists based on fetchProjectDetails the search term
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

  // all data in one dropdown for subassemblylistfirst
  useEffect(() => {
    const fetchAllProjects = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
        );
        const data = await response.json();
        const allSubAssemblyLists = data.reduce((acc, project) => {
          return acc.concat(project.subAssemblyListFirst || []);
        }, []);
        setExistingSubAssemblyLists(allSubAssemblyLists);
      } catch (error) {
        console.error("Error fetching all projects:", error);
      }
    };
    fetchAllProjects();
  }, []);

  //all data in dropdown for assemblypartlist
  useEffect(() => {
    const fetchAllAssemblyLists = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
        );
        const data = await response.json();
        const allAssemblyLists = data.reduce((acc, project) => {
          return acc.concat(project.assemblyPartsLists || []);
        }, []);
        setExistingAssemblyLists(allAssemblyLists);
      } catch (error) {
        console.error("Error fetching all assembly lists:", error);
      }
    };
    fetchAllAssemblyLists();
  }, []);

  // For Parts Lists
  useEffect(() => {
    const fetchExistingPartsLists = async () => {
      try {
        const response = await fetch(
          // `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists`
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists`
        );
        const data = await response.json();
        setExistingPartsLists(data);
      } catch (error) {
        console.error("Error fetching existing parts lists:", error);
      }
    };
    fetchExistingPartsLists();
  }, [_id]);

  const updatesubAssemblyItems = (updatedSubAssembly) => {
    setSubAssemblyItems((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  };

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

  const costPerUnit =
    partDetails.allProjects?.reduce(
      (total, item) => total + item.costPerUnit * item.quantity,
      0
    ) || 0;

  const totalMachiningHours = partDetails.allProjects?.reduce(
    (total, item) => total + Number(item.timePerUnit * item.quantity),
    0
  );

  const fetchProjectDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}`
      );
      const data = await response.json();
      setProjectName(data.projectName || "");
      setprojectType(data.projectType || "");
      setPartsLists(data.partsLists || []);
      setassemblyLists(data.assemblyList || []);
      setSubAssemblyItems(data.subAssemblyListFirst || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Ensure fetchProjectDetails is called in useEffect and handlers
  useEffect(() => {
    fetchProjectDetails();
  }, [_id]);

  const handleAddSubAssembly = useCallback(async () => {
    if (!selectedSubAssembly) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/subAssemblyListFirst`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subAssemblyName: selectedSubAssembly.subAssemblyName,
            SubAssemblyNumber: selectedSubAssembly.SubAssemblyNumber,
            costPerUnit: selectedSubAssembly.costPerUnit,
            timePerUnit: selectedSubAssembly.timePerUnit,
            partsListItems: selectedSubAssembly.partsListItems,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add sub-assembly");
      }

      const newSubAssembly = await response.json();
      setSubAssemblyItems((prevItems) => [...prevItems, newSubAssembly]);
      setModalAddSubAssembly(false);
      setSelectedSubAssembly(null);
      setSubAssemblyName("");
      setSubAssemblyNumber("");
      await fetchProjectDetails();

      toast.success("Sub Assembly Added Successfully");
    } catch (error) {
      console.error("Error adding sub-assembly:", error);
      toast.error("Failed to add sub-assembly. Please try again.");
    }
  }, [
    _id,
    selectedSubAssembly,
    setSubAssemblyItems,
    setModalAddSubassembly,
    setSelectedSubAssembly,
    setSubAssemblyName,
    setSubAssemblyNumber,
    fetchProjectDetails,
    toast,
  ]);

  const handleNameChange = (event, newValue) => {
    setSelectedSubAssembly(newValue);
    setSubAssemblyName(newValue ? newValue.subAssemblyName : "");
    setSubAssemblyNumber(newValue ? newValue.SubAssemblyNumber : "");
  };

  const handleNumberChange = (event, newValue) => {
    setSelectedSubAssembly(newValue);
    setSubAssemblyName(newValue ? newValue.subAssemblyName : "");
    setSubAssemblyNumber(newValue ? newValue.SubAssemblyNumber : "");
  };

  const handleAddAssembly = useCallback(async () => {
    if (!selectedAssmebly) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/assemblyList`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            AssemblyName: selectedAssmebly.AssemblyName,
            AssemblyNumber: selectedAssmebly.AssemblyNumber,
            costPerUnit: selectedAssmebly.costPerUnit,
            timePerUnit: selectedAssmebly.timePerUnit,
            partsListItems: selectedAssmebly.partsListItems,
            subAssemblies: selectedAssmebly.subAssemblies,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add sub-assembly");
      }

      const newAssembly = await response.json();
      setAssemblyItems((prevItems) => [...prevItems, newAssembly]);
      setModalAddassembly(false);
      setSelectedAssmebly(null);
      setAssmeblyName("");
      setAssmeblyNumber("");
      await fetchProjectDetails();

      toast.success("Assembly Added Successfully");
    } catch (error) {
      console.error("Error adding Assembly:", error);
      toast.error("Failed to add sub-assembly. Please try again.");
    }
  }, [
    _id,
    selectedSubAssembly,
    setAssemblyItems,
    setModalAddassembly,
    setSelectedAssmebly,
    setAssmeblyName,
    setAssmeblyNumber,
    fetchProjectDetails,
    toast,
  ]);

  const handleNameChangeassmebly = (event, newValue) => {
    setSelectedAssmebly(newValue);
    setAssmeblyName(newValue ? newValue.AssemblyName : "");
    setAssmeblyNumber(newValue ? newValue.AssemblyNumber : "");
  };

  const handleNumberassmebly = (event, newValue) => {
    setSelectedAssmebly(newValue);
    setAssmeblyName(newValue ? newValue.AssemblyName : "");
    setAssmeblyNumber(newValue ? newValue.AssemblyNumber : "");
  };

  // ====================== ends
  const handlePartsListUpdate = useCallback((updatedSubAssembly) => {
    setPartsLists((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  }, []);

  const handleAddPart = useCallback(
    async (newPart, targetList) => {
      if (targetList._id === "default") {
        // Update the local state for the default list
        setPartsLists((prevLists) => {
          const updatedLists = [...prevLists];
          const defaultList = updatedLists.find(
            (list) => list._id === "default"
          );
          if (defaultList) {
            defaultList.items.push(newPart);
          }
          return updatedLists;
        });
      } else {
        // Add to an existing list via API
        try {
          const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/partsLists/${targetList._id}/items`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newPart),
            }
          );
          if (!response.ok) throw new Error("Failed to add part");

          const updatedList = await response.json();
          // updatePartsLists(updatedList);
          handlePartsListUpdate(updatedList); // Use the correct function name
        } catch (error) {
          console.error("Error adding part:", error);
        }
      }
    },
    [_id, handlePartsListUpdate]
  );

  const renderPartsContent = useCallback(() => {
    const defaultPartsLists =
      partsLists.length > 0
        ? partsLists
        : [
            {
              _id: "default",
              partsListName: `${projectName}-Parts`,
              items: [],
            },
          ];

    return (
      <div className="parts-lists">
        {defaultPartsLists.map((partsList, index) => (
          <div key={index} className="parts-list border-top-green">
            <PartsTable
              partsList={partsList}
              partsListID={partsList._id}
              updatePartsLists={handlePartsListUpdate} // Use handlePartsListUpdate
              onAddPart={(newPart) => handleAddPart(newPart, partsList)}
              onUpdatePrts={fetchProjectDetails}
            />
          </div>
        ))}
      </div>
    );
  }, [partsLists, projectName, handlePartsListUpdate, handleAddPart]);

  // ================== for sub assmeblyfetching and updating

  const handleOuterSubAssmeblyUpdate = (updatedSubAssembly) => {
    setSubAssemblyItems((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedSubAssembly._id ? updatedSubAssembly : item
      )
    );
  };

  const handleAddOutSubAssmebly = useCallback((newPart) => {
    setSubAssemblyItems((prevLists) => [...prevLists, newPart]);
  }, []);

  const renderSubASsmeblyContent = useCallback(() => {
    return (
      <div className="parts-lists">
        {subAssemblyItems.map((subAssemblyItem, index) => (
          <div key={index} className="parts-list">
            <OuterSubAssmebly
              subAssemblyItem={subAssemblyItem}
              updatesubAssemblyItems={updatesubAssemblyItems}
              setSubAssemblyItems={setSubAssemblyItems}
              subAssemblyId={subAssemblyItem._id}
              projectId={_id}
              onAddPart={handleAddPart}
              onUpdatePrts={fetchProjectDetails}
            />
          </div>
        ))}
      </div>
    );
  }, [subAssemblyItems, handleOuterSubAssmeblyUpdate, handleAddOutSubAssmebly]);

  // =================== ends here

  // ================ for add assmebly code start

  const handleUpdateAssemblyLists = useCallback((updatedAssembly) => {
    setassemblyLists((prevItems) =>
      prevItems.map((item) =>
        item._id === updatedAssembly._id ? updatedAssembly : item
      )
    );
  }, []);

  const renderAssemblyContent = useCallback(() => {
    return (
      <div className="assembly-lists">
        {assemblyLists.map((assemblyList, index) => (
          <div key={index} className="assembly-list border-top-green">
            <AssemblyTable
              // assemblyList={assemblyList}
              projectId={_id}
              assemblypartsList={assemblyList}
              assemblypartsListId={assemblyList._id}
              setassemblyLists={setassemblyLists}
              updateAssemblyLists={handleUpdateAssemblyLists}
              onAddAssembly={handleAddAssembly}
              onUpdatePrts={fetchProjectDetails}
            />
          </div>
        ))}
      </div>
    );
  }, [assemblyLists, handleUpdateAssemblyLists, handleAddAssembly]);

  //================= for add assmebly code end here

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
        toast.success("New Part Added Successfully");

        await fetchProjectDetails(); // Call fetchProjectDetails here
      } catch (error) {
        console.error("Error adding new parts list:", error);
        setError("Failed to add new parts list. Please try again.");
      }
    },
    [_id]
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
    } finally {
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
        toast.success("New Records created successfully");
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error adding new assembly list:", error);
        setError("Failed to add new assembly list. Please try again.");
      }
    },
    [_id, assemblyLists]
  );

  const handleDuplicateSubAssemblyList = useCallback(
    async (subAssemblyListId) => {
      try {
        // Find the sub-assembly list to duplicate
        const listToDuplicate = existingSubAssemblyLists.find(
          (list) => list._id === subAssemblyListId
        );

        if (!listToDuplicate) {
          throw new Error("Sub-assembly list not found");
        }

        // Create a new sub-assembly list with the same properties
        const newSubAssemblyList = {
          ...listToDuplicate,
          _id: null, // Generate a new ID
          subAssemblyListName: `${listToDuplicate.subAssemblyListName} (Duplicated)`,
          // Add any other properties that need to be updated
        };

        // Send the new sub-assembly list to the backend
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/subAssemblyListFirst`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newSubAssemblyList),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to duplicate sub-assembly list"
          );
        }

        const duplicatedSubAssemblyList = await response.json();
        setSubAssemblyItems((prevItems) => [
          ...prevItems,
          duplicatedSubAssemblyList,
        ]);
        setModalAddSubassembly(false); // Close the sub-assembly modal
        toast.success("Records Created Successfully");
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error duplicating sub-assembly list:", error);
        setError("Failed to duplicate Records. Please try again.");
      }
    },
    [
      _id,
      existingSubAssemblyLists,
      setSubAssemblyItems,
      setModalAddSubassembly,
      toast,
      fetchProjectDetails,
    ]
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
        toast.success("New Records created successfully");
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error adding new sub-assembly list:", error);
        setError("Failed to add new Records. Please try again.");
      }
    },
    [_id]
  );

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
        toast.success("Records Created Successfully");
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error duplicating parts list:", error);
        setError("Failed to Records. Please try again.");
      }
    },
    [_id, partsLists]
  );

  const handleDuplicateAssemblyList = useCallback(
    async (assemblyListId) => {
      try {
        // Find the assembly list to duplicate
        const listToDuplicate = existingAssemblyLists.find(
          (list) => list._id === assemblyListId
        );

        if (!listToDuplicate) {
          throw new Error("Assembly list not found");
        }

        // Create a new assembly list with the same properties
        const newAssemblyList = {
          ...listToDuplicate,
          _id: null, // Generate a new ID
          assemblyListName: `${listToDuplicate.assemblyListName} (Duplicated)`,
          // Add any other properties that need to be updated
        };

        // Send the new assembly list to the backend
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}/assemblyPartsLists`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAssemblyList),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to duplicate assembly list"
          );
        }

        const duplicatedAssemblyList = await response.json();
        setassemblyLists((prevLists) => [...prevLists, duplicatedAssemblyList]);
        setModalAddassembly(false); // Close the assembly modal
        toast.success("Assembly List Duplicated Successfully");
        await fetchProjectDetails();
      } catch (error) {
        console.error("Error duplicating assembly list:", error);
        setError("Failed to duplicate Assembly List. Please try again.");
      }
    },
    [
      _id,
      existingAssemblyLists,
      setassemblyLists,
      setModalAddassembly,
      toast,
      fetchProjectDetails,
    ]
  );

  // fetching and hadleing the fetching and post crud operations for assembly list
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  // console.log(existingSubAssemblyLists);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="project-header" style={{ marginTop: "-2rem" }}>
            {/* Left Section */}
            <div className="header-section left">
              <h2 className="project-name" style={{ fontWeight: "bold" }}>
                PRODUCTION ORDER DETAILS
              </h2>
              <br />
              <h4 className="">{projectName}</h4>
              <p className="po-id">
                {" "}
                <span style={{ fontWeight: "bold" }}>PO Type:</span>{" "}
                {projectType}
              </p>
            </div>
          </div>
          <div className="button-group" style={{ marginLeft: "7.9rem" }}>
            {userRole === "admin" && (
              <>
                <Button
                  color="danger"
                  className="add-btn"
                  onClick={() => setModalAddSubAssembly(true)}
                >
                  <i className="ri-add-line align-bottom me-1"></i> Add Sub
                  Assembly
                </Button>
                <Button
                  color="primary"
                  className="add-btn"
                  onClick={toggleAddModalAssembly}
                >
                  <i className="ri-add-line align-bottom me-1"></i> Add Assembly
                </Button>
              </>
            )}
          </div>
          {/* showTable */}

          {renderPartsContent()}

          {renderSubASsmeblyContent()}

          {renderAssemblyContent()}
        </Container>
      </div>

      {/* modal for parts list  */}
      <Modal isOpen={modalAdd} toggle={toggleAddModal}>
        <ModalHeader toggle={toggleAddModal}>Add Parts List</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <Label for="partsListName">Parts List Name</Label>
              <div className="d-flex flex-column">
                <div className="mb-3">
                  <Input
                    className="mt-1"
                    type="text"
                    id="partsListName"
                    placeholder="New Part List Name"
                    value={partsListName}
                    onChange={(e) => setPartsListName(e.target.value)}
                    required
                  />
                </div>
                <Button
                  color="primary"
                  onClick={() => {
                    handleAddNewPartsList({ partsListName });
                    setPartsListName("");
                  }}
                >
                  Add New Part
                </Button>
                <h3 className="text-center mt-3 mb-3">OR</h3>

                <Label for="partsListName">Duplicate From Existing List</Label>
                <div className="mt-1">
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
                    {partsLists.map((list) => (
                      <option key={list._id} value={list._id}>
                        {list.partsListName}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  color="success"
                  className="mt-3"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDuplicatePartsList(selectedPartsList);
                  }}
                >
                  Duplicate
                </Button>
              </div>
            </div>
            <ModalFooter>
              <Button color="secondary" onClick={toggleAddModal}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

     

      <Modal isOpen={modalAddassembly} toggle={toggleAddModalAssembly}>
        <ModalHeader toggle={toggleAddModalAssembly}>
          Add Assembly List
        </ModalHeader>
        <ModalBody>
          <Autocomplete
            options={allAssmebly}
            getOptionLabel={(option) =>
              `${option.AssemblyName} - ${option.AssemblyNumber}` || ""
            }
            onChange={(event, newValue) => {
              setSelectedAssmebly(newValue);
              setAssmeblyName(newValue ? newValue.AssemblyName : "");
              setAssmeblyNumber(newValue ? newValue.AssemblyNumber : "");
            }}
            value={
              allAssmebly.find(
                (item) =>
                  item.AssemblyName === AssemblyName &&
                  item.AssemblyNumber === AssemblyNumber
              ) || null
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Assembly"
                variant="outlined"
                required
              />
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddAssembly}>
            Add
          </Button>
          <Button color="secondary" onClick={toggleAddModalAssembly}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* modal for outer sub assmebly list */}

      <Modal
        isOpen={modalAddSubAssembly}
        toggle={() => setModalAddSubAssembly(false)}
      >
        <ModalHeader toggle={() => setModalAddSubAssembly(false)}>
          Add Sub Assembly
        </ModalHeader>
        <ModalBody>
          <Autocomplete
            options={allSubAssemblies}
            getOptionLabel={(option) =>
              `${option.subAssemblyName} - ${option.SubAssemblyNumber}` || ""
            }
            onChange={(event, newValue) => {
              setSelectedSubAssembly(newValue);
              setSubAssemblyName(newValue ? newValue.subAssemblyName : "");
              setSubAssemblyNumber(newValue ? newValue.SubAssemblyNumber : "");
            }}
            value={
              allSubAssemblies.find(
                (item) =>
                  item.subAssemblyName === subAssemblyName &&
                  item.SubAssemblyNumber === subAssemblyNumber
              ) || null
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Sub Assembly"
                variant="outlined"
                required
              />
            )}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddSubAssembly}>
            Add
          </Button>
          <Button
            color="secondary"
            onClick={() => setModalAddSubAssembly(false)}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default SingeProject;
