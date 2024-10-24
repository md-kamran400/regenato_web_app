// // react imports
// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";

// // third party impprts
// import { Link } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import {
//   Card,
//   CardBody,
//   Col,
//   DropdownItem,
//   DropdownMenu,
//   DropdownToggle,
//   Input,
//   Row,
//   UncontrolledDropdown,
// } from "reactstrap";
// import FeatherIcon from "feather-icons-react";
// import {
//   getProjectList as onGetProjectList,
//   deleteProjectList as onDeleteProjectList,
// } from "../../../slices/thunks";

// // component import
// import DeleteModal from "../../../Components/Common/DeleteModal";

// import { createSelector } from "reselect";

// const List = () => {
//   const dispatch = useDispatch();

//   const selectDashboardData = createSelector(
//     (state) => state.Projects,
//     (projectLists) => projectLists.projectLists
//   );
//   // Inside your component
//   const projectLists = useSelector(selectDashboardData);

//   const [project, setProject] = useState(null);
//   const [deleteModal, setDeleteModal] = useState(false);

//   useEffect(() => {
//     dispatch(onGetProjectList());
//   }, [dispatch]);

//   useEffect(() => {
//     setProject(projectLists);
//   }, [projectLists]);

//   // delete
//   const onClickData = (project) => {
//     setProject(project);
//     setDeleteModal(true);
//   };

//   const handleDeleteProjectList = () => {
//     if (project) {
//       dispatch(onDeleteProjectList(project));
//       setDeleteModal(false);
//     }
//   };

//   const activebtn = (ele) => {
//     if (ele.closest("button").classList.contains("active")) {
//       ele.closest("button").classList.remove("active");
//     } else {
//       ele.closest("button").classList.add("active");
//     }
//   };
//   return (
//     <React.Fragment>
//       <ToastContainer closeButton={false} />
//       <DeleteModal
//         show={deleteModal}
//         onDeleteClick={() => handleDeleteProjectList()}
//         onCloseClick={() => setDeleteModal(false)}
//       />
//       <Row className="g-4 mb-3">
//         <div className="col-sm-auto">
//           <div>
//             <Link to="/apps-projects-create" className="btn btn-success">
//               <i className="ri-add-line align-bottom me-1"></i> Add New
//             </Link>
//           </div>
//         </div>
//         <div className="col-sm-3 ms-auto">
//           <div className="d-flex justify-content-sm-end gap-2">
//             <div className="search-box ms-2 col-sm-7">
//               <Input
//                 type="text"
//                 className="form-control"
//                 placeholder="Search..."
//               />
//               <i className="ri-search-line search-icon"></i>
//             </div>

//             <select
//               className="form-control w-md"
//               data-choices
//               data-choices-search-false
//             >
//               <option value="All">All</option>
//               <option value="Last 7 Days">Last 7 Days</option>
//               <option value="Last 30 Days">Last 30 Days</option>
//               <option value="Last Year">Last Year</option>
//               <option value="This Month">This Month</option>
//               <option value="Today">Today</option>
//               <option value="Yesterday" defaultValue>
//                 Yesterday
//               </option>
//             </select>
//           </div>
//         </div>
//       </Row>

//       <div className="row">
//         {(projectLists || []).map((item, index) => (
//           <React.Fragment key={index}>
//             {item.isDesign2 ? (
//               <Col xxl={3} sm={6} className="project-card">
//                 <Card>
//                   <CardBody>
//                     <div
//                       className={`p-3 mt-n3 mx-n3 bg-${item.cardHeaderClass}-subtle rounded-top`}
//                     >
//                       <div className="d-flex align-items-center">
//                         <div className="flex-grow-1">
//                           <h5 className="mb-0 fs-14">
//                             <Link to="/singleproject" className="text-body">
//                               {item.label}
//                             </Link>
//                           </h5>
//                         </div>
//                         <div className="flex-shrink-0">
//                           <div className="d-flex gap-1 align-items-center my-n2">
//                             <button
//                               type="button"
//                               className={`btn avatar-xs mt-n1 p-0 favourite-btn shadow-none ${item.ratingClass}`}
//                               onClick={(e) => activebtn(e)}
//                             >
//                               <span className="avatar-title bg-transparent fs-15">
//                                 <i className="ri-star-fill"></i>
//                               </span>
//                             </button>
//                             <UncontrolledDropdown direction="start">
//                               <DropdownToggle
//                                 tag="button"
//                                 className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
//                               >
//                                 <FeatherIcon
//                                   icon="more-horizontal"
//                                   className="icon-sm"
//                                 />
//                               </DropdownToggle>

