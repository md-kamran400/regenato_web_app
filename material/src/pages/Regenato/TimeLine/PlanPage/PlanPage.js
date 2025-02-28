import React, { useState, useEffect } from "react";
import "./Plan.css";
import { Calendar, Clock } from "feather-icons-react/build/IconComponents";

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

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
    <div className="plan-container">
      <div className="plan-header">
        <div className="plan-header-left">
          <h1 className="plan-title">Production Planning</h1>
          <div className="plan-subtitle">
            <span className="part-label">Part:</span>
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
        <div className="plan-header-right">
          <div className="date-range-display">
            <Calendar size={16} className="icon" />
            <span>
              {formatDate(minDate.toISOString())} - {formatDate(maxDate.toISOString())}
            </span>
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
          <div className="timeline-header dates-row">
            <div className="timeline-sidebar"></div>
            <div className="timeline-content">
              {dates.map((date, idx) => (
                <div key={idx} className="date-cell">
                  {formatDateHeader(date)}
                </div>
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
                        orderNum === selectedOrder ? "selected-text" : ""
                      }`}
                    >
                      {orderNum}
                    </div>
                    <div
                      className={`order-quantity ${
                        orderNum === selectedOrder ? "selected-text" : ""
                      }`}
                    >
                      Qty: {orderAllocations[0]?.plannedQuantity || 0}
                    </div>
                  </div>
                  <div
                    className={`order-timeline ${
                      orderNum === selectedOrder ? "selected-timeline" : ""
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

                      const isSelected = 
                        orderNum === selectedOrder && 
                        processAllocation.processName === selectedProcess;

                      return (
                        <div
                          key={allocation._id}
                          className={`process-bar ${isSelected ? "selected-process" : ""}`}
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
                            <div className="process-dates">
                              <Clock size={12} className="date-icon" />
                              <span>{formatDate(allocation.startDate)} - {formatDate(allocation.endDate)}</span>
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
      <div className="panels-container">
        {/* Orders Panel */}
        <div className="panel orders-panel">
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
                    orderNum === selectedOrder ? "selected-item" : ""
                  }`}
                  onClick={() => {
                    setSelectedOrder(orderNum);
                    setSelectedProcess(null);
                  }}
                >
                  <div className="order-item-header">
                    <div className="order-item-id">{orderNum}</div>
                    <div className="order-item-quantity">
                      Qty: {firstAllocation?.plannedQuantity || 0}
                    </div>
                  </div>
                  <div className="order-item-dates">
                    <Calendar size={14} className="date-icon" />
                    <span>
                      {formatDate(firstAllocation?.startDate)} - 
                      {formatDate(firstAllocation?.endDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Processes Panel */}
        <div className="panel processes-panel">
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

                const isSelected = processAllocation.processName === selectedProcess;

                return (
                  <div
                    key={processAllocation._id}
                    className={`process-item ${isSelected ? "selected-item" : ""}`}
                    onClick={() =>
                      setSelectedProcess(processAllocation.processName)
                    }
                  >
                    <div className="process-item-header">
                      <span className="process-item-name">
                        {processAllocation.processName}
                      </span>
                      <span className="process-item-machine">
                        {allocation.machineId}
                      </span>
                    </div>
                    <div className="process-item-dates">
                      <Clock size={14} className="date-icon" />
                      <span>
                        {formatDate(allocation.startDate)} - 
                        {formatDate(allocation.endDate)}
                      </span>
                    </div>
                    <div className="process-item-operator">
                      Operator: {allocation.operator}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Process Details Panel */}
        <div className="panel details-panel">
          <div className="panel-header">
            <h2 className="panel-title">Process Details</h2>
            {selectedOrder && selectedProcess && (
              <div className="panel-subtitle">
                {selectedProcess} - {selectedOrder}
              </div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder && selectedProcess &&
              filteredAllocations
                .filter(p => p.processName === selectedProcess)
                .map((processAllocation) => {
                  const allocation = processAllocation.allocations.find(
                    (a) => a.orderNumber === selectedOrder
                  );

                  if (!allocation) return null;

                  return (
                    <div key={processAllocation._id} className="details-content">
                      <div className="details-header">
                        <h3 className="details-title">{processAllocation.processName}</h3>
                        <div className="details-subtitle">
                          <Clock size={16} className="details-icon" />
                          <span>
                            {formatDate(allocation.startDate)} - 
                            {formatDate(allocation.endDate)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="details-card">
                        <div className="details-row">
                          <div className="details-label">Machine ID</div>
                          <div className="details-value">{allocation.machineId}</div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Order Number</div>
                          <div className="details-value">{allocation.orderNumber}</div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Operator</div>
                          <div className="details-value">{allocation.operator}</div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Planned Quantity</div>
                          <div className="details-value">{allocation.plannedQuantity} units</div>
                        </div>
                        <div className="details-row">
                          <div className="details-label">Duration</div>
                          <div className="details-value">
                            {getDaysBetweenDates(allocation.startDate, allocation.endDate)} days
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}

