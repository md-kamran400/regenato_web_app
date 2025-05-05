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
import { fetchManufacturingData, fetchAllocationsData } from "./apiService";

const MachineCapacityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch data from APIs
        const [manufacturingRes, allocationsRes] = await Promise.all([
          fetchManufacturingData(),
          fetchAllocationsData(),
        ]);

        // Process data for chart
        const processedData = manufacturingRes.map((category) => {
          let occupied = 0;

          // Count occupied machines for this category
          allocationsRes.data.forEach((project) => {
            project.allocations.forEach((alloc) => {
              alloc.allocations.forEach((machineAlloc) => {
                if (
                  category.subCategories.some(
                    (sub) => sub.subcategoryId === machineAlloc.machineId
                  )
                ) {
                  occupied++;
                }
              });
            });
          });

          return {
            name: category.name,
            total: category.subCategories.length,
            available: category.subCategories.length - occupied,
            occupied: occupied,
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

  if (loading) return <div>Loading machine capacity data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ width: "100%", height: 400 }}>
      <h3>Machine Capacity Overview</h3>
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
              value: "Manufacturing Process",
              position: "insideBottom",
              offset: -30,
            }}
          />
          <YAxis
            label={{
              value: "Number of Machines",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="total"
            stackId="a"
            fill="#8884d8"
            name="Total Machines"
          />
          <Bar
            dataKey="available"
            stackId="a"
            fill="#82ca9d"
            name="Available Machines"
          />
          <Bar dataKey="occupied" fill="#ffc658" name="Occupied Machines" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MachineCapacityChart;
