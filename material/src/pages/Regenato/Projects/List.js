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
// import { ToastContainer } from "react-toastify";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  ModalFooter ,
  Row,
  UncontrolledDropdown,
  Modal, ModalBody, ModalHeader,Button
} from "reactstrap";
import FeatherIcon from "feather-icons-react";
import { ToastContainer, toast } from 'react-toastify';


// component import
import DeleteModal from "../../../Components/Common/DeleteModal";



const List = () => {
  const [modal_list, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [modal_category, setModal_category] = useState(false);
  const [projectListsData, setprojectListsData] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [newprojectName, setNewprojectName] = useState(''); // For storing new part name
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [timePerUnit, setTimePerUnit] = useState(0);
  const [stockPOQty, setStockPOQty] = useState(0);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null); // State for handling errors
  const [formData, setFormData] = useState({
    projectName: "",
    costPerUnit: "",
    timePerUnit: "",
    stockPOQty: "",
  });
  const toggleModal = () => {
    setModalList(!modal_list);
};

const toggleEditModal = (item = null) => {
  if (item) {
      // Pre-fill the modal with data from the selected item
      setFormData({
        projectName: item.projectName,
        costPerUnit: item.costPerUnit,
        timePerUnit: item.timePerUnit,
        stockPOQty: item.stockPOQty
      });
      setEditId(item._id); // Save the ID for the PUT request
  } else {
      // Clear form data if no item is selected
      setFormData({
        projectName: "",
        costPerUnit: 0,
        timePerUnit: 0,
        stockPOQty: 0
      });
      setEditId(null);
  }
  setModalEdit(!modal_edit);
};



const toggleModalCategory = () => {
  setModal_category(!modal_category);
};
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


    // Handle adding a new part
    const handleAddPart = async () => {
      if (newprojectName.trim() !== '') {
          const newPart = {
              projectName: newprojectName,
              costPerUnit: 0,
              timePerUnit: 0,
              stockPoQty: 0
          };

          try {
              const response = await fetch('http://localhost:4040/api/projects', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(newPart), // Send new part data
              });

              if (!response.ok) {
                  throw new Error('Failed to add the part');
              }

              const addedPart = await response.json();

              // Update the list with the new part from the server
              setprojectListsData((prevData) => [...prevData, addedPart]); 
              toast.success('Part added successfully!');
          } catch (error) {
              toast.error(`Error: ${error.message}`);
          } finally {
              setNewprojectName(''); // Reset the input field
              toggleModal(); // Close the modal
          }
      }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/projects/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      //   if (!response.ok) {
      //     throw new Error("Network response was not ok");
      //   }

      // Check if the request was successful
      if (response.ok) {
        // Refresh the page after successful POST request
        await fetchData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      setFormData({
        projectName: "",
        costPerUnit: "",
        timePerUnit: "",
        stockPOQty: "",
      });
      toggleEditModal();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };


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
            {/* <Link className="btn btn-success">
              <i className="ri-add-line align-bottom me-1"></i> Add New
            </Link> */}
            <Button className="btn btn-success" onClick={toggleModal}>
               <i className="ri-add-line align-bottom me-1"></i> Add New 
            </Button>


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
                              <DropdownItem onClick={() => toggleEditModal(item)}>
  <i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit
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
                                                <div>{item.costPerUnit}</div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div>
                                                <p className="text-muted mb-1">Total Hours</p>
                                                <h5 className="fs-14">{item.timePerUnit}</h5>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="d-flex align-items-center mt-3">
                                        <p className="text-muted mb-0 me-2">On Hand :</p>
                                        <p className="mb-0 me-2">{item.stockPOQty}</p>
                                    </div>
                                </div>
                  </CardBody>
                </Card>
              </Col>
          </React.Fragment>
        ))}
      </div>

            {/* Modal for adding a new item */}
            <Modal isOpen={modal_list} toggle={toggleModal} centered>
                <ModalHeader className="bg-light p-3" toggle={toggleModal}> Add Part </ModalHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleAddPart(); }}>
                    <ModalBody>
                        <div className="mb-3">
                            <label htmlFor="parts-field" className="form-label">Parts Name</label>
                            <input
                                type="text"
                                id="parts-field"
                                className="form-control"
                                placeholder="Enter Name"
                                value={newprojectName}
                                onChange={(e) => setNewprojectName(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" color="success" className="add-btn me-1">
                            <i className="ri-add-line align-bottom me-1"></i> Add
                        </Button>
                    </ModalBody>
                </form>
            </Modal>

             {/* Edit Modal */}
              <Modal isOpen={modal_edit} toggle={toggleEditModal}>
                <ModalHeader toggle={toggleEditModal}>Edit Part</ModalHeader>
                <ModalBody>
                    <form onSubmit={handleEditSubmit}>
                        <div className="mb-3">
                            <label htmlFor="projectName" className="form-label">Name</label>
                            <Input
                                type="text"
                                id="projectName"
                                value={formData.projectName}
                                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="costPerUnit" className="form-label">Cost Per Unit</label>
                            <Input
                                type="number"
                                id="costPerUnit"
                                value={formData.costPerUnit}
                                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="timePerUnit" className="form-label">Total Hours</label>
                            <Input
                                type="number"
                                id="timePerUnit"
                                value={formData.timePerUnit}
                                onChange={(e) => setFormData({ ...formData, timePerUnit: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="stockPOQty" className="form-label">On Hand</label>
                            <Input
                                type="number"
                                id="stockPOQty"
                                value={formData.stockPOQty}
                                onChange={(e) => setFormData({ ...formData, stockPOQty: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <ModalFooter>
                 <Button type="submit" color="primary" disabled={posting}>
                Update
                </Button>
                <Button type="button" color="secondary" onClick={toggleEditModal}>
                Cancel
               </Button>
            </ModalFooter>
                    </form>
                </ModalBody>
            </Modal>


    </React.Fragment>
  );
};

export default List;
