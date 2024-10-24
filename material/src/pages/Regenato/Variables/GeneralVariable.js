import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, CardBody, CardHeader, Col, Row, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import Flatpickr from "react-flatpickr";

const GeneralVariable = () => {
    const [modalListOpen, setModalListOpen] = useState(false);
    const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
    const [generalData, setGeneralData] = useState([]);
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [error, setError] = useState(null); // State for handling errors
    const [posting, setPosting] = useState(false); // State to manage posting state

    const [formData, setFormData] = useState({
        categoryId: '',
        name: '',
    });

    // Toggles for modals
    const toggleListModal = () => setModalListOpen(!modalListOpen);
    const toggleDeleteModal = () => setModalDeleteOpen(!modalDeleteOpen);

    // Fetch data from API on component mount
    // Fetch data from the API
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:4040/api/general');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setGeneralData(data); // Set the fetched data to state
        } catch (error) {
            setError(error.message); // Set error message
        } finally {
            setLoading(false); // Set loading to false once fetch is complete
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


        // Handle form submission
        const handleSubmit = async (e) => {
            e.preventDefault();
            setPosting(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:4040/api/general', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData), // Send the form data
                });
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
    
                // Option 1: Re-fetch the entire data
                await fetchData();
    
                // Option 2: If API returns the new item, append it
                // const newData = await response.json();
                // setRmtableData((prevData) => [...prevData, newData]);
    
                // Reset the form
                setFormData({ categoryId: '', name: '', });
                toggleListModal(); // Close the modal
            } catch (error) {
                setError(error.message); // Set error message
            } finally {
                setPosting(false);
            }
        };
    
        // Render loading state or error if any
        if (loading) {
            return <div>Loading...</div>;
        }
    
        if (error) {
            return <div>Error: {error}</div>;
        }

    return (
        <React.Fragment>
            {/* Manufacturing Table */}
            <Row>
                <Col lg={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">General Variable</h4>
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
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {generalData.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div className="form-check">
                                                            <input className="form-check-input" type="checkbox" />
                                                        </div>
                                                    </td>
                                                    <td>{item.categoryId}</td>
                                                    <td>{item.name}</td>
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
                <form className="tablelist-form" onSubmit={handleSubmit}>
                    <ModalBody>

                        {/* Hours Field */}
                        <div className="mb-3">
                            <label htmlFor="id-field" className="form-label">categoryId</label>
                            <input type="text" id="id-field" className="form-control" placeholder="Enter Category ID" name='categoryId' value={formData.categoryId} onChange={handleChange}  required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name-field" className="form-label">Name</label>
                            <input type="text" id="name-field" className="form-control" placeholder="Enter Name" name='name' value={formData.name} onChange={handleChange}  required />
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

export default GeneralVariable;

// export default GeneralVariable