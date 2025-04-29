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
//   Table,
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
//   const [categoryStats, setCategoryStats] = useState({});
//   const [machineAllocations, setMachineAllocations] = useState([]);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (allocations.length > 0) {
//       filterAllocationsByDate();
//       calculateCategoryStats();
//     }
//   }, [allocations, startDate, endDate]);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
  
//       // Check if cached data exists
//       const cachedManufacturing = sessionStorage.getItem("cachedManufacturingData");
//       const cachedAllocations = sessionStorage.getItem("cachedAllocationsData");
  
//       if (cachedManufacturing && cachedAllocations) {
//         // Parse and set cached data
//         const manufacturingRes = JSON.parse(cachedManufacturing);
//         const allocationsRes = JSON.parse(cachedAllocations);
  
//         let total = 0;
//         let occupied = 0;
  
//         // Count total machines from all categories
//         manufacturingRes.forEach((category) => {
//           total += category.subCategories.length;
//         });
  
//         // Process allocations to add project and part name to each allocation
//         const processedAllocations = allocationsRes.data.map((project) => {
//           return {
//             ...project,
//             allocations: project.allocations.map((alloc) => {
//               return {
//                 ...alloc,
//                 allocations: alloc.allocations.map((machineAlloc) => {
//                   return {
//                     ...machineAlloc,
//                     projectName: project.projectName,
//                     partName: alloc.partName,
//                     processName: alloc.processName,
//                   };
//                 }),
//               };
//             }),
//           };
//         });
  
//         // Count occupied machines
//         processedAllocations.forEach((project) => {
//           project.allocations.forEach((alloc) => {
//             occupied += alloc.allocations.length;
//           });
//         });
  
//         setTotalMachines(total);
//         setOccupiedMachines(occupied);
//         setCategories(manufacturingRes);
//         setAllocations(processedAllocations);
//         setFilteredAllocations(processedAllocations);
//         setLoading(false);
//         return;
//       }
  
//       // Fetch data from actual API endpoints if cache doesn't exist
//       const [manufacturingRes, allocationsRes] = await Promise.all([
//         fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then((res) =>
//           res.json()
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
  
//       // Store data in sessionStorage
//       sessionStorage.setItem("cachedManufacturingData", JSON.stringify(manufacturingRes));
//       sessionStorage.setItem("cachedAllocationsData", JSON.stringify(allocationsRes));
  
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
  
//   // Call fetchData inside useEffect
//   useEffect(() => {
//     fetchData();
//   }, []);
  

//   const calculateCategoryStats = () => {
//     const stats = {};

//     // Initialize stats for each category
//     categories.forEach((category) => {
//       stats[category._id] = {
//         total: category.subCategories.length,
//         occupied: 0,
//         name: category.name,
//       };
//     });

//     // Count occupied machines per category
//     filteredAllocations.forEach((project) => {
//       project.allocations.forEach((alloc) => {
//         alloc.allocations.forEach((machineAlloc) => {
//           // Find which category this machine belongs to
//           for (const category of categories) {
//             const machineExists = category.subCategories.some(
//               (sub) => sub.subcategoryId === machineAlloc.machineId
//             );

//             if (machineExists) {
//               stats[category._id].occupied += 1;
//               break;
//             }
//           }
//         });
//       });
//     });

//     setCategoryStats(stats);
//   };

//   const filterAllocationsByDate = () => {
//     const filtered = allocations
//       .map((project) => {
//         return {
//           ...project,
//           allocations: project.allocations
//             .map((alloc) => {
//               return {
//                 ...alloc,
//                 allocations: alloc.allocations.filter((machineAlloc) => {
//                   const allocStartDate = parseISO(machineAlloc.startDate);
//                   const allocEndDate = parseISO(machineAlloc.endDate);

//                   // Check if allocation date range overlaps with selected date range
//                   return (
//                     (allocStartDate >= startDate &&
//                       allocStartDate <= endDate) ||
//                     (allocEndDate >= startDate && allocEndDate <= endDate) ||
//                     (allocStartDate <= startDate && allocEndDate >= endDate)
//                   );
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
//     for (let project of filteredAllocations) {
//       for (let alloc of project.allocations) {
//         if (alloc.allocations.some((a) => a.machineId === subcategoryId)) {
//           const allocation = alloc.allocations.find(
//             (a) => a.machineId === subcategoryId
//           );
//           return allocation;
//         }
//       }
//     }
//     return null;
//   };

//   const findAllMachineAllocations = (machineId) => {
//     const allAllocations = [];

