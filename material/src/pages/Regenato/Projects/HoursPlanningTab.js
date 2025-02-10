import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row, Card } from "reactstrap";
import "./project.css";
import { CiSignpostL1 } from "react-icons/ci";
import { FiSettings } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";

const HoursPlanningTab = () => {
  const { _id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState({
    allProjects: [],
    assemblyList: [],
    partsLists: [],
    subAssemblyListFirst: [],
  });
  const [parts, setParts] = useState([]);
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [machineHoursPerDay, setMachineHoursPerDay] = useState({});
  const [numberOfMachines, setNumberOfMachines] = useState({});
  const [daysToWork, setDaysToWork] = useState({});

  console.log(_id);

  const fetchProjectDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        // `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
      console.log(partDetails);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, []);

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
      for (const assemblyList of partDetails.assemblyList || []) {
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

  // const getHoursForProcess = (partName, processName) => {
  //   const processData = processPartsMap[processName]?.find(
  //     (item) => item.partName === partName
  //   );
  //   const quantity =
  //     partDetails.allProjects.find((item) => item.partName === partName)
  //       ?.quantity || 0;

  //   if (!processData || !processData.hours) {
  //     return "-";
  //   }

  //   const hours = processData.hours * quantity;

  //   return hours.toFixed(2);
  // };

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

  // const calculateMonthsRequired = (processName) => {
  //   const totalHours = calculateTotalHoursForProcess(processName);
  //   const availableMachineHoursPerMonth =
  //     (machineHoursPerDay[processName] || 0) *
  //     (numberOfMachines[processName] || 0) *
  //     (daysToWork[processName] || 0);

  //   if (availableMachineHoursPerMonth === 0) {
  //     return "--";
  //   }

  //   const monthsRequired = totalHours / availableMachineHoursPerMonth;
  //   return monthsRequired.toFixed(2);
  // };

  // const getHoursForAssemblyProcess = (partName, processName) => {
  //   const processData = processPartsMap[processName]?.find(
  //     (item) => item.partName === partName
  //   );
  //   let quantity = 0;

  //   partDetails.assemblyPartsLists.forEach((list) => {
  //     list.partsListItems.forEach((item) => {
  //       if (item.partName === partName) {
  //         quantity += item.quantity || 0;
  //       }
  //     });
  //     list.subAssemblyPartsLists.forEach((subList) => {
  //       subList.partsListItems.forEach((item) => {
  //         if (item.partName === partName) {
  //           quantity += item.quantity || 0;
  //         }
  //       });
  //     });
  //   });

  //   if (!processData || !processData.hours) {
  //     return "-";
  //   }

  //   const hours = processData.hours * quantity;
  //   return hours.toFixed(2);
  // };

  // const calculateTotalHoursForAssemblyProcess = (processName) => {
  //   if (!processPartsMap[processName]) return 0;
  //   return processPartsMap[processName]
  //     .reduce(
  //       (sum, part) =>
  //         sum +
  //         part.hours *
  //           (partDetails.assemblyPartsLists
  //             .find((list) =>
  //               list.partsListItems.some(
  //                 (item) => item.partName === part.partName
  //               )
  //             )
  //             ?.partsListItems.find((item) => item.partName === part.partName)
  //             ?.quantity || 0),
  //       0
  //     )
  //     .toFixed(2);
  // };

  // const getHoursForSubAssemblyProcess = (partName, processName) => {
  //   const processData = processPartsMap[processName]?.find(
  //     (item) => item.partName === partName
  //   );
  //   const quantity =
  //     partDetails.assemblyPartsLists
  //       .find((list) =>
  //         list.subAssemblyPartsLists.some((subList) =>
  //           subList.partsListItems.some((item) => item.partName === partName)
  //         )
  //       )
  //       ?.subAssemblyPartsLists.find((subList) =>
  //         subList.partsListItems.some((item) => item.partName === partName)
  //       )
  //       ?.partsListItems.find((item) => item.partName === partName)?.quantity ||
  //     0;
  //   // console.log("quantity in getHoursForAssemblyProcess",quantity);

  //   if (!processData || !processData.hours) {
  //     return "-";
  //   }

  //   const hours = processData.hours * quantity;
  //   console.log("hours in getHoursForAssemblyProcess", hours);

  //   return hours.toFixed(2);
  // };

  // const calculateTotalHoursForSubAssemblyProcess = (
  //   processName,
  //   subAssemblyList
  // ) => {
  //   if (!processPartsMap[processName]) return 0;
  //   return processPartsMap[processName]
  //     .reduce((sum, part) => {
  //       console.log(
  //         "aaaaaaaaaa",
  //         processName,
  //         part,
  //         subAssemblyList.partsListItems.find(
  //           (item) => item.partName === part.partName
  //         )?.quantity
  //       );
  //       return (
  //         sum +
  //         part.hours *
  //           (subAssemblyList.partsListItems.find(
  //             (item) => item.partName === part.partName
  //           )?.quantity || 0)
  //       );
  //     }, 0)
  //     .toFixed(2);
  // };

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

  // const calculateTotalHoursForPartsList = (partsList) => {
  //   if (
  //     !partsList ||
  //     !partsList.partsListItems ||
  //     !manufacturingVariables.length
  //   ) {
  //     return 0;
  //   }

  //   return partsList.partsListItems
  //     .reduce(
  //       (sum, item) =>
  //         sum +
  //         (manufacturingVariables.find(
  //           (part) => part.name === item.manufacturingVariables[0]?.name
  //         )?.hours || 0) *
  //           (item.quantity || 0),
  //       0
  //     )
  //     .toFixed(2);
  // };

  const calculateTotalHoursForPartsList = (partsList) => {
    if (
      !partsList ||
      !partsList.partsListItems ||
      !manufacturingVariables.length
    ) {
      return 0;
    }

    const totalHoursPerMachine = {};

    partsList.partsListItems.forEach((item) => {
      item.manufacturingVariables.forEach((variable) => {
        const machineName = variable.name;
        const hours = variable.hours * (item.quantity || 0);

        if (!totalHoursPerMachine[machineName]) {
          totalHoursPerMachine[machineName] = 0;
        }

        totalHoursPerMachine[machineName] += hours;
      });
    });

    return totalHoursPerMachine;
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

  // const formatTime = (time) => {
  //   if (time === 0) {
  //     return 0;
  //   }

  //   let result = "";

  //   const hours = Math.floor(time);
  //   const minutes = Math.round((time - hours) * 60);

  //   if (hours > 0) {
  //     result += `${hours}h `;
  //   }

  //   if (minutes > 0 || (hours === 0 && minutes !== 0)) {
  //     result += `${minutes}m`;
  //   }

  //   return result.trim();
  // };
  const formatTime = (time) => {
    if (time === 0) {
      return "0 m";
    }

    const totalMinutes = Math.round(time * 60); // Convert hours to minutes
    return `${totalMinutes} m`;
  };

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
              {partDetails.partsLists?.map((partsList) => (
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
                                <th className="child_parts">
                                  Production Order-Types
                                </th>
                                <th className="child_parts">Total Cost</th>
                                <th className="child_parts">Total Hours</th>

                                {columnNames
                                  .filter((column) =>
                                    partsList.partsListItems.some(
                                      (item) =>
                                        getHoursForPartListItems(
                                          column,
                                          item.quantity,
                                          item.manufacturingVariables
                                        ) > 0
                                    )
                                  )
                                  .map((column) => (
                                    <th key={column} className="child_parts">
                                      {column}
                                    </th>
                                  ))}
                                <th>Action</th>
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
                                      <td className="table-row-main">
                                        Standard
                                      </td>
                                      <td className="table-row-main">
                                        {item.quantity * item.costPerUnit}
                                      </td>
                                      <td className="table-row-main">
                                        {formatTime(
                                          item.quantity * item.timePerUnit
                                        )}
                                      </td>

                                      {columnNames
                                        .filter((column) =>
                                          partsList.partsListItems.some(
                                            (item) =>
                                              getHoursForPartListItems(
                                                column,
                                                item.quantity,
                                                item.manufacturingVariables
                                              ) > 0
                                          )
                                        )
                                        .map((column) => (
                                          <td
                                            key={column}
                                            className="child_parts"
                                          >
                                            {formatTime(
                                              getHoursForPartListItems(
                                                column,
                                                item.quantity,
                                                item.manufacturingVariables
                                              )
                                            )}
                                          </td>
                                        ))}
                                      <td className="table-row-main">
                                        <div className="action-buttons">
                                          <span
                                            style={{
                                              color: "blue",
                                              cursor: "pointer",
                                              marginRight: "2px",
                                            }}
                                          >
                                            <FiSettings size={20} />
                                          </span>
                                          <span
                                            style={{
                                              color: "red",
                                              cursor: "pointer",
                                              marginLeft: "3px",
                                            }}
                                          >
                                            <MdOutlineDelete size={25} />
                                          </span>
                                        </div>
                                      </td>
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
                                  <th className="child_parts">
                                    Production Order-Types
                                  </th>
                                  <th className="child_parts">Total Cost</th>
                                  <th className="child_parts">Total Hours</th>
                                  {/* {columnNames.map((item) => (
                                    <th key={item} className="child_parts">
                                      {item}
                                    </th>
                                  ))} */}
                                  {/* {columnNames
                                    .filter((column) =>
                                      subAssemblyListFirst.partsListItems.some(
                                        (item) =>
                                          getHoursForPartListItems(
                                            column,
                                            item.quantity,
                                            item.manufacturingVariables
                                          ) > 0
                                      )
                                    )
                                    .map((column) => (
                                      <th key={column} className="child_parts">
                                        {column}
                                      </th>
                                    ))} */}
                                  {columnNames
                                    .filter((column) =>
                                      subAssemblyListFirst.partsListItems.some(
                                        (item) => {
                                          const hours =
                                            getHoursForPartListItems(
                                              column,
                                              item.quantity,
                                              item.manufacturingVariables
                                            );
                                          return (
                                            hours > 0 &&
                                            hours !== null &&
                                            hours !== undefined &&
                                            hours !== ""
                                          );
                                        }
                                      )
                                    )
                                    .map((column) => (
                                      <th key={column} className="child_parts">
                                        {column}
                                      </th>
                                    ))}

                                  <th>Action</th>
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
                                            {`${item.partName || "N/A"} `}
                                          </td>
                                          <td>Standard</td>
                                          <td>
                                            {item.quantity * item.costPerUnit}
                                          </td>
                                          <td>
                                            {formatTime(
                                              item.quantity * item.timePerUnit
                                            )}
                                          </td>

                                          {columnNames
                                            .filter((column) =>
                                              subAssemblyListFirst.partsListItems.some(
                                                (item) =>
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  ) > 0
                                              )
                                            )
                                            .map((column) => (
                                              <td
                                                key={column}
                                                className="child_parts"
                                              >
                                                {formatTime(
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  )
                                                )}
                                              </td>
                                            ))}
                                          {/* {columnNames
                                            .filter((column) =>
                                              subAssemblyListFirst.partsListItems.some(
                                                (item) => {
                                                  const hours =
                                                    getHoursForPartListItems(
                                                      column,
                                                      item.quantity,
                                                      item.manufacturingVariables
                                                    );
                                                  return (
                                                    hours > 0 &&
                                                    hours !== null &&
                                                    hours !== undefined &&
                                                    hours !== ""
                                                  );
                                                }
                                              )
                                            )
                                            .map((column) => (
                                              <th
                                                key={column}
                                                className="child_parts"
                                              >
                                                {formatTime(
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  )
                                                )}
                                              </th>
                                            ))} */}

                                          <td>
                                            <div className="action-buttons">
                                              <span
                                                style={{
                                                  color: "blue",
                                                  cursor: "pointer",
                                                  marginRight: "2px",
                                                }}
                                              >
                                                <FiSettings size={20} />
                                              </span>
                                              <span
                                                style={{
                                                  color: "red",
                                                  cursor: "pointer",
                                                  marginLeft: "3px",
                                                }}
                                              >
                                                <MdOutlineDelete size={25} />
                                              </span>
                                            </div>
                                          </td>
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
                            </table>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </React.Fragment>
              ))}

              {!loading && !error && partDetails.assemblyList?.length > 0
                ? partDetails.assemblyList.map((assemblyList) => (
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
                                <thead className="table-header">
                                  <tr>
                                    <th
                                      className="part-name-header"
                                      style={{ backgroundColor: "#F5F5F5" }}
                                    >
                                      Assembly Part Name
                                    </th>
                                    <th className="child_parts">
                                      Production Order-Types
                                    </th>
                                    <th className="child_parts">Total Cost</th>
                                    <th className="child_parts">Total Hours</th>

                                    {columnNames
                                      .filter((column) =>
                                        assemblyList.partsListItems.some(
                                          (item) =>
                                            getHoursForPartListItems(
                                              column,
                                              item.quantity,
                                              item.manufacturingVariables
                                            ) > 0
                                        )
                                      )
                                      .map((column) => (
                                        <th
                                          key={column}
                                          className="child_parts"
                                        >
                                          {column}
                                        </th>
                                      ))}
                                    <th>Action</th>
                                  </tr>
                                </thead>
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
                                            {`${item.partName || "N/A"} `}
                                          </td>
                                          <td>Standard</td>
                                          <td>
                                            {item.quantity * item.costPerUnit}
                                          </td>
                                          <td>
                                            {formatTime(
                                              item.quantity * item.timePerUnit
                                            )}
                                          </td>
                                          {columnNames
                                            .filter((column) =>
                                              assemblyList.partsListItems.some(
                                                (item) =>
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  ) > 0
                                              )
                                            )
                                            .map((column) => (
                                              <th
                                                key={column}
                                                className="child_parts"
                                              >
                                                {formatTime(
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  )
                                                )}
                                              </th>
                                            ))}
                                          <td>
                                            <div className="action-buttons">
                                              <span
                                                style={{
                                                  color: "blue",
                                                  cursor: "pointer",
                                                  marginRight: "2px",
                                                }}
                                              >
                                                <FiSettings size={20} />
                                              </span>
                                              <span
                                                style={{
                                                  color: "red",
                                                  cursor: "pointer",
                                                  marginLeft: "3px",
                                                }}
                                              >
                                                <MdOutlineDelete size={25} />
                                              </span>
                                            </div>
                                          </td>
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

                          {/* //assemblyList */}
                          {assemblyList.subAssemblies?.map(
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
                                            <th className="child_parts">
                                              Production Order-Types
                                            </th>
                                            <th className="child_parts">
                                              Total Cost
                                            </th>
                                            <th className="child_parts">
                                              Total Hours
                                            </th>
                                            {/* {columnNames.map((item) => (
                                              <th
                                                key={item}
                                                className="child_parts"
                                              >
                                                {item}
                                              </th>
                                            ))} */}
                                            {columnNames
                                              .filter((column) =>
                                                assemblyList.partsListItems.some(
                                                  (item) =>
                                                    getHoursForPartListItems(
                                                      column,
                                                      item.quantity,
                                                      item.manufacturingVariables
                                                    ) > 0
                                                )
                                              )
                                              .map((column) => (
                                                <th
                                                  key={column}
                                                  className="child_parts"
                                                >
                                                  {column}
                                                </th>
                                              ))}
                                            <th>Action</th>
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
                                                      }  `}
                                                    </td>
                                                    <td className="child_parts">
                                                      Standard
                                                    </td>
                                                    <td>
                                                      {item.quantity *
                                                        item.costPerUnit}
                                                    </td>
                                                    <td>
                                                      {formatTime(
                                                        item.quantity *
                                                          item.timePerUnit
                                                      )}
                                                    </td>

                                                    {columnNames
                                                      .filter((column) =>
                                                        assemblyList.partsListItems.some(
                                                          (item) =>
                                                            getHoursForPartListItems(
                                                              column,
                                                              item.quantity,
                                                              item.manufacturingVariables
                                                            ) > 0
                                                        )
                                                      )
                                                      .map((column) => (
                                                        <td
                                                          key={column}
                                                          className="child_parts"
                                                        >
                                                          {formatTime(
                                                            getHoursForPartListItems(
                                                              column,
                                                              item.quantity,
                                                              item.manufacturingVariables
                                                            )
                                                          )}
                                                        </td>
                                                      ))}
                                                    <td>
                                                      {" "}
                                                      <div className="action-buttons">
                                                        <span
                                                          style={{
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            marginRight: "2px",
                                                          }}
                                                        >
                                                          <FiSettings
                                                            size={20}
                                                          />
                                                        </span>
                                                        <span
                                                          style={{
                                                            color: "red",
                                                            cursor: "pointer",
                                                            marginLeft: "3px",
                                                          }}
                                                        >
                                                          <MdOutlineDelete
                                                            size={25}
                                                          />
                                                        </span>
                                                      </div>
                                                    </td>
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
                                </div>
                              </React.Fragment>
                            )
                          )}
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
export default HoursPlanningTab;
