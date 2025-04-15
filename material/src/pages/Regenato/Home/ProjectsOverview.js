// import React from "react";
// import Chart from "react-apexcharts";

// const ProjectsOverview = () => {
//   const totalProjects = 9851;
//   const activeProjects = 1026;
//   const totalRevenue = 228890;
//   const workingHours = 10589;

//   const chartOptions = {
//     chart: {
//       type: "line",
//       stacked: false,
//       height: 350,
//       toolbar: { show: false },
//     },
//     stroke: {
//       width: [0, 2, 2],
//       curve: "smooth",
//       dashArray: [0, 0, 5],
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: "30%",
//         borderRadius: 5,
//       },
//     },
//     colors: ["#4B3DE6", "#FFC43D", "#2CD47A"],
//     fill: {
//       opacity: [1, 0.25, 1],
//       type: ["bar", "area", "bar"],
//     },
//     labels: [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ],
//     markers: {
//       size: 4,
//       strokeWidth: 0,
//       hover: {
//         size: 6,
//       },
//     },
//     yaxis: {
//       title: { text: undefined },
//     },
//     tooltip: {
//       shared: true,
//       intersect: false,
//       y: {
//         formatter: (val, opts) => {
//           const index = opts.seriesIndex;
//           return index === 1 ? `$${val}k` : val;
//         },
//       },
//     },
//     legend: {
//       position: "top",
//       horizontalAlign: "left",
//     },
//     grid: {
//       borderColor: "#eee",
//       strokeDashArray: 4,
//     },
//   };

//   const chartSeries = [
//     {
//       name: "Number of Production Order",
//       type: "column",
//       data: [35, 65, 48, 66, 49, 70, 52, 41, 78, 45, 61, 69],
//     },
//     {
//       name: "Revenue",
//       type: "area",
//       data: [90, 95, 68, 100, 77.54, 88, 74, 61, 93, 65, 82, 70],
//     },
//     {
//       name: "Active Production Order",
//       type: "column",
//       data: [9, 14, 7, 15, 21, 10, 5, 11, 8, 22, 13, 29],
//     },
//   ];

//   return (
//     <div
//       style={{
//         padding: "24px",
//         backgroundColor: "#fff",
//         borderRadius: "12px",
//         boxShadow: "0 0 12px rgba(0,0,0,0.05)",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
//         Production Orders Overview
//         </h2>
//         <div style={{ display: "flex", gap: "8px" }}>
//           {["ALL", "1M", "6M", "1Y"].map((label) => (
//             <button
//               key={label}
//               style={{
//                 padding: "6px 12px",
//                 borderRadius: "6px",
//                 border: "1px solid #ddd",
//                 backgroundColor: label === "ALL" ? "#EEF2FF" : "#fff",
//                 color: label === "ALL" ? "#4B3DE6" : "#333",
//                 fontWeight: 500,
//                 cursor: "pointer",
//               }}
//             >
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginTop: "24px",
//           marginBottom: "16px",
//         }}
//       >
//         <div style={metricStyle}>
//           <h3 style={metricValue}>{totalProjects.toLocaleString()}</h3>
//           <p style={metricLabel}>Number of Production Order</p>
//         </div>
//         <div style={metricStyle}>
//           <h3 style={metricValue}>{activeProjects.toLocaleString()}</h3>
//           <p style={metricLabel}>Active Production Order</p>
//         </div>
//         <div style={metricStyle}>
//           <h3 style={metricValue}>${(totalRevenue / 1000).toFixed(2)}k</h3>
//           <p style={metricLabel}>Revenue</p>
//         </div>
//         <div style={metricStyle}>
//           <h3 style={{ ...metricValue, color: "#2CD47A" }}>
//             {workingHours.toLocaleString()}h
//           </h3>
//           <p style={metricLabel}>Working Hours</p>
//         </div>
//       </div>

//       <div
//         style={{ background: "#FFFCF5", padding: "20px", borderRadius: "12px" }}
//       >
//         <Chart
//           options={chartOptions}
//           series={chartSeries}
//           type="line"
//           height={350}
//         />
//       </div>
//     </div>
//   );
// };

// const metricStyle = {
//   flex: 1,
//   backgroundColor: "#F9FAFB",
//   padding: "16px",
//   borderRadius: "10px",
//   textAlign: "center",
//   marginRight: "16px",
//   boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
// };

