import React, { useState, useEffect } from "react";
import "./Plan.css";

export function PlanPage() {
  const [allocationData, setAllocationData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPart, setSelectedPart] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllocationData();
  }, []);

  const fetchAllocationData = async () => {
    try {
      const response = await fetch(
        "http://localhost:4040/api/defpartproject/all-allocations"
      );
      const data = await response.json();

      setAllocationData(data.data);

      // Set initial project with allocations
      const projectWithAllocations = data.data.find(
        (project) => project.allocations.length > 0
      );
      if (projectWithAllocations) {
        setSelectedProject(projectWithAllocations);
        setSelectedPart(projectWithAllocations.allocations[0]?.partName || "");
      }

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch allocation data");
      setLoading(false);
    }
  };

  const getDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      if (currentDate.getDay() !== 0) {
        // Skip Sundays
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // const formatDateHeader = (date) => {
  //   const day = date.getDay();
  //   const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  //   return (
  //     <div className={`date-header ${day === 6 ? "weekend" : ""}`}>
  //       <div>{date.getDate()}</div>
  //       <div className="text-xs">{dayNames[day]}</div>
  //     </div>
  //   );
  // };

  // In the PlanPage.js file

  const formatDateHeader = (date) => {
    const day = date.getDay();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Check if the current date is within a process bar
    const isWithinProcessBar = dates.some((d) => {
      const index = dates.indexOf(d);
      if (index >= 0 && index < dates.length - 1) {
        const startDate = new Date(dates[index]);
        const endDate = new Date(dates[index + 1]);
        const currentDate = new Date(d);

        if (currentDate >= startDate && currentDate <= endDate) {
          return true;
        }
      }
      return false;
    });

    return (
      <div
        className={`date-header ${
          isWithinProcessBar ? "wide-date-header" : ""
        }`}
      >
        <div>{date.getDate()}</div>
        <div className="text-xs">{dayNames[day]}</div>
      </div>
    );
  };

  const formatMonthHeader = (date) => {
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  // Get all unique parts from the selected project
  const uniqueParts = [
    ...new Set(
      selectedProject?.allocations.map((allocation) => allocation.partName) ||
        []
    ),
  ];

  // Filter allocations by selected part
  const filteredAllocations =
    selectedProject?.allocations.filter(
      (allocation) => allocation.partName === selectedPart
    ) || [];

  // Get all unique orders
  const uniqueOrders = [
    ...new Set(
      filteredAllocations.flatMap((allocation) =>
        allocation.allocations.map((a) => a.orderNumber)
      )
    ),
  ];

  // Find the overall date range
  const allDates = filteredAllocations.flatMap((allocation) =>
    allocation.allocations.flatMap((a) => [
      new Date(a.startDate),
      new Date(a.endDate),
    ])
  );

  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const dates = getDatesBetween(minDate, maxDate);

  // Group dates by month
  const months = dates.reduce((acc, date) => {
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!acc[monthKey]) {
      acc[monthKey] = {
        label: formatMonthHeader(date),
        dates: [],
      };
    }
    acc[monthKey].dates.push(date);
    return acc;
  }, {});

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1 className="page-title">Allocation Parts View</h1>
          <div className="mt-2">
            <select
              className="part-select"
              value={selectedPart}
              onChange={(e) => setSelectedPart(e.target.value)}
            >
              {uniqueParts.map((part) => (
                <option key={part} value={part}>
                  {part}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="gantt-container">
        <h2 className="gantt-title">Production Timeline</h2>
        <div className="gantt-scroll">
          {/* Month Headers */}
          <div className="timeline-header">
            <div className="timeline-sidebar"></div>
            <div className="timeline-content">
              {Object.values(months).map((month, idx) => (
                <div
                  key={idx}
                  className="month-header"
                  style={{
                    width: `${(month.dates.length / dates.length) * 100}%`,
                  }}
                >
                  {month.label}
                </div>
              ))}
            </div>
          </div>

          {/* Date Headers */}
          {/* <div className="timeline-header">
            <div className="timeline-sidebar"></div>
            <div className="timeline-content">
              {dates.map((date, idx) => (
                <div key={idx}>{formatDateHeader(date)}</div>
              ))}
            </div>
          </div> */}

          {/* Date Headers */}
          <div className="timeline-header">
            <div className="timeline-sidebar"></div>
            <div className="timeline-content">
              {dates.map((date, idx) => (
                <div key={idx}>{formatDateHeader(date)}</div>
              ))}
            </div>
          </div>

          {/* Orders */}
          {uniqueOrders.map((orderNum) => {
            const orderAllocations = filteredAllocations.flatMap((allocation) =>
              allocation.allocations.filter((a) => a.orderNumber === orderNum)
            );

            return (
              <div key={orderNum} className="order-row">
                <div className="order-content">
                  <div className="order-sidebar">
                    <div
                      className={`order-id ${
                        orderNum === selectedOrder ? "text-blue" : ""
                      }`}
                    >
                      {orderNum}
                    </div>
                    <div
                      className={`order-quantity ${
                        orderNum === selectedOrder ? "text-blue" : ""
                      }`}
                    >
                      Qty: {orderAllocations[0]?.plannedQuantity || 0}
                    </div>
                  </div>
                  <div
                    className={`order-timeline ${
                      orderNum === selectedOrder ? "selected" : ""
                    }`}
                  >
                    {filteredAllocations.map((processAllocation) => {
                      const allocation = processAllocation.allocations.find(
                        (a) => a.orderNumber === orderNum
                      );

                      if (!allocation) return null;

                      const startIdx = getDaysBetweenDates(
                        minDate,
                        allocation.startDate
                      );
                      const duration = getDaysBetweenDates(
                        allocation.startDate,
                        allocation.endDate
                      );
                      const totalDays = getDaysBetweenDates(minDate, maxDate);
                      const widthPercent = (duration / totalDays) * 100;
                      const leftPercent = (startIdx / totalDays) * 100;

                      return (
                        <div
                          key={allocation._id}
                          className={`process-bar ${
                            orderNum === selectedOrder ? "selected" : ""
                          }`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          onClick={() => {
                            setSelectedOrder(orderNum);
                            setSelectedProcess(processAllocation.processName);
                          }}
                        >
                          <div className="process-bar-content">
                            <div className="process-name">
                              {processAllocation.processName}
                            </div>
                            <div className="process-machine">
                              {allocation.machineId}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="flex space-x-4">
        {/* Orders Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Orders</h2>
          </div>
          <div className="panel-content">
            {uniqueOrders.map((orderNum) => {
              const orderAllocations = filteredAllocations.flatMap(
                (allocation) =>
                  allocation.allocations.filter(
                    (a) => a.orderNumber === orderNum
                  )
              );
              const firstAllocation = orderAllocations[0];

              return (
                <div
                  key={orderNum}
                  className={`order-item ${
                    orderNum === selectedOrder ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedOrder(orderNum);
                    setSelectedProcess(null);
                  }}
                >
                  <div className="order-id">{orderNum}</div>
                  <div className="order-quantity">
                    Qty: {firstAllocation?.plannedQuantity || 0}
                  </div>
                  <div className="text-xs text-gray">
                    {new Date(firstAllocation?.startDate).toLocaleDateString()}{" "}
                    -{new Date(firstAllocation?.endDate).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Processes Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Processes</h2>
            {selectedOrder && (
              <div className="panel-subtitle">Order: {selectedOrder}</div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder &&
              filteredAllocations.map((processAllocation) => {
                const allocation = processAllocation.allocations.find(
                  (a) => a.orderNumber === selectedOrder
                );

                if (!allocation) return null;

                return (
                  <div
                    key={processAllocation._id}
                    className={`process-details ${
                      processAllocation.processName === selectedProcess
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedProcess(processAllocation.processName)
                    }
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {processAllocation.processName}
                      </span>
                      <span className="text-xs text-gray">
                        {allocation.machineId}
                      </span>
                    </div>
                    <div className="text-xs text-gray mb-2">
                      {new Date(allocation.startDate).toLocaleDateString()} -
                      {new Date(allocation.endDate).toLocaleDateString()}
                    </div>
                    <div className="machine-grid">
                      <div className={`machine-card active`}>
                        <div className="text-xs font-medium">
                          {allocation.machineId}
                        </div>
                        <div className="text-xs text-gray">
                          Operator: {allocation.operator}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Process Details Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Process Details</h2>
            {selectedOrder && (
              <div className="panel-subtitle">Order: {selectedOrder}</div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder &&
              filteredAllocations.map((processAllocation) => {
                const allocation = processAllocation.allocations.find(
                  (a) => a.orderNumber === selectedOrder
                );

                if (!allocation) return null;

                return (
                  <div key={processAllocation._id} className="process-details">
                    <h4 className="font-medium mb-2">
                      {processAllocation.processName}
                    </h4>
                    <div className="text-xs text-gray mb-3">
                      Period:{" "}
                      {new Date(allocation.startDate).toLocaleDateString()} -
                      {new Date(allocation.endDate).toLocaleDateString()}
                    </div>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Machine ID</th>
                          <th>Order</th>
                          <th>Operator</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="selected">
                          <td>{allocation.machineId}</td>
                          <td>{allocation.orderNumber}</td>
                          <td>{allocation.operator}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
