// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     Button,
//     Card,
//     CardBody,
//     CardHeader,
//     Col,
//     Container,
//     ListGroup,
//     ListGroupItem,
// Modal,
// ModalBody,
// ModalFooter,
// ModalHeader,
//     Row,
// } from 'reactstrap';
// import { Link } from 'react-router-dom';

// const RmVariable = () => {
//     const [modal_list, setModalList] = useState(false);
//     const [modal_delete, setModalDelete] = useState(false);
//     const [modal_edit, setModalEdit] = useState(false);
//     const [RmtableData, setRmtableData] = useState([]); // State to hold fetched data
//     const [loading, setLoading] = useState(true); // State to manage loading state
//     const [error, setError] = useState(null); // State for handling errors
//     const [posting, setPosting] = useState(false); // State to manage posting state
//     const [editId, setEditId] = useState(null); // State for tracking the ID of the item being edited
//     const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion

// // Handle delete action
// const handleDelete = async (_id) => {
//     setPosting(true);
//     setError(null);
//     try {
//         const response = await fetch(`http://localhost:4040/api/rmvariable/${_id}`, {
//             method: 'DELETE',
//         });
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         await fetchData(); // Refetch the data to update the table
//         tog_delete(); // Close the modal
//     } catch (error) {
//         setError(error.message);
//     } finally {
//         setPosting(false);
//     }
// };

//     // Form state
//     const [formData, setFormData] = useState({
//         categoryId: '',
//         name: '',
//         netweight: '',
//         price: '',
//         totalrate: ''
//     });

//     // Function to toggle 'Add' modal
//     const tog_list = () => {
//         setModalList(!modal_list);
//     };

//     // Function to toggle 'Delete' modal
//     const tog_delete = () => {
//         setModalDelete(!modal_delete);
//     };

// // Function to toggle 'Edit' modal
// const tog_edit = (item = null) => {
//     if (item) {
//         setFormData({
//             categoryId: item.categoryId,
//             name: item.name,
//             netweight: item.netweight,
//             price: item.price,
//             totalrate: item.totalrate,
//         });
//         setEditId(item._id); // Set the ID of the item being edited
//     } else {
//         setFormData({
//             categoryId: '',
//             name: '',
//             netweight: '',
//             price: '',
//             totalrate: '',
//         });
//         setEditId(null); // Reset the ID if no item is selected
//     }
//     setModalEdit(!modal_edit);
// };

//     // Fetch data from the API
//     const fetchData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await fetch('http://localhost:4040/api/rmvariable');
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             const data = await response.json();
//             setRmtableData(data); // Set the fetched data to state
//         } catch (error) {
//             setError(error.message); // Set error message
//         } finally {
//             setLoading(false); // Set loading to false once fetch is complete
//         }
//     }, []);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     // Calculate the total of 'totalrate'
//     const totalRate = RmtableData.reduce((total, item) => total + item.totalrate, 0);

//     // Handle form input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     // Handle form submission for adding a new variable
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setPosting(true);
//         setError(null);
//         try {
//             const response = await fetch('http://localhost:4040/api/rmvariable', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData), // Send the form data
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             await fetchData();
//             setFormData({ categoryId: '', name: '', netweight: '', price: '', totalrate: '' });
//             tog_list(); // Close the modal
//         } catch (error) {
//             setError(error.message); // Set error message
//         } finally {
//             setPosting(false);
//         }
//     };

// // Handle form submission for editing a variable (PUT request)
// const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setPosting(true);
//     setError(null);
//     try {
//         const response = await fetch(`http://localhost:4040/api/rmvariable/${editId}`, {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(formData), // Send the updated form data
//         });

//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         await fetchData();
//         setFormData({ categoryId: '', name: '', netweight: '', price: '', totalrate: '' });
//         tog_edit(); // Close the edit modal
//     } catch (error) {
//         setError(error.message); // Set error message
//     } finally {
//         setPosting(false);
//     }
// };

//     // Render loading state or error if any
//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>Error: {error}</div>;
//     }

//     return (
//         <React.Fragment>
//             {/* General variable */}
//             <Row>
//                 <Col lg={12}>
//                     <Card>
//                         <CardHeader>
//                             <h4 className="card-title mb-0">RM Variables</h4>
//                         </CardHeader>
//                         <CardBody>
//                             <div className="listjs-table" id="customerList">
//                                 <Row className="g-4 mb-3">
//                                     <Col className="col-sm-auto">
//                                         <div>
// <Button color="success" className="add-btn me-1" onClick={tog_list} id="create-btn">
//     <i className="ri-add-line align-bottom me-1"></i> Add
// </Button>
//                                             <Button className="btn btn-soft-danger">
//                                                 <i className="ri-delete-bin-2-line"></i>
//                                             </Button>
//                                         </div>
//                                     </Col>
//                                     <Col className="col-sm">
//                                         <div className="d-flex justify-content-sm-end">
//                                             <div className="search-box ms-2">
//                                                 <input type="text" className="form-control search" placeholder="Search..." />
//                                                 <i className="ri-search-line search-icon"></i>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                 </Row>