//     filteredAllocations.forEach((project) => {
//       project.allocations.forEach((alloc) => {
//         alloc.allocations.forEach((machineAlloc) => {
//           if (machineAlloc.machineId === machineId) {
//             const allocStartDate = parseISO(machineAlloc.startDate);
//             const allocEndDate = parseISO(machineAlloc.endDate);

//             // Check if allocation date range overlaps with selected date range
//             if (allocStartDate <= endDate && allocEndDate >= startDate) {
//               allAllocations.push({
//                 ...machineAlloc,
//                 projectName: project.projectName,
//                 partName: alloc.partName,
//                 processName: alloc.processName,
//               });
//             }
//           }
//         });
//       });
//     });

//     return allAllocations;
//   };

//   const toggleModal = (machine) => {
//     if (machine) {
//       const allAllocations = findAllMachineAllocations(machine.subcategoryId);
//       setMachineAllocations(allAllocations);
//       setSelectedMachine({ ...machine, allocations: allAllocations });
//     }
//     setModalOpen(!modalOpen);
//   };

//   const handleViewPlan = (allocationId) => {
//     navigate(`/regenato-planPage/${allocationId}`);
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
//           <div className="d-flex flex-wrap gap-3 mb-3 date-picker-container">
//             <div>
//               <label className="form-label">Start Date</label>
//               <DatePicker
//                 selected={startDate}
//                 onChange={(date) => setStartDate(date)}
//                 selectsStart
//                 startDate={startDate}
//                 endDate={endDate}
//                 dateFormat="dd-MM-yyyy"
//                 className="form-control"
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
//                 dateFormat="dd-MM-yyyy"
//                 className="form-control"
//               />
//             </div>
//           </div>

//           <div className="alert alert-info mb-3">
//             <strong>Selected Date Range:</strong>{" "}
//             {format(startDate, "dd-MM-yyyy")} - {format(endDate, "dd-MM-yyyy")}
//           </div>
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

//       {categories.map((category) => {
//         const stats = categoryStats[category._id] || { total: 0, occupied: 0 };
//         const availableCategoryMachines = stats.total - stats.occupied;
//         const categoryOccupiedPercentage =
//           stats.total > 0
//             ? ((stats.occupied / stats.total) * 100).toFixed(1)
//             : 0;

//         return (
//           <Card key={category._id} className="shadow-sm mb-4">
//             <CardBody>
//               <div className="d-flex justify-content-between align-items-center mb-3">
//                 <h5 className="mb-0">{category.name}</h5>
//                 <div className="d-flex align-items-center">
//                   <div className="me-3">
//                     <Badge color="primary" className="me-2">
//                       Total
//                     </Badge>
//                     <span>{stats.total}</span>
//                   </div>
//                   <div className="me-3">
//                     <Badge color="success" className="me-2">
//                       Available
//                     </Badge>
//                     <span>{availableCategoryMachines}</span>
//                   </div>
//                   <div>
//                     <Badge color="danger" className="me-2">
//                       Occupied
//                     </Badge>
//                     <span>
//                       {stats.occupied} ({categoryOccupiedPercentage}%)
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <Progress multi className="mb-3" style={{ height: "10px" }}>
//                 <Progress
//                   bar
//                   color="success"
//                   value={
//                     stats.total > 0
//                       ? (availableCategoryMachines / stats.total) * 100
//                       : 0
//                   }
//                 />
//                 <Progress
//                   bar
//                   color="danger"
//                   value={categoryOccupiedPercentage}
//                 />
//               </Progress>

//               <Row xs={2} sm={3} md={4} lg={6} className="g-3">
//                 {category.subCategories.map((machine) => {
//                   const allocation = getMachineAllocation(
//                     machine.subcategoryId,
//                     category.name
//                   );
//                   const isOccupied = allocation !== null;
//                   return (
//                     <Col key={machine.subcategoryId}>
//                       <Card
//                         className={`h-100 ${
//                           isOccupied ? "border-danger" : "border-success"
//                         }`}
//                         style={{
//                           background: isOccupied ? "#FFEEEE" : "#EEFFEE",
//                           cursor: isOccupied ? "pointer" : "default",
//                         }}
//                         onClick={() =>
//                           isOccupied && toggleModal({ ...machine, allocation })
//                         }
//                       >
//                         <CardBody className="p-2 text-center">
//                           <div className="fw-bold mb-1">
//                             {machine.subcategoryId}
//                           </div>
//                           {isOccupied && (
//                             <Badge color="danger" pill>
//                               Occupied
//                             </Badge>
//                           )}
//                           {!isOccupied && (
//                             <Badge color="success" pill>
//                               Available
//                             </Badge>
//                           )}
//                         </CardBody>
//                       </Card>
//                     </Col>
//                   );
//                 })}
//               </Row>
//             </CardBody>
//           </Card>
//         );
//       })}
//       {selectedMachine && (
//         <Modal isOpen={modalOpen} toggle={toggleModal} size="xl">
//           <div
//             toggle={toggleModal}
//             style={{ marginTop: "10px", fontWeight: "bold" }}
//           >
//             <h3>
//               Machine Allocation Details - {selectedMachine.subcategoryId}
//             </h3>
//           </div>
//           <ModalBody>
//             <div className="mb-4">
//               <h5 className="border-bottom pb-2">Machine Information</h5>
//               <p className="mb-2">
//                 <strong>Machine ID:</strong> {selectedMachine.subcategoryId}
//               </p>
//               <p className="mb-2">
//                 <strong>Machine Name:</strong> {selectedMachine.name}
//               </p>
//               <p className="mb-0">
//                 <strong>Status:</strong> <Badge color="danger">Occupied</Badge>
//               </p>
//             </div>

