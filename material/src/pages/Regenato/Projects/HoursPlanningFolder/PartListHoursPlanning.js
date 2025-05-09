import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row, Card } from "reactstrap";
// import "../project.css";
import "../projectForProjects.css"
import { FiSettings } from "react-icons/fi";
import { MdOutlineDelete } from "react-icons/md";
import AllocationPlanningModal from "../Allocation/AllocationPlanningModal";
import AllocatedDataModal from "../Allocation/AllocatedDataModal";

const PartListHoursPlanning = () => {
  const { _id } = useParams(); // it will always project id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partDetails, setPartDetails] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [manufacturingVariables, setManufacturingVariables] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllocatedModal, setShowAllocatedModal] = useState(false);

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
      if (!partDetails.partsLists) {
        console.error("Parts lists not available");
        return;
      }

      const allAllocations = []; // Store all allocations

      // Parallelize API calls
      const requests = partDetails.partsLists.flatMap((partsList) =>
        partsList.partsListItems.map(async (partsListItem) => {
          const partsListId = partsList._id;
          const partsListItemsId = partsListItem._id;

          const response = await fetch(
            `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${_id}/partsLists/${partsListId}/partsListItems/${partsListItemsId}/allocation`
          );

          if (response.ok) {
            const data = await response.json();
            allAllocations.push(...(data.data || []));
          } else {
            console.error(
              `Failed to fetch allocations for partsListId: ${partsListId}, partsListItemsId: ${partsListItemsId}`
            );
          }
        })
      );

      await Promise.all(requests); // Wait for all API requests to finish

      setAllocations(allAllocations); // Set accumulated allocations
    } catch (err) {
      console.error("Error fetching allocations", err);
    }
  };

  useEffect(() => {
    if (partDetails?.partsLists?.length) {
      fetchAllocations();
    }
  }, [partDetails]);

  useEffect(() => {
    fetchProjectDetails();
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
                                  {`${item.partName || "N/A"}  (${item.Uid})`}
                                </td>
                                <td className="table-row-main">
                                  {item.quantity}
                                </td>
                                <td className="table-row-main">
                                  {item.quantity * item.costPerUnit}
                                </td>
                                <td className="table-row-main">
                                  {formatTime(item.quantity * item.timePerUnit)}
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
                                  .map((column) => {
                                    const columnValue =
                                      getHoursForPartListItems(
                                        column,
                                        item.quantity,
                                        item.manufacturingVariables
                                      );
                                    const hasValue = columnValue > 0;

                                    return (
                                      //   <th
                                      //   key={column}
                                      //   className="child_parts"
                                      //   onClick={hasValue ? async () => {
                                      //     const tableInfo = getTableInfo(item, column);
                                      //     const formattedValue = formatTime(columnValue);

                                      //     // Find matching variable in both sources
                                      //     const matchingVariable = manufacturingVariables.find(
                                      //       (variable) => variable.name.toLowerCase() === column.toLowerCase()
                                      //     );

                                      //     const matchingVariableProcessId = item.manufacturingVariables?.find(
                                      //       (variable) => variable.name.toLowerCase() === column.toLowerCase()
                                      //     );

                                      //     // Extract the categoryId reliably
                                      //     const categoryId =
                                      //       matchingVariableProcessId?.categoryId ||
                                      //       matchingVariable?.categoryId || // Fallback to global manufacturing variables
                                      //       "Unknown";

                                      //     // Check if allocated
                                      //     const isAllocated = (allocations || [])
                                      //       .flatMap((alloc) => alloc.allocations || [])
                                      //       .some(
                                      //         (alloc) =>
                                      //           alloc.partsListId === partsList._id &&
                                      //           alloc.partsListItemsId === item._id &&
                                      //           alloc.process_machineId === matchingVariableProcessId?._id
                                      //       );

                                      //     if (isAllocated) {
                                      //       const allocatedData = allocations
                                      //         .flatMap((alloc) => alloc.allocations || [])
                                      //         .filter(
                                      //           (alloc) =>
                                      //             alloc.partsListId === partsList._id &&
                                      //             alloc.partsListItemsId === item._id &&
                                      //             alloc.process_machineId === matchingVariableProcessId?._id
                                      //         );
                                      //       setModalData({ allocations: allocatedData });
                                      //       setShowAllocatedModal(true);
                                      //     } else {
                                      //       handleCellClick(
                                      //         item.partName,
                                      //         column,
                                      //         item.manufacturingVariables,
                                      //         tableInfo,
                                      //         formattedValue,
                                      //         categoryId,
                                      //         item.quantity,
                                      //         "partsLists",
                                      //         partsList._id,
                                      //         item._id,
                                      //         matchingVariableProcessId?._id || 0
                                      //       );
                                      //     }
                                      //   } : undefined}
                                      //   style={{
                                      //     backgroundColor: (allocations || [])
                                      //       .flatMap((alloc) => alloc.allocations || [])
                                      //       .some(
                                      //         (alloc) =>
                                      //           alloc.partsListId === partsList._id &&
                                      //           alloc.partsListItemsId === item._id &&
                                      //           alloc.process_machineId ===
                                      //             item.manufacturingVariables?.find(
                                      //               (variable) => variable.name.toLowerCase() === column.toLowerCase()
                                      //             )?._id
                                      //       )
                                      //       ? "#00FF00"
                                      //       : "transparent",
                                      //     color: hasValue ? "#2563EB" : "#999",
                                      //     cursor: hasValue ? "pointer" : "not-allowed",
                                      //   }}
                                      // >
                                      //   {formatTime(columnValue) || ""}
                                      // </th>

                                      <th
                                        key={column}
                                        className="child_parts"
                                        onClick={
                                          hasValue
                                            ? async () => {
                                                const tableInfo = getTableInfo(
                                                  item,
                                                  column
                                                );
                                                const formattedValue =
                                                  formatTime(columnValue);

                                                // Match manufacturing variable in both item and global manufacturingVariables
                                                const matchingVariable =
                                                  manufacturingVariables.find(
                                                    (variable) =>
                                                      variable.name.toLowerCase() ===
                                                      column.toLowerCase()
                                                  );

                                                const matchingVariableProcessId =
                                                  item.manufacturingVariables?.find(
                                                    (variable) =>
                                                      variable.name.toLowerCase() ===
                                                      column.toLowerCase()
                                                  );

                                                // Extract categoryId from reliable sources
                                                const categoryId =
                                                  matchingVariableProcessId?.categoryId || // From item's manufacturingVariables
                                                  matchingVariable?.categoryId || // From global manufacturing variables
                                                  "Unknown"; // Fallback to "Unknown"

                                                // Check if allocated
                                                const isAllocated = (
                                                  allocations || []
                                                ).some((alloc) =>
                                                  alloc.allocations?.some(
                                                    (allocation) =>
                                                      allocation.partsListId ===
                                                        partsList._id &&
                                                      allocation.partsListItemsId ===
                                                        item._id &&
                                                      allocation.process_machineId ===
                                                        matchingVariableProcessId?._id
                                                  )
                                                );

                                                if (isAllocated) {
                                                  // Find the full allocation data object
                                                  const fullData =
                                                    allocations.find((alloc) =>
                                                      alloc.allocations?.some(
                                                        (allocation) =>
                                                          allocation.partsListId ===
                                                            partsList._id &&
                                                          allocation.partsListItemsId ===
                                                            item._id &&
                                                          allocation.process_machineId ===
                                                            matchingVariableProcessId?._id
                                                      )
                                                    );
                                                  // setModalData(fullData);
                                                  setModalData({
                                                    ...fullData,
                                                    partsListId: partsList._id,
                                                    partsListItemsId: item._id,
                                                  });
                                                  setShowAllocatedModal(true);
                                                } else {
                                                  handleCellClick(
                                                    item.partName,
                                                    column,
                                                    item.manufacturingVariables,
                                                    tableInfo,
                                                    formattedValue,
                                                    categoryId, // Now reliably fetched
                                                    item.quantity,
                                                    "partsLists",
                                                    partsList._id,
                                                    item._id,
                                                    matchingVariableProcessId?._id ||
                                                      0
                                                  );
                                                }
                                              }
                                            : undefined
                                        }
                                        style={{
                                          color: (allocations || []).some(
                                            (alloc) =>
                                              alloc.allocations?.some(
                                                (allocation) =>
                                                  allocation.partsListId ===
                                                    partsList._id &&
                                                  allocation.partsListItemsId ===
                                                    item._id &&
                                                  allocation.process_machineId ===
                                                    item.manufacturingVariables?.find(
                                                      (variable) =>
                                                        variable.name.toLowerCase() ===
                                                        column.toLowerCase()
                                                    )?._id
                                              )
                                          )
                                            ? "#00FF00" // Green if allocated
                                            : hasValue
                                            ? "#2563EB" // Default clickable color
                                            : "#999", // Gray for non-clickable
                                          cursor: hasValue
                                            ? "pointer"
                                            : "not-allowed", // Pointer cursor if clickable
                                        }}
                                      >
                                        {formatTime(columnValue) || ""}
                                      </th>

                                      // <th
                                      //   key={column}
                                      //   className="child_parts"
                                      //   onClick={
                                      //     hasValue
                                      //       ? () => {
                                      //           const tableInfo = getTableInfo(
                                      //             item,
                                      //             column
                                      //           );
                                      //           const formattedValue =
                                      //             formatTime(columnValue);

                                      //           // Match manufacturingVariables
                                      //           const matchingVariable =
                                      //             manufacturingVariables.find(
                                      //               (variable) =>
                                      //                 variable.name.toLowerCase() ===
                                      //                 column.toLowerCase()
                                      //             );
                                      //           const matchingVariableProcessId =
                                      //             item.manufacturingVariables?.find(
                                      //               (variable) =>
                                      //                 variable.name.toLowerCase() ===
                                      //                 column.toLowerCase()
                                      //             );

                                      //           // Extract necessary IDs
                                      //           const categoryId =
                                      //             matchingVariable?.categoryId ||
                                      //             "Unknown";
                                      //           const process_machineId =
                                      //             matchingVariableProcessId?._id ||
                                      //             0;

                                      //           handleCellClick(
                                      //             item.partName,
                                      //             column,
                                      //             item.manufacturingVariables,
                                      //             tableInfo,
                                      //             formattedValue,
                                      //             categoryId,
                                      //             item.quantity,
                                      //             "partsLists",
                                      //             partsList._id, // partsListId
                                      //             item._id, // partsListItemsId
                                      //             process_machineId // MachineId
                                      //           );
                                      //         }
                                      //       : undefined
                                      //   }
                                      //   style={{
                                      //     backgroundColor: (allocations || [])
                                      //       .flatMap(
                                      //         (alloc) => alloc.allocations || []
                                      //       )
                                      //       .some(
                                      //         (alloc) =>
                                      //           alloc.partsListId ===
                                      //             partsList._id && // Match partsListId
                                      //           alloc.partsListItemsId ===
                                      //             item._id && // Match partsListItemsId
                                      //           alloc.process_machineId ===
                                      //             item.manufacturingVariables?.find(
                                      //               (variable) =>
                                      //                 variable.name.toLowerCase() ===
                                      //                 column.toLowerCase()
                                      //             )?._id // Match process_machineId
                                      //       )
                                      //       ? "#00FF00" // Green if allocated
                                      //       : "transparent", // Default background
                                      //     color: hasValue ? "#2563EB" : "#999", // Text color
                                      //     cursor: hasValue
                                      //       ? "pointer"
                                      //       : "not-allowed", // Pointer if clickable
                                      //   }}
                                      // >
                                      //   {formatTime(columnValue) || ""}
                                      // </th>
                                    );
                                  })}

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
      </div>

      <AllocationPlanningModal
        isOpen={isModalOpen && !showAllocatedModal}
        toggle={toggleModal}
        name={modalData.name}
        manufacturingVariables={modalData.manufacturingVariable}
        columnName={modalData.columnName}
        columnValue={modalData.columnValue}
        tableInfo={modalData.tableInfo}
        categoryId={modalData.categoryId}
        quantity={modalData.quantity}
        sourceType={modalData.sourceType}
        projectId={_id}
        partsListId={modalData.partsListId}
        partsListItemsId={modalData.partsListItemsId}
        process_machineId={modalData.process_machineId}
        onUpdateData={fetchAllocations}
      />
      <AllocatedDataModal
        isOpen={showAllocatedModal}
        toggle={() => setShowAllocatedModal(false)}
        data={modalData}
        projectId={_id}
        onUpdateData={fetchAllocations}
      />
    </div>
  );
};

export default PartListHoursPlanning;