//                                 {/* Display total cost */}
//                                 <div className="d-flex align-items-center mt-3">
//                                     <p className="fw-bold mb-0 me-2">Total Cost :</p>
//                                     <p className="fw-bold mb-0 me-2">{totalRate.toFixed(2)}</p>
//                                 </div>

//                                 <div className="table-responsive table-card mt-3 mb-1">
//                                     <table className="table align-middle table-nowrap" id="customerTable">
//                                         <thead className="table-light">
//                                             <tr>
//                                                 <th scope="col" style={{ width: '50px' }}>
//                                                     <div className="form-check">
//                                                         <input className="form-check-input" type="checkbox" id="checkAll" value="option" />
//                                                     </div>
//                                                 </th>
//                                                 <th className="sort" data-sort="id">Id</th>
//                                                 <th className="sort" data-sort="name">Name</th>
//                                                 <th className="sort" data-sort="net-weight">Net Weight (INR/Kg)</th>
//                                                 <th className="sort" data-sort="price">Price (INR/Kg)</th>
//                                                 <th className="sort" data-sort="total-rate">Total rate</th>
//                                                 <th className="sort" data-sort="action">Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="list form-check-all">
//                                             {RmtableData.map((item) => (
//                                                 <tr key={item.id}>
//                                                     <th scope="row">
//                                                         <div className="form-check">
//                                                             <input className="form-check-input" type="checkbox" name="chk_child" value="option1" />
//                                                         </div>
//                                                     </th>
//                                                     <td className="customer_name">{item.categoryId}</td>
//                                                     <td className="customer_name">{item.name}</td>
//                                                     <td className="customer_name">{item.netweight}</td>
//                                                     <td className="customer_name">{item.price}</td>
//                                                     <td className="customer_name">{item.totalrate}</td>
// <td>
//     <div className="d-flex gap-2">
//         <div className="edit">
//             <button className="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-bs-target="#showModal" onClick={() => tog_edit(item)}>Edit</button>
//         </div>
//         <div className="remove">
// <button className="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={() => {
//     setSelectedId(item._id);
//     tog_delete();
// }}>
//     Remove
// </button>
//         </div>
//     </div>
// </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 {/* Edit modal */}
//                                 <Modal isOpen={modal_edit} toggle={tog_edit} centered>
//                                     <ModalHeader className="bg-light p-3" toggle={tog_edit}>
//                                         Edit RM Variable
//                                     </ModalHeader>
//                                     <form onSubmit={handleEditSubmit}>
//                                         <ModalBody>
//                                             <div className="mb-3">
//                                                 <label htmlFor="categoryId" className="form-label">Category ID</label>
//                                                 <input type="text" className="form-control" id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} />
//                                             </div>
//                                             <div className="mb-3">
//                                                 <label htmlFor="name" className="form-label">Name</label>
//                                                 <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} />
//                                             </div>
//                                             <div className="mb-3">
//                                                 <label htmlFor="netweight" className="form-label">Net Weight</label>
//                                                 <input type="text" className="form-control" id="netweight" name="netweight" value={formData.netweight} onChange={handleChange} />
//                                             </div>
//                                             <div className="mb-3">
//                                                 <label htmlFor="price" className="form-label">Price</label>
//                                                 <input type="text" className="form-control" id="price" name="price" value={formData.price} onChange={handleChange} />
//                                             </div>
//                                             <div className="mb-3">
//                                                 <label htmlFor="totalrate" className="form-label">Total Rate</label>
//                                                 <input type="text" className="form-control" id="totalrate" name="totalrate" value={formData.totalrate} onChange={handleChange} />
//                                             </div>
//                                         </ModalBody>
//                                         <ModalFooter>
//                                             <Button color="primary" type="submit" disabled={posting}>
//                                                 {posting ? 'Saving...' : 'Save'}
//                                             </Button>
//                                             <Button color="secondary" onClick={tog_edit} disabled={posting}>Cancel</Button>
//                                         </ModalFooter>
//                                     </form>
//                                 </Modal>
//                             </div>
//                         </CardBody>
//                     </Card>
//                 </Col>
//             </Row>