//             <div className="mb-4">
//               <h5 className="border-bottom pb-2">Allocation Details</h5>
//               <div className="table-responsive">
//                 <Table bordered hover className="mb-0">
//                   <thead>
//                     <tr>
//                       <th>Production Order Name</th>
//                       <th>Part Name</th>
//                       <th>Process</th>
//                       <th>Operator</th>
//                       <th>Start Date</th>
//                       <th>End Date</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {machineAllocations.map((allocation, index) => (
//                       <tr key={index}>
//                         <td>{allocation.projectName}</td>
//                         <td>{allocation.partName}</td>
//                         <td>{allocation.processName}</td>
//                         <td>{allocation.operator}</td>
//                         <td>
//                           {format(
//                             new Date(allocation.startDate),
//                             "MMM dd, yyyy"
//                           )}
//                         </td>
//                         <td>
//                           {format(new Date(allocation.endDate), "MMM dd, yyyy")}
//                         </td>
//                         <td>
//                           <Button
//                             color="primary"
//                             size="sm"
//                             onClick={() => handleViewPlan(allocation._id)}
//                           >
//                             View Plan
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             </div>
//           </ModalBody>
//           <ModalFooter>
//             <Button onClick={toggleModal}>Close</Button>
//           </ModalFooter>
//         </Modal>
//       )}
//     </Container>
//   );
// };

