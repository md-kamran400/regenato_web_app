import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader, Container } from 'reactstrap';
import Flatpickr from "react-flatpickr";
import { Link } from 'react-router-dom';

const ShipmentVariable = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [modal_delete, setmodal_delete] = useState(false);
    const [shipmentData, setShipmentData] = useState([]); // State to hold fetched data

    // Toggle for Add Modal
    function tog_list() {
        setmodal_list(!modal_list);
    }

    // Toggle for Delete Modal
    function tog_delete() {
        setmodal_delete(!modal_delete);
    }

    // Fetch data from API
    useEffect(() => {
        const fetchShipmentData = async () => {
            try {
                const response = await fetch('http://localhost:4040/api/shipment');
                const data = await response.json();
                setShipmentData(data); // Update state with fetched data
            } catch (error) {
                console.error('Error fetching shipment data:', error);
            }
        };

        fetchShipmentData();
    }, []);

    // Calculate total cost
    // const totalCost = shipmentData.reduce((total, item) => total + item.hourlyrate, 0);

    return (
        <React.Fragment>
            {/* General Variable */}
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">Shipment Variables</h4>
                        </CardHeader>
                        <CardBody>
                            <div className="listjs-table" id="customerList">
                                <Row className="g-4 mb-3">
                                    <Col className="col-sm-auto">
                                        <div>
                                            <Button color="success" className="add-btn me-1" onClick={tog_list} id="create-btn">
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
                                                <input type="text" className="form-control search" placeholder="Search..." />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Display total cost */}
                                {/* <div className="d-flex align-items-center mt-3">
                                    <p className="fw-bold mb-0 me-2">Total Cost:</p>
                                    <p className="fw-bold mb-0 me-2">{totalCost.toFixed(2)}</p>
                                </div> */}

                                <div className="table-responsive table-card mt-3 mb-1">
                                    <table className="table align-middle table-nowrap" id="customerTable">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col" style={{ width: "50px" }}>
                                                    <div className="form-check">
                                                        <input className="form-check-input" type="checkbox" id="checkAll" value="option" />
                                                    </div>
                                                </th>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Hourly Rate (INR)</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="list form-check-all">
                                            {shipmentData.length > 0 ? (
                                                shipmentData.map((item) => (
                                                    <tr key={item.id}>
                                                        <th scope="row">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="checkbox" name="chk_child" value="option1" />
                                                            </div>
                                                        </th>
                                                        <td>{item.categoryId}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.hourlyrate}</td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <div className="edit">
                                                                    <button className="btn btn-sm btn-success edit-item-btn">Edit</button>
                                                                </div>
                                                                <div className="remove">
                                                                    <button className="btn btn-sm btn-danger remove-item-btn">Remove</button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">Loading...</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-end">
                                    <div className="pagination-wrap hstack gap-2">
                                        <Link className="page-item pagination-prev disabled" to="#">
                                            Previous
                                        </Link>
                                        <ul className="pagination listjs-pagination mb-0"></ul>
                                        <Link className="page-item pagination-next" to="#">
                                            Next
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            {/* Add modal */}
            <Modal isOpen={modal_list} toggle={() => { tog_list(); }} centered >
                <ModalHeader className="bg-light p-3" toggle={() => { tog_list(); }}> Add Customer </ModalHeader>
                <form className="tablelist-form">
                    <ModalBody>
                        <div className="mb-3" id="modal-id" style={{ display: "none" }}>
                            <label htmlFor="id-field" className="form-label">ID</label>
                            <input type="text" id="id-field" className="form-control" placeholder="ID" readOnly />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="customername-field" className="form-label">Customer Name</label>
                            <input type="text" id="customername-field" className="form-control" placeholder="Enter Name" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email-field" className="form-label">Email</label>
                            <input type="email" id="email-field" className="form-control" placeholder="Enter Email" required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="phone-field" className="form-label">Phone</label>
                            <input type="text" id="phone-field" className="form-control" placeholder="Enter Phone no." required />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="date-field" className="form-label">Joining Date</label>
                            <Flatpickr
                                className="form-control"
                                options={{
                                    dateFormat: "d M, Y"
                                }}
                                placeholder="Select Date"
                            />
                        </div>

                        <div>
                            <label htmlFor="status-field" className="form-label">Status</label>
                            <select className="form-control" data-trigger name="status-field" id="status-field" >
                                <option value="">Status</option>
                                <option value="Active">Active</option>
                                <option value="Block">Block</option>
                            </select>
                        </div>
                    </ModalBody>

                </form>
            </Modal>

            {/* Remove Modal */}
            <Modal isOpen={modal_delete} toggle={() => { tog_delete(); }} className="modal fade zoomIn" id="deleteRecordModal" centered >
                <div className="modal-header">
                    <Button type="button" onClick={() => setmodal_delete(false)} className="btn-close" aria-label="Close"> </Button>
                </div>
                <ModalBody>
                    <div className="mt-2 text-center">
                        <lord-icon src="https://cdn.lordicon.com/gsqxdxog.json" trigger="loop"
                            colors="primary:#f7b84b,secondary:#f06548" style={{ width: "100px", height: "100px" }}></lord-icon>
                        <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
                            <h4>Are you Sure ?</h4>
                            <p className="text-muted mx-4 mb-0">Are you Sure You want to Remove this Record ?</p>
                        </div>
                    </div>
                    <div className="d-flex gap-2 justify-content-center mt-4 mb-2">
                        <button type="button" className="btn w-sm btn-light" onClick={() => setmodal_delete(false)}>Close</button>
                        <button type="button" className="btn w-sm btn-danger " id="delete-record">Yes, Delete It!</button>
                    </div>
                </ModalBody>
            </Modal>
        </React.Fragment>
    );
};

export default ShipmentVariable;


