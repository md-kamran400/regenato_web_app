import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Collapse,
  Table,
  Button,
  Input,
} from "reactstrap";
import { BsFillClockFill } from "react-icons/bs";
import { MdOutlineDelete } from "react-icons/md";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import axios from "axios";

export const PartListHrPlan = ({
  partName,
  manufacturingVariables,
  quantity,
}) => {
  const [machineOptions, setMachineOptions] = useState({});
  const [isOpen, setIsOpen] = useState(true);
  const [rows, setRows] = useState([]);
  const [operators, setOperators] = useState([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        );
        const data = await response.json();
        if (response.ok) setOperators(data);
      } catch (err) {
        console.error("Error fetching operators", err);
      }
    };
    fetchOperators();
  }, []);

  useEffect(() => {
    const fetchMachines = async () => {
      const machineData = {};
      for (const man of manufacturingVariables) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${man.categoryId}`
          );
          machineData[man.categoryId] = response.data.subCategories;
        } catch (error) {
          console.error("Error fetching machines:", error);
        }
      }
      setMachineOptions(machineData);
    };
    fetchMachines();
  }, [manufacturingVariables]);

  useEffect(() => {
    const updatedRows = manufacturingVariables.map((man, index) => {
      const machineList = machineOptions[man.categoryId] || [];
      const firstMachine =
        machineList.length > 0 ? machineList[0].subcategoryId : "";
      const firstOperator =
        operators.find((op) => op.processName.includes(man.name)) || {};

      const plannedMinutes = man.hours * quantity * 60 || 0;

      return [
        {
          partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          endDate: "",
          machineId: firstMachine,
          shift: "Shift A",
          plannedQtyTime: plannedMinutes + " m",
          operatorId: firstOperator._id || "",
        },
      ];
    });
    setRows(updatedRows);
  }, [machineOptions, operators]);

  const toggle = () => setIsOpen(!isOpen);

  const addRow = (index) => {
    setRows((prevRows) => ({
      ...prevRows,
      [index]: [...(prevRows[index] || []), {}],
    }));
  };

  const deleteRow = (index, rowIndex) => {
    setRows((prevRows) => {
      const updatedRows = [...(prevRows[index] || [])];
      updatedRows.splice(rowIndex, 1);
      return { ...prevRows, [index]: updatedRows.length ? updatedRows : [{}] };
    });
  };

  const formatTime = (time) => {
    if (time === 0) {
      return "0 m";
    }
    const totalMinutes = Math.round(time * 60); // Convert hours to minutes
    return `${totalMinutes} m`;
  };

  const handleStartDateChange = (index, rowIndex, date) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows[index]];
      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        startDate: date,
      };

      // Calculate end date based on 8-hour shift logic
      const plannedMinutes =
        manufacturingVariables[index].hours * quantity * 60;
      const endDate = calculateEndDate(date, plannedMinutes);
      updatedRows[rowIndex].endDate = endDate;

      // Update the start date of the next row if it exists
      if (updatedRows[rowIndex + 1]) {
        const nextStartDate = new Date(endDate);
        nextStartDate.setDate(nextStartDate.getDate() + 1);
        updatedRows[rowIndex + 1].startDate = nextStartDate
          .toISOString()
          .split("T")[0];
      }

      return { ...prevRows, [index]: updatedRows };
    });
  };

  // const calculateEndDate = (startDate, plannedMinutes) => {
  //   let currentDate = new Date(startDate);
  //   let remainingMinutes = plannedMinutes;

  //   while (remainingMinutes > 0) {
  //     const shiftEnd = new Date(currentDate);
  //     shiftEnd.setHours(16, 0, 0); // Assuming shift ends at 4 PM

  //     const availableMinutes = (shiftEnd - currentDate) / (1000 * 60);
  //     const minutesToDeduct = Math.min(availableMinutes, remainingMinutes);

  //     currentDate.setMinutes(currentDate.getMinutes() + minutesToDeduct);
  //     remainingMinutes -= minutesToDeduct;

  //     if (remainingMinutes > 0) {
  //       currentDate.setDate(currentDate.getDate() + 1);
  //       currentDate.setHours(8, 0, 0); // Assuming shift starts at 8 AM
  //     }
  //   }

  //   return currentDate.toISOString().split("T")[0];
  // };

  const calculateEndDate = (startDate, plannedQtyTime, shiftCapacity = 480) => {
    if (!startDate) return null; // Ensure start date is selected

    let requiredDays = Math.ceil(plannedQtyTime / shiftCapacity); // Days needed based on shift capacity
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + requiredDays - 1);

    return endDate.toISOString().split("T")[0];
  };

  const updatePlanDates = (plans) => {
    let lastEndDate = null;

    return plans.map((plan, index) => {
      if (index === 0) {
        // First row requires manual start date
        if (!plan.startDate) return { ...plan, endDate: null };

        plan.endDate = calculateEndDate(plan.startDate, plan.plannedQtyTime);
        lastEndDate = new Date(plan.endDate);
      } else {
        if (!lastEndDate) return { ...plan, startDate: null, endDate: null };

        // Next row's start date is previous row's end date + 1 day
        let newStartDate = new Date(lastEndDate);
        newStartDate.setDate(newStartDate.getDate() + 1);

        plan.startDate = newStartDate.toISOString().split("T")[0];
        plan.endDate = calculateEndDate(plan.startDate, plan.plannedQtyTime);
        lastEndDate = new Date(plan.endDate);
      }
      return plan;
    });
  };
  return (
    <div style={{ width: "100%", margin: "10px 0" }}>
      <Card>
        <CardHeader
          onClick={toggle}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          <BsFillClockFill
            size={20}
            style={{ marginRight: "10px", color: "#495057" }}
          />
          <span style={{ color: "#495057", fontSize: "15px" }}>
            ALLOCATION SUMMARY FOR {partName}
          </span>
        </CardHeader>
        <Collapse isOpen={isOpen}>
          <CardBody className="shadow-md">
            {manufacturingVariables.map((man, index) => (
              <Card key={index} className="mb-4 shadow-lg border-black">
                <CardHeader
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#495057",
                    }}
                  >
                    {`Machine-wise Allocation ${man.name} - ${man.categoryId}`}
                  </span>
                  <Button color="primary" onClick={() => addRow(index)}>
                    Add Row
                  </Button>
                </CardHeader>
                <Table bordered responsive>
                  <thead>
                    <tr>
                      <th style={{ width: "15%" }}>Part Type</th>
                      <th>Planned Quantity</th>
                      <th style={{ width: "15%" }}>Start Date</th>
                      <th style={{ width: "15%" }}>End Date</th>
                      <th style={{ width: "25%" }}>Machine ID</th>
                      <th style={{ width: "15%" }}>Number of Shifts</th>
                      <th>Planned Qty Time</th>
                      <th style={{ width: "25%" }}>Operator</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows[index] &&
                      rows[index].map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td>
                            <Input type="select" value={row.partType}>
                              <option>Select Part</option>
                              <option value="Make">Make</option>
                              <option value="Purchase">Purchase</option>
                            </Input>
                          </td>
                          <td>
                            <Input
                              type="number"
                              min="0"
                              value={row.plannedQuantity || 0}
                            />
                          </td>
                          <td>
                            <Input
                              type="date"
                              value={row.startDate}
                              onChange={(e) =>
                                handleStartDateChange(
                                  index,
                                  rowIndex,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <Input type="date" value={row.endDate} readOnly />
                          </td>
                          <td>
                            <Autocomplete
                              options={machineOptions[man.categoryId] || []}
                              value={
                                machineOptions[man.categoryId]?.find(
                                  (machine) =>
                                    machine.subcategoryId === row.machineId
                                ) || null
                              }
                              getOptionLabel={(option) =>
                                `${option.subcategoryId} - ${option.name}`
                              }
                              renderOption={(props, option) => {
                                const isDisabled = rows[index].some(
                                  (r) => r.machineId === option.subcategoryId
                                );
                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isDisabled ? "gray" : "black",
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    {option.subcategoryId} - {option.name}
                                  </li>
                                );
                              }}
                              onChange={(event, newValue) => {
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    machineId: newValue
                                      ? newValue.subcategoryId
                                      : "",
                                  };
                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Machine"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              disableClearable={false}
                            />
                          </td>

                          <td>
                            <Input type="text" value={row.shift} />
                          </td>
                          <td>{formatTime(man.hours * quantity)}</td>
                          <td>
                            <Autocomplete
                              options={operators.filter((operator) =>
                                operator.processName.includes(man.name)
                              )}
                              getOptionLabel={(option) => option.name}
                              value={
                                operators.find(
                                  (op) => op._id === row.operatorId
                                ) || null
                              } // Prefill value
                              renderOption={(props, option) => {
                                const isDisabled = rows[index].some(
                                  (r) => r.operatorId === option._id
                                );
                                return (
                                  <li
                                    {...props}
                                    style={{
                                      color: isDisabled ? "gray" : "black",
                                      pointerEvents: isDisabled
                                        ? "none"
                                        : "auto",
                                    }}
                                  >
                                    {option.name}
                                  </li>
                                );
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Operator"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              onChange={(event, newValue) => {
                                setRows((prevRows) => {
                                  const updatedRows = [...prevRows[index]];
                                  updatedRows[rowIndex] = {
                                    ...updatedRows[rowIndex],
                                    operatorId: newValue ? newValue._id : "",
                                  };
                                  return { ...prevRows, [index]: updatedRows };
                                });
                              }}
                              disableClearable={false}
                            />
                          </td>

                          <td>
                            <span
                              onClick={() => deleteRow(index, rowIndex)}
                              style={{ color: "red", cursor: "pointer" }}
                            >
                              <MdOutlineDelete size={25} />
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Card>
            ))}
          </CardBody>
        </Collapse>
      </Card>
    </div>
  );
};

// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   CardBody,
//   CardHeader,
//   Collapse,
//   Table,
//   Button,
//   Input,
// } from "reactstrap";
// import { BsFillClockFill } from "react-icons/bs";
// import { FaTrash } from "react-icons/fa";
// import { MdOutlineDelete } from "react-icons/md";
// import Autocomplete from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
// import axios from "axios";

// export const PartListHrPlan = ({
//   partName,
//   manufacturingVariables,
//   quantity,
// }) => {
//   const [machineOptions, setMachineOptions] = useState({});
//   const [isOpen, setIsOpen] = useState(true);
//   const [rows, setRows] = useState([]);
//   const [operators, setOperators] = useState([]);

//   useEffect(() => {
//     const fetchOperators = async () => {
//       try {
//         const response = await fetch(
//           `${process.env.REACT_APP_BASE_URL}/api/userVariable`
//         );
//         const data = await response.json();

//         if (response.ok) {
//           setOperators(data); // Store all operators initially
//         } else {
//           console.error("Failed to fetch operators");
//         }
//       } catch (err) {
//         console.error("Error fetching operators", err);
//       }
//     };

//     fetchOperators();
//   }, []);

//   useEffect(() => {
//     const fetchMachines = async () => {
//       const machineData = {};
//       for (const man of manufacturingVariables) {
//         try {
//           const response = await axios.get(
//             `${process.env.REACT_APP_BASE_URL}/api/manufacturing/category/${man.categoryId}`
//           );
//           machineData[man.categoryId] = response.data.subCategories;
//         } catch (error) {
//           console.error("Error fetching machines:", error);
//         }
//       }
//       setMachineOptions(machineData);
//     };
//     fetchMachines();
//   }, [manufacturingVariables]);

//   useEffect(() => {
//     const today = new Date();
//     let lastEndDate = new Date(today);
//     const updatedRows = manufacturingVariables.map((man) => {
//       const machineList = machineOptions[man.categoryId] || [];
//       const firstMachine =
//         machineList.length > 0 ? machineList[0].subcategoryId : "";
//       const firstOperator =
//         operators.find((op) => op.processName.includes(man.name)) || {};

//       const plannedMinutes = man.hours * quantity * 60 || 0;
//       let endDate = new Date(lastEndDate);
//       endDate.setMinutes(endDate.getMinutes() + plannedMinutes);

//       while (endDate.getDay() === 0) {
//         // Skip Sundays
//         endDate.setDate(endDate.getDate() + 1);
//       }

//       lastEndDate = new Date(endDate);
//       lastEndDate.setMinutes(lastEndDate.getMinutes() + 1);

//       return [
//         {
//           partType: "Make",
//           plannedQuantity: quantity,
//           startDate: today.toISOString().split("T")[0],
//           endDate: endDate.toISOString().split("T")[0],
//           machineId: firstMachine,
//           shift: "Shift A",
//           plannedQtyTime: plannedMinutes + " m",
//           operatorId: firstOperator._id || "",
//         },
//       ];
//     });
//     setRows(updatedRows);
//   }, [machineOptions, operators]);

//   const toggle = () => setIsOpen(!isOpen);

//   const addRow = (index) => {
//     setRows((prevRows) => ({
//       ...prevRows,
//       [index]: [...(prevRows[index] || []), {}],
//     }));
//   };

//   const deleteRow = (index, rowIndex) => {
//     setRows((prevRows) => {
//       const updatedRows = [...(prevRows[index] || [])];
//       updatedRows.splice(rowIndex, 1);
//       return { ...prevRows, [index]: updatedRows.length ? updatedRows : [{}] };
//     });
//   };

//   const formatTime = (time) => {
//     if (time === 0) {
//       return "0 m";
//     }

//     const totalMinutes = Math.round(time * 60); // Convert hours to minutes
//     return `${totalMinutes} m`;
//   };

//   return (
//     <div style={{ width: "100%", margin: "10px 0" }}>
//       <Card>
//         <CardHeader
//           onClick={toggle}
//           style={{
//             cursor: "pointer",
//             fontWeight: "bold",
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           <BsFillClockFill
//             size={20}
//             style={{ marginRight: "10px", color: "#495057" }}
//           />
//           <span style={{ color: "#495057", fontSize: "15px" }}>
//             ALLOCATION SUMMARY FOR {partName}
//           </span>
//         </CardHeader>
//         <Collapse isOpen={isOpen}>
//           <CardBody className="shadow-md">
//             {manufacturingVariables.map((man, index) => (
//               <Card key={index} className="mb-4 shadow-lg border-black">
//                 <CardHeader
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                   }}
//                 >
//                   <span
//                     style={{
//                       fontSize: "16px",
//                       fontWeight: "bold",
//                       color: "#495057",
//                     }}
//                   >{`Machine-wise Allocation ${man.name} - ${man.categoryId}`}</span>
//                   <Button color="primary" onClick={() => addRow(index)}>
//                     Add Row
//                   </Button>
//                 </CardHeader>
//                 <Table bordered responsive>
//                   <thead>
//                     <tr>
//                       <th style={{ width: "15%" }}>Part Type</th>
//                       <th>Planned Quantity</th>
//                       <th style={{ width: "15%" }}>Start Date</th>
//                       <th style={{ width: "15%" }}>End Date</th>
//                       <th style={{ width: "25%" }}>Machine ID</th>
//                       <th style={{ width: "15%" }}>Number of Shifts</th>
//                       <th>Planned Qty Time</th>
//                       <th style={{ width: "25%" }}>Operator</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {rows[index] &&
//                       rows[index].map((row, rowIndex) => (
//                         <tr key={rowIndex}>
//                           <td>
//                             <Input type="select" value={row.partType} readOnly>
//                               <option>Select Part</option>
//                               <option value="Make">Make</option>
//                               <option value="Purchase">Purchase</option>
//                             </Input>
//                           </td>

//                           <td>
//                             <Input
//                               type="number"
//                               min="0"
//                               value={row.plannedQuantity}
//                               readOnly
//                             />
//                           </td>
//                           <td>
//                             <Input type="date" value={row.startDate} readOnly />
//                           </td>
//                           <td>
//                             <Input type="date" value={row.endDate} readOnly />
//                           </td>

//                           <td>
//                             <Autocomplete
//                               options={machineOptions[man.categoryId] || []}
//                               value={
//                                 machineOptions[man.categoryId]?.find(
//                                   (machine) =>
//                                     machine.subcategoryId === row.machineId
//                                 ) || null
//                               }
//                               getOptionLabel={(option) =>
//                                 `${option.subcategoryId} - ${option.name}`
//                               }
//                               renderOption={(props, option) => {
//                                 const isDisabled = rows[index].some(
//                                   (r) => r.machineId === option.subcategoryId
//                                 );
//                                 return (
//                                   <li
//                                     {...props}
//                                     style={{
//                                       color: isDisabled ? "gray" : "black",
//                                       pointerEvents: isDisabled
//                                         ? "none"
//                                         : "auto",
//                                     }}
//                                   >
//                                     {option.subcategoryId} - {option.name}
//                                   </li>
//                                 );
//                               }}
//                               onChange={(event, newValue) => {
//                                 setRows((prevRows) => {
//                                   const updatedRows = [...prevRows[index]];
//                                   updatedRows[rowIndex] = {
//                                     ...updatedRows[rowIndex],
//                                     machineId: newValue
//                                       ? newValue.subcategoryId
//                                       : "",
//                                   };
//                                   return { ...prevRows, [index]: updatedRows };
//                                 });
//                               }}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   label="Machine"
//                                   variant="outlined"
//                                   size="small"
//                                 />
//                               )}
//                               disableClearable={false} // Allow clearing of selection
//                             />
//                           </td>

//                           <td>
//                             <Input type="select" value={row.shift} readOnly>
//                               <option>Shift A</option>
//                             </Input>
//                           </td>
//                           <td>{formatTime(man.hours * quantity)}</td>

//                           <td>
//                             <Autocomplete
//                               className="h-10"
//                               options={operators.filter((operator) =>
//                                 operator.processName.includes(man.name)
//                               )}
//                               value={
//                                 operators.find(
//                                   (op) => op._id === row.operatorId
//                                 ) || null
//                               }
//                               getOptionLabel={(option) => option.name}
//                               renderOption={(props, option) => {
//                                 const isDisabled = rows[index].some(
//                                   (r) => r.operatorId === option._id
//                                 );
//                                 return (
//                                   <li
//                                     {...props}
//                                     style={{
//                                       color: isDisabled ? "gray" : "black",
//                                       pointerEvents: isDisabled
//                                         ? "none"
//                                         : "auto",
//                                     }}
//                                   >
//                                     {option.name}
//                                   </li>
//                                 );
//                               }}
//                               renderInput={(params) => (
//                                 <TextField
//                                   {...params}
//                                   label="Operator"
//                                   variant="outlined"
//                                   size="small"
//                                 />
//                               )}
//                               onChange={(event, newValue) => {
//                                 setRows((prevRows) => {
//                                   const updatedRows = [...prevRows[index]];
//                                   updatedRows[rowIndex] = {
//                                     ...updatedRows[rowIndex],
//                                     operatorId: newValue ? newValue._id : "",
//                                   };
//                                   return { ...prevRows, [index]: updatedRows };
//                                 });
//                               }}
//                               disableClearable={false} // Allows clearing the selection
//                             />
//                           </td>

//                           <td>
//                             <span
//                               onClick={() => deleteRow(index, rowIndex)}
//                               style={{ color: "red", cursor: "pointer" }}
//                             >
//                               <MdOutlineDelete size={25} />
//                             </span>
//                           </td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </Table>
//               </Card>
//             ))}
//           </CardBody>
//         </Collapse>
//       </Card>
//     </div>
//   );
// };
