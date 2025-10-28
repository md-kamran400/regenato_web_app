// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Card, CardBody, CardHeader } from 'reactstrap';

// const data = [
//   { name: 'Product A', value: 400 },
//   { name: 'Product B', value: 300 },
//   { name: 'Product C', value: 600 },
//   { name: 'Product D', value: 200 },
//   { name: 'Product E', value: 500 },
// ];

// const RechartsBarChart = () => {
//   return (
//     <Card>
//       <CardHeader>
//         <h5>Bar Chart (Recharts)</h5>
//       </CardHeader>
//       <CardBody>
//         <div style={{ width: '100%', height: 300 }}>
//           <ResponsiveContainer>
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar 
//                 dataKey="value" 
//                 fill="#82ca9d" 
//                 animationDuration={1500}
//                 animationEasing="ease-in-out"
//                 radius={[4, 4, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </CardBody>
//     </Card>
//   );
// };

// export default RechartsBarChart;