//                         {/* Modal for adding new variables */}
//              <Modal isOpen={modal_list} toggle={tog_list}>
//                 <ModalHeader toggle={tog_list}>Add RM Variable</ModalHeader>
//                 <ModalBody>
//                     <form onSubmit={handleSubmit}>
//                         <div className="mb-3">
//                             <label htmlFor="categoryId" className="form-label">Category ID</label>
//                             <input type="text" className="form-control" name="categoryId" value={formData.categoryId} onChange={handleChange} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="name" className="form-label">Name</label>
//                             <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="netweight" className="form-label">Net Weight</label>
//                             <input type="number" className="form-control" name="netweight" value={formData.netweight} onChange={handleChange} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="price" className="form-label">Price</label>
//                             <input type="number" className="form-control" name="price" value={formData.price} onChange={handleChange} required />
//                         </div>
//                         <div className="mb-3">
//                             <label htmlFor="totalrate" className="form-label">Total Rate</label>
//                             <input type="number" className="form-control" name="totalrate" value={formData.totalrate} onChange={handleChange} required />
//                         </div>
//                         <ModalFooter>
//                             <Button type="submit" color="success" disabled={posting}>
//                                 {posting ? 'Adding...' : 'Add Variable'}
//                             </Button>
//                             <Button color="secondary" onClick={tog_list} disabled={posting}>Cancel</Button>
//                         </ModalFooter>
//                     </form>
//                 </ModalBody>
//             </Modal>

//             {/* Delete modal */}
//             <Modal isOpen={modal_delete} toggle={tog_delete} centered>
//                 <ModalHeader className="bg-light p-3" toggle={tog_delete}>Delete Record</ModalHeader>
//                 <ModalBody>
//                 <div className="mt-2 text-center">
//                         <lord-icon
//                             src="https://cdn.lordicon.com/gsqxdxog.json"
//                             trigger="loop"
//                             colors="primary:#f7b84b,secondary:#f06548"
//                             style={{ width: '100px', height: '100px' }}
//                         ></lord-icon>
//                         <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
//                             <h4>Are you Sure?</h4>
//                             <p className="text-muted mx-4 mb-0">
//                                 Are you sure you want to remove this record?
//                             </p>
//                         </div>
//                     </div>
//                 </ModalBody>
//                 <ModalFooter>
//                     <Button color="danger" onClick={() => handleDelete(selectedId)} disabled={posting}>
//                         {posting ? 'Deleting...' : 'Yes! Delete It'}
//                     </Button>
//                     <Button color="secondary" onClick={tog_delete} disabled={posting}>Cancel</Button>
//                 </ModalFooter>
//             </Modal>
//         </React.Fragment>
//     );
// };

// export default RmVariable;

