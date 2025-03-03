
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Container,
//   Row,
//   Col,
//   Card,
//   CardBody,
//   Modal,
//   ModalHeader,
//   ModalBody,
//   Badge,
//   Button,
//   Progress,
//   FormGroup,
//   Label,
//   Input,
//   ModalFooter,
// } from "reactstrap";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format, isWithinInterval, parseISO } from "date-fns";

// const MachineCapacity = () => {
//   const navigate = useNavigate();
//   const [categories, setCategories] = useState([]);
//   const [allocations, setAllocations] = useState([]);
//   const [filteredAllocations, setFilteredAllocations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMachine, setSelectedMachine] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [totalMachines, setTotalMachines] = useState(0);
//   const [occupiedMachines, setOccupiedMachines] = useState(0);
//   const [startDate, setStartDate] = useState(new Date());
//   const [endDate, setEndDate] = useState(new Date());
//   const [dateRangeActive, setDateRangeActive] = useState(false);
//   const [selectedProcess, setSelectedProcess] = useState("All");
//   const [availableProcesses, setAvailableProcesses] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (allocations.length > 0) {
//       filterAllocationsByDate();
//       extractProcesses();
//     }
//   }, [allocations, startDate, endDate, dateRangeActive, selectedProcess]);

//   const fetchData = async () => {
//     try {
//       // Fetch data from actual API endpoints
//       const [manufacturingRes, allocationsRes] = await Promise.all([
//         fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then(
//           (res) => res.json()
//         ),
//         fetch(
//           `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
//         ).then((res) => res.json()),
//       ]);

//       let total = 0;
//       let occupied = 0;

//       // Count total machines from all categories
//       manufacturingRes.forEach((category) => {
//         total += category.subCategories.length;
//       });

//       // Process allocations to add project and part name to each allocation
//       const processedAllocations = allocationsRes.data.map((project) => {
//         return {
//           ...project,
//           allocations: project.allocations.map((alloc) => {
//             return {
//               ...alloc,
//               allocations: alloc.allocations.map((machineAlloc) => {
//                 return {
//                   ...machineAlloc,
//                   projectName: project.projectName,
//                   partName: alloc.partName,
//                   processName: alloc.processName,
//                 };
//               }),
//             };
//           }),
//         };
//       });

//       // Count occupied machines
//       processedAllocations.forEach((project) => {
//         project.allocations.forEach((alloc) => {
//           occupied += alloc.allocations.length;
//         });
//       });

//       setTotalMachines(total);
//       setOccupiedMachines(occupied);
//       setCategories(manufacturingRes);
//       setAllocations(processedAllocations);
//       setFilteredAllocations(processedAllocations);
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//       setLoading(false);
//     }
//   };

//   const extractProcesses = () => {
//     const processes = new Set();
//     processes.add("All");

//     allocations.forEach((project) => {
//       project.allocations.forEach((alloc) => {
//         processes.add(alloc.processName);
//       });
//     });

//     setAvailableProcesses(Array.from(processes));
//   };

//   const filterAllocationsByDate = () => {
//     if (!dateRangeActive) {
//       setFilteredAllocations(allocations);
//       return;
//     }

//     const filtered = allocations
//       .map((project) => {
//         return {
//           ...project,
//           allocations: project.allocations
//             .map((alloc) => {
//               // Filter by process if not "All"
//               if (
//                 selectedProcess !== "All" &&
//                 alloc.processName !== selectedProcess
//               ) {
//                 return { ...alloc, allocations: [] };
//               }

//               return {
//                 ...alloc,
//                 allocations: alloc.allocations.filter((machineAlloc) => {
//                   const allocStartDate = parseISO(machineAlloc.startDate);
//                   const allocEndDate = parseISO(machineAlloc.endDate);

//                   // Check if allocation date range overlaps with selected date range
//                   return allocStartDate <= endDate && allocEndDate >= startDate;
//                 }),
//               };
//             })
//             .filter((alloc) => alloc.allocations.length > 0),
//         };
//       })
//       .filter((project) => project.allocations.length > 0);

