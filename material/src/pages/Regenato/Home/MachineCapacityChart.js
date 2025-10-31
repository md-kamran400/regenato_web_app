// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { fetchManufacturingData, fetchAllocationsData } from "./apiService";

// const MachineCapacityChart = () => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // Fetch data from APIs
//         const [manufacturingRes, allocationsRes] = await Promise.all([
//           fetchManufacturingData(),
//           fetchAllocationsData(),
//         ]);

//         // Process data for chart
//         const processedData = manufacturingRes.map((category) => {
//           let occupied = 0;

//           // Count occupied machines for this category
//           allocationsRes.data.forEach((project) => {
//             project.allocations.forEach((alloc) => {
//               alloc.allocations.forEach((machineAlloc) => {
//                 if (
//                   category.subCategories.some(
//                     (sub) => sub.subcategoryId === machineAlloc.machineId
//                   )
//                 ) {
//                   occupied++;
//                 }
//               });
//             });
//           });

//           const total = category.subCategories.length;
//           return {
//             name: category.name,
//             available: Math.max(0, total - occupied), // Clamp available to 0 0 
//             occupied: occupied,
//             overAllocated: occupied > total ? occupied - total : 0, // Optional: track over-allocations
//           };
//         });

//         setData(processedData);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) return <div>Loading machine capacity data...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div
//       style={{
//         width: "100%",
//         height: 400,
//         borderRadius: "8px",
//         marginTop: "2rem",
//       }}
//       className="shadow border-0"
//     >
//       <h3>Machine Capacity Overview</h3>

//       <ResponsiveContainer width="100%" height="90%">
//         <BarChart
//           data={data}
//           margin={{
//             top: 20,
//             right: 30,
//             left: 20,
//             bottom: 60,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             dataKey="name"
//             angle={-45}
//             textAnchor="end"
//             height={60}
//             label={{
//               value: "",
//               position: "insideBottom",
//               offset: -30,
//             }}
//           />
//           <YAxis
//             label={{
//               value: "Number of Machines",
//               angle: -90,
//               position: "insideLeft",
//             }}
//           />

//           <Tooltip />

//           <Bar
//             dataKey="available"
//             stackId="a"
//             fill="#82ca9d"
//             name="Available Machines"
//           />
//           <Bar
//             dataKey="occupied"
//             stackId="a"
//             fill="#F44336"
//             name="Occupied Machines"
//           />
//           {/* <Legend style={{marginTop:'10rem'}} /> */}
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default MachineCapacityChart;
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
import { fetchManufacturingData, fetchAllocationsData, getFlatAllocations } from "./apiService";

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

        console.log("Manufacturing data:", manufacturingRes);
        console.log("Allocations data:", allocationsRes);

        // Get flat allocations for easier processing
        const flatAllocations = getFlatAllocations(allocationsRes);
        console.log("Flat allocations:", flatAllocations);

        // Process data for chart
        const processedData = manufacturingRes.map((category) => {
          // Count occupied machines for this category
          const occupiedMachines = new Set();
          
          flatAllocations.forEach((allocation) => {
            // Check if this machine belongs to the current category
            const machineExists = category.subCategories.some(
              (sub) => sub.subcategoryId === allocation.machineId
            );
            
            if (machineExists) {
              occupiedMachines.add(allocation.machineId);
            }
          });

          const total = category.subCategories.length;
          const occupied = occupiedMachines.size;
          const available = Math.max(0, total - occupied);

          console.log(`Category ${category.name}: Total=${total}, Occupied=${occupied}, Available=${available}`);

          return {
            name: category.name,
            available: available,
            occupied: occupied,
            total: total,
          };
        }).filter(item => item.total > 0); // Only show categories with machines

        console.log("Processed chart data:", processedData);
        setData(processedData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading machine capacity data...</span>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-danger" role="alert">
      Error loading machine capacity data: {error}
    </div>
  );

  if (data.length === 0) return (
    <div className="alert alert-info" role="alert">
      No machine data available to display.
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
      <h3>Machine Capacity Overview</h3>
      
      {data.every(item => item.occupied === 0) && (
        <div className="alert alert-warning mb-3">
          No machines are currently occupied. All machines are available.
        </div>
      )}

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
            interval={0}
          />
          <YAxis
            label={{
              value: "Number of Machines",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip 
            formatter={(value, name) => [value, name === "available" ? "Available Machines" : "Occupied Machines"]}
            labelFormatter={(label) => `Process: ${label}`}
          />
          <Legend 
            formatter={(value) => value === "available" ? "Available Machines" : "Occupied Machines"}
          />
          <Bar
            dataKey="available"
            stackId="a"
            fill="#28a745"
            name="Available Machines"
          />
          <Bar
            dataKey="occupied"
            stackId="a"
            fill="#dc3545"
            name="Occupied Machines"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MachineCapacityChart;