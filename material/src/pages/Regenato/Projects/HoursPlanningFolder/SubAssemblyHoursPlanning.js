import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row, Card } from "reactstrap";
// import "../project.css";
import "../projectForProjects.css"
import { FiSettings } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import AllocationPlanningModal from "../Allocation/AllocationPlanningModal";

const SubAssemblyHoursPlanning = () => {
  const { _id } = useParams(); // it will always project id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [modalData, setModalData] = useState({
    name: "",
    projectName: "",
    columnName: "",
    formattedTime: 0,
    tableInfo: null, // Add any other dynamic data needed
    manufacturingVariable: null,
    categoryId: "",
    quantity: 0,
    sourceType: "",
    partsListId: 0, // => partsListId => partlist => task1 task2 ...
    partsListItemsId: 0, // => partsListItems =>  sf body shank
    process_machineId: 0, // machine id like vmc milling
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
    categoryId,
    quantity,
    sourceType,
    partsListId,
    partsListItemsId,
    process_machineId
  ) => {
    setModalData({
      name: partName,
      columnName,
      columnValue,
      tableInfo,
      manufacturingVariable: manufacturingVariable
        ? JSON.stringify(manufacturingVariable)
        : "N/A",
      categoryId,
      quantity,
      sourceType,
      partsListId,
      partsListItemsId,
      process_machineId,
    });
    toggleModal();
  };

  const getTableInfo = (item, column) => {
    if (item.partName) return "partsList";
    if (item.subAssemblyListName) return "subAssemblyListFirst";
    if (item.assemblyListName) return "assemblyList";

    return "unknown";
  };

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

    fetchManufacturingVariables();
  }, []);

  const fetchAllocations = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${modalData.partsListId}/partsListItems/${modalData.partsListItemsId}/allocation`
      );
      const data = await response.json();
      if (response.ok) {
        setAllocations(data.data); // Store allocations
      } else {
        console.error("Failed to fetch allocations");
      }
    } catch (err) {
      console.error("Error fetching allocations", err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchAllocations(); // Fetch allocations
  }, []);

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
    <div>
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
                                  const hours = getHoursForPartListItems(
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
                        subAssemblyListFirst.partsListItems?.length > 0 ? (
                          subAssemblyListFirst.partsListItems.map((item) => (
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
                                <td>{item.quantity * item.costPerUnit}</td>
                                <td>
                                  {formatTime(item.quantity * item.timePerUnit)}
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
                                          matchingVariable?.categoryId || null;

                                        handleCellClick(
                                          item.partName,
                                          column,
                                          item.manufacturingVariables,
                                          tableInfo,
                                          formattedValue,
                                          categoryId,
                                          item.quantity
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
    </div>
  );
};

export default SubAssemblyHoursPlanning;
