import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fetchManufacturingData, fetchAllocationsData, fetchOperatorsData } from './apiService';

const OperatorCapacityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch data from APIs
        const [manufacturingRes, allocationsRes, operatorsRes] = await Promise.all([
          fetchManufacturingData(),
          fetchAllocationsData(),
          fetchOperatorsData()
        ]);

        // Process data for chart
        const processedData = manufacturingRes.map(category => {
          // Count total operators for this process
          const total = operatorsRes.filter(operator => 
            operator.processName && operator.processName.includes(category.name)
          ).length;

          // Count occupied operators for this process
          const occupiedOperators = new Set();
          allocationsRes.data.forEach(project => {
            project.allocations.forEach(alloc => {
              alloc.allocations.forEach(machineAlloc => {
                if (machineAlloc.operator) {
                  const operator = operatorsRes.find(op => op.name === machineAlloc.operator);
                  if (operator && operator.processName && operator.processName.includes(category.name)) {
                    occupiedOperators.add(machineAlloc.operator);
                  }
                }
              });
            });
          });

          return {
            name: category.name,
            total: total,
            available: total - occupiedOperators.size,
            occupied: occupiedOperators.size
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
    <div style={{ width: '100%', height: 400 }}>
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
            label={{ value: 'Manufacturing Process', position: 'insideBottom', offset: -30 }} 
          />
          <YAxis label={{ value: 'Number of Operators', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" stackId="a" fill="#8884d8" name="Total Operators" />
          <Bar dataKey="available" stackId="a" fill="#82ca9d" name="Available Operators" />
          <Bar dataKey="occupied" fill="#ffc658" name="Occupied Operators" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperatorCapacityChart;