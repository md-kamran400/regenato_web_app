// import React, { useState, useEffect, useCallback } from 'react';
// import {
//     Button,
//     Card,
//     CardBody,
//     CardHeader,
//     Col,
//     Row,
//     Modal,
//     ModalBody,
//     ModalFooter,
//     ModalHeader
// } from 'reactstrap';
// import Flatpickr from "react-flatpickr";

// const ManufacturingVariable = () => {
//     const [modalListOpen, setModalListOpen] = useState(false);
//     const [modal_delete, setModalDelete] = useState(false);
//     const [modal_edit, setModalEdit] = useState(false);
//     const [manufacturingData, setManufacturingData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null); // State for handling errors
//     const [posting, setPosting] = useState(false); // State to manage posting state
//     const [editId, setEditId] = useState(null); // State for tracking the ID of the item being edited
//     const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion

//     // Form state
//     const [formData, setFormData] = useState({
//         categoryId: '',
//         name: '',
//         hours: '',
//         hourlyrate: '',
//         totalrate: ''
//     });

//     // Toggles for modals
//     const toggleListModal = () => setModalListOpen(!modalListOpen);
//     const tog_delete = () => setModalDelete(!modal_delete);

//     // Function to toggle 'Edit' modal
//     const tog_edit = (item = null) => {
//         if (item) {
//             setFormData({
//                 categoryId: item.categoryId,
//                 name: item.name,
//                 hours: item.hours,
//                 hourlyrate: item.hourlyrate,
//                 totalrate: item.totalrate,
//             });
//             setEditId(item._id); // Set the ID of the item being edited
//         } else {
//             setFormData({
//                 categoryId: '',
//                 name: '',
//                 hours: '',
//                 hourlyrate: '',
//                 totalrate: '',
//             });
//             setEditId(null); // Reset the ID if no item is selected
//         }
//         setModalEdit(!modal_edit);
//     };
//     // Fetch data from API
//     const fetchManufacturingData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await fetch('http://localhost:4040/api/manufacturing');
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             const data = await response.json();
//             setManufacturingData(data);
//         } catch (error) {
//             console.error('Error fetching manufacturing data:', error);
//             setError(error.message || 'An error occurred');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Fetch data on component mount
//     useEffect(() => {
//         fetchManufacturingData();
//     }, [fetchManufacturingData]);

//     // Handle form input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData({ ...formData, [name]: value });
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setPosting(true);
//         setError(null);
//         try {
//             const response = await fetch('http://localhost:4040/api/manufacturing', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData), // Send the form data
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             await fetchManufacturingData();
//             setFormData({ categoryId: '', name: '', hours: '', hourlyrate: '', totalrate: '' });
//             toggleListModal(); // Close the modal
//         } catch (error) {
//             console.error('Error adding manufacturing data:', error);
//             setError(error.message || 'An error occurred while adding data');
//         } finally {
//             setPosting(false);
//         }
//     };

//         // Handle form submission for editing a variable (PUT request)
//         const handleEditSubmit = async (e) => {
//             e.preventDefault();
//             setPosting(true);
//             setError(null);
//             try {
//                 const response = await fetch(`http://localhost:4040/api/manufacturing/${editId}`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(formData), // Send the updated form data
//                 });
    
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 await fetchManufacturingData();
//                 setFormData({ categoryId: '', name: '', hours: '', hourlyrate: '', totalrate: '' });
//                 tog_edit(); // Close the edit modal
//             } catch (error) {
//                 setError(error.message); // Set error message
//             } finally {
//                 setPosting(false);
//             }
//         };

//         // Handle delete action
//         const handleDelete = async (_id) => {
//             setPosting(true);
//             setError(null);
//             try {
//                 const response = await fetch(`http://localhost:4040/api/manufacturing/${_id}`, {
//                     method: 'DELETE',
//                 });
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 await fetchManufacturingData(); // Refetch the data to update the table
//                 tog_delete(); // Close the modal
//             } catch (error) {
//                 setError(error.message);
//             } finally {
//                 setPosting(false);
//             }
//         };

