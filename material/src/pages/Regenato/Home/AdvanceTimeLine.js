// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
// import moment from "moment"; // Ensure correct import
// import getChartColorsArray from "../../../Components/Common/ChartsDynamicColor";

// const AdvanceTimeLine = ({ dataColors }) => {
//   const [seriesData, setSeriesData] = useState([]);

//   const createSeries = (partsData, scalingFactor, baseDate) => {
//     const series = [];
//     partsData.forEach((part) => {
//       let currentTime = baseDate;
//       const data = [];
//       for (const [step, quantity] of Object.entries(part.steps)) {
//         if (quantity <= 0) continue; // Skip invalid or zero quantities
//         const durationDays = quantity / scalingFactor;
//         const start = currentTime;
//         const end = start + durationDays * 24 * 60 * 60 * 1000;
//         data.push({
//           x: step,
//           y: [start, end],
//         });
//         currentTime = end;
//       }
//       if (data.length > 0) {
//         series.push({
//           name: part.partName,
//           data,
//         });
//       }
//     });
//     return series;
//   };

//   useEffect(() => {
//     try {
//       const chartTimelineAdvancedColors = getChartColorsArray(dataColors);
//       const scalingFactor = 100;
//       const baseDate = moment("2024-03-01").valueOf();

//       const partsData = [
//         {
//           partName: "Project 1",
//           steps: {
//             "VMC Imported": 1000.0,
//             "VMC Local": 3050,
//             "Grinding Final": 4150,
//             "CNC Lathe": 1150,
//             "Wire Cut Rough": 400,
//             "Grinding Blank/Rough": 1675,
//           },
//         },
//       ];

//       const processedSeriesData = createSeries(
//         partsData,
//         scalingFactor,
//         baseDate
//       );
//       setSeriesData(processedSeriesData);
//     } catch (error) {
//       console.error("Error in processing chart data:", error);
//     }
//   }, [dataColors]);

//   const options = {
//     chart: { height: 500, type: "rangeBar", toolbar: { show: false } },
//     plotOptions: { bar: { horizontal: true, barHeight: "80%" } },
//     xaxis: { type: "datetime", labels: { format: "dd MMM" } },
//     stroke: { width: 1 },
//     fill: { type: "solid", opacity: 0.6 },
//     legend: { position: "top", horizontalAlign: "left" },
//     colors: getChartColorsArray(dataColors),
//     tooltip: { x: { format: "dd MMM yyyy" } },
//   };

//   return (
//     <div>
//       {seriesData.length > 0 ? (
//         <ReactApexChart
//           dir="ltr"
//           className="apex-charts"
//           options={options}
//           series={seriesData}
//           type="rangeBar"
//           height={500}
//         />
//       ) : (
//         <p>Loading chart...</p>
//       )}
//     </div>
//   );
// };

// export default AdvanceTimeLine;
