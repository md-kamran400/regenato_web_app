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
  const [rows, setRows] = useState({});
  const [operators, setOperators] = useState([]);
  const [hasStartDate, setHasStartDate] = useState(false);

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
    // Only initialize rows with empty data
    const initialRows = manufacturingVariables.reduce((acc, man, index) => {
      acc[index] = [{
        partType: "Make",
        plannedQuantity: quantity,
        startDate: "",
        endDate: "",
        machineId: "",
        shift: "Shift A",
        plannedQtyTime: calculatePlannedMinutes(man.hours * quantity),
        operatorId: "",
        processName: man.name,
      }];
      return acc;
    }, {});
    
    setRows(initialRows);
  }, [manufacturingVariables, quantity]);

  const calculatePlannedMinutes = (hours) => {
    return Math.ceil(hours * 60);
  };

  const calculateEndDate = (startDate, plannedMinutes) => {
    if (!startDate) return "";
    
    const minutesPerDay = 480; // 8 hours per day
    const daysNeeded = Math.ceil(plannedMinutes / minutesPerDay);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysNeeded - 1);
    
    return endDate.toISOString().split('T')[0];
  };

  const prefillData = (allRows, startDate) => {
    let currentDate = new Date(startDate);
    
    manufacturingVariables.forEach((man, index) => {
      if (allRows[index] && allRows[index][0]) {
        const machineList = machineOptions[man.categoryId] || [];
        const firstMachine = machineList.length > 0 ? machineList[0].subcategoryId : "";
        const firstOperator = operators.find((op) => op.processName.includes(man.name)) || {};
        
        // Set start date
        const processStartDate = currentDate.toISOString().split('T')[0];
        
        // Calculate end date based on planned minutes
        const plannedMinutes = calculatePlannedMinutes(man.hours * quantity);
        const processEndDate = calculateEndDate(processStartDate, plannedMinutes);
        
        allRows[index][0] = {
          ...allRows[index][0],
          startDate: processStartDate,
          endDate: processEndDate,
          machineId: firstMachine,
          operatorId: firstOperator._id || "",
        };
        
        // Set up next process start date
        currentDate = new Date(processEndDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return allRows;
  };

  const handleStartDateChange = (index, rowIndex, date) => {
    if (index === 0) { // Only handle start date change for first process
      setHasStartDate(!!date);
      
      setRows(prevRows => {
        const newRows = { ...prevRows };
        if (date) {
          // If start date is set, prefill all data
          return prefillData(newRows, date);
        } else {
          // If start date is cleared, reset all data
          return manufacturingVariables.reduce((acc, man, idx) => {
            acc[idx] = [{
              partType: "Make",
              plannedQuantity: quantity,
              startDate: "",
              endDate: "",
              machineId: "",
              shift: "Shift A",
              plannedQtyTime: calculatePlannedMinutes(man.hours * quantity),
              operatorId: "",
              processName: man.name,
            }];
            return acc;
          }, {});
        }
      });
    }
  };

  const toggle = () => setIsOpen(!isOpen);

  const addRow = (index) => {
    if (!hasStartDate) return; // Prevent adding rows before start date is set
    
    setRows(prevRows => ({
      ...prevRows,
      [index]: [
        ...(prevRows[index] || []),
        {
          partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          endDate: "",
          machineId: "",
          shift: "Shift A",
          plannedQtyTime: calculatePlannedMinutes(manufacturingVariables[index].hours * quantity),
          operatorId: "",
          processName: manufacturingVariables[index].name,
        }
      ]
    }));
  };

  const deleteRow = (index, rowIndex) => {
    setRows(prevRows => {
      const updatedRows = [...prevRows[index]];
      updatedRows.splice(rowIndex, 1);
      return {
        ...prevRows,
        [index]: updatedRows.length ? updatedRows : [{
          partType: "Make",
          plannedQuantity: quantity,
          startDate: "",
          endDate: "",
          machineId: "",
          shift: "Shift A",
          plannedQtyTime: calculatePlannedMinutes(manufacturingVariables[index].hours * quantity),
          operatorId: "",
          processName: manufacturingVariables[index].name,
        }]
      };
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
                  <Button 
                    color="primary" 
                    onClick={() => addRow(index)}
                    disabled={!hasStartDate}
                  >
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
                    {rows[index]?.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>
                          <Input 
                            type="select" 
                            value={row.partType}
                            disabled={!hasStartDate && index !== 0}
                          >
                            <option>Select Part</option>
                            <option value="Make">Make</option>
                            <option value="Purchase">Purchase</option>
                          </Input>
                        </td>
                        <td>
                          <Input
                            type="number"
                            min="0"
                            value={row.plannedQuantity}
                            readOnly
                          />
                        </td>
                        <td>
                          <Input
                            type="date"
                            value={row.startDate}
                            onChange={(e) => handleStartDateChange(index, rowIndex, e.target.value)}
                            readOnly={index !== 0}
                          />
                        </td>
                        <td>
                          <Input
                            type="date"
                            value={row.endDate}
                            readOnly
                          />
                        </td>
                        <td>
                          <Autocomplete
                            options={machineOptions[man.categoryId] || []}
                            value={
                              machineOptions[man.categoryId]?.find(
                                (machine) => machine.subcategoryId === row.machineId
                              ) || null
                            }
                            getOptionLabel={(option) =>
                              `${option.subcategoryId} - ${option.name}`
                            }
                            renderOption={(props, option) => {
                              const isDisabled = rows[index]?.some(
                                (r) => r.machineId === option.subcategoryId
                              );
                              return (
                                <li
                                  {...props}
                                  style={{
                                    color: isDisabled ? "gray" : "black",
                                    pointerEvents: isDisabled ? "none" : "auto",
                                  }}
                                >
                                  {option.subcategoryId} - {option.name}
                                </li>
                              );
                            }}
                            onChange={(event, newValue) => {
                              if (!hasStartDate && index !== 0) return;
                              setRows((prevRows) => {
                                const updatedRows = [...prevRows[index]];
                                updatedRows[rowIndex] = {
                                  ...updatedRows[rowIndex],
                                  machineId: newValue ? newValue.subcategoryId : "",
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
                            disabled={!hasStartDate && index !== 0}
                          />
                        </td>
                        <td>
                          <Input type="text" value={row.shift} readOnly />
                        </td>
                        <td>{row.plannedQtyTime} m</td>
                        <td>
                          <Autocomplete
                            options={operators.filter((operator) =>
                              operator.processName.includes(man.name)
                            )}
                            value={
                              operators.find(
                                (op) => op._id === row.operatorId
                              ) || null
                            }
                            getOptionLabel={(option) => option.name}
                            renderOption={(props, option) => {
                              const isDisabled = rows[index]?.some(
                                (r) => r.operatorId === option._id
                              );
                              return (
                                <li
                                  {...props}
                                  style={{
                                    color: isDisabled ? "gray" : "black",
                                    pointerEvents: isDisabled ? "none" : "auto",
                                  }}
                                >
                                  {option.name}
                                </li>
                              );
                            }}
                            onChange={(event, newValue) => {
                              if (!hasStartDate && index !== 0) return;
                              setRows((prevRows) => {
                                const updatedRows = [...prevRows[index]];
                                updatedRows[rowIndex] = {
                                  ...updatedRows[rowIndex],
                                  operatorId: newValue ? newValue._id : "",
                                };
                                return { ...prevRows, [index]: updatedRows };
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Operator"
                                variant="outlined"
                                size="small"
                              />
                            )}
                            disableClearable={false}
                            disabled={!hasStartDate && index !== 0}
                          />
                        </td>
                        <td>
                          <span
                            onClick={() => hasStartDate && deleteRow(index, rowIndex)}
                            style={{ 
                              color: "red", 
                              cursor: hasStartDate ? "pointer" : "not-allowed",
                              opacity: hasStartDate ? 1 : 0.5
                            }}
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