// export default MachineCapacity;



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
  Table,
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
  const [categoryStats, setCategoryStats] = useState({});
  const [machineAllocations, setMachineAllocations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (allocations.length > 0) {
      filterAllocationsByDate();
      calculateCategoryStats();
    }
  }, [allocations, startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
  
      // Check if cached data exists
      const cachedManufacturing = sessionStorage.getItem("cachedManufacturingData");
      const cachedAllocations = sessionStorage.getItem("cachedAllocationsData");
  
      if (cachedManufacturing && cachedAllocations) {
        // Parse and set cached data
        const manufacturingRes = JSON.parse(cachedManufacturing);
        const allocationsRes = JSON.parse(cachedAllocations);
  
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
        return;
      }
  
      // Fetch data from actual API endpoints if cache doesn't exist
      const [manufacturingRes, allocationsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BASE_URL}/api/manufacturing`).then((res) =>
          res.json()
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
  
      // Store data in sessionStorage
      sessionStorage.setItem("cachedManufacturingData", JSON.stringify(manufacturingRes));
      sessionStorage.setItem("cachedAllocationsData", JSON.stringify(allocationsRes));
  
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
    categories.forEach((category) => {
      stats[category._id] = {
        total: category.subCategories.length,
        occupied: 0,
        name: category.name,
      };
    });

    // Count occupied machines per category
    filteredAllocations.forEach((project) => {
      project.allocations.forEach((alloc) => {
        alloc.allocations.forEach((machineAlloc) => {
          // Find which category this machine belongs to
          for (const category of categories) {
            const machineExists = category.subCategories.some(
              (sub) => sub.subcategoryId === machineAlloc.machineId
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

  const filterAllocationsByDate = () => {
    // If dates are the same or not properly set, show all data
    if (!startDate || !endDate || startDate.getTime() === endDate.getTime()) {
      setFilteredAllocations(allocations);
      
      // Recalculate occupied machines
      let occupied = 0;
      allocations.forEach((project) => {
        project.allocations.forEach((alloc) => {
          occupied += alloc.allocations.length;
        });
      });
      
      setOccupiedMachines(occupied);
      return;
    }

    const filtered = allocations
      .map((project) => {
        return {
          ...project,
          allocations: project.allocations
            .map((alloc) => {
              return {
                ...alloc,
                allocations: alloc.allocations.filter((machineAlloc) => {
                  const allocStartDate = parseISO(machineAlloc.startDate);
                  const allocEndDate = parseISO(machineAlloc.endDate);

                  // Check if allocation date range overlaps with selected date range
                  return (
                    (allocStartDate >= startDate &&
                      allocStartDate <= endDate) ||
                    (allocEndDate >= startDate && allocEndDate <= endDate) ||
                    (allocStartDate <= startDate && allocEndDate >= endDate)
                  );
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
    for (let project of filteredAllocations) {
      for (let alloc of project.allocations) {
        if (alloc.allocations.some((a) => a.machineId === subcategoryId)) {
          const allocation = alloc.allocations.find(
            (a) => a.machineId === subcategoryId
          );
          return allocation;
        }
      }
    }
    return null;
  };

  const findAllMachineAllocations = (machineId) => {
    const allAllocations = [];

    filteredAllocations.forEach((project) => {
      project.allocations.forEach((alloc) => {
        alloc.allocations.forEach((machineAlloc) => {
          if (machineAlloc.machineId === machineId) {
            const allocStartDate = parseISO(machineAlloc.startDate);
            const allocEndDate = parseISO(machineAlloc.endDate);

            // Check if allocation date range overlaps with selected date range
            if (!startDate || !endDate || startDate.getTime() === endDate.getTime() || 
                (allocStartDate <= endDate && allocEndDate >= startDate)) {
              allAllocations.push({
                ...machineAlloc,
                projectName: project.projectName,
                partName: alloc.partName,
                processName: alloc.processName,
              });
            }
          }
        });
      });
    });

    return allAllocations;
  };

  const toggleModal = (machine) => {
    if (machine) {
      const allAllocations = findAllMachineAllocations(machine.subcategoryId);
      setMachineAllocations(allAllocations);
      setSelectedMachine({ ...machine, allocations: allAllocations });
    }
    setModalOpen(!modalOpen);
  };

  const handleViewPlan = (allocationId) => {
    navigate(`/regenato-planPage/${allocationId}`);
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
          <div className="d-flex flex-wrap gap-3 mb-3 date-picker-container">
            <div>
              <label className="form-label">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd-MM-yyyy"
                className="form-control"
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
                dateFormat="dd-MM-yyyy"
                className="form-control"
              />
            </div>
          </div>

          <div className="alert alert-info mb-3">
            <strong>Selected Date Range:</strong>{" "}
            {format(startDate, "dd-MM-yyyy")} - {format(endDate, "dd-MM-yyyy")}
          </div>
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
        const categoryOccupiedPercentage =
          stats.total > 0
            ? ((stats.occupied / stats.total) * 100).toFixed(1)
            : 0;

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
                  value={
                    stats.total > 0
                      ? (availableCategoryMachines / stats.total) * 100
                      : 0
                  }
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
                          <div className="fw-bold mb-1">
                            {machine.subcategoryId}
                          </div>
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
        <Modal isOpen={modalOpen} toggle={toggleModal} size="xl">
          <div
            toggle={toggleModal}
            style={{ marginTop: "10px", fontWeight: "bold" }}
          >
            <h3>
              Machine Allocation Details - {selectedMachine.subcategoryId}
            </h3>
          </div>
          <ModalBody>
            <div className="mb-4">
              <h5 className="border-bottom pb-2">Machine Information</h5>
              <p className="mb-2">
                <strong>Machine ID:</strong> {selectedMachine.subcategoryId}
              </p>
              <p className="mb-2">
                <strong>Machine Name:</strong> {selectedMachine.name}
              </p>
              <p className="mb-0">
                <strong>Status:</strong> <Badge color="danger">Occupied</Badge>
              </p>
            </div>

            <div className="mb-4">
              <h5 className="border-bottom pb-2">Allocation Details</h5>
              <div className="table-responsive">
                <Table bordered hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Production Order Name</th>
                      <th>Part Name</th>
                      <th>Process</th>
                      <th>Operator</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {machineAllocations.map((allocation, index) => (
                      <tr key={index}>
                        <td>{allocation.projectName}</td>
                        <td>{allocation.partName}</td>
                        <td>{allocation.processName}</td>
                        <td>{allocation.operator}</td>
                        <td>
                          {format(
                            new Date(allocation.startDate),
                            "MMM dd, yyyy"
                          )}
                        </td>
                        <td>
                          {format(new Date(allocation.endDate), "MMM dd, yyyy")}
                        </td>
                        <td>
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleViewPlan(allocation._id)}
                          >
                            View Plan
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={toggleModal}>Close</Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
};

export default MachineCapacity;