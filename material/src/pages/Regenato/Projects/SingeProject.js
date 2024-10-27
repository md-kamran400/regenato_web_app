// import React, { useState, useEffect } from "react";
// import {
//   Card,
//   Button,
//   CardBody,
//   Col,
//   Container,
//   DropdownItem,
//   DropdownMenu,
//   DropdownToggle,
//   Row,
//   UncontrolledDropdown,
//   Modal,
//   ModalBody,
//   ModalFooter,
//   ModalHeader,
// } from "reactstrap";
// import BreadCrumb from "../../../Components/Common/BreadCrumb";


// import FeatherIcon from "feather-icons-react";
// import { Link, useParams } from "react-router-dom";

// const SingeProject = () => {
//   document.title = "Listjs | Velzon - React Admin & Dashboard Template";
  
//   const { _id } = useParams(); // Use _id from the route parameters
//   const [modal_add, setModalList] = useState(false);
//   const [modal_edit, setModalEdit] = useState(false);
//   const [modal_delete, setModalDelete] = useState(false);
//   const [partDetails, setPartDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [posting, setPosting] = useState(false);

//   // Form States
//   const [partName, setPartName] = useState('');
//   const [costPerUnit, setCostPerUnit] = useState('');
//   const [totalMachiningHours, setTotalMachiningHours] = useState('');
//   const [processes, setProcesses] = useState([{ subpartName: '', value: '' }]);

//   const [currentPart, setCurrentPart] = useState(null); // Track the currently selected part for editing

//   const tog_add = () => {
//     setModalList(!modal_add);
//   };

//   const tog_edit = (part) => {
//     setCurrentPart(part); // Set the part to be edited
//     setPartName(part.partName); // Pre-fill input fields with existing data
//     setCostPerUnit(part.costPerUnit);
//     setTotalMachiningHours(part.totalMachiningHours);
//     setProcesses(part.processes); // Pre-fill processes (sub-input fields)
//     setModalEdit(!modal_edit);
//   };

//   const tog_delete =()=>{
//     setModalDelete(!modal_delete)
//   }
//   useEffect(() => {
//     const fetchProjectDetails = async () => {
//       try {
//         const response = await fetch(`http://localhost:4040/api/projects/${_id}`);
        
//         // Check if the response is ok (status code 200-299)
//         if (!response.ok) {
//           throw new Error(`Error: ${response.statusText}`);
//         }
        
//         const data = await response.json();
//         setPartDetails(data);
//         console.log(data)
//       } catch (error) {
//         console.error("Error fetching part details:", error);
//         setError(error.message); // Update error state
//       } finally {
//         setLoading(false); // Stop loading
//       }
//     };

//     fetchProjectDetails(); // Fetch details when the component mounts
//   }, [_id]); // Fetch details when the component mounts or _id changes

//   if (loading) {
//     return <div>Loading...</div>; // Show loading state while fetching data
//   }

//   if (error) {
//     return <div>Error: {error}</div>; // Show error message if fetching fails
//   }

//   if (!partDetails) {
//     return <div>No details found for this part.</div>; // Handle case where no details are found
//   }

//    // Function to handle form submission
//    const handleSubmit = async (e) => {
//     e.preventDefault();
//     setPosting(true); // Set posting state to true

//     const newPart = {
//       partName,
//       costPerUnit,
//       totalMachiningHours,
//       processes, // Array of sub parts
//     };

//     try {
//       const response = await fetch(`http://localhost:4040/api/projects/${_id}/allProjects`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newPart),
//       });

//       if (!response.ok) {
//         throw new Error(`Error: ${response.statusText}`);
//       }

//       const data = await response.json();
//       console.log('Part added successfully:', data);

//       setModalList(false); // Close modal after submission
//       setPartName(''); // Clear input fields
//       setCostPerUnit('');
//       setTotalMachiningHours('');
//       setProcesses([{ subpartName: '', value: '' }]); // Reset processes

//     } catch (error) {
//       console.error('Error adding part:', error);
//     } finally {
//       setPosting(false); // Stop posting state
//     }
//   };


//   // function to handle form updatation 
//   // Handle form submission for editing part details
//    const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setPosting(true);