//     // Render loading state or error if any
//     if (loading) {
//         return <div>Loading...</div>;
//     }

//     if (error) {
//         return <div>Error: {error}</div>;
//     }

//     // Calculate total rate based on fetched data
//     const totalRate = manufacturingData.reduce((total, item) => total + Number(item.totalrate), 0);

//     return (
//         <React.Fragment>
//             {/* Manufacturing Table */}
//             <Row>
//                 <Col lg={12}>
//                     <Card>
//                         <CardHeader>
//                             <h4 className="card-title mb-0">Manufacturing</h4>
//                         </CardHeader>
//                         <CardBody>
//                             <Row className="g-4 mb-3">
//                                 <Col className="col-sm-auto">
//                                     <div>
//                                         <Button
//                                             color="success"
//                                             className="add-btn me-1"
//                                             onClick={toggleListModal}
//                                         >
//                                             <i className="ri-add-line align-bottom me-1"></i> Add
//                                         </Button>
//                                         <Button className="btn btn-soft-danger">
//                                             <i className="ri-delete-bin-2-line"></i>
//                                         </Button>
//                                     </div>
//                                 </Col>
//                                 <Col className="col-sm">
//                                     <div className="d-flex justify-content-sm-end">
//                                         <div className="search-box ms-2">
//                                             <input type="text" className="form-control" placeholder="Search..." />
//                                             <i className="ri-search-line search-icon"></i>
//                                         </div>
//                                     </div>
//                                 </Col>
//                             </Row>

//                             {/* Display total cost */}
//                             <div className="d-flex align-items-center mt-3">
//                                 <p className="fw-bold mb-0 me-2">Total Cost:</p>
//                                 <p className="fw-bold mb-0 me-2">{totalRate.toFixed(2)}</p>
//                             </div>

//                             {/* Table */}
//                             <div className="table-responsive table-card mt-3 mb-1">
//                                 {loading ? (
//                                     <p>Loading...</p>
//                                 ) : (
//                                     <table className="table align-middle table-nowrap">
//                                         <thead className="table-light">
//                                             <tr>
//                                                 <th style={{ width: "50px" }}>
//                                                     <div className="form-check">
//                                                         <input className="form-check-input" type="checkbox" />
//                                                     </div>
//                                                 </th>
//                                                 <th>Id</th>
//                                                 <th>Name</th>
//                                                 <th>Hours (h)</th>
//                                                 <th>Hourly Rate (INR)</th>
//                                                 <th>Total Rate</th>
//                                                 <th>Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {manufacturingData.map((item) => (
//                                                 <tr key={item.id}>
//                                                     <td>
//                                                         <div className="form-check">
//                                                             <input className="form-check-input" type="checkbox" />
//                                                         </div>
//                                                     </td>
//                                                     <td>{item.categoryId}</td>
//                                                     <td>{item.name}</td>
//                                                     <td>{item.hours}</td>
//                                                     <td>{item.hourlyrate}</td>
//                                                     <td>{item.totalrate}</td>
//                                                     <td>
//                                                         <div className="d-flex gap-2">
//                                                         <button className="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-bs-target="#showModal" onClick={() => tog_edit(item)}>Edit</button>
//                                                         <button className="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={() => {
//                                                                     setSelectedId(item._id);
//                                                                     tog_delete();
//                                                                 }}>
//                                                                     Remove
//                                                                 </button>
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 )}
//                                 <div className="noresult" style={{ display: "none" }}>
//                                     <div className="text-center">
//                                         <lord-icon
//                                             src="https://cdn.lordicon.com/msoeawqm.json"
//                                             trigger="loop"
//                                             style={{ width: "75px", height: "75px" }}
//                                         ></lord-icon>
//                                         <h5 className="mt-2">Sorry! No Result Found</h5>
//                                         <p className="text-muted mb-0">We couldn't find any results for your search.</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </CardBody>
//                     </Card>
//                 </Col>
//             </Row>

