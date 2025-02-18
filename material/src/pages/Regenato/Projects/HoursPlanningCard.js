// import React, { useState } from "react";
// import { Card, CardBody, CardHeader, Collapse, Input, Table } from "reactstrap";
// import { BsFillClockFill } from "react-icons/bs";

// const HoursPlanningCard = ({ partName, manufacturingVariables, quantity }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [inputs, setInputs] = useState(
//     manufacturingVariables.map(() => ({
//       hoursPerDay: 8,
//       machinesTBU: 3,
//       shifts: 1,
//       daysWorked: 26,
//     }))
//   );

//   // const formatTime = (time) => {
//   //   if (time === 0) return 0;
//   //   let result = "";
//   //   const hours = Math.floor(time);
//   //   const minutes = Math.round((time - hours) * 60);
//   //   if (hours >= 24) {
//   //     const days = Math.floor(hours / 24);
//   //     const remainingHours = hours % 24;
//   //     if (days > 0) result += `${days}d `;
//   //     if (remainingHours > 0) result += `${remainingHours}h `;
//   //     if (minutes > 0) result += `${minutes}m`;
//   //     return result.trim();
//   //   }
//   //   if (hours > 0) result += `${hours}h `;
//   //   if (minutes > 0) result += `${minutes}m`;
//   //   return result.trim();
//   // };
//   const formatTime = (time) => {
//     if (time === 0) {
//       return "0 m";
//     }

//     const totalMinutes = Math.round(time * 60); // Convert hours to minutes
//     return `${totalMinutes} m`;
//   };
//   const toggle = () => setIsOpen(!isOpen);

//   const handleInputChange = (index, field, value) => {
//     const newInputs = [...inputs];
//     newInputs[index][field] = value === "" ? "" : Number(value);
//     setInputs(newInputs);
//   };
// // <div style={{ width: "100%", margin: "10px 0" }}>

//   return (
//     <div
//       // style={{
//       //   display: "flex",
//       //   justifyContent: "center",
//       //   width: "100%",
//       //   margin: "1rem 15px",
//       // }}
//       style={{ width: "100%", margin: "10px 0" }}
//     >
//       <div style={{ width: "100%" }}>
//         <Card>
//           <CardHeader
//             onClick={toggle}
//             style={{
//               cursor: "pointer",
//               fontWeight: "bold",
//               display: "flex",
//               alignItems: "center",
//             }}
//           >
//             <BsFillClockFill
//               size={20}
//               style={{ marginRight: "10px", color: "#495057" }}
//             />
//             <span style={{ color: "#495057", fontSize: "15px" }}>
//               Hours Planning for {partName}
//             </span>
//           </CardHeader>
//           <Collapse isOpen={isOpen}>
//             <CardBody>
//               <Table bordered>
//                 <thead>
//                   <tr>
//                     <th>Part Name {partName}</th>
//                     {manufacturingVariables.map((man, index) => (
//                       <th key={index}>{man.name}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td>Required Machinewise Total Hours</td>
//                     {manufacturingVariables.map((man, index) => (
//                       <td key={index}>
//                         {formatTime(man.hours * quantity) || 0}
//                       </td>
//                     ))}
//                   </tr>
//                   <tr>
//                     <td>Available machine hours per day</td>
//                     {manufacturingVariables.map((_, index) => (
//                       <td key={index}>
//                         <Input
//                           type="number"
//                           value={inputs[index].hoursPerDay}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "hoursPerDay",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                   <tr>
//                     <td>Number of Machines TBU</td>
//                     {manufacturingVariables.map((_, index) => (
//                       <td key={index}>
//                         <Input
//                           type="number"
//                           value={inputs[index].machinesTBU}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "machinesTBU",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                   <tr>
//                     <td>Number of Shifts</td>
//                     {manufacturingVariables.map((_, index) => (
//                       <td key={index}>
//                         <Input
//                           type="number"
//                           value={inputs[index].shifts}
//                           onChange={(e) =>
//                             handleInputChange(index, "shifts", e.target.value)
//                           }
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                   <tr>
//                     <td>Number of days to be worked</td>
//                     {manufacturingVariables.map((_, index) => (
//                       <td key={index}>
//                         <Input
//                           type="number"
//                           value={inputs[index].daysWorked}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "daysWorked",
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                   <tr
//                     style={{ backgroundColor: "#f1f5f9", fontWeight: "bold" }}
//                   >
//                     <td>Available machine hours per month</td>
//                     {manufacturingVariables.map((_, index) => {
//                       const availableHoursPerMonth =
//                         (inputs[index].hoursPerDay || 0) *
//                         (inputs[index].machinesTBU || 0) *
//                         (inputs[index].shifts || 0) *
//                         (inputs[index].daysWorked || 0);
//                       return <td key={index}>{availableHoursPerMonth}</td>;
//                     })}
//                   </tr>
//                 </tbody>
//               </Table>
//             </CardBody>
//           </Collapse>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default HoursPlanningCard;




import React, { useState } from "react";
import { Card, CardBody, CardHeader, Collapse, Input, Table } from "reactstrap";
import { BsFillClockFill } from "react-icons/bs";

const HoursPlanningCard = ({ partName, manufacturingVariables, quantity }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [inputs, setInputs] = useState(
    manufacturingVariables.map(() => ({
      hoursPerDay: 8,
      machinesTBU: 3,
      shifts: 1,
      daysWorked: 26,
    }))
  );

  const toggle = () => setIsOpen(!isOpen);

  return (
    <div style={{ width: "100%", margin: "10px 0" }}>
      <div style={{ width: "100%" }}>
        <Card>
          <CardHeader
            onClick={toggle}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            <BsFillClockFill
              size={20}
              style={{ marginRight: "10px", color: "#495057" }}
            />
            <span style={{ color: "#495057", fontSize: "15px" }}>
              Hours Planning for {partName}
            </span>
          </CardHeader>
          <Collapse isOpen={isOpen}>
            <CardBody>
              <Table bordered>
                <thead>
                  <tr>
                    <th>Part Name {partName}</th>
                  </tr>
                </thead>
                <tbody>
                  {manufacturingVariables.map((man, index) => (
                    <tr key={index}>
                      <td colSpan="100%">{man.name}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Collapse>
        </Card>
      </div>
    </div>
  );
};

export default HoursPlanningCard;
