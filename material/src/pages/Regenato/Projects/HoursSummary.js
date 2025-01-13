// import React, { useCallback, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { CardBody, Col, Row, Card } from "reactstrap";
// import "./project.css";
// import { CiSignpostL1 } from "react-icons/ci";

// const HoursSummary = () => {
//   const { _id } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [partDetails, setPartDetails] = useState({
//     allProjects: [],
//     assemblyPartsLists: [],
//     partsLists: [],
//     subAssemblyListFirst: [],
//   });
//   const [parts, setParts] = useState([]);
//   const [manufacturingVariables, setManufacturingVariables] = useState([]);
//   const [expandedRows, setExpandedRows] = useState({});
//   const [machineHoursPerDay, setMachineHoursPerDay] = useState({});
//   const [numberOfMachines, setNumberOfMachines] = useState({});
//   const [daysToWork, setDaysToWork] = useState({});
//   console.log("partDetails", partDetails);

//   const fetchProjectDetails = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
//       );
//       const data = await response.json();
//       setPartDetails(data);
//     } catch (error) {
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [_id]);

//   useEffect(() => {
//     fetchProjectDetails();
//   }, [fetchProjectDetails]);

//   useEffect(() => {
//     const fetchParts = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_BASE_URL}/api/parts`
//         );
//         const data = await response.json();
//         setParts(data);
//       } catch (err) {
//         console.error("Error fetching parts:", err);
//       }
//     };

//     const fetchManufacturingVariables = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
//         );
//         const data = await response.json();
//         setManufacturingVariables(data);
//       } catch (err) {
//         console.error("Error fetching manufacturing variables:", err);
//       }
//     };

//     fetchParts();
//     fetchManufacturingVariables();
//   }, []);

//   const processPartsMap = parts.reduce((acc, part) => {
//     let isMatchingPart = false;

//     for (const item of partDetails.allProjects || []) {
//       if (item.partName === part.partName) {
//         isMatchingPart = true;
//         break;
//       }
//     }

//     if (!isMatchingPart) {
//       for (const partsList of partDetails.partsLists || []) {
//         for (const item of partsList.partsListItems || []) {
//           if (item.partName === part.partName) {
//             isMatchingPart = true;
//             break;
//           }
//         }
//         if (isMatchingPart) break;
//       }
//     }

//     if (!isMatchingPart) {
//       for (const assemblyList of partDetails.assemblyPartsLists || []) {
//         for (const item of assemblyList.partsListItems || []) {
//           if (item.partName === part.partName) {
//             isMatchingPart = true;
//             break;
//           }
//         }
//         if (isMatchingPart) break;

//         for (const subList of assemblyList.subAssemblyPartsLists || []) {
//           for (const item of subList.partsListItems || []) {
//             if (item.partName === part.partName) {
//               isMatchingPart = true;
//               break;
//             }
//           }
//           if (isMatchingPart) break;
//         }
//         if (isMatchingPart) break;
//       }
//     }

//     if (isMatchingPart) {
//       part.manufacturingVariables.forEach((variable) => {
//         if (!acc[variable.name]) acc[variable.name] = [];
//         acc[variable.name].push({
//           partName: part.partName,
//           hours: variable.hours,
//         });
//       });
//     }

//     if (!isMatchingPart) {
//       for (const subAssemblyListFirst of partDetails.subAssemblyListFirst ||
//         []) {
//         for (const item of subAssemblyListFirst.partsListItems || []) {
//           if (item.partName === part.partName) {
//             isMatchingPart = true;
//             break;
//           }
//         }
//         if (isMatchingPart) break;
//       }
//     }

//     if (isMatchingPart) {
//       part.manufacturingVariables.forEach((variable) => {
//         if (!acc[variable.name]) acc[variable.name] = [];
//         acc[variable.name].push({
//           partName: part.partName,
//           hours: variable.hours,
//         });
//       });
//     }

//     return acc;
//   }, {});
//   console.log("processPartsMap", processPartsMap);
//   console.log("subAssemblyListFirst:", partDetails.subAssemblyListFirst);

//   const getHoursForProcess = (partName, processName) => {
//     const processData = processPartsMap[processName]?.find(
//       (item) => item.partName === partName
//     );
//     const quantity =
//       partDetails.allProjects.find((item) => item.partName === partName)
//         ?.quantity || 0;

//     if (!processData || !processData.hours) {
//       return "-";
//     }

//     const hours = processData.hours * quantity;

//     return hours.toFixed(2);
//   };

//   const calculateTotalHoursForProcess = (processName) => {
//     if (!processPartsMap[processName]) return 0;
//     return processPartsMap[processName]
//       .reduce(
//         (sum, part) =>
//           sum +
//           part.hours *
//             (partDetails.allProjects.find(
//               (item) => item.partName === part.partName
//             )?.quantity || 0),
//         0
//       )
//       .toFixed(2);
//   };

//   const handleInputChange = (event, type, processName) => {
//     switch (type) {
//       case "machineHoursPerDay":
//         setMachineHoursPerDay((prev) => ({
//           ...prev,
//           [processName]: event.target.value ? Number(event.target.value) : 0,
//         }));
//         break;
//       case "numberOfMachines":
//         setNumberOfMachines((prev) => ({
//           ...prev,
//           [processName]: event.target.value ? Number(event.target.value) : 0,
//         }));
//         break;
//       case "daysToWork":
//         setDaysToWork((prev) => ({
//           ...prev,
//           [processName]: event.target.value ? Number(event.target.value) : 25,
//         }));
//         break;
//       default:
//         break;
//     }
//   };

//   const calculateMonthsRequired = (processName) => {
//     const totalHours = calculateTotalHoursForProcess(processName);
//     const availableMachineHoursPerMonth =
//       (machineHoursPerDay[processName] || 0) *
//       (numberOfMachines[processName] || 0) *
//       (daysToWork[processName] || 0);

//     if (availableMachineHoursPerMonth === 0) {
//       return "--";
//     }

//     const monthsRequired = totalHours / availableMachineHoursPerMonth;
//     return monthsRequired.toFixed(2);
//   };

//   const getHoursForAssemblyProcess = (partName, processName) => {
//     const processData = processPartsMap[processName]?.find(
//       (item) => item.partName === partName
//     );
//     let quantity = 0;

//     partDetails.assemblyPartsLists.forEach((list) => {
//       list.partsListItems.forEach((item) => {
//         if (item.partName === partName) {
//           quantity += item.quantity || 0;
//         }
//       });
//       list.subAssemblyPartsLists.forEach((subList) => {
//         subList.partsListItems.forEach((item) => {
//           if (item.partName === partName) {
//             quantity += item.quantity || 0;
//           }
//         });
//       });
//     });

//     if (!processData || !processData.hours) {
//       return "-";
//     }

//     const hours = processData.hours * quantity;
//     return hours.toFixed(2);
//   };

//   const calculateTotalHoursForAssemblyProcess = (processName) => {
//     if (!processPartsMap[processName]) return 0;
//     return processPartsMap[processName]
//       .reduce(
//         (sum, part) =>
//           sum +
//           part.hours *
//             (partDetails.assemblyPartsLists
//               .find((list) =>
//                 list.partsListItems.some(
//                   (item) => item.partName === part.partName
//                 )
//               )
//               ?.partsListItems.find((item) => item.partName === part.partName)
//               ?.quantity || 0),
//         0
//       )
//       .toFixed(2);
//   };

//   const getHoursForSubAssemblyProcess = (partName, processName) => {
//     const processData = processPartsMap[processName]?.find(
//       (item) => item.partName === partName
//     );
//     const quantity =
//       partDetails.assemblyPartsLists
//         .find((list) =>
//           list.subAssemblyPartsLists.some((subList) =>
//             subList.partsListItems.some((item) => item.partName === partName)
//           )
//         )
//         ?.subAssemblyPartsLists.find((subList) =>
//           subList.partsListItems.some((item) => item.partName === partName)
//         )
//         ?.partsListItems.find((item) => item.partName === partName)?.quantity ||
//       0;
//     // console.log("quantity in getHoursForAssemblyProcess",quantity);

//     if (!processData || !processData.hours) {
//       return "-";
//     }

//     const hours = processData.hours * quantity;
//     console.log("hours in getHoursForAssemblyProcess", hours);

//     return hours.toFixed(2);
//   };

//   const calculateTotalHoursForSubAssemblyProcess = (
//     processName,
//     subAssemblyList
//   ) => {
//     if (!processPartsMap[processName]) return 0;
//     return processPartsMap[processName]
//       .reduce((sum, part) => {
//         console.log(
//           "aaaaaaaaaa",
//           processName,
//           part,
//           subAssemblyList.partsListItems.find(
//             (item) => item.partName === part.partName
//           )?.quantity
//         );
//         return (
//           sum +
//           part.hours *
//             (subAssemblyList.partsListItems.find(
//               (item) => item.partName === part.partName
//             )?.quantity || 0)
//         );
//       }, 0)
//       .toFixed(2);
//   };

