import React, { useState, useEffect } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Container, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import { Link } from 'react-router-dom';
import Flatpickr from "react-flatpickr";

const OverheadsVariable = () => {
    const [modal_list, setmodal_list] = useState(false);
    const [modal_delete, setmodal_delete] = useState(false);
    const [overheadsData, setOverheadsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Toggles for modals
    const tog_list = () => setmodal_list(!modal_list);
    const tog_delete = () => setmodal_delete(!modal_delete);

    // Fetch data from the API
    useEffect(() => {
        const fetchOverheads = async () => {
            try {
                const response = await fetch('http://localhost:4040/api/overheadsAndProfit');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setOverheadsData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchOverheads();
    }, []);

    // Calculate total rate
    // const totalRate = overheadsData.reduce((total, item) => total + item.totalrate, 0);

    return (
        <React.Fragment>
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">Overheads and profits</h4>
                        </CardHeader>
                        <CardBody>
                            <div className="listjs-table" id="customerList">
                                <Row className="g-4 mb-3">
                                    <Col className="col-sm-auto">
                                        <div>
                                            <Button color="success" className="add-btn me-1" onClick={tog_list}>
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

                                {/* <div className="d-flex align-items-center mt-3">
                                    <p className="fw-bold mb-0 me-2">Total Cost :</p>
                                    <p className="fw-bold mb-0 me-2">{totalRate.toFixed(2)}</p> 
                                </div> */}
                                <div className="table-responsive table-card mt-3 mb-1">
                                    {loading ? (
                                        <p>Loading...</p>
                                    ) : error ? (
                                        <p>Error: {error}</p>
                                    ) : (
                                        <table className="table align-middle table-nowrap" id="customerTable">
                                            <thead className="table-light">
                                                <tr>
                                                    <th scope="col" style={{ width: "50px" }}>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" id="checkAll" value="option" />
                                                        </div>
                                                    </th>
                                                    <th className="sort" data-sort="customer_name">ID</th>
                                                    <th className="sort" data-sort="name">Name</th>
                                                    <th className="sort" data-sort="percentage">Percentage (%)</th>
                                                    {/* <th className="sort" data-sort="total-rate">Total Rate (INR)</th> */}
                                                    <th className="sort" data-sort="action">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="list form-check-all">
                                                {overheadsData.map((item) => (
                                                    <tr key={item._id}>
                                                        <th scope="row">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="checkbox" name="chk_child" value="option1" />
                                                            </div>
                                                        </th>
                                                        <td className="customer_name">{item.categoryId}</td>
                                                        <td className="customer_name">{item.name}</td>
                                                        <td className="customer_name">{item.percentage}</td>
                                                        {/* <td className="customer_name">{item.totalrate}</td> */}
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <div className="edit">
                                                                    <button className="btn btn-sm btn-success edit-item-btn" onClick={tog_list}>Edit</button>
                                                                </div>
                                                                <div className="remove">
                                                                    <button className="btn btn-sm btn-danger remove-item-btn" onClick={tog_delete}>Remove</button>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                    <div className="noresult" style={{ display: "none" }}>
                                        <div className="text-center">
                                            <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop" colors="primary:#121331,secondary:#08a88a" style={{ width: "75px", height: "75px" }}></lord-icon>
                                            <h5 className="mt-2">Sorry! No Result Found</h5>
                                            <p className="text-muted mb-0">We've searched more than 150+ Orders We did not find any orders for your search.</p>
                                        </div>
                                    </div>
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
            <Modal isOpen={modal_list} toggle={tog_list} centered>
                <ModalHeader className="bg-light p-3" toggle={tog_list}> Add Customer </ModalHeader>
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
            <Modal isOpen={modal_delete} toggle={tog_delete} centered>
                <div className="modal-header">
                    <Button type="button" onClick={tog_delete} className="btn-close" aria-label="Close"></Button>
                </div>
                <ModalBody>
                    <div className="text-center">
                        <lord-icon src="https://cdn.lordicon.com/wxnxqpvr.json" trigger="loop" colors="primary:#121331,secondary:#08a88a" style={{ width: "75px", height: "75px" }}></lord-icon>
                        <h4 className="mt-4">Are you sure you want to delete this item?</h4>
                        <p className="text-muted">You won't be able to revert this!</p>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="light" onClick={tog_delete}>Cancel</Button>
                    <Button color="danger" onClick={tog_delete}>Delete</Button>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
}

export default OverheadsVariable;