//     setFilteredAllocations(filtered);

//     // Recalculate occupied machines
//     let occupied = 0;
//     filtered.forEach((project) => {
//       project.allocations.forEach((alloc) => {
//         occupied += alloc.allocations.length;
//       });
//     });

//     setOccupiedMachines(occupied);
//   };

//   const getMachineAllocation = (subcategoryId, processName) => {
//     if (selectedProcess !== "All" && selectedProcess !== processName) {
//       return null;
//     }

//     for (let project of filteredAllocations) {
//       for (let alloc of project.allocations) {
//         if (
//           (selectedProcess === "All" || alloc.processName === processName) &&
//           alloc.allocations.some((a) => a.machineId === subcategoryId)
//         ) {
//           const allocation = alloc.allocations.find(
//             (a) => a.machineId === subcategoryId
//           );
//           return allocation;
//         }
//       }
//     }
//     return null;
//   };

//   const toggleModal = (machine) => {
//     if (machine) {
//       setSelectedMachine(machine);
//     }
//     setModalOpen(!modalOpen);
//   };

//   const handleDateRangeToggle = () => {
//     setDateRangeActive(!dateRangeActive);
//   };

//   const handleProcessChange = (e) => {
//     setSelectedProcess(e.target.value);
//   };

//   const handleViewPlan = () => {
//     if (selectedMachine && selectedMachine.allocation) {
//       navigate(`/regenato-planPage/${selectedMachine.allocation._id}`);
//     }
//   };

//   if (loading)
//     return (
//       <div
//         className="d-flex justify-content-center align-items-center"
//         style={{ height: "100vh" }}
//       >
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );

//   const availableMachines = totalMachines - occupiedMachines;
//   const availablePercentage = (
//     (availableMachines / totalMachines) *
//     100
//   ).toFixed(1);
//   const occupiedPercentage = ((occupiedMachines / totalMachines) * 100).toFixed(
//     1
//   );

//   return (
//     <Container fluid className="py-4">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2 className="mb-0">Machine Capacity</h2>
//       </div>

//       <Card className="shadow-sm mb-4">
//         <CardBody>
//           <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
//             <h5 className="mb-0">Date Range Filter</h5>
//             <div className="form-check form-switch">
//               <input
//                 className="form-check-input"
//                 type="checkbox"
//                 id="dateRangeToggle"
//                 checked={dateRangeActive}
//                 onChange={handleDateRangeToggle}
//               />
//               <label className="form-check-label" htmlFor="dateRangeToggle">
//                 {dateRangeActive ? "Filter Active" : "Filter Inactive"}
//               </label>
//             </div>
//           </div>

//           <div className="d-flex flex-wrap gap-3 mb-3 date-picker-container">
//             <div>
//               <label className="form-label">Start Date</label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 className="form-control"
//                 disabled={!dateRangeActive}
//               />
//             </div>
//             <div>
//               <label className="form-label">End Date</label>
//               <DatePicker
//                 selected={endDate}
//                 onChange={(date) => setEndDate(date)}
//                 selectsEnd
//                 startDate={startDate}
//                 endDate={endDate}
//                 minDate={startDate}
//                 className="form-control"
//                 disabled={!dateRangeActive}
//               />
//             </div>
//             <div>
//               <label className="form-label">Process Filter</label>
//               <select
//                 className="form-select"
//                 value={selectedProcess}
//                 onChange={handleProcessChange}
//               >
//                 {availableProcesses.map((process) => (
//                   <option key={process} value={process}>
//                     {process}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {dateRangeActive && (
//             <div className="alert alert-info mb-3">
//               <strong>Selected Date Range:</strong>{" "}
//               {format(startDate, "MMM dd, yyyy")} -{" "}
//               {format(endDate, "MMM dd, yyyy")}
//               {selectedProcess !== "All" && (
//                 <span>
//                   {" "}
//                   | <strong>Process:</strong> {selectedProcess}
//                 </span>
//               )}
//             </div>
//           )}
//         </CardBody>
//       </Card>

