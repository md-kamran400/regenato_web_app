// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { Card, CardBody, Col, DropdownItem, Button, DropdownMenu, DropdownToggle, Input, Row, UncontrolledDropdown, Modal, ModalBody, ModalHeader } from 'reactstrap';
// import DeleteModal from "../../../Components/Common/DeleteModal";
// import { ToastContainer } from 'react-toastify';
// import { useSelector, useDispatch } from 'react-redux';
// import FeatherIcon from "feather-icons-react";
// import { getProjectList as onGetProjectList } from "../../../slices/thunks";
// import { createSelector } from 'reselect';

// const List = () => {
//     const dispatch = useDispatch();
//     const [modal_list, setmodal_list] = useState(false);
//     const [newPartName, setNewPartName] = useState('');  // For storing new part name
//     const [projectLists, setProjectLists] = useState([]); // Local state to store project list

//     function tog_list() {
//         setmodal_list(!modal_list);
//     }

//     const selectDashboardData = createSelector(
//         (state) => state.Projects,
//         (projectLists) => projectLists.projectLists
//     );

//     const reduxProjectLists = useSelector(selectDashboardData);

//     useEffect(() => {
//         dispatch(onGetProjectList());
//     }, [dispatch]);

//     useEffect(() => {
//         setProjectLists(reduxProjectLists);
//     }, [reduxProjectLists]);

//     // Handle adding a new part
//     const handleAddPart = () => {
//         if (newPartName.trim() !== '') {
//             const newPart = {
//                 label: newPartName,
//                 cardHeaderClass: "primary", // You can change this to any default class
//                 isDesign1: true,
//                 status: 0,      // Default cost per unit
//                 deadline: 0,    // Default total hours
//                 subItem: 0,     // Default on-hand value
//                 ratingClass: "" // Default empty rating
//             };

//             setProjectLists([...projectLists, newPart]);  // Add the new part to the project list
//             setNewPartName('');  // Reset the input field
//             setmodal_list(false); // Close the modal
//         }
//     };

//     // Handle removing a part
//     const handleRemovePart = (indexToRemove) => {
//         const updatedParts = projectLists.filter((_, index) => index !== indexToRemove);
//         setProjectLists(updatedParts);  // Update the project list with the part removed
//     };

//     const activebtn = (ele) => {
//         if (ele.closest("button").classList.contains("active")) {
//             ele.closest("button").classList.remove("active");
//         } else {
//             ele.closest("button").classList.add("active");
//         }
//     };

//     return (
//         <React.Fragment>
//             <ToastContainer closeButton={false} />
//             <DeleteModal
//                 show={false}
//                 onDeleteClick={() => {}}
//                 onCloseClick={() => {}}
//             />

//             <Row className="g-4 mb-3">
//                 <div className="col-sm-auto">
//                     <div>
//                         <Button color="success" className="add-btn me-1" onClick={tog_list} id="create-btn">
//                             <i className="ri-add-line align-bottom me-1"></i> Add Part
//                         </Button>
//                     </div>
//                 </div>
//                 <div className="col-sm-3 ms-auto">
//                     <div className="d-flex justify-content-sm-end gap-2">
//                         <div className="search-box ms-2 col-sm-7">
//                             <Input type="text" className="form-control" placeholder="Search..." />
//                             <i className="ri-search-line search-icon"></i>
//                         </div>
//                     </div>
//                 </div>
//             </Row>

//             <div className="row">
//                 {(projectLists || []).map((item, index) => (
//                     item.isDesign1 && (
//                         <Col xxl={3} sm={6} key={index} className="project-card">
//                             <Card>
//                                 <CardBody>
//                                     <div className={`p-3 mt-n3 mx-n3 bg-${item.cardHeaderClass}-subtle rounded-top`}>
//                                         <div className="d-flex align-items-center">
//                                             <div className="flex-grow-1">
//                                                 <h5 className="mb-0 fs-14"><Link to="/singlepart" className="text-body">{item.label}</Link></h5>
//                                             </div>
//                                             <div className="flex-shrink-0">
//                                                 <div className="d-flex gap-1 align-items-center my-n2">
//                                                     <button type="button" className={`btn avatar-xs mt-n1 p-0 favourite-btn shadow-none ${item.ratingClass}`} onClick={(e) => activebtn(e.target)}>
//                                                         <span className="avatar-title bg-transparent fs-15">
//                                                             <i className="ri-star-fill"></i>
//                                                         </span>
//                                                     </button>
//                                                     <UncontrolledDropdown direction='start'>
//                                                         <DropdownToggle tag="button" className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none">
//                                                             <FeatherIcon icon="more-horizontal" className="icon-sm" />
//                                                         </DropdownToggle>

//                                                         <DropdownMenu className="dropdown-menu-end">
//                                                             <DropdownItem href="apps-projects-overview"><i className="ri-eye-fill align-bottom me-2 text-muted"></i> View</DropdownItem>
//                                                             <DropdownItem href="apps-projects-create"><i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit</DropdownItem>
//                                                             <div className="dropdown-divider"></div>
//                                                             <DropdownItem href="#" onClick={() => handleRemovePart(index)}><i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Remove</DropdownItem>  {/* Remove part */}
//                                                         </DropdownMenu>
//                                                     </UncontrolledDropdown>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="py-3">
//                                         <Row className="gy-3">
//                                             <Col xs={6}>
//                                                 <div>
//                                                     <p className="text-muted mb-1">Cost per unit</p>
//                                                     <div>0</div>
//                                                 </div>
//                                             </Col>
//                                             <Col xs={6}>
//                                                 <div>
//                                                     <p className="text-muted mb-1">Total Hours</p>
//                                                     <h5 className="fs-14">0</h5>
//                                                 </div>
//                                             </Col>
//                                         </Row>

