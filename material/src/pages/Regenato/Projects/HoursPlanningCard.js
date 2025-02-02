import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Input,
  Row,
  Table,
} from "reactstrap";
import { FaClock } from "react-icons/fa";

const HoursPlanningCard = ({ partName, manufacturingVariables, quantity }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoursPerDay, setHoursPerDay] = useState(8);
  const [machinesTBU, setMachinesTBU] = useState(3);
  const [shifts, setShifts] = useState(1);
  const [daysWorked, setDaysWorked] = useState(26);

  const formatTime = (time) => {
    if (time === 0) {
      return 0;
    }

    let result = "";

    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (days > 0) result += `${days}d `;
      if (remainingHours > 0) result += `${remainingHours}h `;
      if (minutes > 0) result += `${minutes}m`;

      return result.trim();
    }

    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim();
  };

  const toggle = () => setIsOpen(!isOpen);
  const availableHoursPerMonth =
    hoursPerDay * machinesTBU * shifts * daysWorked || 0;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        marginLeft: "15px",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ width: "100%" }}>
        <Card>
          <CardHeader
            onClick={toggle}
            style={{ cursor: "pointer", fontWeight: "bold" }}
          >
            <FaClock style={{ marginRight: "10px" }} />
            Hours Planning for {partName}
          </CardHeader>
          <div style={{ width: "100%" }}>
            <Collapse isOpen={isOpen}>
              <CardBody>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Part Name {partName}</th>
                      {manufacturingVariables.map((man, index) => (
                        <th key={index}>{man.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Required Machinewise Total Hours</td>
                      {manufacturingVariables.map((man, index) => (
                        <td key={index}>
                          {formatTime(man.hours * quantity) || 0}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td>Available machine hours per day</td>
                      <td>
                        <Input
                          type="number"
                          value={hoursPerDay}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setHoursPerDay(
                              newValue === "" ? "" : Number(newValue)
                            );
                          }}
                        />
                      </td>
                      <td>
                        <Input type="number" value={hoursPerDay} disabled />
                      </td>
                      <td>
                        <Input type="number" value={hoursPerDay} disabled />
                      </td>
                    </tr>
                    <tr>
                      <td>Number of Machines TBU</td>
                      <td>
                        <Input
                          type="number"
                          value={machinesTBU === 0 ? "" : machinesTBU} // Show empty when cleared
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setMachinesTBU(
                              newValue === "" ? "" : Number(newValue)
                            ); // Allow empty input
                          }}
                        />
                      </td>
                      <td>
                        <Input type="number" value={4} disabled />
                      </td>
                      <td>
                        <Input type="number" value={2} disabled />
                      </td>
                    </tr>
                    <tr>
                      <td>Number of Shift</td>
                      <td>
                        <Input
                          type="number"
                          value={shifts === 0 ? "" : shifts}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setShifts(newValue === "" ? "" : Number(newValue));
                          }}
                        />
                      </td>
                      <td>
                        <Input type="number" value={1} disabled />
                      </td>
                      <td>
                        <Input type="number" value={1} disabled />
                      </td>
                    </tr>
                    <tr>
                      <td>Number of days to be worked</td>
                      <td>
                        <Input
                          type="number"
                          value={daysWorked === 0 ? "" : daysWorked}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setDaysWorked(
                              newValue === "" ? "" : Number(newValue)
                            );
                          }}
                        />
                      </td>
                      <td>
                        <Input type="number" value={26} disabled />
                      </td>
                      <td>
                        <Input type="number" value={26} disabled />
                      </td>
                    </tr>
                    <tr
                      style={{ backgroundColor: "#f1f5f9", fontWeight: "bold" }}
                    >
                      <td>Available machine hours per month</td>
                      <td>{availableHoursPerMonth}</td>
                      <td>{availableHoursPerMonth}</td>
                      <td>{availableHoursPerMonth}</td>
                    </tr>
                  </tbody>
                </Table>
              </CardBody>
            </Collapse>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HoursPlanningCard;

// import React, { useState } from "react";
// import {
//   Card,
//   CardBody,
//   CardHeader,
//   Collapse,
//   Button,
//   Input,
//   Table,
// } from "reactstrap";
// import { FaClock } from "react-icons/fa";

// const HoursPlanningCard = ({
//   partName,
//   manufacturingVariables,
//   quantity,
//   hours,
// }) => {
//   const [isOpen, setIsOpen] = useState(true);
//   const [hoursPerDay, setHoursPerDay] = useState(0);
//   const [machinesTBU, setMachinesTBU] = useState(0);
//   const [daysWorked, setDaysWorked] = useState(0);

//   const formatTime = (time) => {
//     if (time === 0) {
//       return 0;
//     }

//     let result = "";

//     const hours = Math.floor(time);
//     const minutes = Math.round((time - hours) * 60);

//     if (hours > 0) {
//       result += `${hours}h `;
//     }

//     if (minutes > 0 || (hours === 0 && minutes !== 0)) {
//       result += `${minutes}m`;
//     }

//     return result.trim();
//   };

//   console.log(quantity, hours);
//   const toggle = () => setIsOpen(!isOpen);

//   const availableHoursPerMonth = hoursPerDay * machinesTBU * daysWorked;

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         width: "210%",
//         marginLeft: "15px",
//         marginTop: "1rem",
//         marginBottom: "1rem",
//       }}
//     >
//       <div style={{ width: "100%" }}>
//         <CardHeader
//           onClick={toggle}
//           style={{ cursor: "pointer", width: "100%" }}
//         >
//           <FaClock /> Hours Planning for {partName}
//         </CardHeader>
//         <Collapse
//           isOpen={isOpen}
//           style={{
//             boxShadow: `rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px`,
//             borderRadius: "5px",
//           }}
//         >
//           <CardBody>
//             <Table bordered>
//               <tbody>
//                 <tr>
//                   <td>Part Name {partName}</td>
//                   <td>Hours</td>
//                 </tr>
//                 {manufacturingVariables.map((man, index) => (
//                   <tr key={man._id}>
//                     <td>{man.name}</td>
//                     <td>{formatTime(man.hours * quantity) || 0}</td>
//                   </tr>
//                 ))}
//                 <tr>
//                   <td colSpan="2"></td>
//                 </tr>
//                 <tr>
//                   <td>Available machine hours per day</td>
//                   <td>
//                     <Input
//                       type="number"
//                       value={hoursPerDay}
//                       onChange={(e) =>
//                         setHoursPerDay(
//                           e.target.value ? Number(e.target.value) : ""
//                         )
//                       }
//                     />
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>Number of Machines TBU</td>
//                   <td>
//                     <Input
//                       type="number"
//                       value={machinesTBU}
//                       onChange={(e) =>
//                         setMachinesTBU(
//                           e.target.value ? Number(e.target.value) : ""
//                         )
//                       }
//                     />
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>Number of days to be worked</td>
//                   <td>
//                     <Input
//                       type="number"
//                       value={daysWorked}
//                       onChange={(e) =>
//                         setDaysWorked(
//                           e.target.value ? Number(e.target.value) : ""
//                         )
//                       }
//                     />
//                   </td>
//                 </tr>
//                 <tr>
//                   <td>Available machine hours per month</td>
//                   <td>{availableHoursPerMonth}</td>
//                 </tr>
//               </tbody>
//             </Table>
//           </CardBody>
//         </Collapse>
//       </div>
//     </div>
//   );
// };

// export default HoursPlanningCard;