//   const calculateMonthsRequiredForPartsList = (processName, partsList) => {
//     const totalHours = partsList.partsListItems.reduce(
//       (sum, item) =>
//         sum +
//         (processPartsMap[processName]?.find(
//           (part) => part.partName === item.partName
//         )?.hours || 0) *
//           item.quantity,
//       0
//     );
//     const availableMachineHoursPerMonth =
//       (machineHoursPerDay[`${processName}_${partsList._id}`] || 0) *
//       (numberOfMachines[`${processName}_${partsList._id}`] || 0) *
//       (daysToWork[`${processName}_${partsList._id}`] || 0);

//     if (availableMachineHoursPerMonth === 0) {
//       return "--";
//     }

//     const monthsRequired = totalHours / availableMachineHoursPerMonth;
//     return monthsRequired.toFixed(2);
//   };

//   const calculateMonthsRequiredForSubAssembly = (
//     processName,
//     subAssemblyList
//   ) => {
//     const totalHours = subAssemblyList.partsListItems.reduce(
//       (sum, item) =>
//         sum +
//         (processPartsMap[processName]?.find(
//           (part) => part.partName === item.partName
//         )?.hours || 0) *
//           item.quantity,
//       0
//     );
//     const availableMachineHoursPerMonth =
//       (machineHoursPerDay[`${processName}_${subAssemblyList._id}`] || 0) *
//       (numberOfMachines[`${processName}_${subAssemblyList._id}`] || 0) *
//       (daysToWork[`${processName}_${subAssemblyList._id}`] || 0);

//     if (availableMachineHoursPerMonth === 0) {
//       return "--";
//     }

//     const monthsRequired = totalHours / availableMachineHoursPerMonth;
//     return monthsRequired.toFixed(2);
//   };

//   const calculateTotalHoursForSubAssembly = (processName, subAssemblyList) => {
//     return subAssemblyList.partsListItems
//       .reduce(
//         (sum, item) =>
//           sum +
//           (processPartsMap[processName]?.find(
//             (part) => part.partName === item.partName
//           )?.hours || 0) *
//             item.quantity,
//         0
//       )
//       .toFixed(2);
//   };

//   const calculateTotalHoursForPartsList = (processName, partsList) => {
//     return partsList.partsListItems
//       .reduce(
//         (sum, item) =>
//           sum +
//           (processPartsMap[processName]?.find(
//             (part) => part.partName === item.partName
//           )?.hours || 0) *
//             item.quantity,
//         0
//       )
//       .toFixed(2);
//   };
//   const getHoursForPartListItems = (
//     column,
//     quantity,
//     manufacturingVariables
//   ) => {
//     const target = manufacturingVariables.find(
//       (a) => a.name.toLowerCase() === column.toLowerCase()
//     );
//     if (target) {
//       return target.hours;
//     } else {
//       return "-";
//     }
//   };

//   const calculateTotalHoursForSubAssemblyFirst = (
//     processName,
//     subAssemblyListFirst
//   ) => {
//     return subAssemblyListFirst.partsListItems
//       .reduce(
//         (sum, item) =>
//           sum +
//           (processPartsMap[processName]?.find(
//             (part) => part.partName === item.partName
//           )?.hours || 0) *
//             item.quantity,
//         0
//       )
//       .toFixed(2);
//   };

//   const calculateMonthsRequiredForSubAssemblyFirst = (
//     processName,
//     subAssemblyListFirst
//   ) => {
//     const totalHours = calculateTotalHoursForSubAssemblyFirst(
//       processName,
//       subAssemblyListFirst
//     );
//     const availableMachineHoursPerMonth =
//       (machineHoursPerDay[`${processName}_${subAssemblyListFirst._id}`] || 0) *
//       (numberOfMachines[`${processName}_${subAssemblyListFirst._id}`] || 0) *
//       (daysToWork[`${processName}_${subAssemblyListFirst._id}`] || 0);

//     if (availableMachineHoursPerMonth === 0) {
//       return "--";
//     }

//     const monthsRequired = totalHours / availableMachineHoursPerMonth;
//     return monthsRequired.toFixed(2);
//   };

//   const columnNames = [
//     "VMC Imported",
//     "VMC Local",
//     "Milling Manual",
//     "Grinding Final",
//     "CNC Lathe",
//     "Drill/Tap",
//     "Wire Cut Local",
//     "Wire Cut Rough",
//     "Wire Cut Imported",
//     "EDM",
//     "Black Oxide",
//     "Laser Marking",
//     "Lapping/Polishing",
//     "Grinding Blank/Rough",
//     "Gauges & Fixtures",
//   ];

//   if (loading)
//     return (
//       <div className="loader-overlay">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   return (
//     <div className="table-container">
//       <Row
//         lg={12}
//         style={{
//           width: "93rem",
//           margin: "0 auto", // Centers the row horizontally
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//         }}
//       >
//         <Col>
//           <CardBody>
//             <div className="table-wrapper">
//               {partDetails.partsLists.map((partsList) => (
//                 <React.Fragment key={partsList._id}>
//                   <Card
//                     className="mb-4"
//                     style={{
//                       boxSizing: "border-box",
//                       borderTop: "20px solid rgb(69, 203, 133)",
//                       borderRadius: "5px",
//                       padding: "10px",
//                     }}
//                   >
//                     <CardBody>
//                       <ul
//                         style={{
//                           listStyleType: "none",
//                           padding: 0,
//                           fontWeight: "600",
//                         }}
//                       >
//                         <li style={{ fontSize: "23px", marginBottom: "5px" }}>
//                           {partsList.partsListName}
//                         </li>