import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const RmVariable = ({ partDetails }) => {
  const [modal_add, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [RmtableData, setRmtableData] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rmVariables, setRmVariables] = useState([]);
  const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion
  const [selectedRmVariable, setSelectedRmVariable] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    netWeight: 1, // Default to 1
    pricePerKg: "",
    totalRate: "",
  });

  const tog_add = () => {
    // Generate the next ID based on the existing data
    let nextId = "B1";  // Default if there's no previous data
    if (RmtableData.length > 0) {
        const lastId = RmtableData[RmtableData.length - 1].id;
        const lastNumber = parseInt(lastId.substring(1));  // Extract numeric part of the ID
        nextId = `B${lastNumber + 1}`;  // Increment the numeric part
    }

    // Set the formData with the new ID
    setFormData({
        id: nextId,
        name: '',
        netWeight: '',
        pricePerKg: '',
        totalRate: '',
    });

    setModalList(!modal_add);  // Open the modal
};

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        id: item.id,
        name: item.name,
        netWeight: item.netWeight,
        pricePerKg: item.pricePerKg,
        totalRate: item.totalRate,
      });
      setEditId(item._id);
    } else {
      setFormData({
        id: "",
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      totalRate:
        name === "netWeight"
          ? value * formData.pricePerKg
          : formData.netWeight * formData.pricePerKg,
    }));
  };

  // useEffect(() => {
    const fetchRmData = useCallback(async () => {
      try {
        const response = await fetch(
          `http://localhost:4040/api/parts/${partDetails._id}/rmVariables`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setRmtableData(data);
      } catch (error) {
        console.error("Error fetching RM data:", error);
      }
    
  }, [partDetails?._id])


  useEffect(() => {
    if (partDetails && partDetails._id) {
      fetchRmData();
    }
  }, [partDetails, fetchRmData]);

  useEffect(() => {
    const fetchRmVariables = async () => {
      try {
        const response = await fetch(`http://localhost:4040/api/rmvariable`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setRmVariables(data);
      } catch (error) {
        console.error("Error fetching RM variables:", error);
      }
    };

    fetchRmVariables();
  }, []);

  const totalRate = formData.pricePerKg * formData.netWeight;

  const handleAutocompleteChange = (event, newValue) => {
    setSelectedRmVariable(newValue);
    if (newValue) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: newValue.name,
        pricePerKg: newValue.price,
        totalRate: newValue.price * formData.netWeight,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/parts/${partDetails._id}/rmVariables`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      // Check if the request was successful
      if (response.ok) {
        // Refresh the page after successful POST request
        await fetchRmData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      await fetchRmData();
      setFormData({
        id: "",
        name: "",
        netWeight: 1,
        pricePerKg: "",
        totalRate: "",
      });
      tog_add();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4040/api/parts/${partDetails._id}/rmVariables/${editId}`,
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
        await fetchRmData();
      } else {
        // Handle errors here
        throw new Error("Network response was not ok");
      }

      setFormData({
        id: "",
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      tog_edit();
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  // Handle delete action
  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
        const response = await fetch(`http://localhost:4040/api/parts/${partDetails._id}/rmVariables/${_id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        await fetchRmData(); // Refetch the data to update the table
        tog_delete(); // Close the modal
    } catch (error) {
        setError(error.message);
    } finally {
        setPosting(false);
    }
};

const countTotalRate = RmtableData.reduce((total, item) => total + Number(item.totalRate), 0);

  return (
    <React.Fragment>
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">RM Variables</h4>
            </CardHeader>
            <CardBody>
              <Col className="col-sm-auto">
                <div>
                  <Button
                    onClick={tog_add}
                    color="success"
                    className="add-btn me-1"
                    id="create-btn"
                  >
                    <i className="ri-add-line align-bottom me-1"></i> Add
                  </Button>
                </div>
              </Col>

              {/* Display total cost */}
              <div className="d-flex align-items-center mt-3">
              <p className="fw-bold mb-0 me-2">Total Cost:</p>
              <p className="fw-bold mb-0 me-2">{countTotalRate.toFixed(2)}</p>
              </div>
              <div className="table-responsive table-card mt-3 mb-1">
                <table className="table align-middle table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Id</th>
                      <th>Name</th>
                      <th>Net Weight (Kg)</th>
                      <th>Price (INR/Kg)</th>
                      <th>Total rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RmtableData.map((item) => (
                      <tr key={item._id}>
                        <td>{item.id}</td>
                        <td>{item.name}</td>
                        <td>{item.netWeight}</td>
                        <td>{item.pricePerKg}</td>
                        <td>{item.totalRate}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              className="btn btn-sm btn-success"
                              onClick={() => tog_edit(item)}
                            >
                              Edit
                            </Button>
                            <button
                              className="btn btn-sm btn-danger remove-item-btn"
                              data-bs-toggle="modal"
                              data-bs-target="#deleteRecordModal"
                              onClick={() => {
                                setSelectedId(item._id);
                                tog_delete();
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>


      {/* Add modal */}
      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add RM Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={rmVariables}
                getOptionLabel={(option) => option.name}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Material"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                Net Weight
              </label>
              <input
                type="number"
                className="form-control"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price
              </label>
              <input
                type="number"
                className="form-control"
                name="pricePerKg"
                value={formData.pricePerKg}
                // readOnly
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="totalRate"
                value={totalRate}
                readOnly
                required
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Add
              </Button>
              <Button type="button" color="secondary" onClick={tog_add}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

       {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>Edit RM Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Category ID
              </label>
              <input
                type="text"
                className="form-control"
                name="id"
                value={formData.id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              {/* <Autocomplete
                options={rmVariables}
                getOptionLabel={(option) => option.name}
                value={selectedRmVariable}
                onChange={handleAutocompleteChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Material"
                    variant="outlined"
                  />
                )}
              /> */}
              <input type='number ' className='form-control' id="name" name="name" value={formData.name} onChange={handleChange}/>
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                Net Weight
              </label>
              <input
                type="number"
                className="form-control"
                name="netWeight"
                value={formData.netWeight}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="pricePerKg" className="form-label">
                Price
              </label>
              <input
                type="number"
                className="form-control"
                name="pricePerKg"
                value={formData.pricePerKg}
                readOnly
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="totalRate"
                value={totalRate}
                readOnly
                required
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Update
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* Delete modal */}
      <Modal isOpen={modal_delete} toggle={tog_delete} centered>
        <ModalHeader className="bg-light p-3" toggle={tog_delete}>
          Delete Record
        </ModalHeader>
        <ModalBody>
          <div className="mt-2 text-center">
            <lord-icon
              src="https://cdn.lordicon.com/gsqxdxog.json"
              trigger="loop"
              colors="primary:#f7b84b,secondary:#f06548"
              style={{ width: "100px", height: "100px" }}
            ></lord-icon>
            <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
              <h4>Are you Sure?</h4>
              <p className="text-muted mx-4 mb-0">
                Are you sure you want to remove this record?
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            onClick={() => handleDelete(selectedId)}
            disabled={posting}
          >
            {posting ? "Deleting..." : "Yes! Delete It"}
          </Button>
          <Button color="secondary" onClick={tog_delete} disabled={posting}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default RmVariable;
