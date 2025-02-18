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
import { FaTrash } from "react-icons/fa";
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
  const [rows, setRows] = useState(
    manufacturingVariables.reduce((acc, _, index) => {
      acc[index] = [{}]; // Initialize with one default row per machine
      return acc;
    }, {})
  );
  const [operators, setOperators] = useState([]);

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/userVariable`
        );
        const data = await response.json();

        if (response.ok) {
          setOperators(data); // Store all operators initially
        } else {
          console.error("Failed to fetch operators");
        }
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
                  >{`Machine-wise Allocation ${man.name} - ${man.categoryId}`}</span>
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
                    {rows[index].map((_, rowIndex) => (
                      <tr key={rowIndex}>
                        <td>
                          <Input type="select">
                            <option>Select Part</option>
                            <option value="Make">Make</option>
                            <option value="Purchase">Purchase</option>
                          </Input>
                        </td>

                        <td>
                          <Input
                            type="number"
                            min="0"
                            defaultValue={quantity}
                          />
                        </td>
                        <td>
                          <Input type="date" />
                        </td>
                        <td>
                          <Input type="date" />
                        </td>

                        <td>
                          <Autocomplete
                            options={machineOptions[man.categoryId] || []}
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
                                    pointerEvents: isDisabled ? "none" : "auto",
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
                            disableClearable={false} // Allow clearing of selection
                          />
                        </td>

                        <td>
                          <Input type="select">
                            <option>Shift A</option>
                          </Input>
                        </td>
                        <td>
                          {formatTime(man.hours * quantity)}
                          {man.quantity}
                        </td>

                        <td>
                          <Autocomplete
                            className="h-10"
                            // style={{height:'10px'}}
                            options={operators.filter((operator) =>
                              operator.processName.includes(man.name)
                            )}
                            getOptionLabel={(option) => option.name}
                            renderOption={(props, option) => {
                              const isDisabled = rows[index].some(
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
                            disableClearable={false} // Allows clearing the selection
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