//                         <li style={{ fontSize: "19px" }}>
//                           <span class="badge bg-success-subtle text-success">
//                             Parts
//                           </span>
//                         </li>
//                       </ul>
//                       <div className="table-wrapper">
//                         <div className="table-responsive">
//                           <table className="table table-hover align-middle">
//                             <thead className="table-header">
//                               <tr>
//                                 <th
//                                   className="part-name-header"
//                                   style={{ backgroundColor: "#F5F5F5" }}
//                                 >
//                                   Part Name
//                                 </th>
//                                 {columnNames.map((item) => (
//                                   <th key={item} className="child_parts">
//                                     {item}
//                                   </th>
//                                 ))}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {!loading &&
//                               !error &&
//                               partsList.partsListItems?.length > 0 ? (
//                                 partsList.partsListItems.map((item) => (
//                                   <React.Fragment key={item.Uid}>
//                                     <tr className="table-row-main">
//                                       <td
//                                         style={{
//                                           backgroundColor: "#EFEBE9",
//                                           color: "black",
//                                         }}
//                                         className="part-name"
//                                       >
//                                         {`${item.partName || "N/A"}  (${
//                                           item.Uid
//                                         })`}
//                                       </td>
//                                       {columnNames.map((column) => (
//                                         <td key={column}>
//                                           {getHoursForPartListItems(
//                                             column,
//                                             item.quantity,
//                                             item.manufacturingVariables
//                                           )}
//                                         </td>
//                                       ))}
//                                     </tr>
//                                   </React.Fragment>
//                                 ))
//                               ) : (
//                                 <tr>
//                                   <td colSpan="16" className="text-center">
//                                     {loading
//                                       ? "Loading..."
//                                       : error
//                                       ? error
//                                       : "No parts available"}
//                                   </td>
//                                 </tr>
//                               )}
//                             </tbody>
//                             <br />
//                             <br />
//                             {/* <tbody>
//                               <tr className="table-row-main">
//                                 <td
//                                   className="part-name-header"
//                                   style={{
//                                     backgroundColor: "#C8E6C9",
//                                     color: "black",
//                                   }}
//                                 >
//                                   Required Machinewise Total Hours
//                                 </td>
//                                 {[
//                                   "VMC Imported",
//                                   "VMC Local",
//                                   "Milling Manual",
//                                   "Grinding Final",
//                                   "CNC Lathe",
//                                   "Drill/Tap",
//                                   "Wire Cut Local",
//                                   "Wire Cut Rough",
//                                   "Wire Cut Imported",
//                                   "EDM",
//                                   "Black Oxide",
//                                   "Laser Marking",
//                                   "Lapping/Polishing",
//                                   "Grinding Blank/Rough",
//                                   "Gauges & Fixtures",
//                                 ].map((processName) => (
//                                   <td key={processName}>
//                                     {calculateTotalHoursForPartsList(
//                                       processName,
//                                       partsList
//                                     )}
//                                   </td>
//                                 ))}
//                               </tr>
//                               <tr className="table-row-main">
//                                 <td
//                                   className="part-name-header"
//                                   style={{
//                                     backgroundColor: "#EFEBE9",
//                                     color: "black",
//                                   }}
//                                 >
//                                   Available machine hours per day
//                                 </td>
//                                 {[
//                                   "VMC Imported",
//                                   "VMC Local",
//                                   "Milling Manual",
//                                   "Grinding Final",
//                                   "CNC Lathe",
//                                   "Drill/Tap",
//                                   "Wire Cut Local",
//                                   "Wire Cut Rough",
//                                   "Wire Cut Imported",
//                                   "EDM",
//                                   "Black Oxide",
//                                   "Laser Marking",
//                                   "Lapping/Polishing",
//                                   "Grinding Blank/Rough",
//                                   "Gauges & Fixtures",
//                                 ].map((processName) => (
//                                   <td key={processName}>
//                                     <input
//                                       className="input-field"
//                                       type="number"
//                                       value={
//                                         machineHoursPerDay[
//                                           `${processName}_${partsList._id}`
//                                         ] || 0
//                                       }
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           e,
//                                           "machineHoursPerDay",
//                                           `${processName}_${partsList._id}`
//                                         )
//                                       }
//                                     />
//                                   </td>
//                                 ))}
//                               </tr>
//                               <tr className="table-row-main">
//                                 <td
//                                   className="part-name-header"
//                                   style={{
//                                     backgroundColor: "#EFEBE9",
//                                     color: "black",
//                                   }}
//                                 >
//                                   Number of Machines TBU
//                                 </td>
//                                 {[
//                                   "VMC Imported",
//                                   "VMC Local",
//                                   "Milling Manual",
//                                   "Grinding Final",
//                                   "CNC Lathe",
//                                   "Drill/Tap",
//                                   "Wire Cut Local",
//                                   "Wire Cut Rough",
//                                   "Wire Cut Imported",
//                                   "EDM",
//                                   "Black Oxide",
//                                   "Laser Marking",
//                                   "Lapping/Polishing",
//                                   "Grinding Blank/Rough",
//                                   "Gauges & Fixtures",
//                                 ].map((processName) => (
//                                   <td key={processName}>
//                                     <input
//                                       className="input-field"
//                                       type="number"
//                                       value={
//                                         numberOfMachines[
//                                           `${processName}_${partsList._id}`
//                                         ] || 0
//                                       }
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           e,
//                                           "numberOfMachines",
//                                           `${processName}_${partsList._id}`
//                                         )
//                                       }
//                                     />
//                                   </td>
//                                 ))}
//                               </tr>
//                               <tr className="table-row-main">
//                                 <td
//                                   className="part-name-header"
//                                   style={{
//                                     backgroundColor: "#EFEBE9",
//                                     color: "black",
//                                   }}
//                                 >
//                                   Number of Days to be worked
//                                 </td>
//                                 {[
//                                   "VMC Imported",
//                                   "VMC Local",
//                                   "Milling Manual",
//                                   "Grinding Final",
//                                   "CNC Lathe",
//                                   "Drill/Tap",
//                                   "Wire Cut Local",
//                                   "Wire Cut Rough",
//                                   "Wire Cut Imported",
//                                   "EDM",
//                                   "Black Oxide",
//                                   "Laser Marking",
//                                   "Lapping/Polishing",
//                                   "Grinding Blank/Rough",
//                                   "Gauges & Fixtures",
//                                 ].map((processName) => (
//                                   <td key={processName}>
//                                     <input
//                                       className="input-field"
//                                       type="number"
//                                       value={
//                                         daysToWork[
//                                           `${processName}_${partsList._id}`
//                                         ] || 0
//                                       }
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           e,
//                                           "daysToWork",
//                                           `${processName}_${partsList._id}`
//                                         )
//                                       }
//                                     />
//                                   </td>
//                                 ))}
//                               </tr>
//                               <tr className="table-row-main">
//                                 <td
//                                   className="part-name-header"
//                                   style={{
//                                     backgroundColor: "#EFEBE9",
//                                     color: "black",
//                                   }}
//                                 >
//                                   Available machine hours per month
//                                 </td>
//                                 {[
//                                   "VMC Imported",
//                                   "VMC Local",
//                                   "Milling Manual",
//                                   "Grinding Final",
//                                   "CNC Lathe",
//                                   "Drill/Tap",
//                                   "Wire Cut Local",
//                                   "Wire Cut Rough",
//                                   "Wire Cut Imported",
//                                   "EDM",
//                                   "Black Oxide",
//                                   "Laser Marking",
//                                   "Lapping/Polishing",
//                                   "Grinding Blank/Rough",
//                                   "Gauges & Fixtures",
//                                 ].map((processName) => (
//                                   <td key={processName}>
//                                     {(
//                                       (machineHoursPerDay[
//                                         `${processName}_${partsList._id}`
//                                       ] || 0) *
//                                       (numberOfMachines[
//                                         `${processName}_${partsList._id}`
//                                       ] || 0) *
//                                       (daysToWork[
//                                         `${processName}_${partsList._id}`
//                                       ] || 0)
//                                     ).toFixed(2)}
//                                   </td>
//                                 ))}
//                               </tr>
//                               <tr className="table-row-main">
//                                 <td
//                                   className="part-name-header"
//                                   style={{
//                                     backgroundColor: "#C8E6C9",
//                                     color: "black",
//                                   }}
//                                 >
//                                   Months Required to complete
//                                 </td>
//                                 {[
//                                   "VMC Imported",
//                                   "VMC Local",
//                                   "Milling Manual",
//                                   "Grinding Final",
//                                   "CNC Lathe",
//                                   "Drill/Tap",
//                                   "Wire Cut Local",
//                                   "Wire Cut Rough",
//                                   "Wire Cut Imported",
//                                   "EDM",
//                                   "Black Oxide",
//                                   "Laser Marking",
//                                   "Lapping/Polishing",
//                                   "Grinding Blank/Rough",
//                                   "Gauges & Fixtures",
//                                 ].map((processName) => (
//                                   <td key={processName}>
//                                     {calculateMonthsRequiredForPartsList(
//                                       processName,
//                                       partsList
//                                     )}
//                                   </td>
//                                 ))}
//                               </tr>
//                             </tbody> */}
//                           </table>
//                         </div>
//                       </div>
//                     </CardBody>
//                   </Card>
//                 </React.Fragment>
//               ))}

//               {/* for sub assmbly outer  */}
//               {partDetails.subAssemblyListFirst?.map((subAssemblyListFirst) => (
//                 <React.Fragment key={subAssemblyListFirst._id}>
//                   <Card
//                     className="mb-4"
//                     style={{
//                       boxSizing: "border-box",
//                       borderTop: "20px solid rgb(240, 101, 72)",
//                       borderRadius: "5px",
//                       padding: "10px",
//                     }}
//                   >
//                     <CardBody>
//                       {/* <h4>{subAssemblyListFirst.subAssemblyListName}</h4> */}
//                       <ul
//                         style={{
//                           listStyleType: "none",
//                           padding: 0,
//                           fontWeight: "600",
//                         }}
//                       >
//                         <li style={{ fontSize: "23px", marginBottom: "5px" }}>
//                           {subAssemblyListFirst.subAssemblyListName}
//                         </li>

