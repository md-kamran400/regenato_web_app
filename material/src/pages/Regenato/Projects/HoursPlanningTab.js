import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row, Card } from "reactstrap";
import "./project.css";
import { CiSignpostL1 } from "react-icons/ci";
import { FiSettings } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import AllocationPlanningModal from "./Allocation/AllocationPlanningModal";
// hoursplanning
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    name: "",
    projectName: "",
    columnName: "",
    formattedTime: 0,
    tableInfo: null, // Add any other dynamic data needed
    manufacturingVariable: null,
    categoryId: "",
  });

  const getHoursForPartListItems = (
    column,
    quantity,
    manufacturingVariables
  ) => {
    const target = manufacturingVariables.find(
      (a) => a.name.toLowerCase() === column.toLowerCase()
    );
    if (target) {
      const hours = target.hours || 0; // Default to 0 if hours is undefined or null
      return quantity * hours;
    } else {
      return "-"; // Return "-" instead of NaN
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleCellClick = (
    partName,
    columnName,
    manufacturingVariable,
    tableInfo,
    columnValue,
    categoryId
  ) => {
    setModalData({
      name: partName,
      columnName,
      columnValue,
      tableInfo,
      manufacturingVariable: manufacturingVariable
        ? JSON.stringify(manufacturingVariable)
        : "N/A",
      categoryId, // Store the categoryId in modal data
    });
    toggleModal();
  };

  const getTableInfo = (item, column) => {
    if (item.partName) return "partsList";
    if (item.subAssemblyListName) return "subAssemblyListFirst";
    if (item.assemblyListName) return "assemblyList";

    return "unknown";
  };

  // const getQuantityForCell = (item, column) => {
  //   // This function should return the quantity value for the specific cell
  //   // based on the column and item
  //   // You'll need to implement this logic based on your data structure
  //   // For example:
  //   const target = manufacturingVariables.find(
  //     (a) => a.name.toLowerCase() === column.toLowerCase()
  //   );
  //   if (target) {
  //     return item.quantity * target.hours || 0;
  //   }
  //   return 0;
  // };

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

  const columnNames = manufacturingVariables.map((variable) => variable.name);

  const formatTime = (time) => {
    if (time === "-" || isNaN(time)) {
      return "-";
    }

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
        <div className="project-header">
          {/* Left Section */}
          <div className="header-section left">
            <h2 className="project-name" style={{ fontWeight: "bold" }}>
              Allocation Planning
            </h2>
            <br />
            <h4 className="">{partDetails.projectName}</h4>
            <p className="po-id">
              {" "}
              <span style={{ fontWeight: "bold" }}>PO Type:</span>{" "}
              {partDetails.projectType}
            </p>
          </div>
        </div>
        <Col>
          <CardBody>
            {/* Part list code start */}
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
                                <th className="child_parts">Quantity</th>
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
                                        {item.quantity}
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
                                          <th
                                            key={column}
                                            className="child_parts"
                                            onClick={() => {
                                              const tableInfo = getTableInfo(
                                                item,
                                                column
                                              );
                                              const columnValue =
                                                getHoursForPartListItems(
                                                  column,
                                                  item.quantity,
                                                  item.manufacturingVariables
                                                );
                                              const formattedValue =
                                                formatTime(columnValue);

                                              // Fetch the manufacturingVariable and categoryId based on column
                                              const matchingVariable =
                                                manufacturingVariables.find(
                                                  (variable) =>
                                                    variable.name.toLowerCase() ===
                                                    column.toLowerCase()
                                                );
                                              const categoryId =
                                                matchingVariable?.categoryId ||
                                                null;

                                              handleCellClick(
                                                item.partName,
                                                column,
                                                item.manufacturingVariables,
                                                tableInfo,
                                                formattedValue,
                                                categoryId // Pass categoryId to the handler
                                              );
                                            }}
                                            style={{ color: "#2563EB" }}
                                          >
                                            {formatTime(
                                              getHoursForPartListItems(
                                                column,
                                                item.quantity,
                                                item.manufacturingVariables
                                              )
                                            ) || ""}
                                          </th>
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
                      <ul
                        style={{
                          listStyleType: "none",
                          padding: 0,
                          fontWeight: "600",
                        }}
                      >
                        <li style={{ fontSize: "23px", marginBottom: "5px" }}>
                          {subAssemblyListFirst.subAssemblyName}
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
                                  <th className="child_parts">Quantity</th>
                                  <th className="child_parts">Total Cost</th>
                                  <th className="child_parts">Total Hours</th>
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
                                          <td>{item.quantity}</td>
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
                                              
                                              <th
                                                key={column}
                                                className="child_parts"
                                                onClick={() => {
                                                  const tableInfo =
                                                    getTableInfo(item, column);
                                                  const columnValue =
                                                    getHoursForPartListItems(
                                                      column,
                                                      item.quantity,
                                                      item.manufacturingVariables
                                                    );
                                                  const formattedValue =
                                                    formatTime(columnValue);

                                                  // Fetch the manufacturingVariable and categoryId based on column
                                                  const matchingVariable =
                                                    manufacturingVariables.find(
                                                      (variable) =>
                                                        variable.name.toLowerCase() ===
                                                        column.toLowerCase()
                                                    );
                                                  const categoryId =
                                                    matchingVariable?.categoryId ||
                                                    null;

                                                  handleCellClick(
                                                    item.partName,
                                                    column,
                                                    item.manufacturingVariables,
                                                    tableInfo,
                                                    formattedValue,
                                                    categoryId // Pass categoryId to the handler
                                                  );
                                                }}
                                                style={{ color: "#2563EB" }}
                                              >
                                                {formatTime(
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  )
                                                ) || ""}
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
                          <ul
                            style={{
                              listStyleType: "none",
                              padding: 0,
                              fontWeight: "600",
                            }}
                          >
                            <li
                              style={{
                                fontSize: "23px",
                                marginBottom: "5px",
                              }}
                            >
                              {assemblyList.AssemblyName}
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
                                    <th className="child_parts">Quantity</th>
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
                                          <td>{item.quantity}</td>
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
                                                onClick={() => {
                                                  const tableInfo =
                                                    getTableInfo(item, column);
                                                  const columnValue =
                                                    getHoursForPartListItems(
                                                      column,
                                                      item.quantity,
                                                      item.manufacturingVariables
                                                    );
                                                  const formattedValue =
                                                    formatTime(columnValue);

                                                  // Fetch the manufacturingVariable and categoryId based on column
                                                  const matchingVariable =
                                                    manufacturingVariables.find(
                                                      (variable) =>
                                                        variable.name.toLowerCase() ===
                                                        column.toLowerCase()
                                                    );
                                                  const categoryId =
                                                    matchingVariable?.categoryId ||
                                                    null;

                                                  handleCellClick(
                                                    item.partName,
                                                    column,
                                                    item.manufacturingVariables,
                                                    tableInfo,
                                                    formattedValue,
                                                    categoryId // Pass categoryId to the handler
                                                  );
                                                }}
                                                style={{ color: "#2563EB" }}
                                              >
                                                {formatTime(
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  )
                                                ) || ""}
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
                                <ul
                                  style={{
                                    listStyleType: "none",
                                    padding: 0,
                                    fontWeight: "600",
                                  }}
                                >
                                  <li
                                    style={{
                                      fontSize: "23px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    {subAssemblyList.subAssemblyName}
                                  </li>

                                  <li style={{ fontSize: "19px" }}>
                                    <span class="badge bg-danger-subtle text-danger">
                                      Sub Assembly
                                    </span>
                                  </li>
                                </ul>
                                <h4></h4>
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
                                              Quantity
                                            </th>
                                            <th className="child_parts">
                                              Total Cost
                                            </th>
                                            <th className="child_parts">
                                              Total Hours
                                            </th>

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
                                                      {item.quantity}
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
                                                        <th
                                                          key={column}
                                                          className="child_parts"
                                                          onClick={() => {
                                                            const tableInfo =
                                                              getTableInfo(
                                                                item,
                                                                column
                                                              );
                                                            const columnValue =
                                                              getHoursForPartListItems(
                                                                column,
                                                                item.quantity,
                                                                item.manufacturingVariables
                                                              );
                                                            const formattedValue =
                                                              formatTime(
                                                                columnValue
                                                              );

                                                            // Fetch the manufacturingVariable and categoryId based on column
                                                            const matchingVariable =
                                                              manufacturingVariables.find(
                                                                (variable) =>
                                                                  variable.name.toLowerCase() ===
                                                                  column.toLowerCase()
                                                              );
                                                            const categoryId =
                                                              matchingVariable?.categoryId ||
                                                              null;

                                                            handleCellClick(
                                                              item.partName,
                                                              column,
                                                              item.manufacturingVariables,
                                                              tableInfo,
                                                              formattedValue,
                                                              categoryId // Pass categoryId to the handler
                                                            );
                                                          }}
                                                          style={{
                                                            color: "#2563EB",
                                                          }}
                                                        >
                                                          {formatTime(
                                                            getHoursForPartListItems(
                                                              column,
                                                              item.quantity,
                                                              item.manufacturingVariables
                                                            )
                                                          ) || ""}
                                                        </th>
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

      {/*       
      <AllocationPlanningModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        name={modalData.name}
        manufacturingVariables={modalData.manufacturingVariable}
        columnName={modalData.columnName}
        columnValue={modalData.columnValue} // Pass column value to the modal
        tableInfo={modalData.tableInfo}
      /> */}
      <AllocationPlanningModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        name={modalData.name}
        manufacturingVariables={modalData.manufacturingVariable}
        columnName={modalData.columnName}
        columnValue={modalData.columnValue}
        tableInfo={modalData.tableInfo}
        categoryId={modalData.categoryId} // Pass categoryId to the modal
      />
    </div>
  );
};
export default HoursPlanningTab;
