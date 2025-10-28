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