//       <Card className="shadow-sm mb-4">
//         <CardBody>
//           <h5 className="mb-3">Factory Capacity Overview</h5>
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <h2 className="mb-0">{totalMachines}</h2>
//             <span className="text-muted">Total Machines</span>
//           </div>

//           <div className="mb-3">
//             <Progress multi className="mb-2" style={{ height: "20px" }}>
//               <Progress bar color="success" value={availablePercentage}>
//                 {availablePercentage}%
//               </Progress>
//               <Progress bar color="danger" value={occupiedPercentage}>
//                 {occupiedPercentage}%
//               </Progress>
//             </Progress>

//             <div className="d-flex justify-content-between">
//               <div>
//                 <Badge color="success" className="me-2">
//                   Available
//                 </Badge>
//                 <span>
//                   {availableMachines} ({availablePercentage}%)
//                 </span>
//               </div>
//               <div>
//                 <Badge color="danger" className="me-2">
//                   Occupied
//                 </Badge>
//                 <span>
//                   {occupiedMachines} ({occupiedPercentage}%)
//                 </span>
//               </div>
//             </div>
//           </div>
//         </CardBody>
//       </Card>

//       {categories.map((category) => (
//         <Card key={category._id} className="shadow-sm mb-4">
//           <CardBody>
//             <h5 className="mb-3">{category.name}</h5>
//             <Row xs={2} sm={3} md={4} lg={6} className="g-3">
//               {category.subCategories.map((machine) => {
//                 const allocation = getMachineAllocation(
//                   machine.subcategoryId,
//                   category.name
//                 );
//                 const isOccupied = allocation !== null;
//                 return (
//                   <Col key={machine.subcategoryId}>
//                     <Card
//                       className={`h-100 ${
//                         isOccupied ? "border-danger" : "border-success"
//                       }`}
//                       style={{
//                         background: isOccupied ? "#FFEEEE" : "#EEFFEE",
//                         cursor: isOccupied ? "pointer" : "default",
//                       }}
//                       onClick={() =>
//                         isOccupied && toggleModal({ ...machine, allocation })
//                       }
//                     >
//                       <CardBody className="p-2 text-center">
//                         <div className="fw-bold mb-1">{machine.name}</div>
//                         {isOccupied && (
//                           <Badge color="danger" pill>
//                             Occupied
//                           </Badge>
//                         )}
//                         {!isOccupied && (
//                           <Badge color="success" pill>
//                             Available
//                           </Badge>
//                         )}
//                       </CardBody>
//                     </Card>
//                   </Col>
//                 );
//               })}
//             </Row>
//           </CardBody>
//         </Card>
//       ))}

//       {selectedMachine && (
//         <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
//           <div toggle={toggleModal} style={{ marginTop: "10px", fontWeight: "bold" }}>
//             <h3>Machine Allocation Details</h3>
//           </div>
//           <ModalBody>
//             <div className="row">
//               <div className="col-md-6 mb-3">
//                 <Card className="h-100 border-primary">
//                   <CardBody>
//                     <h5 className="card-title border-bottom pb-2">
//                       Machine Information
//                     </h5>
//                     <p className="mb-2">
//                       <strong>Machine ID:</strong>{" "}
//                       {selectedMachine.subcategoryId}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Machine Name:</strong> {selectedMachine.name}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Process:</strong>{" "}
//                       {selectedMachine.allocation?.processName || "N/A"}
//                     </p>
//                     <p className="mb-0">
//                       <strong>Status:</strong>{" "}
//                       <Badge color="danger">Occupied</Badge>
//                     </p>
//                   </CardBody>
//                 </Card>
//               </div>