//     const updatedPart = {
//       partName,
//       costPerUnit,
//       totalMachiningHours,
//       processes,
//     };

//     try {
//       const response = await fetch(`http://localhost:4040/api/projects/${_id}/allProjects/${currentPart._id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(updatedPart),
//       });

//       if (!response.ok) {
//         throw new Error(`Error: ${response.statusText}`);
//       }

//       const data = await response.json();
//       console.log('Part updated successfully:', data);

//       setModalEdit(false); // Close modal after submission
//     } catch (error) {
//       console.error('Error updating part:', error);
//     } finally {
//       setPosting(false);
//     }
//   };
//   // Handle adding new subpart input
//   const addSubPartField = () => {
//     setProcesses([...processes, { subpartName: '', value: '' }]);
//   };

//   // Handle change for subpart fields
//   const handleProcessChange = (index, event) => {
//     const values = [...processes];
//     values[index][event.target.name] = event.target.value;
//     setProcesses(values);
//   };

//     // Handle removing a subpart
//     const removeSubPartField = (index) => {
//       const values = [...processes];
//       values.splice(index, 1); // Remove the subpart at the given index
//       setProcesses(values);
//     };

//   const activebtn = (ele) => {
//     if (ele.closest("button").classList.contains("active")) {
//       ele.closest("button").classList.remove("active");
//     } else {
//       ele.closest("button").classList.add("active");
//     }
//   };
//   return (
//     <React.Fragment>
//       <div className="page-content">
//         <Container fluid>
//         <BreadCrumb title={partDetails.projectName} pageTitle={partDetails.projectName}/>

//          {/* row and colum for widegst is here --- */}

//          {/* end here */}

//           <div className="mb-4 pb-2 d-flex">
//             <Button color="success" className="add-btn me-1" id="create-btn" onClick={tog_add}>
//               <i className="ri-add-line align-bottom me-1"></i> Add Part
//             </Button>
//             <Link to="/projectinvoice">
//               <Button
//                 style={{ backgroundColor: "#9C27B0" }}
//                 className="add-btn me-1"
//                 id="create-btn"
//               >
//                 <i className="ri-add-line align-bottom me-1"></i> Add BOM
//               </Button>
//             </Link>
//           </div>

//           <Row>
//           {partDetails.allProjects?.map((item, index) => (
//            <React.Fragment key={item._id}>
//     <Col xxl={3} sm={6} className="project-card">
//       <Card>
//         <CardBody>
//           <div className={`p-3 mt-n3 mx-n3 bg-danger-subtle rounded-top`}>
//             <div className="d-flex align-items-center">
//               <div className="flex-grow-1">
//                 <h5 className="mb-0 fs-14">
//                   <Link className="text-body">
//                     {item.partName} {/* Looping part name */}
//                   </Link>
//                 </h5>
//               </div>
//               <div className="flex-shrink-0">
//                 <div className="d-flex gap-1 align-items-center my-n2">
//                   <button type="button"className={`btn avatar-xs mt-n1 p-0 favourite-btn shadow-none`}onClick={(e) => activebtn(e.target)}>
//                     <span className="avatar-title bg-transparent fs-15">
//                       <i className="ri-star-fill"></i>
//                     </span>
//                   </button>
//                   <UncontrolledDropdown direction="start">
//                     <DropdownToggle
//                       tag="button"
//                       className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
//                     >
//                       <FeatherIcon icon="more-horizontal" className="icon-sm" />
//                     </DropdownToggle>
//                     <DropdownMenu className="dropdown-menu-end">
//                       <DropdownItem onClick={() => tog_edit(item)}>
//                         <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
//                       </DropdownItem>
//                       <div className="dropdown-divider"></div>
//                       <DropdownItem href="#">
//                         <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Remove
//                       </DropdownItem>
//                     </DropdownMenu>
//                   </UncontrolledDropdown>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="py-3">
//             <Row className="gy-3">
//               <Col xs={6}>
//                 <div>
//                   <p className="text-muted mb-1 fs-11 fw-bold">Cost per unit</p>
//                   <div className="fs-12 fw-bold">{item.costPerUnit}</div> {/* Display item-specific data */}
//                 </div>
//               </Col>
//               <Col xs={6}>
//                 <div>
//                   <p className="text-muted mb-1 fs-11">Total Machining Hours</p>
//                   <h5 className="fs-12 fw-bold">{item.totalMachiningHours}</h5>
//                 </div>
//               </Col>
//             </Row>