//                         <li style={{ fontSize: "19px" }}>
//                           <span class="badge bg-danger-subtle text-danger">
//                             Sub Assembly
//                           </span>
//                         </li>
//                       </ul>
//                       <div className="parts-lists">
//                         <div className="table-wrapper">
//                           <div className="table-responsive">
//                             <table className="table table-hover align-middle">
//                               <thead className="table-header">
//                                 <tr>
//                                   <th
//                                     className="part-name-header"
//                                     style={{ backgroundColor: "#F5F5F5" }}
//                                   >
//                                     Sub-Assembly Part Name
//                                   </th>
//                                   {columnNames.map((item) => (
//                                     <th key={item} className="child_parts">
//                                       {item}
//                                     </th>
//                                   ))}
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {!loading &&
//                                 !error &&
//                                 subAssemblyListFirst.partsListItems?.length >
//                                   0 ? (
//                                   subAssemblyListFirst.partsListItems.map(
//                                     (item) => (
//                                       <React.Fragment key={item.Uid}>
//                                         <tr className="table-row-main">
//                                           <td
//                                             style={{
//                                               backgroundColor: "#EFEBE9",
//                                               color: "black",
//                                             }}
//                                             className="part-name"
//                                           >
//                                             {`${item.partName || "N/A"}  (${
//                                               item.Uid
//                                             })`}
//                                           </td>
//                                           {columnNames.map((column) => (
//                                             <td key={column}>
//                                               {getHoursForPartListItems(
//                                                 column,
//                                                 item.quantity,
//                                                 item.manufacturingVariables
//                                               )}
//                                             </td>
//                                           ))}
//                                         </tr>
//                                       </React.Fragment>
//                                     )
//                                   )
//                                 ) : (
//                                   <tr>
//                                     <td colSpan="16" className="text-center">
//                                       {loading
//                                         ? "Loading..."
//                                         : error
//                                         ? error
//                                         : "No sub-assembly parts available"}
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
//                               <br />
//                               <br />
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                     </CardBody>
//                   </Card>
//                 </React.Fragment>
//               ))}

//               {!loading && !error && partDetails.assemblyPartsLists?.length > 0
//                 ? partDetails.assemblyPartsLists.map((assemblyList) => (
//                     <React.Fragment key={assemblyList._id}>
//                       <Card
//                         className="mb-4"
//                         style={{
//                           boxSizing: "border-box",
//                           borderTop: "20px solid rgb(75, 56, 179)",
//                           borderRadius: "5px",
//                           padding: "10px",
//                         }}
//                       >
//                         <CardBody>
//                           {/* <h4>{assemblyList.assemblyListName}</h4> */}
//                           <ul
//                             style={{
//                               listStyleType: "none",
//                               padding: 0,
//                               fontWeight: "600",
//                             }}
//                           >
//                             <li
//                               style={{ fontSize: "25px", marginBottom: "10px" }}
//                             >
//                               {assemblyList.assemblyListName}
//                             </li>

//                             <li style={{ fontSize: "19px" }}>
//                               <span class="badge bg-primary-subtle text-primary">
//                                 Assembly
//                               </span>
//                             </li>
//                           </ul>
//                           <div className="table-wrapper">
//                             <div className="table-responsive">
//                               <table className="project-table">
//                                 <tbody>
//                                   {!loading &&
//                                   !error &&
//                                   assemblyList.partsListItems?.length > 0 ? (
//                                     assemblyList.partsListItems.map((item) => (
//                                       <React.Fragment key={item.Uid}>
//                                         <tr className="table-row-main">
//                                           <td
//                                             style={{
//                                               backgroundColor: "#EFEBE9",
//                                               color: "black",
//                                             }}
//                                             className="part-name"
//                                           >
//                                             {`${item.partName || "N/A"}  (${
//                                               item.Uid
//                                             })`}
//                                           </td>
//                                           {columnNames.map((column) => (
//                                             <td key={column}>
//                                               {getHoursForPartListItems(
//                                                 column,
//                                                 item.quantity,
//                                                 item.manufacturingVariables
//                                               )}
//                                             </td>
//                                           ))}
//                                         </tr>
//                                       </React.Fragment>
//                                     ))
//                                   ) : (
//                                     <tr></tr>
//                                   )}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                           {assemblyList.subAssemblyPartsLists.map(
//                             (subAssemblyList) => (
//                               <React.Fragment key={subAssemblyList._id}>
//                                 <br />
//                                 <br />
//                                 <h4>{subAssemblyList.subAssemblyListName}</h4>
//                                 <div className="parts-lists">
//                                   <div className="table-wrapper">
//                                     <div className="table-responsive">
//                                       <table className="table table-hover align-middle">
//                                         <thead className="table-header">
//                                           <tr>
//                                             <th
//                                               className="part-name-header"
//                                               style={{
//                                                 backgroundColor: "#F5F5F5",
//                                               }}
//                                             >
//                                               Sub-Assembly Part Name
//                                             </th>
//                                             {columnNames.map((item) => (
//                                               <th
//                                                 key={item}
//                                                 className="child_parts"
//                                               >
//                                                 {item}
//                                               </th>
//                                             ))}
//                                           </tr>
//                                         </thead>
//                                         <tbody>
//                                           {!loading &&
//                                           !error &&
//                                           subAssemblyList.partsListItems
//                                             ?.length > 0 ? (
//                                             subAssemblyList.partsListItems.map(
//                                               (item) => (
//                                                 <React.Fragment key={item.Uid}>
//                                                   <tr className="table-row-main">
//                                                     <td
//                                                       style={{
//                                                         backgroundColor:
//                                                           "#EFEBE9",
//                                                         color: "black",
//                                                       }}
//                                                       className="part-name"
//                                                     >
//                                                       {`${
//                                                         item.partName || "N/A"
//                                                       }  (${item.Uid})`}
//                                                     </td>
//                                                     {columnNames.map(
//                                                       (column) => (
//                                                         <td key={column}>
//                                                           {getHoursForPartListItems(
//                                                             column,
//                                                             item.quantity,
//                                                             item.manufacturingVariables
//                                                           )}
//                                                         </td>
//                                                       )
//                                                     )}
//                                                   </tr>
//                                                 </React.Fragment>
//                                               )
//                                             )
//                                           ) : (
//                                             <tr>
//                                               <td
//                                                 colSpan="16"
//                                                 className="text-center"
//                                               >
//                                                 {loading
//                                                   ? "Loading..."
//                                                   : error
//                                                   ? error
//                                                   : "No sub-assembly parts available"}
//                                               </td>
//                                             </tr>
//                                           )}
//                                         </tbody>
//                                       </table>
//                                     </div>
//                                   </div>
//                                   <br />
//                                   <br />
//                                   <div className="table-wrapper">
//                                     <div className="table-responsive">
//                                       <table className="table table-hover align-middle">
//                                         <thead className="table-header">
//                                           <tr>
//                                             <th
//                                               className="part-name-header"
//                                               style={{
//                                                 backgroundColor: "#F5F5F5",
//                                               }}
//                                             >
//                                               Total Hours
//                                             </th>
//                                             {columnNames.map((item) => (
//                                               <th
//                                                 key={item}
//                                                 className="child_parts"
//                                               >
//                                                 {item}
//                                               </th>
//                                             ))}
//                                           </tr>
//                                         </thead>
                                    
//                                       </table>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </React.Fragment>
//                             )
//                           )}

//                           <div>
//                             {assemblyList.assemblyMultyPartsList.map(
//                               (subAssemblyList) => (
//                                 <React.Fragment key={subAssemblyList._id}>
//                                   <br />
//                                   <br />
//                                   <h4>
//                                     {subAssemblyList.assemblyMultyPartsListName}
//                                   </h4>
//                                   <div className="parts-lists">
//                                     <div className="table-wrapper">
//                                       <div className="table-responsive">
//                                         <table className="table table-hover align-middle">
//                                           <thead className="table-header">
//                                             <tr>
//                                               <th
//                                                 className="part-name-header"
//                                                 style={{
//                                                   backgroundColor: "#F5F5F5",
//                                                 }}
//                                               >
//                                                 Sub-Assembly Part Name
//                                               </th>
//                                               {columnNames.map((item) => (
//                                                 <th
//                                                   key={item}
//                                                   className="child_parts"
//                                                 >
//                                                   {item}
//                                                 </th>
//                                               ))}
//                                             </tr>
//                                           </thead>
//                                           <tbody>
//                                             {!loading &&
//                                             !error &&
//                                             subAssemblyList.partsListItems
//                                               ?.length > 0 ? (
//                                               subAssemblyList.partsListItems.map(
//                                                 (item) => (
//                                                   <React.Fragment
//                                                     key={item.Uid}
//                                                   >
//                                                     <tr className="table-row-main">
//                                                       <td
//                                                         style={{
//                                                           backgroundColor:
//                                                             "#EFEBE9",
//                                                           color: "black",
//                                                         }}
//                                                         className="part-name"
//                                                       >
//                                                         {`${
//                                                           item.partName || "N/A"
//                                                         }  (${item.Uid})`}
//                                                       </td>
//                                                       {columnNames.map(
//                                                         (column) => (
//                                                           <td key={column}>
//                                                             {getHoursForPartListItems(
//                                                               column,
//                                                               item.quantity,
//                                                               item.manufacturingVariables
//                                                             )}
//                                                           </td>
//                                                         )
//                                                       )}
//                                                     </tr>
//                                                   </React.Fragment>
//                                                 )
//                                               )
//                                             ) : (
//                                               <tr>
//                                                 <td
//                                                   colSpan="16"
//                                                   className="text-center"
//                                                 >
//                                                   {loading
//                                                     ? "Loading..."
//                                                     : error
//                                                     ? error
//                                                     : "No sub-assembly parts available"}
//                                                 </td>
//                                               </tr>
//                                             )}
//                                           </tbody>
//                                         </table>
//                                       </div>
//                                     </div>
//                                     <br />
//                                     <br />
//                                     <div className="table-wrapper">
//                                       <div className="table-responsive">
//                                         <table className="table table-hover align-middle">
//                                           <thead className="table-header">
//                                             <tr>
//                                               <th
//                                                 className="part-name-header"
//                                                 style={{
//                                                   backgroundColor: "#F5F5F5",
//                                                 }}
//                                               >
//                                                 Total Hours
//                                               </th>
//                                               {columnNames.map((item) => (
//                                                 <th
//                                                   key={item}
//                                                   className="child_parts"
//                                                 >
//                                                   {item}
//                                                 </th>
//                                               ))}
//                                             </tr>
//                                           </thead>
//                                         </table>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </React.Fragment>
//                               )
//                             )}
//                           </div>
//                         </CardBody>
//                       </Card>
//                     </React.Fragment>
//                   ))
//                 : null}
//               <br />
//               <br />
//             </div>
//           </CardBody>
//         </Col>
//       </Row>
//     </div>
//   );
// };
// export default HoursSummary;

// // export default HoursSummary;







import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row, Card } from "reactstrap";
import "./project.css";
import { CiSignpostL1 } from "react-icons/ci";