// const metricValue = {
//   fontSize: "22px",
//   fontWeight: 600,
//   margin: 0,
// };

// const metricLabel = {
//   fontSize: "14px",
//   color: "#666",
//   margin: "4px 0 0",
// };

// export default ProjectsOverview;












// // import React, { useEffect, useState } from "react";
// // import Chart from "react-apexcharts";
// // import axios from "axios";

// // const ProjectsOverview = () => {
// //   const [projects, setProjects] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchProjects = async () => {
// //       try {
// //         const response = await axios.get("http://localhost:4040/api/defpartproject/projects");
// //         setProjects(response.data);
// //         setLoading(false);
// //       } catch (err) {
// //         setError(err.message);
// //         setLoading(false);
// //       }
// //     };

// //     fetchProjects();
// //   }, []);

// //   // Calculate metrics from projects data
// //   const calculateMetrics = () => {
// //     if (!projects || projects.length === 0) {
// //       return {
// //         totalProjects: 0,
// //         activeProjects: 0,
// //         totalRevenue: 0,
// //         workingHours: 0,
// //         chartData: {
// //           series: [
// //             { name: "Number of Projects", type: "column", data: Array(12).fill(0) },
// //             { name: "Revenue", type: "area", data: Array(12).fill(0) },
// //             { name: "Active Projects", type: "column", data: Array(12).fill(0) },
// //           ],
// //         },
// //       };
// //     }

// //     // Total projects count
// //     const totalProjects = projects.length;

// //     // Active projects (those with allocations that have daily tracking)
// //     const activeProjects = projects.filter(project => {
// //       return project.partsLists.some(partsList => 
// //         partsList.partsListItems.some(item => 
// //           item.allocations.some(allocation => 
// //             allocation.dailyTracking && allocation.dailyTracking.length > 0
// //           )
// //         )
// //       );
// //     }).length;

// //     // Total revenue (sum of all project costs)
// //     const totalRevenue = projects.reduce((sum, project) => {
// //       return sum + (project.costPerUnit * (project.stockPoQty || 1));
// //     }, 0);

// //     // Total working hours (sum of all machine hours)
// //     const workingHours = projects.reduce((sum, project) => {
// //       if (!project.machineHours) return sum;
// //       return sum + Object.values(project.machineHours).reduce((machineSum, hours) => machineSum + hours, 0);
// //     }, 0);

// //     // Simplified chart data - you might want to enhance this with actual monthly data from your API
// //     const months = Array(12).fill(0);
// //     const projectsByMonth = [...months];
// //     const revenueByMonth = [...months];
// //     const activeByMonth = [...months];

// //     // Distribute projects and revenue evenly across months for visualization
// //     const projectsPerMonth = Math.ceil(totalProjects / 12);
// //     const revenuePerMonth = Math.ceil(totalRevenue / 12 / 1000);
// //     const activePerMonth = Math.ceil(activeProjects / 12);

// //     for (let i = 0; i < 12; i++) {
// //       projectsByMonth[i] = Math.min(projectsPerMonth, totalProjects - (i * projectsPerMonth));
// //       revenueByMonth[i] = Math.min(revenuePerMonth, Math.ceil(totalRevenue / 1000) - (i * revenuePerMonth));
// //       activeByMonth[i] = Math.min(activePerMonth, activeProjects - (i * activePerMonth));
// //     }

// //     return {
// //       totalProjects,
// //       activeProjects,
// //       totalRevenue,
// //       workingHours,
// //       chartData: {
// //         series: [
// //           { name: "Number of Projects", type: "column", data: projectsByMonth },
// //           { name: "Revenue", type: "area", data: revenueByMonth },
// //           { name: "Active Projects", type: "column", data: activeByMonth },
// //         ],
// //       },
// //     };
// //   };

// //   const { totalProjects, activeProjects, totalRevenue, workingHours, chartData } = calculateMetrics();