//                         {/* New part to display processes */}
//                         {item.processes.map((subItem, subIndex) => (
//               <div className="d-flex justify-content-between align-items-center mt-3"key={subIndex}>
//                 <h6 className="fs-12 fw-bold mb-0">{subItem.subpartName}</h6>
//                 <span className="text-muted fs-12">{subItem.value}</span>
//               </div>
//             ))}
//             {/* End of processes display */}
//           </div>
//         </CardBody>
//       </Card>
//     </Col>
//             </React.Fragment>
// ))}
//           </Row>
//         </Container>
//       </div>
//           {/* Add modal */}
//           <Modal isOpen={modal_add} toggle={tog_add}>
//             <ModalHeader toggle={tog_add}>Add Part</ModalHeader>
//             <ModalBody>
//               <form onSubmit={handleSubmit}>
//                 <div className="mb-3">
//                   <label htmlFor="partname" className="form-label">Part Name</label>
//                   <input type="text" className="form-control" name="partname" value={partName} onChange={(e) => setPartName(e.target.value)} />
//                 </div>
//                 <div className="mb-3">
//                   <label htmlFor="costperunit" className="form-label">Cost Per Unit</label>
//                   <input type="number" className="form-control"name="costperunit" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
//                 </div>
//                 <div className="mb-3">
//                   <label htmlFor="totalmachininghours" className="form-label"> Total Machining Hours</label>
//                   <input type="number" className="form-control" name="totalmachininghours" value={totalMachiningHours} onChange={(e) => setTotalMachiningHours(e.target.value)} />
//                 </div>

//                 {/* Dynamic Subpart Inputs */}
//                 {processes.map((process, index) => (
//                   <div className="row mb-3" key={index}>
//                     <div className="col-md-5">
//                       <label htmlFor={`subpartName-${index}`} className="form-label"> Sub Part Name </label>
//                       <input  type="text"  className="form-control"  name="subpartName"  value={process.subpartName}  onChange={(e) => handleProcessChange(index, e)}  />
//                     </div>

//                     <div className="col-md-5">
//                       <label htmlFor={`subpartValue-${index}`} className="form-label">  Sub Part Value </label>
//                       <input type="number" className="form-control" name="value" value={process.value} onChange={(e) => handleProcessChange(index, e)} />
//                     </div>

//                     {/* Delete button */}
//                     <div className="col-md-2 d-flex align-items-center" style={{justifyContent: "center", margin: "auto"}}>
//                       <Button color="danger" type="button" onClick={() => removeSubPartField(index)} className="mt-4 p-2" > Remove </Button>
//                     </div>
//                   </div>
//                 ))}

//                 {/* Button to add new subpart */}
//                 <Button color="primary" type="button" onClick={addSubPartField} className="mb-3" > + Add Sub Part
//                 </Button>

//                 <ModalFooter>
//                   <Button type="submit" color="success" disabled={posting}> {posting ? 'Posting...' : 'Add'}</Button>
//                   <Button type="button" color="danger" onClick={tog_add}> Cancel </Button>
//                 </ModalFooter>
//               </form>
//             </ModalBody>
//           </Modal>

