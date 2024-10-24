import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";

const ManufacturingVariable = () => {
    const [modalListOpen, setModalListOpen] = useState(false);
    const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [manufacturingData, setManufacturingData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Toggles for modals
    const toggleListModal = () => setModalListOpen(!modalListOpen);
    const toggleDeleteModal = () => setModalDeleteOpen(!modalDeleteOpen);

    // Fetch data from API on component mount
    useEffect(() => {
        const fetchManufacturingData = async () => {
            try {
                const response = await fetch('http://localhost:4040/api/manufacturing');
                const data = await response.json();
                setManufacturingData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching manufacturing data:', error);
                setLoading(false);
            }
        };

        fetchManufacturingData();
    }, []);

    // Calculate total rate based on fetched data
    // const totalRate = manufacturingData.reduce((total, item) => total + item.totalrate, 0);

    return (
        <React.Fragment>
            {/* Manufacturing Table */}
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">Manufacturing</h4>
                        </CardHeader>
                        <CardBody>
                            <Row className="g-4 mb-3">
                                <Col className="col-sm-auto">
                                    <div>
                                        <Button color="success" className="add-btn me-1" onClick={toggleListModal}>
                                            <i className="ri-add-line align-bottom me-1"></i> Add
                                        </Button>
                                        <Button className="btn btn-soft-danger">
                                            <i className="ri-delete-bin-2-line"></i>
                                        </Button>
                                    </div>
                                </Col>
                                <Col className="col-sm">
                                    <div className="d-flex justify-content-sm-end">
                                        <div className="search-box ms-2">
                                            <input type="text" className="form-control" placeholder="Search..." />
                                            <i className="ri-search-line search-icon"></i>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Display total cost */}
                            {/* <div className="d-flex align-items-center mt-3">
                                <p className="fw-bold mb-0 me-2">Total Cost:</p>
                                <p className="fw-bold mb-0 me-2">{totalRate.toFixed(2)}</p> 
                            </div> */}

                            {/* Table */}
                            <div className="table-responsive table-card mt-3 mb-1">
                                {loading ? (
                                    <p>Loading...</p>
                                ) : (
                                    <table className="table align-middle table-nowrap">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: "50px" }}>
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" />
                                                    </div>
                                                </th>
                                                <th>ID</th>
                                                <th>Name</th>
                                                {/* <th>Hours (h)</th> */}
                                                <th>Hourly Rate (INR)</th>
                                                {/* <th>Total Rate</th> */}
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {manufacturingData.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" />
                                                        </div>
                                                    </td>
                                                    <td>{item.categoryId}</td>
                                                    <td>{item.name}</td>
                                                    {/* <td>{item.hours}</td> */}
                                                    <td>{item.hourlyrate}</td>
                                                    {/* <td>{item.totalrate}</td> */}
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Button className="btn btn-sm btn-success" onClick={toggleListModal}>Edit</Button>
                                                            <Button className="btn btn-sm btn-danger" onClick={toggleDeleteModal}>Remove</Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                <div className="noresult" style={{ display: "none" }}>
                                    <div className="text-center">
                                        <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" style={{ width: "75px", height: "75px" }}></lord-icon>
                                        <h5 className="mt-2">Sorry! No Result Found</h5>
                                        <p className="text-muted mb-0">We couldn't find any results for your search.</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Add Modal */}
            <Modal isOpen={modalListOpen} toggle={toggleListModal} centered>
                <ModalHeader className="bg-light p-3" toggle={toggleListModal}> Add Customer </ModalHeader>
                <ModalBody>
                <form className="tablelist-form">
                    <ModalBody>
                        {/* Name Field */}
                        <div className="mb-3">
                            <label htmlFor="name-field" className="form-label">Name</label>
                            <input type="text" id="name-field" className="form-control" placeholder="Enter Name" required />
                        </div>

                        {/* Hours Field */}
                        <div className="mb-3">
                            <label htmlFor="hours-field" className="form-label">Hours (h)</label>
                            <input type="number" id="hours-field" className="form-control" placeholder="Enter Hours" required />
                        </div>

                        {/* Hourly Rate Field */}
                        <div className="mb-3">
                            <label htmlFor="hourlyrate-field" className="form-label">Hourly Rate (INR)</label>
                            <input type="number" id="hourlyrate-field" className="form-control" placeholder="Enter Hourly Rate" required />
                        </div>

                        {/* Total Rate Field (Read-only or calculated based on Hours and Hourly Rate) */}
                        <div className="mb-3">
                            <label htmlFor="totalrate-field" className="form-label">Total Rate (INR)</label>
                            <input type="number" id="totalrate-field" className="form-control" placeholder="Total Rate" readOnly />
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <Button color="danger" className="add-btn me-1" onClick={() => setModalListOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="success" className="add-btn me-1" type="submit">
                            Add
                        </Button>
                    </ModalFooter>
                </form>
                </ModalBody>
            </Modal>

            {/* Delete Modal */}
            <Modal isOpen={modalDeleteOpen} toggle={toggleDeleteModal} centered>
                <ModalBody>
                    <div className="text-center">
                        <lord-icon src="https://cdn.lordicon.com/gsqxdxog.json" trigger="loop" style={{ width: "100px", height: "100px" }}></lord-icon>
                        <h4>Are you sure?</h4>
                        <p className="text-muted">Do you really want to remove this record?</p>
                    </div>
                    <div className="d-flex justify-content-center mt-4">
                        <Button color="light" onClick={toggleDeleteModal}>Close</Button>
                        <Button color="danger">Yes, Delete It!</Button>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
}

export default ManufacturingVariable;