//                                         <div className="d-flex align-items-center mt-3">
//                                             <p className="text-muted mb-0 me-2">On Hand :</p>
//                                             <p className="mb-0 me-2">0</p>
//                                         </div>
//                                     </div>
//                                 </CardBody>
//                             </Card>
//                         </Col>
//                     )
//                 ))}
//             </div>

//             {/* Modal for adding a new item */}
//             <Modal isOpen={modal_list} toggle={() => { tog_list(); }} centered>
//                 <ModalHeader className="bg-light p-3" toggle={() => { tog_list(); }}> Add Part </ModalHeader>
//                 <form>
//                     <ModalBody>
//                         <div className="mb-3">
//                             <label htmlFor="parts-field" className="form-label">Parts Name</label>
//                             <input
//                                 type="text"
//                                 id="parts-field"
//                                 className="form-control"
//                                 placeholder="Enter Name"
//                                 value={newPartName}
//                                 onChange={(e) => setNewPartName(e.target.value)}
//                                 required
//                             />
//                         </div>

//                         <Button color="success" className="add-btn me-1" onClick={handleAddPart}>
//                             <i className="ri-add-line align-bottom me-1"></i> Add
//                         </Button>
//                     </ModalBody>
//                 </form>
//             </Modal>
//         </React.Fragment>
//     );
// };

// export default List;








import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, DropdownItem, Button, DropdownMenu, DropdownToggle, Input, Row, UncontrolledDropdown, Modal, ModalBody, ModalHeader } from 'reactstrap';
import DeleteModal from "../../../Components/Common/DeleteModal";
import { ToastContainer, toast } from 'react-toastify';
import FeatherIcon from 'feather-icons-react/build/FeatherIcon';

const List = () => {
    const [modal_list, setModalList] = useState(false);
    const [newPartName, setNewPartName] = useState(''); // For storing new part name
    const [listData, setListData] = useState([]); // Local state to store project list
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State for handling errors

    const toggleModal = () => {
        setModalList(!modal_list);
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:4040/api/parts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setListData(data); // Set the fetched data to state
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
        if (newPartName.trim() !== '') {
            const newPart = {
                partName: newPartName,
                costPerUnit: 0,
                totalHours: 0,
                onHand: 0
            };

            try {
                const response = await fetch('http://localhost:4040/api/parts', {
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
                setListData((prevData) => [...prevData, addedPart]); 
                toast.success('Part added successfully!');
            } catch (error) {
                toast.error(`Error: ${error.message}`);
            } finally {
                setNewPartName(''); // Reset the input field
                toggleModal(); // Close the modal
            }
        }
    };

    // Handle removing a part
    const handleRemovePart = (indexToRemove) => {
        const updatedParts = listData.filter((_, index) => index !== indexToRemove);
        setListData(updatedParts); // Update the project list with the part removed
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
                show={false}
                onDeleteClick={() => {}}
                onCloseClick={() => {}}
            />

            <Row className="g-4 mb-3">
                <div className="col-sm-auto">
                    <div>
                        <Button color="success" className="add-btn me-1" onClick={toggleModal} id="create-btn">
                            <i className="ri-add-line align-bottom me-1"></i> Add Part
                        </Button>
                    </div>
                </div>
                <div className="col-sm-3 ms-auto">
                    <div className="d-flex justify-content-sm-end gap-2">
                        <div className="search-box ms-2 col-sm-7">
                            <Input type="text" className="form-control" placeholder="Search..." />
                            <i className="ri-search-line search-icon"></i>
                        </div>
                    </div>
                </div>
            </Row>

            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}

            <div className="row">
                {listData.map((item, index) => (
                    <Col xxl={3} sm={6} key={index} className="project-card">
                        <Card>
                            <CardBody>
                                <div className={`p-3 mt-n3 mx-n3 bg-danger-subtle rounded-top`}>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-grow-1">
                                            <h5 className="mb-0 fs-14">
                                                <Link to={`/singlepart/${item._id}`} className="text-body">{item.partName}</Link>
                                            </h5>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="d-flex gap-1 align-items-center my-n2">
                                                <button type="button" className={`btn avatar-xs mt-n1 p-0 favourite-btn shadow-none `} onClick={(e) => activebtn(e.target)}>
                                                    <span className="avatar-title bg-transparent fs-15">
                                                        <i className="ri-star-fill"></i>
                                                    </span>
                                                </button>
                                                <UncontrolledDropdown direction='start'>
                                                    <DropdownToggle tag="button" className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none">
                                                        <FeatherIcon icon="more-horizontal" className="icon-sm" />
                                                    </DropdownToggle>

                                                    <DropdownMenu className="dropdown-menu-end">
                                                        <DropdownItem href="apps-projects-overview"><i className="ri-eye-fill align-bottom me-2 text-muted"></i> View</DropdownItem>
                                                        <DropdownItem href="apps-projects-create"><i className="ri-pencil-fill align-bottom me-2 text-muted"></i> Edit</DropdownItem>
                                                        <div className="dropdown-divider"></div>
                                                        <DropdownItem href="#" onClick={() => handleRemovePart(index)}><i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i> Remove</DropdownItem>
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
                                value={newPartName}
                                onChange={(e) => setNewPartName(e.target.value)}
                                required
                            />
                        </div>

                        <Button type="submit" color="success" className="add-btn me-1">
                            <i className="ri-add-line align-bottom me-1"></i> Add
                        </Button>
                    </ModalBody>
                </form>
            </Modal>
        </React.Fragment>
    );
};

export default List;