//               <div className="col-md-6 mb-3">
//                 <Card className="h-100 border-info">
//                   <CardBody>
//                     <h5 className="card-title border-bottom pb-2">
//                       Project Information
//                     </h5>
//                     <p className="mb-2">
//                       <strong>Project Name:</strong>{" "}
//                       {selectedMachine.allocation?.projectName || "N/A"}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Part Name:</strong>{" "}
//                       {selectedMachine.allocation?.partName || "N/A"}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Order Number:</strong>{" "}
//                       {selectedMachine.allocation?.orderNumber || "N/A"}
//                     </p>
//                     <p className="mb-0">
//                       <strong>Planned Quantity:</strong>{" "}
//                       {selectedMachine.allocation?.plannedQuantity || "N/A"}
//                     </p>
//                   </CardBody>
//                 </Card>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-md-6 mb-3">
//                 <Card className="h-100 border-success">
//                   <CardBody>
//                     <h5 className="card-title border-bottom pb-2">
//                       Schedule Information
//                     </h5>
//                     <p className="mb-2">
//                       <strong>Start Date:</strong>{" "}
//                       {selectedMachine.allocation?.startDate
//                         ? format(
//                             new Date(selectedMachine.allocation?.startDate),
//                             "MMM dd, yyyy"
//                           )
//                         : "N/A"}
//                     </p>
//                     <p className="mb-2">
//                       <strong>End Date:</strong>{" "}
//                       {selectedMachine.allocation?.endDate
//                         ? format(
//                             new Date(selectedMachine.allocation?.endDate),
//                             "MMM dd, yyyy"
//                           )
//                         : "N/A"}
//                     </p>
//                     <p className="mb-2">
//                       <strong>Start Time:</strong>{" "}
//                       {selectedMachine.allocation?.startTime || "N/A"}
//                     </p>
//                     <p className="mb-0">
//                       <strong>Planned Time:</strong>{" "}
//                       {selectedMachine.allocation?.plannedTime || "N/A"} minutes
//                     </p>
//                   </CardBody>
//                 </Card>
//               </div>

//               <div className="col-md-6 mb-3">
//                 <Card className="h-100 border-warning">
//                   <CardBody>
//                     <h5 className="card-title border-bottom pb-2">
//                       Operation Information
//                     </h5>
//                     <p className="mb-2">
//                       <strong>Operator:</strong>{" "}
//                       {selectedMachine.allocation?.operator || "N/A"}
//                     </p>
//                     <p className="mb-0">
//                       <strong>Shift:</strong>{" "}
//                       {selectedMachine.allocation?.shift || "N/A"}
//                     </p>
//                   </CardBody>
//                 </Card>
//               </div>
//             </div>
//           </ModalBody>
//           <ModalFooter>
//             <Button 
//               color="primary" 
//               onClick={handleViewPlan}
//               className="me-2"
//             >
//               View Plan
//             </Button>
//             <Button onClick={toggleModal}>Close</Button>
//           </ModalFooter>
//         </Modal>
//       )}
//     </Container>
//   );
// };

// export default MachineCapacity;/




import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  Badge,
  Button,
  Progress,
  FormGroup,
  Label,
  Input,
  ModalFooter,
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, isWithinInterval, parseISO } from "date-fns";

