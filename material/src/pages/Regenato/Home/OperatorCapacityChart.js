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

        // Process data for chart
        const processedData = manufacturingRes.map((category) => {
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

          // Find all operator names for this category
          const operatorNames = categoryOperators.map((op) => op.name);

          // Count occupied operators for this category
          const occupiedOperators = new Set();
          allocationsRes.data.forEach((project) => {
            project.allocations.forEach((allocation) => {
              allocation.allocations.forEach((machineAlloc) => {
                if (operatorNames.includes(machineAlloc.operator)) {
                  occupiedOperators.add(machineAlloc.operator);
                }
              });
            });
          });

          const occupied = Math.min(occupiedOperators.size, totalOperators);

          return {
            name: category.name,
            available: Math.max(0, totalOperators - occupied),
            occupied: occupied,
            total: totalOperators,
          };
        });

        setData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading operator capacity data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        borderRadius: "8px",
        marginTop: "2rem",
      }}
      className="shadow border-0"
    >
      <h3>Operator Capacity Overview</h3>
      <ResponsiveContainer width="100%" height="90%">
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
            label={{
              value: "",
              position: "insideBottom",
              offset: -30,
            }}
          />
          <YAxis
            label={{
              value: "Number of Operators",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          {/* <Legend /> */}
          <Bar
            dataKey="available"
            stackId="a"
            fill="#82ca9d"
            name="Available Operators"
          />
          <Bar
            dataKey="occupied"
            stackId="a"
            fill="#F44336"
            name="Occupied Operators"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperatorCapacityChart;