const HoursSummary = () => {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState({
    allProjects: [],
    assemblyPartsLists: [],
    partsLists: [],
    subAssemblyListFirst: [],
  });
  const [parts, setParts] = useState([]);
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [machineHoursPerDay, setMachineHoursPerDay] = useState({});
  const [numberOfMachines, setNumberOfMachines] = useState({});
  const [daysToWork, setDaysToWork] = useState({});

  // console.log("partDetails", partDetails);

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        // `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/parts`
        );
        const data = await response.json();
        setParts(data);
      } catch (err) {
        console.error("Error fetching parts:", err);
      }
    };

    const fetchManufacturingVariables = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
        );
        const data = await response.json();
        setManufacturingVariables(data);
      } catch (err) {
        console.error("Error fetching manufacturing variables:", err);
      }
    };

    fetchParts();
    fetchManufacturingVariables();
  }, []);

  // console.log(manufacturingVariables)

  const processPartsMap = parts.reduce((acc, part) => {
    let isMatchingPart = false;

    for (const item of partDetails.allProjects || []) {
      if (item.partName === part.partName) {
        isMatchingPart = true;
        break;
      }
    }

    if (!isMatchingPart) {
      for (const partsList of partDetails.partsLists || []) {
        for (const item of partsList.partsListItems || []) {
          if (item.partName === part.partName) {
            isMatchingPart = true;
            break;
          }
        }
        if (isMatchingPart) break;
      }
    }

    if (!isMatchingPart) {
      for (const assemblyList of partDetails.assemblyPartsLists || []) {
        for (const item of assemblyList.partsListItems || []) {
          if (item.partName === part.partName) {
            isMatchingPart = true;
            break;
          }
        }
        if (isMatchingPart) break;

        for (const subList of assemblyList.subAssemblyPartsLists || []) {
          for (const item of subList.partsListItems || []) {
            if (item.partName === part.partName) {
              isMatchingPart = true;
              break;
            }
          }
          if (isMatchingPart) break;
        }
        if (isMatchingPart) break;
      }
    }

    if (isMatchingPart) {
      part.manufacturingVariables.forEach((variable) => {
        if (!acc[variable.name]) acc[variable.name] = [];
        acc[variable.name].push({
          partName: part.partName,
          hours: variable.hours,
        });
      });
    }

    if (!isMatchingPart) {
      for (const subAssemblyListFirst of partDetails.subAssemblyListFirst ||
        []) {
        for (const item of subAssemblyListFirst.partsListItems || []) {
          if (item.partName === part.partName) {
            isMatchingPart = true;
            break;
          }
        }
        if (isMatchingPart) break;
      }
    }

    if (isMatchingPart) {
      part.manufacturingVariables.forEach((variable) => {
        if (!acc[variable.name]) acc[variable.name] = [];
        acc[variable.name].push({
          partName: part.partName,
          hours: variable.hours,
        });
      });
    }

    return acc;
  }, {});
  // console.log("processPartsMap", processPartsMap);
  // console.log("subAssemblyListFirst:", partDetails.subAssemblyListFirst);

  const getHoursForProcess = (partName, processName) => {
    const processData = processPartsMap[processName]?.find(
      (item) => item.partName === partName
    );
    const quantity =
      partDetails.allProjects.find((item) => item.partName === partName)
        ?.quantity || 0;

    if (!processData || !processData.hours) {
      return "-";
    }

    const hours = processData.hours * quantity;

    return hours.toFixed(2);
  };

  const calculateTotalHoursForProcess = (processName) => {
    if (!processPartsMap[processName]) return 0;
    return processPartsMap[processName]
      .reduce(
        (sum, part) =>
          sum +
          part.hours *
            (partDetails.allProjects.find(
              (item) => item.partName === part.partName
            )?.quantity || 0),
        0
      )
      .toFixed(2);
  };

  const handleInputChange = (event, type, processName) => {
    switch (type) {
      case "machineHoursPerDay":
        setMachineHoursPerDay((prev) => ({
          ...prev,
          [processName]: event.target.value ? Number(event.target.value) : 0,
        }));
        break;
      case "numberOfMachines":
        setNumberOfMachines((prev) => ({
          ...prev,
          [processName]: event.target.value ? Number(event.target.value) : 0,
        }));
        break;
      case "daysToWork":
        setDaysToWork((prev) => ({
          ...prev,
          [processName]: event.target.value ? Number(event.target.value) : 25,
        }));
        break;
      default:
        break;
    }
  };

  const calculateMonthsRequired = (processName) => {
    const totalHours = calculateTotalHoursForProcess(processName);
    const availableMachineHoursPerMonth =
      (machineHoursPerDay[processName] || 0) *
      (numberOfMachines[processName] || 0) *
      (daysToWork[processName] || 0);

    if (availableMachineHoursPerMonth === 0) {
      return "--";
    }

    const monthsRequired = totalHours / availableMachineHoursPerMonth;
    return monthsRequired.toFixed(2);
  };

  const getHoursForAssemblyProcess = (partName, processName) => {
    const processData = processPartsMap[processName]?.find(
      (item) => item.partName === partName
    );
    let quantity = 0;

    partDetails.assemblyPartsLists.forEach((list) => {
      list.partsListItems.forEach((item) => {
        if (item.partName === partName) {
          quantity += item.quantity || 0;
        }
      });
      list.subAssemblyPartsLists.forEach((subList) => {
        subList.partsListItems.forEach((item) => {
          if (item.partName === partName) {
            quantity += item.quantity || 0;
          }
        });
      });
    });

    if (!processData || !processData.hours) {
      return "-";
    }

    const hours = processData.hours * quantity;
    return hours.toFixed(2);
  };

  const calculateTotalHoursForAssemblyProcess = (processName) => {
    if (!processPartsMap[processName]) return 0;
    return processPartsMap[processName]
      .reduce(
        (sum, part) =>
          sum +
          part.hours *
            (partDetails.assemblyPartsLists
              .find((list) =>
                list.partsListItems.some(
                  (item) => item.partName === part.partName
                )
              )
              ?.partsListItems.find((item) => item.partName === part.partName)
              ?.quantity || 0),
        0
      )
      .toFixed(2);
  };

  const getHoursForSubAssemblyProcess = (partName, processName) => {
    const processData = processPartsMap[processName]?.find(
      (item) => item.partName === partName
    );
    const quantity =
      partDetails.assemblyPartsLists
        .find((list) =>
          list.subAssemblyPartsLists.some((subList) =>
            subList.partsListItems.some((item) => item.partName === partName)
          )
        )
        ?.subAssemblyPartsLists.find((subList) =>
          subList.partsListItems.some((item) => item.partName === partName)
        )
        ?.partsListItems.find((item) => item.partName === partName)?.quantity ||
      0;
    // console.log("quantity in getHoursForAssemblyProcess",quantity);

    if (!processData || !processData.hours) {
      return "-";
    }

    const hours = processData.hours * quantity;
    console.log("hours in getHoursForAssemblyProcess", hours);

    return hours.toFixed(2);
  };

  const calculateTotalHoursForSubAssemblyProcess = (
    processName,
    subAssemblyList
  ) => {
    if (!processPartsMap[processName]) return 0;
    return processPartsMap[processName]
      .reduce((sum, part) => {
        console.log(
          "aaaaaaaaaa",
          processName,
          part,
          subAssemblyList.partsListItems.find(
            (item) => item.partName === part.partName
          )?.quantity
        );
        return (
          sum +
          part.hours *
            (subAssemblyList.partsListItems.find(
              (item) => item.partName === part.partName
            )?.quantity || 0)
        );
      }, 0)
      .toFixed(2);
  };

  const calculateMonthsRequiredForPartsList = (partsList) => {
    const totalHours = calculateTotalHoursForPartsList(partsList);
    if (totalHours === 0) {
      return "--";
    }

    const availableMachineHoursPerMonth = manufacturingVariables.reduce(
      (sum, variable) =>
        sum +
        (machineHoursPerDay[`${variable.name}_${partsList._id}`] || 0) *
          (numberOfMachines[`${variable.name}_${partsList._id}`] || 0) *
          (daysToWork[`${variable.name}_${partsList._id}`] || 0),
      0
    );

    if (availableMachineHoursPerMonth === 0) {
      return "--";
    }

    const monthsRequired = totalHours / availableMachineHoursPerMonth;
    return monthsRequired.toFixed(2);
  };

  const calculateMonthsRequiredForSubAssembly = (
    processName,
    subAssemblyList
  ) => {
    const totalHours = subAssemblyList.partsListItems.reduce(
      (sum, item) =>
        sum +
        (processPartsMap[processName]?.find(
          (part) => part.partName === item.partName
        )?.hours || 0) *
          item.quantity,
      0
    );
    const availableMachineHoursPerMonth =
      (machineHoursPerDay[`${processName}_${subAssemblyList._id}`] || 0) *
      (numberOfMachines[`${processName}_${subAssemblyList._id}`] || 0) *
      (daysToWork[`${processName}_${subAssemblyList._id}`] || 0);

    if (availableMachineHoursPerMonth === 0) {
      return "--";
    }

    const monthsRequired = totalHours / availableMachineHoursPerMonth;
    return monthsRequired.toFixed(2);
  };

  const calculateTotalHoursForSubAssembly = (processName, subAssemblyList) => {
    return subAssemblyList.partsListItems
      .reduce(
        (sum, item) =>
          sum +
          (processPartsMap[processName]?.find(
            (part) => part.partName === item.partName
          )?.hours || 0) *
            item.quantity,
        0
      )
      .toFixed(2);
  };

  const calculateTotalHoursForPartsList = (partsList) => {
    if (!partsList || !partsList.partsListItems || !manufacturingVariables.length) {
      return 0;
    }
  
    return partsList.partsListItems.reduce(
      (sum, item) =>
        sum +
        (manufacturingVariables.find(
          (part) => part.name === item.manufacturingVariables[0]?.name
        )?.hours || 0) *
          (item.quantity || 0),
      0
    ).toFixed(2);
  };
  const getHoursForPartListItems = (
    column,
    quantity,
    manufacturingVariables
  ) => {
    const target = manufacturingVariables.find(
      (a) => a.name.toLowerCase() === column.toLowerCase()
    );
    if (target) {
      return quantity * target.hours;
    } else {
      return "-";
    }
  };

  const calculateTotalHoursForSubAssemblyFirst = (
    processName,
    subAssemblyListFirst
  ) => {
    return subAssemblyListFirst.partsListItems
      .reduce(
        (sum, item) =>
          sum +
          (processPartsMap[processName]?.find(
            (part) => part.partName === item.partName
          )?.hours || 0) *
            item.quantity,
        0
      )
      .toFixed(2);
  };

  const calculateMonthsRequiredForSubAssemblyFirst = (
    processName,
    subAssemblyListFirst
  ) => {
    const totalHours = calculateTotalHoursForSubAssemblyFirst(
      processName,
      subAssemblyListFirst
    );
    const availableMachineHoursPerMonth =
      (machineHoursPerDay[`${processName}_${subAssemblyListFirst._id}`] || 0) *
      (numberOfMachines[`${processName}_${subAssemblyListFirst._id}`] || 0) *
      (daysToWork[`${processName}_${subAssemblyListFirst._id}`] || 0);

    if (availableMachineHoursPerMonth === 0) {
      return "--";
    }

    const monthsRequired = totalHours / availableMachineHoursPerMonth;
    return monthsRequired.toFixed(2);
  };

  const columnNames = manufacturingVariables.map((variable) => variable.name);

  if (loading)
    return (
      <div className="loader-overlay">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  return (
    <div className="table-container">
      <Row
        lg={12}
        style={{
          width: "93rem",
          margin: "0 auto", // Centers the row horizontally
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Col>
          <CardBody>
            <div className="table-wrapper">
              {partDetails?.partsLists?.map((partsList) => (
                <React.Fragment key={partsList._id}>
                  <Card
                    className="mb-4"
                    style={{
                      boxSizing: "border-box",
                      borderTop: "20px solid rgb(69, 203, 133)",
                      borderRadius: "5px",
                      padding: "10px",
                    }}
                  >
                    <CardBody>
                      <ul
                        style={{
                          listStyleType: "none",
                          padding: 0,
                          fontWeight: "600",
                        }}
                      >
                        <li style={{ fontSize: "23px", marginBottom: "5px" }}>
                          {partsList.partsListName}
                        </li>

                        <li style={{ fontSize: "19px" }}>
                          <span class="badge bg-success-subtle text-success">
                            Parts
                          </span>
                        </li>
                      </ul>
                      <div className="table-wrapper">
                        <div className="table-responsive">
                          <table className="table table-hover align-middle">
                            <thead className="table-header">
                              <tr>
                                <th
                                  className="part-name-header"
                                  style={{ backgroundColor: "#F5F5F5" }}
                                >
                                  Part Name
                                </th>
                                {columnNames.map((item) => (
                                  <th key={item} className="child_parts">
                                    {item}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {!loading &&
                              !error &&
                              partsList.partsListItems?.length > 0 ? (
                                partsList.partsListItems.map((item) => (
                                  <React.Fragment key={item.Uid}>
                                    <tr className="table-row-main">
                                      <td
                                        style={{
                                          backgroundColor: "#EFEBE9",
                                          color: "black",
                                        }}
                                        className="part-name"
                                      >
                                        {`${item.partName || "N/A"}  (${
                                          item.Uid
                                        })`}
                                      </td>
                                      {columnNames.map((column) => (
                                        <td key={column}>
                                          {getHoursForPartListItems(
                                            column,
                                            item.quantity,
                                            item.manufacturingVariables
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  </React.Fragment>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="16" className="text-center">
                                    {loading
                                      ? "Loading..."
                                      : error
                                      ? error
                                      : "No parts available"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            <br />
                            <br />
                            <tbody>
                              <tr className="table-row-main">
                                <td
                                  className="part-name-header"
                                  style={{
                                    backgroundColor: "#C8E6C9",
                                    color: "black",
                                  }}
                                >
                                  Required Machinewise Total Hours
                                </td>
                                {columnNames.map((processName) => (
                                  <td key={processName}>
                                    {calculateTotalHoursForPartsList(partsList)}
                                  </td>
                                ))}
                              </tr>
                              <tr className="table-row-main">
                                <td
                                  className="part-name-header"
                                  style={{
                                    backgroundColor: "#EFEBE9",
                                    color: "black",
                                  }}
                                >
                                  Available machine hours per day
                                </td>
                                {columnNames.map((processName) => (
                                  <td key={processName}>
                                    <input
                                      className="input-field"
                                      type="number"
                                      value={
                                        machineHoursPerDay[
                                          `${processName}_${partsList._id}`
                                        ] || 0
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          e,
                                          "machineHoursPerDay",
                                          `${processName}_${partsList._id}`
                                        )
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                              <tr className="table-row-main">
                                <td
                                  className="part-name-header"
                                  style={{
                                    backgroundColor: "#EFEBE9",
                                    color: "black",
                                  }}
                                >
                                  Number of Machines TBU
                                </td>
                                {columnNames.map((processName) => (
                                  <td key={processName}>
                                    <input
                                      className="input-field"
                                      type="number"
                                      value={
                                        numberOfMachines[
                                          `${processName}_${partsList._id}`
                                        ] || 0
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          e,
                                          "numberOfMachines",
                                          `${processName}_${partsList._id}`
                                        )
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                              <tr className="table-row-main">
                                <td
                                  className="part-name-header"
                                  style={{
                                    backgroundColor: "#EFEBE9",
                                    color: "black",
                                  }}
                                >
                                  Number of Days to be worked
                                </td>
                                {columnNames.map((processName) => (
                                  <td key={processName}>
                                    <input
                                      className="input-field"
                                      type="number"
                                      value={
                                        daysToWork[
                                          `${processName}_${partsList._id}`
                                        ] || 0
                                      }
                                      onChange={(e) =>
                                        handleInputChange(
                                          e,
                                          "daysToWork",
                                          `${processName}_${partsList._id}`
                                        )
                                      }
                                    />
                                  </td>
                                ))}
                              </tr>
                              <tr className="table-row-main">
                                <td
                                  className="part-name-header"
                                  style={{
                                    backgroundColor: "#EFEBE9",
                                    color: "black",
                                  }}
                                >
                                  Available machine hours per month
                                </td>
                                {columnNames.map((processName) => (
                                  <td key={processName}>
                                    {(
                                      (machineHoursPerDay[
                                        `${processName}_${partsList._id}`
                                      ] || 0) *
                                      (numberOfMachines[
                                        `${processName}_${partsList._id}`
                                      ] || 0) *
                                      (daysToWork[
                                        `${processName}_${partsList._id}`
                                      ] || 0)
                                    ).toFixed(2)}
                                  </td>
                                ))}
                              </tr>
                              <tr className="table-row-main">
                                <td
                                  className="part-name-header"
                                  style={{
                                    backgroundColor: "#C8E6C9",
                                    color: "black",
                                  }}
                                >
                                  Months Required to complete
                                </td>
                                {columnNames.map((processName) => (
                                  <td key={processName}>
                                    {calculateMonthsRequiredForPartsList(
                                      processName,
                                      partsList
                                    )}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </React.Fragment>
              ))}

              {/* for sub assmbly outer  */}
              {partDetails.subAssemblyListFirst?.map((subAssemblyListFirst) => (
                <React.Fragment key={subAssemblyListFirst._id}>
                  <Card
                    className="mb-4"
                    style={{
                      boxSizing: "border-box",
                      borderTop: "20px solid rgb(240, 101, 72)",
                      borderRadius: "5px",
                      padding: "10px",
                    }}
                  >
                    <CardBody>
                      {/* <h4>{subAssemblyListFirst.subAssemblyListName}</h4> */}
                      <ul
                        style={{
                          listStyleType: "none",
                          padding: 0,
                          fontWeight: "600",
                        }}
                      >
                        <li style={{ fontSize: "23px", marginBottom: "5px" }}>
                          {subAssemblyListFirst.subAssemblyListName}
                        </li>

                        <li style={{ fontSize: "19px" }}>
                          <span class="badge bg-danger-subtle text-danger">
                            Sub Assembly
                          </span>
                        </li>
                      </ul>
                      <div className="parts-lists">
                        <div className="table-wrapper">
                          <div className="table-responsive">
                            <table className="table table-hover align-middle">
                              <thead className="table-header">
                                <tr>
                                  <th
                                    className="part-name-header"
                                    style={{ backgroundColor: "#F5F5F5" }}
                                  >
                                    Sub-Assembly Part Name
                                  </th>
                                  {columnNames.map((item) => (
                                    <th key={item} className="child_parts">
                                      {item}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {!loading &&
                                !error &&
                                subAssemblyListFirst.partsListItems?.length >
                                  0 ? (
                                  subAssemblyListFirst.partsListItems.map(
                                    (item) => (
                                      <React.Fragment key={item.Uid}>
                                        <tr className="table-row-main">
                                          <td
                                            style={{
                                              backgroundColor: "#EFEBE9",
                                              color: "black",
                                            }}
                                            className="part-name"
                                          >
                                            {`${item.partName || "N/A"}  (${
                                              item.Uid
                                            })`}
                                          </td>
                                          {columnNames.map((column) => (
                                            <td key={column}>
                                              {getHoursForPartListItems(
                                                column,
                                                item.quantity,
                                                item.manufacturingVariables
                                              )}
                                            </td>
                                          ))}
                                        </tr>
                                      </React.Fragment>
                                    )
                                  )
                                ) : (
                                  <tr>
                                    <td colSpan="16" className="text-center">
                                      {loading
                                        ? "Loading..."
                                        : error
                                        ? error
                                        : "No sub-assembly parts available"}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                              <br />
                              <br />
                              <tbody>
                                <tr className="table-row-main">
                                  <td
                                    className="part-name-header"
                                    style={{
                                      backgroundColor: "#C8E6C9",
                                      color: "black",
                                    }}
                                  >
                                    Required Machinewise Total Hours
                                  </td>
                                  {/* {columnNames.map((processName) => (
                  <td key={processName}>
                    {calculateTotalHoursForSubAssemblyFirst(processName, subAssemblyListFirst)}
                  </td>
                ))} */}
                                  {columnNames.map((processName) => (
                                    <td key={processName}>
                                      {calculateTotalHoursForSubAssemblyFirst(
                                        processName,
                                        subAssemblyListFirst
                                      )}
                                    </td>
                                  ))}
                                </tr>

                                <tr className="table-row-main">
                                  <td
                                    className="part-name-header"
                                    style={{
                                      backgroundColor: "#EFEBE9",
                                      color: "black",
                                    }}
                                  >
                                    Available machine hours per day
                                  </td>
                                  {columnNames.map((processName) => (
                                    <td key={processName}>
                                      <input
                                        className="input-field"
                                        type="number"
                                        value={
                                          machineHoursPerDay[
                                            `${processName}_${subAssemblyListFirst._id}`
                                          ] || 0
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            e,
                                            "machineHoursPerDay",
                                            `${processName}_${subAssemblyListFirst._id}`
                                          )
                                        }
                                      />
                                    </td>
                                  ))}
                                </tr>

                                <tr className="table-row-main">
                                  <td
                                    className="part-name-header"
                                    style={{
                                      backgroundColor: "#EFEBE9",
                                      color: "black",
                                    }}
                                  >
                                    Number of Machines TBU
                                  </td>
                                  {columnNames.map((processName) => (
                                    <td key={processName}>
                                      <input
                                        className="input-field"
                                        type="number"
                                        value={
                                          numberOfMachines[
                                            `${processName}_${subAssemblyListFirst._id}`
                                          ] || 0
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            e,
                                            "numberOfMachines",
                                            `${processName}_${subAssemblyListFirst._id}`
                                          )
                                        }
                                      />
                                    </td>
                                  ))}
                                </tr>

                                <tr className="table-row-main">
                                  <td
                                    className="part-name-header"
                                    style={{
                                      backgroundColor: "#EFEBE9",
                                      color: "black",
                                    }}
                                  >
                                    Number of Days to be worked
                                  </td>
                                  {columnNames.map((processName) => (
                                    <td key={processName}>
                                      <input
                                        className="input-field"
                                        type="number"
                                        value={
                                          daysToWork[
                                            `${processName}_${subAssemblyListFirst._id}`
                                          ] || 0
                                        }
                                        onChange={(e) =>
                                          handleInputChange(
                                            e,
                                            "daysToWork",
                                            `${processName}_${subAssemblyListFirst._id}`
                                          )
                                        }
                                      />
                                    </td>
                                  ))}
                                </tr>

                                <tr className="table-row-main">
                                  <td
                                    className="part-name-header"
                                    style={{
                                      backgroundColor: "#EFEBE9",
                                      color: "black",
                                    }}
                                  >
                                    Available machine hours per month
                                  </td>
                                  {columnNames.map((processName) => (
                                    <td key={processName}>
                                      {(
                                        (machineHoursPerDay[
                                          `${processName}_${subAssemblyListFirst._id}`
                                        ] || 0) *
                                        (numberOfMachines[
                                          `${processName}_${subAssemblyListFirst._id}`
                                        ] || 0) *
                                        (daysToWork[
                                          `${processName}_${subAssemblyListFirst._id}`
                                        ] || 0)
                                      ).toFixed(2)}
                                    </td>
                                  ))}
                                </tr>

                                <tr className="table-row-main">
                                  <td
                                    className="part-name-header"
                                    style={{
                                      backgroundColor: "#C8E6C9",
                                      color: "black",
                                    }}
                                  >
                                    Months Required to complete
                                  </td>
                                  {columnNames.map((processName) => (
                                    <td key={processName}>
                                      {calculateMonthsRequiredForSubAssemblyFirst(
                                        processName,
                                        subAssemblyListFirst
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </React.Fragment>
              ))}

              {!loading && !error && partDetails.assemblyPartsLists?.length > 0
                ? partDetails.assemblyPartsLists.map((assemblyList) => (
                    <React.Fragment key={assemblyList._id}>
                      <Card
                        className="mb-4"
                        style={{
                          boxSizing: "border-box",
                          borderTop: "20px solid rgb(75, 56, 179)",
                          borderRadius: "5px",
                          padding: "10px",
                        }}
                      >
                        <CardBody>
                          {/* <h4>{assemblyList.assemblyListName}</h4> */}
                          <ul
                            style={{
                              listStyleType: "none",
                              padding: 0,
                              fontWeight: "600",
                            }}
                          >
                            <li
                              style={{ fontSize: "25px", marginBottom: "10px" }}
                            >
                              {assemblyList.assemblyListName}
                            </li>

                            <li style={{ fontSize: "19px" }}>
                              <span class="badge bg-primary-subtle text-primary">
                                Assembly
                              </span>
                            </li>
                          </ul>
                          <div className="table-wrapper">
                            <div className="table-responsive">
                              <table className="project-table">
                                <tbody>
                                  {!loading &&
                                  !error &&
                                  assemblyList.partsListItems?.length > 0 ? (
                                    assemblyList.partsListItems.map((item) => (
                                      <React.Fragment key={item.Uid}>
                                        <tr className="table-row-main">
                                          <td
                                            style={{
                                              backgroundColor: "#EFEBE9",
                                              color: "black",
                                            }}
                                            className="part-name"
                                          >
                                            {`${item.partName || "N/A"}  (${
                                              item.Uid
                                            })`}
                                          </td>
                                          {columnNames.map((column) => (
                                            <td key={column}>
                                              {getHoursForPartListItems(
                                                column,
                                                item.quantity,
                                                item.manufacturingVariables
                                              )}
                                            </td>
                                          ))}
                                        </tr>
                                      </React.Fragment>
                                    ))
                                  ) : (
                                    <tr></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {assemblyList.subAssemblyPartsLists.map(
                            (subAssemblyList) => (
                              <React.Fragment key={subAssemblyList._id}>
                                <br />
                                <br />
                                <h4>{subAssemblyList.subAssemblyListName}</h4>
                                <div className="parts-lists">
                                  <div className="table-wrapper">
                                    <div className="table-responsive">
                                      <table className="table table-hover align-middle">
                                        <thead className="table-header">
                                          <tr>
                                            <th
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#F5F5F5",
                                              }}
                                            >
                                              Sub-Assembly Part Name
                                            </th>
                                            {columnNames.map((item) => (
                                              <th
                                                key={item}
                                                className="child_parts"
                                              >
                                                {item}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {!loading &&
                                          !error &&
                                          subAssemblyList.partsListItems
                                            ?.length > 0 ? (
                                            subAssemblyList.partsListItems.map(
                                              (item) => (
                                                <React.Fragment key={item.Uid}>
                                                  <tr className="table-row-main">
                                                    <td
                                                      style={{
                                                        backgroundColor:
                                                          "#EFEBE9",
                                                        color: "black",
                                                      }}
                                                      className="part-name"
                                                    >
                                                      {`${
                                                        item.partName || "N/A"
                                                      }  (${item.Uid})`}
                                                    </td>
                                                    {columnNames.map(
                                                      (column) => (
                                                        <td key={column}>
                                                          {getHoursForPartListItems(
                                                            column,
                                                            item.quantity,
                                                            item.manufacturingVariables
                                                          )}
                                                        </td>
                                                      )
                                                    )}
                                                  </tr>
                                                </React.Fragment>
                                              )
                                            )
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan="16"
                                                className="text-center"
                                              >
                                                {loading
                                                  ? "Loading..."
                                                  : error
                                                  ? error
                                                  : "No sub-assembly parts available"}
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                  <br />
                                  <br />
                                  <div className="table-wrapper">
                                    <div className="table-responsive">
                                      <table className="table table-hover align-middle">
                                        <thead className="table-header">
                                          <tr>
                                            <th
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#F5F5F5",
                                              }}
                                            >
                                              Total Hours
                                            </th>
                                            {columnNames.map((item) => (
                                              <th
                                                key={item}
                                                className="child_parts"
                                              >
                                                {item}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <tr className="table-row-main">
                                            <td
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#C8E6C9",
                                                color: "black",
                                              }}
                                            >
                                              Required Machinewise Total Hours
                                            </td>
                                            {columnNames.map((processName) => (
                                              <td key={processName}>
                                                {calculateTotalHoursForSubAssembly(
                                                  processName,
                                                  subAssemblyList
                                                )}
                                              </td>
                                            ))}
                                          </tr>
                                          <tr className="table-row-main">
                                            <td
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#EFEBE9",
                                                color: "black",
                                              }}
                                            >
                                              Available machine hours per day
                                            </td>
                                            {columnNames.map((processName) => (
                                              <td key={processName}>
                                                <input
                                                  className="input-field"
                                                  type="number"
                                                  value={
                                                    machineHoursPerDay[
                                                      `${processName}_${subAssemblyList._id}`
                                                    ] || 0
                                                  }
                                                  onChange={(e) =>
                                                    handleInputChange(
                                                      e,
                                                      "machineHoursPerDay",
                                                      `${processName}_${subAssemblyList._id}`
                                                    )
                                                  }
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                          <tr className="table-row-main">
                                            <td
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#EFEBE9",
                                                color: "black",
                                              }}
                                            >
                                              Number of Machines TBU
                                            </td>
                                            {columnNames.map((processName) => (
                                              <td key={processName}>
                                                <input
                                                  className="input-field"
                                                  type="number"
                                                  value={
                                                    numberOfMachines[
                                                      `${processName}_${subAssemblyList._id}`
                                                    ] || 0
                                                  }
                                                  onChange={(e) =>
                                                    handleInputChange(
                                                      e,
                                                      "numberOfMachines",
                                                      `${processName}_${subAssemblyList._id}`
                                                    )
                                                  }
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                          <tr className="table-row-main">
                                            <td
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#EFEBE9",
                                                color: "black",
                                              }}
                                            >
                                              Number of Days to be worked
                                            </td>
                                            {columnNames.map((processName) => (
                                              <td key={processName}>
                                                <input
                                                  className="input-field"
                                                  type="number"
                                                  value={
                                                    daysToWork[
                                                      `${processName}_${subAssemblyList._id}`
                                                    ] || 0
                                                  }
                                                  onChange={(e) =>
                                                    handleInputChange(
                                                      e,
                                                      "daysToWork",
                                                      `${processName}_${subAssemblyList._id}`
                                                    )
                                                  }
                                                />
                                              </td>
                                            ))}
                                          </tr>
                                          <tr className="table-row-main">
                                            <td
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#EFEBE9",
                                                color: "black",
                                              }}
                                            >
                                              Available machine hours per month
                                            </td>
                                            {columnNames.map((processName) => (
                                              <td key={processName}>
                                                {(
                                                  (machineHoursPerDay[
                                                    `${processName}_${subAssemblyList._id}`
                                                  ] || 0) *
                                                  (numberOfMachines[
                                                    `${processName}_${subAssemblyList._id}`
                                                  ] || 0) *
                                                  (daysToWork[
                                                    `${processName}_${subAssemblyList._id}`
                                                  ] || 0)
                                                ).toFixed(2)}
                                              </td>
                                            ))}
                                          </tr>
                                          <tr className="table-row-main">
                                            <td
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#C8E6C9",
                                                color: "black",
                                              }}
                                            >
                                              Months Required to complete
                                            </td>
                                            {columnNames.map((processName) => (
                                              <td key={processName}>
                                                {calculateMonthsRequiredForSubAssembly(
                                                  processName,
                                                  subAssemblyList
                                                )}
                                              </td>
                                            ))}
                                          </tr>
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              </React.Fragment>
                            )
                          )}

                          <div>
                            {assemblyList.assemblyMultyPartsList.map(
                              (subAssemblyList) => (
                                <React.Fragment key={subAssemblyList._id}>
                                  <br />
                                  <br />
                                  <h4>
                                    {subAssemblyList.assemblyMultyPartsListName}
                                  </h4>
                                  <div className="parts-lists">
                                    <div className="table-wrapper">
                                      <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                          <thead className="table-header">
                                            <tr>
                                              <th
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#F5F5F5",
                                                }}
                                              >
                                                Sub-Assembly Part Name
                                              </th>
                                              {columnNames.map((item) => (
                                                <th
                                                  key={item}
                                                  className="child_parts"
                                                >
                                                  {item}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {!loading &&
                                            !error &&
                                            subAssemblyList.partsListItems
                                              ?.length > 0 ? (
                                              subAssemblyList.partsListItems.map(
                                                (item) => (
                                                  <React.Fragment
                                                    key={item.Uid}
                                                  >
                                                    <tr className="table-row-main">
                                                      <td
                                                        style={{
                                                          backgroundColor:
                                                            "#EFEBE9",
                                                          color: "black",
                                                        }}
                                                        className="part-name"
                                                      >
                                                        {`${
                                                          item.partName || "N/A"
                                                        }  (${item.Uid})`}
                                                      </td>
                                                      {columnNames.map(
                                                        (column) => (
                                                          <td key={column}>
                                                            {getHoursForPartListItems(
                                                              column,
                                                              item.quantity,
                                                              item.manufacturingVariables
                                                            )}
                                                          </td>
                                                        )
                                                      )}
                                                    </tr>
                                                  </React.Fragment>
                                                )
                                              )
                                            ) : (
                                              <tr>
                                                <td
                                                  colSpan="16"
                                                  className="text-center"
                                                >
                                                  {loading
                                                    ? "Loading..."
                                                    : error
                                                    ? error
                                                    : "No sub-assembly parts available"}
                                                </td>
                                              </tr>
                                            )}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    <br />
                                    <br />
                                    <div className="table-wrapper">
                                      <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                          <thead className="table-header">
                                            <tr>
                                              <th
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#F5F5F5",
                                                }}
                                              >
                                                Total Hours
                                              </th>
                                              {columnNames.map((item) => (
                                                <th
                                                  key={item}
                                                  className="child_parts"
                                                >
                                                  {item}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            <tr className="table-row-main">
                                              <td
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#C8E6C9",
                                                  color: "black",
                                                }}
                                              >
                                                Required Machinewise Total Hours
                                              </td>
                                              {columnNames.map(
                                                (processName) => (
                                                  <td key={processName}>
                                                    {calculateTotalHoursForSubAssembly(
                                                      processName,
                                                      subAssemblyList
                                                    )}
                                                  </td>
                                                )
                                              )}
                                            </tr>
                                            <tr className="table-row-main">
                                              <td
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#EFEBE9",
                                                  color: "black",
                                                }}
                                              >
                                                Available machine hours per day
                                              </td>
                                              {columnNames.map(
                                                (processName) => (
                                                  <td key={processName}>
                                                    <input
                                                      className="input-field"
                                                      type="number"
                                                      value={
                                                        machineHoursPerDay[
                                                          `${processName}_${subAssemblyList._id}`
                                                        ] || 0
                                                      }
                                                      onChange={(e) =>
                                                        handleInputChange(
                                                          e,
                                                          "machineHoursPerDay",
                                                          `${processName}_${subAssemblyList._id}`
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                )
                                              )}
                                            </tr>
                                            <tr className="table-row-main">
                                              <td
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#EFEBE9",
                                                  color: "black",
                                                }}
                                              >
                                                Number of Machines TBU
                                              </td>
                                              {columnNames.map(
                                                (processName) => (
                                                  <td key={processName}>
                                                    <input
                                                      className="input-field"
                                                      type="number"
                                                      value={
                                                        numberOfMachines[
                                                          `${processName}_${subAssemblyList._id}`
                                                        ] || 0
                                                      }
                                                      onChange={(e) =>
                                                        handleInputChange(
                                                          e,
                                                          "numberOfMachines",
                                                          `${processName}_${subAssemblyList._id}`
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                )
                                              )}
                                            </tr>
                                            <tr className="table-row-main">
                                              <td
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#EFEBE9",
                                                  color: "black",
                                                }}
                                              >
                                                Number of Days to be worked
                                              </td>
                                              {columnNames.map(
                                                (processName) => (
                                                  <td key={processName}>
                                                    <input
                                                      className="input-field"
                                                      type="number"
                                                      value={
                                                        daysToWork[
                                                          `${processName}_${subAssemblyList._id}`
                                                        ] || 0
                                                      }
                                                      onChange={(e) =>
                                                        handleInputChange(
                                                          e,
                                                          "daysToWork",
                                                          `${processName}_${subAssemblyList._id}`
                                                        )
                                                      }
                                                    />
                                                  </td>
                                                )
                                              )}
                                            </tr>
                                            <tr className="table-row-main">
                                              <td
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#EFEBE9",
                                                  color: "black",
                                                }}
                                              >
                                                Available machine hours per
                                                month
                                              </td>
                                              {columnNames.map(
                                                (processName) => (
                                                  <td key={processName}>
                                                    {(
                                                      (machineHoursPerDay[
                                                        `${processName}_${subAssemblyList._id}`
                                                      ] || 0) *
                                                      (numberOfMachines[
                                                        `${processName}_${subAssemblyList._id}`
                                                      ] || 0) *
                                                      (daysToWork[
                                                        `${processName}_${subAssemblyList._id}`
                                                      ] || 0)
                                                    ).toFixed(2)}
                                                  </td>
                                                )
                                              )}
                                            </tr>
                                            <tr className="table-row-main">
                                              <td
                                                className="part-name-header"
                                                style={{
                                                  backgroundColor: "#C8E6C9",
                                                  color: "black",
                                                }}
                                              >
                                                Months Required to complete
                                              </td>
                                              {columnNames.map(
                                                (processName) => (
                                                  <td key={processName}>
                                                    {calculateMonthsRequiredForSubAssembly(
                                                      processName,
                                                      subAssemblyList
                                                    )}
                                                  </td>
                                                )
                                              )}
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </React.Fragment>
                              )
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </React.Fragment>
                  ))
                : null}
              <br />
              <br />
            </div>
          </CardBody>
        </Col>
      </Row>
    </div>
  );
};
export default HoursSummary;