// //   const chartOptions = {
// //     chart: {
// //       type: "line",
// //       stacked: false,
// //       height: 350,
// //       toolbar: { show: false },
// //     },
// //     stroke: {
// //       width: [0, 2, 2],
// //       curve: "smooth",
// //       dashArray: [0, 0, 5],
// //     },
// //     plotOptions: {
// //       bar: {
// //         columnWidth: "30%",
// //         borderRadius: 5,
// //       },
// //     },
// //     colors: ["#4B3DE6", "#FFC43D", "#2CD47A"],
// //     fill: {
// //       opacity: [1, 0.25, 1],
// //       type: ["bar", "area", "bar"],
// //     },
// //     labels: [
// //       "Jan",
// //       "Feb",
// //       "Mar",
// //       "Apr",
// //       "May",
// //       "Jun",
// //       "Jul",
// //       "Aug",
// //       "Sep",
// //       "Oct",
// //       "Nov",
// //       "Dec",
// //     ],
// //     markers: {
// //       size: 4,
// //       strokeWidth: 0,
// //       hover: {
// //         size: 6,
// //       },
// //     },
// //     yaxis: {
// //       title: { text: undefined },
// //     },
// //     tooltip: {
// //       shared: true,
// //       intersect: false,
// //       y: {
// //         formatter: (val, opts) => {
// //           const index = opts.seriesIndex;
// //           return index === 1 ? `$${val}k` : val;
// //         },
// //       },
// //     },
// //     legend: {
// //       position: "top",
// //       horizontalAlign: "left",
// //     },
// //     grid: {
// //       borderColor: "#eee",
// //       strokeDashArray: 4,
// //     },
// //   };

// //   if (loading) {
// //     return <div style={{ padding: "24px", textAlign: "center" }}>Loading projects data...</div>;
// //   }

// //   if (error) {
// //     return <div style={{ padding: "24px", color: "red" }}>Error: {error}</div>;
// //   }

// //   return (
// //     <div
// //       style={{
// //         padding: "24px",
// //         backgroundColor: "#fff",
// //         borderRadius: "12px",
// //         boxShadow: "0 0 12px rgba(0,0,0,0.05)",
// //       }}
// //     >
// //       <div
// //         style={{
// //           display: "flex",
// //           justifyContent: "space-between",
// //           alignItems: "center",
// //         }}
// //       >
// //         <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
// //           Projects Overview
// //         </h2>
// //         <div style={{ display: "flex", gap: "8px" }}>
// //           {["ALL", "1M", "6M", "1Y"].map((label) => (
// //             <button
// //               key={label}
// //               style={{
// //                 padding: "6px 12px",
// //                 borderRadius: "6px",
// //                 border: "1px solid #ddd",
// //                 backgroundColor: label === "ALL" ? "#EEF2FF" : "#fff",
// //                 color: label === "ALL" ? "#4B3DE6" : "#333",
// //                 fontWeight: 500,
// //                 cursor: "pointer",
// //               }}
// //             >
// //               {label}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       <div
// //         style={{
// //           display: "flex",
// //           justifyContent: "space-between",
// //           marginTop: "24px",
// //           marginBottom: "16px",
// //         }}
// //       >
// //         <div style={metricStyle}>
// //           <h3 style={metricValue}>{totalProjects.toLocaleString()}</h3>
// //           <p style={metricLabel}>Number of Projects</p>
// //         </div>
// //         <div style={metricStyle}>
// //           <h3 style={metricValue}>{activeProjects.toLocaleString()}</h3>
// //           <p style={metricLabel}>Active Projects</p>
// //         </div>
// //         <div style={metricStyle}>
// //           <h3 style={metricValue}>${(totalRevenue / 1000).toFixed(2)}k</h3>
// //           <p style={metricLabel}>Revenue</p>
// //         </div>
// //         <div style={metricStyle}>
// //           <h3 style={{ ...metricValue, color: "#2CD47A" }}>
// //             {workingHours.toFixed(0)}h
// //           </h3>
// //           <p style={metricLabel}>Working Hours</p>
// //         </div>
// //       </div>

// //       <div
// //         style={{ background: "#FFFCF5", padding: "20px", borderRadius: "12px" }}
// //       >
// //         <Chart
// //           options={chartOptions}
// //           series={chartData.series}
// //           type="line"
// //           height={350}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // const metricStyle = {
// //   flex: 1,
// //   backgroundColor: "#F9FAFB",
// //   padding: "16px",
// //   borderRadius: "10px",
// //   textAlign: "center",
// //   marginRight: "16px",
// //   boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
// // };

// // const metricValue = {
// //   fontSize: "22px",
// //   fontWeight: 600,
// //   margin: 0,
// // };

// // const metricLabel = {
// //   fontSize: "14px",
// //   color: "#666",
// //   margin: "4px 0 0",
// // };

// // export default ProjectsOverview;