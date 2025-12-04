// export default OperatorCapacityChart;
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  fetchManufacturingData,
  fetchOperatorsData,
  fetchAllocationsData,
  getFlatAllocations,
} from "./apiService";

const OperatorCapacityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch data from APIs
        const [manufacturingRes, operatorsRes, allocationsRes] =
          await Promise.all([
            fetchManufacturingData(),
            fetchOperatorsData(),
            fetchAllocationsData(),
          ]);

        console.log("Manufacturing data:", manufacturingRes);
        console.log("Operators data:", operatorsRes);
        console.log("Allocations data:", allocationsRes);

        // Get flat allocations
        const flatAllocations = getFlatAllocations(allocationsRes);
        console.log("Flat allocations for operators:", flatAllocations);

        // Create operator name to process mapping
        const operatorProcessMap = {};
        operatorsRes.forEach((operator) => {
          if (Array.isArray(operator.processName)) {
            operator.processName.forEach((process) => {
              if (!operatorProcessMap[operator.name]) {
                operatorProcessMap[operator.name] = new Set();
              }
              operatorProcessMap[operator.name].add(process);
            });
          }
        });

        console.log("Operator process map:", operatorProcessMap);

        // Process data for chart
        const processedData = manufacturingRes
          .map((category) => {
            // Filter operators for this manufacturing category
            const categoryOperators = operatorsRes.filter(
              (operator) =>
                operator.processName &&
                operator.processName.some((process) =>
                  process.includes(category.name)
                )
            );

            // Count total operators for this category
            const totalOperators = categoryOperators.length;

            // Find occupied operators for this category
            const occupiedOperators = new Set();

            flatAllocations.forEach((allocation) => {
              if (!allocation.operator || allocation.operator.trim() === "")
                return;

              const operatorName = allocation.operator.trim();

              // Check if this operator belongs to the current category
              if (
                operatorProcessMap[operatorName] &&
                operatorProcessMap[operatorName].has(category.name)
              ) {
                occupiedOperators.add(operatorName);
              }
            });

            const occupied = occupiedOperators.size;
            const available = Math.max(0, totalOperators - occupied);

            console.log(
              `Category ${category.name}: Total Operators=${totalOperators}, Occupied=${occupied}, Available=${available}`
            );
            console.log(`Occupied operators:`, Array.from(occupiedOperators));

            return {
              name: category.name,
              available: available,
              occupied: occupied,
              total: totalOperators,
            };
          })
          .filter((item) => item.total > 0); // Only show categories with operators

        console.log("Processed operator chart data:", processedData);
        setData(processedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching operator data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "200px" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            Loading operator capacity data...
          </span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger" role="alert">
        Error loading operator capacity data: {error}
      </div>
    );

  if (data.length === 0)
    return (
      <div className="alert alert-info" role="alert">
        No operator data available to display.
      </div>
    );

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        borderRadius: "8px",
        marginTop: "2rem",
      }}
      className="shadow border-0 p-3"
    >
      <h3>Operator Capacity Overview</h3>

      {data.every((item) => item.occupied === 0) && (
        <div className="alert alert-warning mb-3">
          No operators are currently occupied. All operators are available.
        </div>
      )}

      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            label={{
              value: "Operators",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === "available"
                ? "Available Operators"
                : "Occupied Operators",
            ]}
            labelFormatter={(label) => `Process: ${label}`}
          />
         
          <Bar
            dataKey="available"
            stackId="a"
            fill="#28a745"
            name="Available Operators"
          />
          <Bar
            dataKey="occupied"
            stackId="a"
            fill="#dc3545"
            name="Occupied Operators"
          />
        </BarChart>
         <Legend
            formatter={(value) =>
              value === "available"
                ? "Available Operators"
                : "Occupied Operators"
            }
          />
      </ResponsiveContainer>
    </div>
  );
};

export default OperatorCapacityChart;