//                               <DropdownMenu className="dropdown-menu-end">
//                                 <DropdownItem href="apps-projects-overview">
//                                   <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
//                                   View
//                                 </DropdownItem>
//                                 <DropdownItem href="apps-projects-create">
//                                   <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
//                                   Edit
//                                 </DropdownItem>
//                                 <div className="dropdown-divider"></div>
//                                 <DropdownItem
//                                   href="#"
//                                   onClick={() => onClickData(item)}
//                                   data-bs-toggle="modal"
//                                   data-bs-target="#removeProjectModal"
//                                 >
//                                   <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
//                                   Remove
//                                 </DropdownItem>
//                               </DropdownMenu>
//                             </UncontrolledDropdown>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="py-3">
//                       <Row className="gy-3">
//                         <Col xs={6}>
//                           <div>
//                             <p className="text-muted mb-1">Cost per unit</p>
//                             <div>{item.status}</div>
//                           </div>
//                         </Col>
//                         <Col xs={6}>
//                           <div>
//                             <p className="text-muted mb-1">Total Hours</p>
//                             <h5 className="fs-14">{item.deadline}</h5>
//                           </div>
//                         </Col>
//                       </Row>

//                       <div className="d-flex align-items-center mt-3">
//                         <p className="text-muted mb-0 me-2">On Hand :</p>
//                         <p className="mb-0 me-2">{item.subItem}</p>
//                       </div>
//                     </div>
//                   </CardBody>
//                 </Card>
//               </Col>
//             ) : null}
//           </React.Fragment>
//         ))}
//       </div>
//     </React.Fragment>
//   );
// };

// export default List;








// react imports
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

// third party impprts
import { Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  UncontrolledDropdown,
} from "reactstrap";
import FeatherIcon from "feather-icons-react";


// component import
import DeleteModal from "../../../Components/Common/DeleteModal";



const List = () => {

  const [projectListsData, setprojectListsData] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State for handling errors


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await fetch('http://localhost:4040/api/projects');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setprojectListsData(data); // Set the fetched data to state
    } catch (error) {
        setError(error.message); // Set error message
    } finally {
        setLoading(false); // Set loading to false once fetch is complete
    }
}, []);

useEffect(() => {
  fetchData();
}, [fetchData]);


  const activebtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };
  return (
    <React.Fragment>
      <ToastContainer closeButton={false} />
      <DeleteModal
        show={deleteModal}
        onDeleteClick={() => handleDeleteProjectList()}
        onCloseClick={() => setDeleteModal(false)}
      />
      <Row className="g-4 mb-3">
        <div className="col-sm-auto">
          <div>
            <Link to="/apps-projects-create" className="btn btn-success">
              <i className="ri-add-line align-bottom me-1"></i> Add New
            </Link>
          </div>
        </div>
        <div className="col-sm-3 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2">
            <div className="search-box ms-2 col-sm-7">
              <Input
                type="text"
                className="form-control"
                placeholder="Search..."
              />
              <i className="ri-search-line search-icon"></i>
            </div>

            <select
              className="form-control w-md"
              data-choices
              data-choices-search-false
            >
              <option value="All">All</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Year">Last Year</option>
              <option value="This Month">This Month</option>
              <option value="Today">Today</option>
              <option value="Yesterday" defaultValue>
                Yesterday
              </option>
            </select>
          </div>
        </div>
      </Row>

      <div className="row">
        {(projectListsData || []).map((item, index) => (
          <React.Fragment key={index}>
            
              <Col xxl={3} sm={6} className="project-card">
                <Card>
                  <CardBody>
                    <div
                      className={`p-3 mt-n3 mx-n3 bg-success-subtle rounded-top`}
                    >
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <h5 className="mb-0 fs-14">
                            <Link to={`/singleproject/${item._id}`} className="text-body">{item.projectName}</Link>
                          </h5>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="d-flex gap-1 align-items-center my-n2">
                            <button
                              type="button"
                              className={`btn avatar-xs mt-n1 p-0 favourite-btn shadow-none`}
                              onClick={(e) => activebtn(e)}
                            >
                              <span className="avatar-title bg-transparent fs-15">
                                <i className="ri-star-fill"></i>
                              </span>
                            </button>
                            <UncontrolledDropdown direction="start">
                              <DropdownToggle
                                tag="button"
                                className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                              >
                                <FeatherIcon
                                  icon="more-horizontal"
                                  className="icon-sm"
                                />
                              </DropdownToggle>

                              <DropdownMenu className="dropdown-menu-end">
                                <DropdownItem href="apps-projects-overview">
                                  <i className="ri-eye-fill align-bottom me-2 text-muted"></i>{" "}
                                  View
                                </DropdownItem>
                                <DropdownItem href="apps-projects-create">
                                  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
                                  Edit
                                </DropdownItem>
                                <div className="dropdown-divider"></div>
                                <DropdownItem
                                  href="#"
                                  onClick={() => onClickData(item)}
                                  data-bs-toggle="modal"
                                  data-bs-target="#removeProjectModal"
                                >
                                  <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                                  Remove
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-3">
                      <Row className="gy-3">
                        <Col xs={6}>
                          <div>
                            <p className="text-muted mb-1">Cost per unit</p>
                            <div>0</div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div>
                            <p className="text-muted mb-1">Total Hours</p>
                            <h5 className="fs-14">0</h5>
                          </div>
                        </Col>
                      </Row>

                      <div className="d-flex align-items-center mt-3">
                        <p className="text-muted mb-0 me-2">On Hand :</p>
                        <p className="mb-0 me-2">0</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
          </React.Fragment>
        ))}
      </div>
    </React.Fragment>
  );
};

export default List;