//           {/* Edit modal */}
//       <Modal isOpen={modal_edit} toggle={tog_edit}>
//         <ModalHeader toggle={tog_edit}>Edit Part</ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleEditSubmit}>
//             <div className="mb-3">
//               <label htmlFor="partname" className="form-label">
//                 Part Name
//               </label>
//               <input type="text" className="form-control" name="partname" value={partName} onChange={(e) => setPartName(e.target.value)} />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="costperunit" className="form-label">
//                 Cost Per Unit
//               </label>
//               <input type="number" className="form-control" name="costperunit" value={costPerUnit} onChange={(e) => setCostPerUnit(e.target.value)} />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="machininghours" className="form-label">
//                 Total Machining Hours
//               </label>
//               <input type="number" className="form-control" name="machininghours" value={totalMachiningHours} onChange={(e) => setTotalMachiningHours(e.target.value)} />
//             </div>
//             <div className="mb-3">
//               <label className="form-label">Processes</label>
//               {processes.map((process, index) => (
//                 <div key={index} className="input-group mb-3">
//                   <input
//                     type="text"
//                     className="form-control"
//                     name="subpartName"
//                     value={process.subpartName}
//                     onChange={(event) => handleProcessChange(index, event)}
//                     placeholder="Subpart Name"
//                   />
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="value"
//                     value={process.value}
//                     onChange={(event) => handleProcessChange(index, event)}
//                     placeholder="Value"
//                   />
//                   <button type="button" className="btn btn-danger" onClick={() => removeSubPartField(index)}>
//                     Remove
//                   </button>
//                 </div>
//               ))}
//               <button type="button" className="btn btn-primary" onClick={addSubPartField}>
//                 Add Subpart
//               </button>
//             </div>
//             <button type="submit" className="btn btn-success" disabled={posting}>
//               {posting ? 'Saving...' : 'Save Changes'}
//             </button>
//           </form>
//         </ModalBody>
//       </Modal>
//     </React.Fragment>
//   );
// };

// export default SingeProject;







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
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Link, useParams } from "react-router-dom";

