import React, { useState } from "react";
import {
  partsData,
  machiningProcesses,
  ordersData,
  machineAssignments,
} from "./data";
import "./Plan.css";
import { RiH4 } from "react-icons/ri";

export function PlanPage() {
  const [selectedOrder, setSelectedOrder] = useState(ordersData[0]);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedPart, setSelectedPart] = useState(partsData[0]);

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
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const formatDateHeader = (date) => {
    const day = date.getDay();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className={`date-header ${day === 6 ? "weekend" : ""}`}>
        <div>{date.getDate()}</div>
        <div className="text-xs">{dayNames[day]}</div>
      </div>
    );
  };

  const formatMonthHeader = (date) => {
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  // Find the overall date range
  const allDates = ordersData.flatMap((order) => [
    new Date(order.startDate),
    new Date(order.endDate),
  ]);
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
              onChange={(e) =>
                setSelectedPart(
                  partsData.find((p) => p.id === parseInt(e.target.value))
                )
              }
            >
              <option value="1" selected>
                SF BODY (RS-EM) -NEW
              </option>
              <option value="2" disabled>
                Bottom Base Plate (RSSF-PN-SB)
              </option>
              <option value="3" disabled>
                Retainer Plate (RSSF-MECH)
              </option>
              <option value="4" disabled>
                Shaft Plunger (RSSF-MECH)
              </option>
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
              {Object.values(months).map((month) => (
                <div
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
          <div className="timeline-header">
            <div className="timeline-sidebar"></div>
            <div className="timeline-content">
              {dates.map(formatDateHeader)}
            </div>
          </div>

          {/* Orders */}
          {ordersData.map((order) => (
            <div key={order.id} className="order-row">
              <div className="order-content">
                <div className="order-sidebar">
                  <div
                    className={`order-id ${
                      order.id === selectedOrder?.id ? "text-blue" : ""
                    }`}
                  >
                    {order.id}
                  </div>
                  <div
                    className={`order-quantity ${
                      order.id === selectedOrder?.id ? "text-blue" : ""
                    }`}
                  >
                    Qty: {order.quantity}
                  </div>
                </div>
                <div
                  className={`order-timeline ${
                    order.id === selectedOrder?.id ? "selected" : ""
                  }`}
                >
                  {Object.entries(order.processes).map(
                    ([processCode, process]) => {
                      const startIdx = getDaysBetweenDates(
                        minDate,
                        process.startDate
                      );
                      const duration = getDaysBetweenDates(
                        process.startDate,
                        process.endDate
                      );
                      const totalDays = getDaysBetweenDates(minDate, maxDate);
                      const widthPercent = (duration / totalDays) * 100;
                      const leftPercent = (startIdx / totalDays) * 100;

                      return (
                        <div
                          key={processCode}
                          className={`process-bar ${
                            order.id === selectedOrder?.id ? "selected" : ""
                          }`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedProcess(processCode);
                          }}
                        >
                          <div className="process-bar-content">
                            <div className="process-name">
                              {machiningProcesses[processCode].name}
                            </div>
                            <div className="process-machine">
                              {process.machineId}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          ))}
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
            {ordersData.map((order) => (
              <div
                key={order.id}
                className={`order-item ${
                  order.id === selectedOrder?.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedOrder(order);
                  setSelectedProcess(null);
                }}
              >
                <div className="order-id">{order.id}</div>
                <div className="order-quantity">Qty: {order.quantity}</div>
                <div className="text-xs text-gray">
                  {order.startDate} - {order.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processes Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Processes</h2>
            {selectedOrder && (
              <div className="panel-subtitle">Order: {selectedOrder.id}</div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder &&
              Object.entries(selectedOrder.processes).map(
                ([processCode, process]) => (
                  <div
                    key={processCode}
                    className={`process-details ${
                      processCode === selectedProcess ? "selected" : ""
                    }`}
                    onClick={() => setSelectedProcess(processCode)}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">
                        {machiningProcesses[processCode].name}
                      </span>
                      <span className="text-xs text-gray">{processCode}</span>
                    </div>
                    <div className="text-xs text-gray mb-2">
                      {process.startDate} - {process.endDate}
                    </div>
                    <div className="machine-grid">
                      {machineAssignments[processCode].map((machine) => (
                        <div
                          key={machine.id}
                          className={`machine-card ${
                            machine.orderId === selectedOrder.id ? "active" : ""
                          }`}
                        >
                          <div className="text-xs font-medium">
                            {machine.id}
                          </div>
                          <div className="text-xs text-gray">
                            Order: {machine.orderId}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
          </div>
        </div>

        {/* Process Details Panel */}
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Process Details</h2>
            {selectedOrder && (
              <div className="panel-subtitle">Order: {selectedOrder.id}</div>
            )}
          </div>
          <div className="panel-content">
            {selectedOrder &&
              Object.entries(selectedOrder.processes).map(
                ([processCode, process]) => {
                  const machines = machineAssignments[processCode] || [];
                  return (
                    <div key={processCode} className="process-details">
                      <h4 className="font-medium mb-2">
                        {machiningProcesses[processCode].name}
                      </h4>
                      <div className="text-xs text-gray mb-3">
                        Period: {process.startDate} - {process.endDate}
                      </div>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Machine ID</th>
                            <th>Order ID</th>
                            <th>Operator</th>
                          </tr>
                        </thead>
                        <tbody>
                          {machines.map((machine) => (
                            <tr
                              key={machine.id}
                              className={
                                machine.orderId === selectedOrder.id
                                  ? "selected"
                                  : ""
                              }
                            >
                              <td>{machine.id}</td>
                              <td>{machine.orderId}</td>
                              <td>{machine.operator}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