const MachineCapacity = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalMachines, setTotalMachines] = useState(0);
  const [occupiedMachines, setOccupiedMachines] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [dateRangeActive, setDateRangeActive] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState("All");
  const [availableProcesses, setAvailableProcesses] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allocations.length > 0) {
      filterAllocationsByDate();
      extractProcesses();
      calculateCategoryStats();
    }
  }, [allocations, startDate, endDate, dateRangeActive, selectedProcess]);

  const fetchData = async () => {
    try {
      // Fetch data from actual API endpoints
      const [manufacturingRes, allocationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then(
          (res) => res.json()
        ),
        fetch(
          `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
        ).then((res) => res.json()),
      ]);

      let total = 0;
      let occupied = 0;

      // Count total machines from all categories
      manufacturingRes.forEach((category) => {
        total += category.subCategories.length;
      });

      // Process allocations to add project and part name to each allocation
      const processedAllocations = allocationsRes.data.map((project) => {
        return {
          ...project,
          allocations: project.allocations.map((alloc) => {
            return {
              ...alloc,
              allocations: alloc.allocations.map((machineAlloc) => {
                return {
                  ...machineAlloc,
                  projectName: project.projectName,
                  partName: alloc.partName,
                  processName: alloc.processName,
                };
              }),
            };
          }),
        };
      });

      // Count occupied machines
      processedAllocations.forEach((project) => {
        project.allocations.forEach((alloc) => {
          occupied += alloc.allocations.length;
        });
      });

      setTotalMachines(total);
      setOccupiedMachines(occupied);
      setCategories(manufacturingRes);
      setAllocations(processedAllocations);
      setFilteredAllocations(processedAllocations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const calculateCategoryStats = () => {
    const stats = {};
    
    // Initialize stats for each category
    categories.forEach(category => {
      stats[category._id] = {
        total: category.subCategories.length,
        occupied: 0,
        name: category.name
      };
    });
    
    // Count occupied machines per category
    filteredAllocations.forEach(project => {
      project.allocations.forEach(alloc => {
        alloc.allocations.forEach(machineAlloc => {
          // Find which category this machine belongs to
          for (const category of categories) {
            const machineExists = category.subCategories.some(
              sub => sub.subcategoryId === machineAlloc.machineId
            );
            
            if (machineExists) {
              stats[category._id].occupied += 1;
              break;
            }
          }
        });
      });
    });
    
    setCategoryStats(stats);
  };

  const extractProcesses = () => {
    const processes = new Set();
    processes.add("All");

    allocations.forEach((project) => {
      project.allocations.forEach((alloc) => {
        processes.add(alloc.processName);
      });
    });

    setAvailableProcesses(Array.from(processes));
  };

  const filterAllocationsByDate = () => {
    if (!dateRangeActive) {
      setFilteredAllocations(allocations);
      return;
    }

    const filtered = allocations
      .map((project) => {
        return {
          ...project,
          allocations: project.allocations
            .map((alloc) => {
              // Filter by process if not "All"
              if (
                selectedProcess !== "All" &&
                alloc.processName !== selectedProcess
              ) {
                return { ...alloc, allocations: [] };
              }

              return {
                ...alloc,
                allocations: alloc.allocations.filter((machineAlloc) => {
                  const allocStartDate = parseISO(machineAlloc.startDate);
                  const allocEndDate = parseISO(machineAlloc.endDate);

                  // Check if allocation date range overlaps with selected date range
                  return allocStartDate <= endDate && allocEndDate >= startDate;
                }),
              };
            })
            .filter((alloc) => alloc.allocations.length > 0),
        };
      })
      .filter((project) => project.allocations.length > 0);

    setFilteredAllocations(filtered);

    // Recalculate occupied machines
    let occupied = 0;
    filtered.forEach((project) => {
      project.allocations.forEach((alloc) => {
        occupied += alloc.allocations.length;
      });
    });

    setOccupiedMachines(occupied);
  };

  const getMachineAllocation = (subcategoryId, processName) => {
    if (selectedProcess !== "All" && selectedProcess !== processName) {
      return null;
    }

    for (let project of filteredAllocations) {
      for (let alloc of project.allocations) {
        if (
          (selectedProcess === "All" || alloc.processName === processName) &&
          alloc.allocations.some((a) => a.machineId === subcategoryId)
        ) {
          const allocation = alloc.allocations.find(
            (a) => a.machineId === subcategoryId
          );
          return allocation;
        }
      }
    }
    return null;
  };

  const toggleModal = (machine) => {
    if (machine) {
      setSelectedMachine(machine);
    }
    setModalOpen(!modalOpen);
  };

  const handleDateRangeToggle = () => {
    setDateRangeActive(!dateRangeActive);
  };

  const handleProcessChange = (e) => {
    setSelectedProcess(e.target.value);
  };

  const handleViewPlan = () => {
    if (selectedMachine && selectedMachine.allocation) {
      navigate(`/regenato-planPage/${selectedMachine.allocation._id}`);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  const availableMachines = totalMachines - occupiedMachines;
  const availablePercentage = (
    (availableMachines / totalMachines) *
    100
  ).toFixed(1);
  const occupiedPercentage = ((occupiedMachines / totalMachines) * 100).toFixed(
    1
  );

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Machine Capacity</h2>
      </div>

      <Card className="shadow-sm mb-4">
        <CardBody>
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Date Range Filter</h5>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="dateRangeToggle"
                checked={dateRangeActive}
                onChange={handleDateRangeToggle}
              />
              <label className="form-check-label" htmlFor="dateRangeToggle">
                {dateRangeActive ? "Filter Active" : "Filter Inactive"}
              </label>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-3 mb-3 date-picker-container">
            <div>
              <label className="form-label">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="form-control"
                disabled={!dateRangeActive}
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="form-control"
                disabled={!dateRangeActive}
              />
            </div>
            <div>
              <label className="form-label">Process Filter</label>
              <select
                className="form-select"
                value={selectedProcess}
                onChange={handleProcessChange}
              >
                {availableProcesses.map((process) => (
                  <option key={process} value={process}>
                    {process}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {dateRangeActive && (
            <div className="alert alert-info mb-3">
              <strong>Selected Date Range:</strong>{" "}
              {format(startDate, "MMM dd, yyyy")} -{" "}
              {format(endDate, "MMM dd, yyyy")}
              {selectedProcess !== "All" && (
                <span>
                  {" "}
                  | <strong>Process:</strong> {selectedProcess}
                </span>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="shadow-sm mb-4">
        <CardBody>
          <h5 className="mb-3">Factory Capacity Overview</h5>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h2 className="mb-0">{totalMachines}</h2>
            <span className="text-muted">Total Machines</span>
          </div>

          <div className="mb-3">
            <Progress multi className="mb-2" style={{ height: "20px" }}>
              <Progress bar color="success" value={availablePercentage}>
                {availablePercentage}%
              </Progress>
              <Progress bar color="danger" value={occupiedPercentage}>
                {occupiedPercentage}%
              </Progress>
            </Progress>

            <div className="d-flex justify-content-between">
              <div>
                <Badge color="success" className="me-2">
                  Available
                </Badge>
                <span>
                  {availableMachines} ({availablePercentage}%)
                </span>
              </div>
              <div>
                <Badge color="danger" className="me-2">
                  Occupied
                </Badge>
                <span>
                  {occupiedMachines} ({occupiedPercentage}%)
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {categories.map((category) => {
        const stats = categoryStats[category._id] || { total: 0, occupied: 0 };
        const availableCategoryMachines = stats.total - stats.occupied;
        const categoryOccupiedPercentage = stats.total > 0 ? ((stats.occupied / stats.total) * 100).toFixed(1) : 0;
        
        return (
          <Card key={category._id} className="shadow-sm mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{category.name}</h5>
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <Badge color="primary" className="me-2">
                      Total
                    </Badge>
                    <span>{stats.total}</span>
                  </div>
                  <div className="me-3">
                    <Badge color="success" className="me-2">
                      Available
                    </Badge>
                    <span>{availableCategoryMachines}</span>
                  </div>
                  <div>
                    <Badge color="danger" className="me-2">
                      Occupied
                    </Badge>
                    <span>
                      {stats.occupied} ({categoryOccupiedPercentage}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <Progress multi className="mb-3" style={{ height: "10px" }}>
                <Progress 
                  bar 
                  color="success" 
                  value={stats.total > 0 ? ((availableCategoryMachines / stats.total) * 100) : 0} 
                />
                <Progress 
                  bar 
                  color="danger" 
                  value={categoryOccupiedPercentage} 
                />
              </Progress>
              
              <Row xs={2} sm={3} md={4} lg={6} className="g-3">
                {category.subCategories.map((machine) => {
                  const allocation = getMachineAllocation(
                    machine.subcategoryId,
                    category.name
                  );
                  const isOccupied = allocation !== null;
                  return (
                    <Col key={machine.subcategoryId}>
                      <Card
                        className={`h-100 ${
                          isOccupied ? "border-danger" : "border-success"
                        }`}
                        style={{
                          background: isOccupied ? "#FFEEEE" : "#EEFFEE",
                          cursor: isOccupied ? "pointer" : "default",
                        }}
                        onClick={() =>
                          isOccupied && toggleModal({ ...machine, allocation })
                        }
                      >
                        <CardBody className="p-2 text-center">
                          <div className="fw-bold mb-1">{machine.name}</div>
                          {isOccupied && (
                            <Badge color="danger" pill>
                              Occupied
                            </Badge>
                          )}
                          {!isOccupied && (
                            <Badge color="success" pill>
                              Available
                            </Badge>
                          )}
                        </CardBody>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </CardBody>
          </Card>
        );
      })}

      {selectedMachine && (
        <Modal isOpen={modalOpen} toggle={toggleModal} size="lg">
          <div toggle={toggleModal} style={{ marginTop: "10px", fontWeight: "bold" }}>
            <h3>Machine Allocation Details</h3>
          </div>
          <ModalBody>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Card className="h-100 border-primary">
                  <CardBody>
                    <h5 className="card-title border-bottom pb-2">
                      Machine Information
                    </h5>
                    <p className="mb-2">
                      <strong>Machine ID:</strong>{" "}
                      {selectedMachine.subcategoryId}
                    </p>
                    <p className="mb-2">
                      <strong>Machine Name:</strong> {selectedMachine.name}
                    </p>
                    <p className="mb-2">
                      <strong>Process:</strong>{" "}
                      {selectedMachine.allocation?.processName || "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Status:</strong>{" "}
                      <Badge color="danger">Occupied</Badge>
                    </p>
                  </CardBody>
                </Card>
              </div>

              <div className="col-md-6 mb-3">
                <Card className="h-100 border-info">
                  <CardBody>
                    <h5 className="card-title border-bottom pb-2">
                      Project Information
                    </h5>
                    <p className="mb-2">
                      <strong>Project Name:</strong>{" "}
                      {selectedMachine.allocation?.projectName || "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>Part Name:</strong>{" "}
                      {selectedMachine.allocation?.partName || "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>Order Number:</strong>{" "}
                      {selectedMachine.allocation?.orderNumber || "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Planned Quantity:</strong>{" "}
                      {selectedMachine.allocation?.plannedQuantity || "N/A"}
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Card className="h-100 border-success">
                  <CardBody>
                    <h5 className="card-title border-bottom pb-2">
                      Schedule Information
                    </h5>
                    <p className="mb-2">
                      <strong>Start Date:</strong>{" "}
                      {selectedMachine.allocation?.startDate
                        ? format(
                            new Date(selectedMachine.allocation?.startDate),
                            "MMM dd, yyyy"
                          )
                        : "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>End Date:</strong>{" "}
                      {selectedMachine.allocation?.endDate
                        ? format(
                            new Date(selectedMachine.allocation?.endDate),
                            "MMM dd, yyyy"
                          )
                        : "N/A"}
                    </p>
                    <p className="mb-2">
                      <strong>Start Time:</strong>{" "}
                      {selectedMachine.allocation?.startTime || "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Planned Time:</strong>{" "}
                      {selectedMachine.allocation?.plannedTime || "N/A"} minutes
                    </p>
                  </CardBody>
                </Card>
              </div>

              <div className="col-md-6 mb-3">
                <Card className="h-100 border-warning">
                  <CardBody>
                    <h5 className="card-title border-bottom pb-2">
                      Operation Information
                    </h5>
                    <p className="mb-2">
                      <strong>Operator:</strong>{" "}
                      {selectedMachine.allocation?.operator || "N/A"}
                    </p>
                    <p className="mb-0">
                      <strong>Shift:</strong>{" "}
                      {selectedMachine.allocation?.shift || "N/A"}
                    </p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="primary" 
              onClick={handleViewPlan}
              className="me-2"
            >
              View Plan
            </Button>
            <Button onClick={toggleModal}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
};

export default MachineCapacity;