//             {/* Edit modal */}
//             <Modal isOpen={modal_edit} toggle={tog_edit} centered>
//                                     <ModalHeader className="bg-light p-3" toggle={tog_edit}>
//                                         Edit Manufacturing Variable
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
//                                                 <label htmlFor="netweight" className="form-label">Hourly Rate</label>
//                                                 <input type="text" className="form-control" id="hourlyrate" name="hourlyrate" value={formData.hourlyrate} onChange={handleChange} />
//                                             </div>
//                                             <div className="mb-3">
//                                                 <label htmlFor="price" className="form-label">Hours</label>
//                                                 <input type="text" className="form-control" id="hours" name="hours" value={formData.hours} onChange={handleChange} />
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
//              </Modal>

//             {/* Add Modal */}
//             <Modal isOpen={modalListOpen} toggle={toggleListModal} centered>
//                 <ModalHeader className="bg-light p-3" toggle={toggleListModal}>
//                     Add Manufacturing Variable
//                 </ModalHeader>
//                 <ModalBody>
//                     <form className="tablelist-form" onSubmit={handleSubmit}>
//                         {/* Id */}
//                         <div className="mb-3">
//                             <label htmlFor="ID-field" className="form-label">ID</label>
//                             <input type="text" id="ID-field" className="form-control" placeholder="Enter ID" name="categoryId" value={formData.categoryId} onChange={handleChange} require />
//                         </div>

//                         {/* Name Field */}
//                         <div className="mb-3">
//                             <label htmlFor="name-field" className="form-label">Name</label>
//                             <input type="text" id="name-field" className="form-control" placeholder="Enter Name" name="name" value={formData.name} onChange={handleChange} require />
//                         </div>

//                         {/* Hours Field */}
//                         <div className="mb-3">
//                             <label htmlFor="hours-field" className="form-label">Hours (h)</label>
//                             <input type="number" id="hours-field" className="form-control" placeholder="Enter Hours" name="hours" value={formData.hours} onChange={handleChange} require />
//                         </div>

//                         {/* Hourly Rate Field */}
//                         <div className="mb-3">
//                             <label htmlFor="hourlyrate-field" className="form-label">Hourly Rate (INR)</label>
//                             <input type="number" id="hourlyrate-field" className="form-control" placeholder="Enter Hourly Rate" name="hourlyrate" value={formData.hourlyrate} onChange={handleChange} require />
//                         </div>

//                         {/* Total Rate Field (Read-only or calculated based on Hours and Hourly Rate) */}
//                         <div className="mb-3">
//                             <label htmlFor="totalrate-field" className="form-label">Total Rate (INR)</label>
//                             <input type="number" id="totalrate-field" className="form-control" placeholder="Total Rate" name="totalrate" value={formData.totalrate} onChange={handleChange} />
//                         </div>

//                         <ModalFooter>
//                             <Button color="secondary" onClick={toggleListModal} disabled={posting} > Cancel </Button> 
//                             <Button color="success" type="submit" disabled={posting} > {posting ? 'Adding...' : 'Add'} </Button>
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
// }

// export default ManufacturingVariable;


