const SingeProject = () => {
  const { _id } = useParams();
  const [modalAdd, setModalAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partsData, setPartsData] = useState([]);
  const [partDetails, setPartDetails] = useState([]);
  const [listData, setListData] = useState([]);
  const [selectedPartData, setSelectedPartData] = useState(null);
  const [quantity, setQuantity] = useState(0); // New state for quantity
  const [processPartsMap, setProcessPartsMap] = useState({});

  const handleRowClick = (process) => {
    setExpandedRows((prevExpandedRows) => ({
      ...prevExpandedRows,
      [process]: !prevExpandedRows[process],
    }));
  };
  const processes = [
    { name: "VMC Imported", totalHours: 4 },
    { name: "VMC Local", totalHours: 3 },
    { name: "Milling Manual", totalHours: 2 },
    { name: "Grinding Final", totalHours: 2 },
    { name: "CNC Lathe", totalHours: 2 },
    { name: "Drill/Tap", totalHours: 2 },
    { name: "Wire Cut Local", totalHours: 2 },
    { name: "Wire Cut Rough", totalHours: 2 },
    { name: "Wire Cut Imported", totalHours: 2 },
    { name: "EDM", totalHours: 2 },
    { name: "Black Oxide", totalHours: 2 },
    { name: "Laser Marking", totalHours: 2 },
    { name: "Lapping/Polishing", totalHours: 2 },
    { name: "Grinding Blank/Rough", totalHours: 2 },
  ];


  const [expandedRows, setExpandedRows] = useState({});

  const toggleAddModal = () => {
    setModalAdd(!modalAdd);
  };


  const organizeProcessData = (data) => {
    if (!data || !data.allProjects || !Array.isArray(data.allProjects)) {
      console.error("Invalid data structure: allProjects is undefined or not an array");
      return;
    }
  
    const processMap = {};
  
    data.allProjects.forEach((project) => {
      if (project && project.processes && Array.isArray(project.processes)) {
        project.processes.forEach((process) => {
          // Initialize the process key in processMap if not already present
          if (!processMap[process]) {
            processMap[process] = [];
          }
          // Add the part's name to the array for this process
          processMap[process].push(project.partName);
        });
      } else {
        console.warn("Skipping project due to missing or invalid processes array:", project);
      }
    });
  
    setProcessPartsMap(processMap); // Update the state with the organized map
    console.log("Process-to-parts mapping:", processMap); // Debugging log
  };
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4040/api/projects/${_id}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
  
        const data = await response.json();
        setPartDetails(data || { allProjects: [] });
  
        if (data && data.allProjects) {
          organizeProcessData(data); // Map processes to parts
        } else {
          console.error("Expected 'allProjects' in response, but it was not found.");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjectDetails();
  }, [_id]);
  

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:4040/api/parts");
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setListData(data);
      setPartsData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedPartData(newValue);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedPartData) {
      const payload = {
        partName: selectedPartData.partName,
        costPerUnit: selectedPartData.costPerUnit,
        timePerUnit: selectedPartData.timePerUnit,
        quantity: quantity,
      };

      try {
        const response = await fetch(`http://localhost:4040/api/projects/${_id}/allProjects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error("Failed to submit part data");
        
        await fetchProjectDetails()
        await fetchData()
        const newPart = await response.json();
        setListData((prevData) => [...prevData, newPart]);
        setModalAdd(false);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const totalCost = partDetails.allProjects?.reduce((total, item) => total + (item.costPerUnit * item.quantity), 0) || 0;
  const totalMachiningHours = partDetails.allProjects?.reduce((total, item) => total + Number(item.timePerUnit * item.quantity), 0);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Project Details" pageTitle="Project Details" />

          {/* top headers div */}


          <div className="mb-4 pb-2 d-flex">
            <Button color="success" className="add-btn me-1" onClick={toggleAddModal}>
              <i className="ri-add-line align-bottom me-1"></i> Add Part
            </Button>
            <Link to="/projectinvoice">
              <Button style={{ backgroundColor: "#9C27B0" }} className="add-btn me-1">
                <i className="ri-add-line align-bottom me-1"></i> Add BOM
              </Button>
            </Link>
          </div>

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex align-items-center mt-3">
                    <p className="fw-bold mb-0 me-2">Total Cost:</p>
                    <p className="fw-bold mb-0 me-2">{totalCost.toFixed(2)}</p>
                  </div>
                  <div className="d-flex align-items-center mt-3">
                    <p className="fw-bold mb-0 me-2">Total Machining Hours:</p>
                    <p className="fw-bold mb-0 me-2">{totalMachiningHours}</p>
                  </div>

                  <div className="table-responsive table-card mt-3 mb-1">
                    <table className="table align-middle table-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Cost Per Unit</th>
                          <th>Machining Hours</th>
                          <th>Quantity</th>
                          <th>Total Cost</th>
                          <th>Total Machining Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partDetails.allProjects?.map((item) => (
                          <tr key={item._id}>
                            <td>{item.partName}</td>
                            <td>{item.costPerUnit}</td>
                            <td>{item.timePerUnit}</td>
                            <td>{item.quantity}</td>
                            <td>{(item.costPerUnit * item.quantity).toFixed(2)}</td>
                            <td>{(item.timePerUnit * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>


                  <div className="table-responsive table-card mt-3 mb-1">
                <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Process</th>
            <th>Required Machinewise Total Hours</th>
          </tr>
        </thead>
        <tbody>
       {processes.map((process) => (
         <React.Fragment key={process.name}>
          <tr onClick={() => handleRowClick(process.name)} style={{ cursor: "pointer" }}>
           <td>{process.name}</td>
            <td>{process.totalHours}</td>
         </tr>

      {/* Expanded row content */}
      {expandedRows[process.name] && (
        <tr>
          <td colSpan="2">
            <div className="nested-table">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Part Name</th>
                  </tr>
                </thead>
                <tbody>
                  {processPartsMap[process.name]?.map((partName, index) => (
                    <tr key={index}>
                      <td>{partName}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td>No parts available for this process</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>


               </table>
                   </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add modal */}
      <Modal isOpen={modalAdd} toggle={toggleAddModal}>
        <ModalHeader toggle={toggleAddModal}>Add Part</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="partquantity" className="form-label">Part Quantity</label>
              <input
                type="number"
                className="form-control"
                name="partquantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <Autocomplete
              options={partsData}
              getOptionLabel={(option) => option.partName}
              value={selectedPartData}
              onChange={handleAutocompleteChange}
              renderInput={(params) => (
                <TextField {...params} label="Select Part Name" variant="outlined" />
               )}
            />
            <Button type="submit" color="primary" className="mt-3">
              Add Part
            </Button>
          </form>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};
export default SingeProject;