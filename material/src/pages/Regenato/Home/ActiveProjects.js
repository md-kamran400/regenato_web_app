// import React from "react";
// import { Link } from "react-router-dom";
// import { Card, CardBody, CardHeader, Col } from "reactstrap";
// // import { activeProjects } from '../../common/data';

// const activeProjects = [
//   {
//     id: 1,
//     projectName: "Brand Logo Design",
//     img: "avatar1",
//     projectLead: "Donald Risher",
//     percentage: "53%",
//     subItem: [
//       { id: 1, assImg: "" },
//       { id: 2, assImg: "" },
//       { id: 3, assImg: "" },
//     ],
//     badge: "Inprogress",
//     badgeClass: "warning",
//     dueDate: "06 Sep 2021",
//   },
//   {
//     id: 2,
//     projectName: "Redesign - Landing Page",
//     img: "avatar2",
//     projectLead: "Prezy William",
//     percentage: "0%",
//     subItem: [
//       { id: 1, assImg: "" },
//       { id: 2, assImg: "" },
//     ],
//     badge: "Pending",
//     badgeClass: "danger",
//     dueDate: "13 Nov 2021",
//   },
//   {
//     id: 3,
//     projectName: "Multipurpose Landing Template",
//     img: "avatar3",
//     projectLead: "Boonie Hoynas",
//     percentage: "100%",
//     subItem: [
//       { id: 1, assImg: "" },
//       { id: 2, assImg: "" },
//     ],
//     badge: "Completed",
//     badgeClass: "success",
//     dueDate: "26 Nov 2021",
//   },
//   {
//     id: 4,
//     projectName: "Chat Application",
//     img: "avatar5",
//     projectLead: "Pauline Moll",
//     percentage: "64%",
//     subItem: [{ id: 1, assImg: "" }],
//     badge: "Progress",
//     badgeClass: "warning",
//     dueDate: "15 Dec 2021",
//   },
//   {
//     id: 5,
//     projectName: "Create Wireframe",
//     img: "avatar6",
//     projectLead: "James Bangs",
//     percentage: "77%",
//     subItem: [
//       { id: 1, assImg: "" },
//       { id: 2, assImg: "" },
//       { id: 3, assImg: "" },
//     ],
//     badge: "Progress",
//     badgeClass: "warning",
//     dueDate: "21 Dec 2021",
//   },
// ];

// const ActiveProjects = () => {
//   return (
//     <React.Fragment>
//       <Col xxl={12} style={{ marginTop: "20px" }}>
//         <Card className="card-height-100">
//           <CardHeader className="d-flex align-items-center">
//             <h4 className="card-title flex-grow-1 mb-0">Active Projects</h4>
//             <div className="flex-shrink-0">
//               <Link to="#" className="btn btn-soft-info btn-sm shadow-none">
//                 Export Report
//               </Link>
//             </div>
//           </CardHeader>
//           <CardBody>
//             <div className="table-responsive table-card">
//               <table className="table table-nowrap table-centered align-middle">
//                 <thead className="bg-light text-muted">
//                   <tr>
//                     <th scope="col">Project Name</th>
//                     <th scope="col">Project Lead</th>
//                     <th scope="col">Progress</th>
//                     <th scope="col">Assignee</th>
//                     <th scope="col">Status</th>
//                     <th scope="col" style={{ width: "10%" }}>
//                       Due Date
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {(activeProjects || []).map((item, key) => (
//                     <tr key={key}>
//                       <td className="fw-medium">{item.projectName}</td>
//                       <td>
//                         <img
//                           src={item.img}
//                           className="avatar-xxs rounded-circle me-1"
//                           alt=""
//                         />
//                         <Link to="#" className="text-reset">
//                           {item.projectLead}
//                         </Link>
//                       </td>
//                       <td>
//                         <div className="d-flex align-items-center">
//                           <div className="flex-shrink-0 me-1 text-muted fs-13">
//                             {item.percentage}
//                           </div>
//                           <div
//                             className="progress progress-sm  flex-grow-1"
//                             style={{ width: "68%" }}
//                           >
//                             <div
//                               className="progress-bar bg-primary rounded"
//                               role="progressbar"
//                               style={{ width: item.percentage }}
//                               aria-valuenow="53"
//                               aria-valuemin="0"
//                               aria-valuemax="100"
//                             ></div>
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className="avatar-group flex-nowrap">
//                           {item.subItem.map((item, key) => (
//                             <div className="avatar-group-item" key={key}>
//                               <Link to="#" className="d-inline-block">
//                                 <img
//                                   src={item.assImg}
//                                   alt=""
//                                   className="rounded-circle avatar-xxs"
//                                 />
//                               </Link>
//                             </div>
//                           ))}
//                         </div>
//                       </td>
//                       <td>
//                         <span
//                           className={
//                             "badge bg-" +
//                             item.badgeClass +
//                             "-subtle text-" +
//                             item.badgeClass
//                           }
//                         >
//                           {item.badge}
//                         </span>
//                       </td>
//                       <td className="text-muted">{item.dueDate}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <div className="align-items-center mt-xl-3 mt-4 justify-content-between d-flex">
//               <div className="flex-shrink-0">
//                 <div className="text-muted">
//                   Showing <span className="fw-semibold">5</span> of{" "}
//                   <span className="fw-semibold">25</span> Results
//                 </div>
//               </div>
//               <ul className="pagination pagination-separated pagination-sm mb-0">
//                 <li className="page-item disabled">
//                   <Link to="#" className="page-link">
//                     ←
//                   </Link>
//                 </li>
//                 <li className="page-item">
//                   <Link to="#" className="page-link">
//                     1
//                   </Link>
//                 </li>
//                 <li className="page-item active">
//                   <Link to="#" className="page-link">
//                     2
//                   </Link>
//                 </li>
//                 <li className="page-item">
//                   <Link to="#" className="page-link">
//                     3
//                   </Link>
//                 </li>
//                 <li className="page-item">
//                   <Link to="#" className="page-link">
//                     →
//                   </Link>
//                 </li>
//               </ul>
//             </div>
//           </CardBody>
//         </Card>
//       </Col>
//     </React.Fragment>
//   );
// };

// export default ActiveProjects;