import React, { useState, useEffect, useCallback } from 'react';
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
    ModalHeader
} from 'reactstrap';
import Flatpickr from "react-flatpickr";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const ManufacturingVariable = ({partDetails}) => {
    const [modal_add, setModalList] = useState(false);
    const [modal_edit, setModalEdit] = useState(false);
    const [modal_delete, setModalDelete] = useState(false);
    const [manufacturingData, setManufacturingData] = useState([]);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [manufacturingVariables, setmanufacturingVariables] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [SelectedManufacuturingVariable, setSelectedManufacuturingVariable] = useState(null);
    const [editId, setEditId] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        hours: '',
        hourlyRate: '',
        totalRate: ''
    });

    // Toggles for modals
    const tog_add = () => {
      // Generate the next ID based on the existing data
      let nextId = "C1";  // Default if there's no previous data
      if (manufacturingData.length > 0) {
          const lastId = manufacturingData[manufacturingData.length - 1].id;
          const lastNumber = parseInt(lastId.substring(1));  // Extract numeric part of the ID
          nextId = `C${lastNumber + 1}`;  // Increment the numeric part
      }
  
      // Set the formData with the new ID
      setFormData({
          id: nextId,
          name: '',
          hours: '',
          hourlyRate: '',
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
            hours: item.hours,
            hourlyRate: item.hourlyRate,
            totalRate: item.totalRate,
          });
          setEditId(item._id);
        } else {
          setFormData({
            id: "",
            name: "",
            hours: "",
            hourlyRate: "",
            totalRate: "",
          });
          setEditId(null);
        }
        setModalEdit(!modal_edit);
      };

    //   useEffect(() => {
        const fetchManufacturingData = useCallback(async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `http://localhost:4040/api/parts/${partDetails._id}/manufacturingVariables`
              );
              if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
              }
              const data = await response.json();
              setManufacturingData(data);
              console.log(data);
            } catch (error) {
              console.error("Error fetching manufacturingVariables data:", error);
            } finally {
              setLoading(false);
            }
          }, [partDetails?._id]); // Add partDetails._id as a dependency
        
          // Fetch data when partDetails changes
          useEffect(() => {
            if (partDetails && partDetails._id) {
              fetchManufacturingData();
            }
          }, [partDetails, fetchManufacturingData]);


      const totalRate = formData.hourlyRate * formData.hours;

      const handleAutocompleteChange = (event, newValue) => {
        setSelectedManufacuturingVariable(newValue);
        if (newValue) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            name: newValue.name,
            hourlyRate: newValue.hourlyrate,
            totalRate: newValue.hourlyrate * formData.hours,
          }));
        }
      };


      useEffect(() => {
        const fetchRmVariables = async () => {
          try {
            const response = await fetch(`http://localhost:4040/api/manufacturing`);
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            setmanufacturingVariables(data);
          } catch (error) {
            console.error("Error fetching RM variables:", error);
          }
        };
    
        fetchRmVariables();
      }, []);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
          totalRate:
            name === "hours"
              ? value * formData.hourlyRate
              : formData.hours * formData.hourlyRate,
        }));
      };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);
        setError(null);
        try {
          const response = await fetch(
            `http://localhost:4040/api/parts/${partDetails._id}/manufacturingVariables`,
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
            await fetchManufacturingData();
          } else {
            // Handle errors here
            throw new Error("Network response was not ok");
          }
    
          await fetchManufacturingData();
          setFormData({
            id: "",
            name: "",
            hours: 1,
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


        // Handle form submission for editing a variable (PUT request)
        const handleEditSubmit = async (e) => {
            e.preventDefault();
            setPosting(true);
            setError(null);
            try {
              const response = await fetch(
                `http://localhost:4040/api/parts/${partDetails._id}/manufacturingVariables/${editId}`,
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
                await fetchManufacturingData();
              } else {
                // Handle errors here
                throw new Error("Network response was not ok");
              }
        
              setFormData({
                id: "",
                name: "",
                hours: "",
                hourlyRate: "",
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
        const response = await fetch(`http://localhost:4040/api/parts/${partDetails._id}/manufacturingVariables/${_id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        await fetchManufacturingData(); // Refetch the data to update the table
        tog_delete(); // Close the modal
    } catch (error) {
        setError(error.message);
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

    // Calculate total rate based on fetched data
    const manufacturingtotalCount = manufacturingData.reduce((total, item) => total + Number(item.totalRate), 0);

    return (
        <React.Fragment>

                            <Row className="g-4 mb-3">
                                <Col className="col-sm-auto">
                                    <div>
                                        <Button
                                            color="success"
                                            className="add-btn me-1"
                                            onClick={tog_add}
                                        >
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
                                                <th>Hours (h)</th>
                                                <th>Hourly Rate (INR)</th>
                                                <th>Total Rate</th>
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
                                                    <td>{item.id}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.hours}</td>
                                                    <td>{item.hourlyRate}</td>
                                                    <td>{item.totalRate}</td>
                                                    <td>
                                                        <div className="d-flex gap-2">
                                                        <button className="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-bs-target="#showModal" onClick={() => tog_edit(item)}>Edit</button>
                                                        <button className="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={() => {
                                                                    setSelectedId(item._id);
                                                                    tog_delete();
                                                                }}>
                                                                    Remove
                                                                </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                <div className="noresult" style={{ display: "none" }}>
                                    <div className="text-center">
                                        <lord-icon src="https://cdn.lordicon.com/msoeawqm.json" trigger="loop"style={{ width: "75px", height: "75px" }} ></lord-icon>
                                        <h5 className="mt-2">Sorry! No Result Found</h5>
                                        <p className="text-muted mb-0">We couldn't find any results for your search.</p>
                                    </div>
                                </div>
                            </div>

      {/* Add modal */}
      <Modal isOpen={modal_add} toggle={tog_add}>
        <ModalHeader toggle={tog_add}>Add RM Variable</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">Category ID</label>
              <input  type="text"  className="form-control"  name="id"  value={formData.id}  onChange={handleChange}  required/>
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete options={manufacturingVariables}  getOptionLabel={(option) => option.name}  onChange={handleAutocompleteChange}  renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Material"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hours" className="form-label">Hours</label>
              <input  type="number"  className="form-control"  name="hours"  value={formData.hours}  onChange={handleChange}  required/>
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyRate" className="form-label">Hourly Rate</label>
              <input  type="number"  className="form-control"  name="hourlyRate"  value={formData.hourlyRate} onChange={handleChange}  required/>
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">
                Total Rate
              </label>
              <input  type="number"  className="form-control"  name="totalRate"  value={totalRate}  readOnly  required/>
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
        <ModalHeader toggle={tog_edit}>Edit Mwnufacturing</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="id" className="form-label">
                Category ID
              </label>
              <input  type="text"  className="form-control"  name="id"  value={formData.id}  onChange={handleChange}  required/>
            </div>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              {/* <Autocomplete
                options={manufacturingVariables}
                getOptionLabel={(option) => option.name}
                value={SelectedManufacuturingVariable}
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
              <label htmlFor="hours" className="form-label">Hours</label>
              <input type="number" className="form-control" name="hours" value={formData.hours} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyRate" className="form-label">Hourly Rate</label>
              <input  type="number"  className="form-control"  name="hourlyRate"  value={formData.hourlyRate}  onChange={handleChange}    required />
            </div>
            <div className="mb-3">
              <label htmlFor="totalRate" className="form-label">Total Rate</label>
              <input  type="number"  className="form-control"  name="totalRate"  value={totalRate}  readOnly  required/>
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>Update</Button>
              <Button type="button" color="secondary" onClick={tog_edit}>Cancel</Button>
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
            <lord-icon  src="https://cdn.lordicon.com/gsqxdxog.json"  trigger="loop"  colors="primary:#f7b84b,secondary:#f06548"  style={{ width: "100px", height: "100px" }}  ></lord-icon>
            <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
              <h4>Are you Sure?</h4>
              <p className="text-muted mx-4 mb-0">
                Are you sure you want to remove this record?
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button  color="danger"  onClick={() => handleDelete(selectedId)}  disabled={posting}  >
            {posting ? "Deleting..." : "Yes! Delete It"}
          </Button>
          <Button color="secondary" onClick={tog_delete} disabled={posting}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
        </React.Fragment>
    );
}

export default ManufacturingVariable;
