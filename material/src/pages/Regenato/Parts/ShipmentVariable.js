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
//     ModalHeader,
// } from 'reactstrap';
// import { Link } from 'react-router-dom';

// const ShipmentVariable = () => {
//     const [modalListOpen, setModalListOpen] = useState(false);
//     const [modal_delete, setModalDelete] = useState(false);
//     const [modal_edit, setModalEdit] = useState(false);
//     const [shipmentData, setShipmentData] = useState([]); // State to hold fetched data
//     const [loading, setLoading] = useState(true); // State to manage loading state
//     const [error, setError] = useState(null); // State for handling errors
//     const [posting, setPosting] = useState(false); // State to manage posting state
//     const [editId, setEditId] = useState(null); // State for tracking the ID of the item being edited
//     const [selectedId, setSelectedId] = useState(null); // To track the selected RM variable for deletion
//     // Form state
//     const [formData, setFormData] = useState({
//         categoryId: '',
//         name: '',
//         hourlyrate: '',
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
//     const fetchShipmentData = useCallback(async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const response = await fetch('http://localhost:4040/api/shipment');
//             if (!response.ok) {
//                 throw new Error('Failed to fetch shipment data');
//             }
//             const data = await response.json();
//             setShipmentData(data); // Update state with fetched data
//         } catch (error) {
//             console.error('Error fetching shipment data:', error);
//             setError(error.message || 'An error occurred while fetching data');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     // Fetch data on component mount
//     useEffect(() => {
//         fetchShipmentData();
//     }, [fetchShipmentData]);

//     // Handle form input changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;

//         // Ensure that hourlyrate is treated as a number
//         if (name === 'hourlyrate') {
//             // Allow only numbers and at most two decimal places
//             const regex = /^\d*\.?\d{0,2}$/;
//             if (value === '' || regex.test(value)) {
//                 setFormData({ ...formData, [name]: value });
//             }
//         } else {
//             setFormData({ ...formData, [name]: value });
//         }
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setPosting(true);
//         setError(null);
//         try {
//             const response = await fetch('http://localhost:4040/api/shipment', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData), // Send the form data
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to add shipment data');
//             }

//             // Option 1: Re-fetch the entire data
//             await fetchShipmentData();

//             // Option 2: If API returns the new item, append it
//             // const newData = await response.json();
//             // setShipmentData((prevData) => [...prevData, newData]);

//             // Reset the form
//             setFormData({ categoryId: '', name: '', hourlyrate: '' });
//             toggleListModal(); // Close the modal
//         } catch (error) {
//             console.error('Error adding shipment data:', error);
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
//                 const response = await fetch(`http://localhost:4040/api/shipment/${editId}`, {
//                     method: 'PUT',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify(formData), // Send the updated form data
//                 });
    
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 await fetchShipmentData();
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
//                 const response = await fetch(`http://localhost:4040/api/shipment/${_id}`, {
//                     method: 'DELETE',
//                 });
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 await fetchShipmentData(); // Refetch the data to update the table
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
//         return <div className="alert alert-danger">Error: {error}</div>;
//     }

//     // Calculate total cost
//     const totalCost = shipmentData.reduce((total, item) => total + Number(item.hourlyrate || 0), 0);

//     return (
//         <React.Fragment>
//             {/* General Variable */}
//             <Row>
//                 <Col lg={12}>
//                     <Card>
//                         <CardHeader>
//                             <h4 className="card-title mb-0">Shipment Variables</h4>
//                         </CardHeader>
//                         <CardBody>
//                             <div className="listjs-table" id="customerList">
//                                 <Row className="g-4 mb-3">
//                                     <Col className="col-sm-auto">
//                                         <div>
//                                             <Button
//                                                 color="success"
//                                                 className="add-btn me-1"
//                                                 onClick={toggleListModal}
//                                                 id="create-btn"
//                                             >
//                                                 <i className="ri-add-line align-bottom me-1"></i> Add
//                                             </Button>
//                                             <Button className="btn btn-soft-danger">
//                                                 <i className="ri-delete-bin-2-line"></i>
//                                             </Button>
//                                         </div>
//                                     </Col>
//                                     <Col className="col-sm">
//                                         <div className="d-flex justify-content-sm-end">
//                                             <div className="search-box ms-2">
//                                                 <input
//                                                     type="text"
//                                                     className="form-control search"
//                                                     placeholder="Search..."
//                                                 />
//                                                 <i className="ri-search-line search-icon"></i>
//                                             </div>
//                                         </div>
//                                     </Col>
//                                 </Row>

//                                 {/* Display total cost */}
//                                 <div className="d-flex align-items-center mt-3">
//                                     <p className="fw-bold mb-0 me-2">Total Cost:</p>
//                                     <p className="fw-bold mb-0 me-2">{totalCost.toFixed(2)}</p>
//                                 </div>

//                                 {/* Table */}
//                                 <div className="table-responsive table-card mt-3 mb-1">
//                                     <table className="table align-middle table-nowrap" id="customerTable">
//                                         <thead className="table-light">
//                                             <tr>
//                                                 <th scope="col" style={{ width: '50px' }}>
//                                                     <div className="form-check">
//                                                         <input
//                                                             className="form-check-input"
//                                                             type="checkbox"
//                                                             id="checkAll"
//                                                             value="option"
//                                                         />
//                                                     </div>
//                                                 </th>
//                                                 <th>ID</th>
//                                                 <th>Name</th>
//                                                 <th>Hourly Rate (INR)</th>
//                                                 <th>Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="list form-check-all">
//                                             {shipmentData.length > 0 ? (
//                                                 shipmentData.map((item) => (
//                                                     <tr key={item.id}>
//                                                         <th scope="row">
//                                                             <div className="form-check">
//                                                                 <input
//                                                                     className="form-check-input"
//                                                                     type="checkbox"
//                                                                     name="chk_child"
//                                                                     value="option1"
//                                                                 />
//                                                             </div>
//                                                         </th>
//                                                         <td>{item.categoryId}</td>
//                                                         <td>{item.name}</td>
//                                                         <td>{Number(item.hourlyrate).toFixed(2)}</td>
//                                                         <td>
//                                                         <div className="d-flex gap-2">
//                                                         <button className="btn btn-sm btn-success edit-item-btn" data-bs-toggle="modal" data-bs-target="#showModal" onClick={() => tog_edit(item)}>Edit</button>
//                                                         <button className="btn btn-sm btn-danger remove-item-btn" data-bs-toggle="modal" data-bs-target="#deleteRecordModal" onClick={() => {
//                                                                     setSelectedId(item._id);
//                                                                     tog_delete();
//                                                                 }}>
//                                                                     Remove
//                                                                 </button>
//                                                         </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))
//                                             ) : (
//                                                 <tr>
//                                                     <td colSpan="5" className="text-center">
//                                                         No Shipment Variables Found
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 {/* Pagination (Placeholder) */}
//                                 <div className="d-flex justify-content-end">
//                                     <div className="pagination-wrap hstack gap-2">
//                                         <Link className="page-item pagination-prev disabled" to="#">
//                                             Previous
//                                         </Link>
//                                         <ul className="pagination listjs-pagination mb-0"></ul>
//                                         <Link className="page-item pagination-next" to="#">
//                                             Next
//                                         </Link>
//                                     </div>
//                                 </div>
//                             </div>
//                         </CardBody>
//                     </Card>
//                 </Col>
//             </Row>

//             {/* Add Modal */}
//              {/* <Modal isOpen={modalListOpen} toggle={toggleListModal} centered>
//                 <ModalHeader className="bg-light p-3" toggle={toggleListModal}>
//                     {formData.categoryId ? 'Edit Shipment Variable' : 'Add Shipment Variable'}
//                 </ModalHeader>
//                 <ModalBody>
//                     <form className="tablelist-form" onSubmit={handleSubmit}>
                      
//                         <div className="mb-3">
//                             <label htmlFor="id-field" className="form-label">
//                                 ID
//                             </label>
//                             <input type="text" id="id-field" className="form-control" name="categoryId" placeholder="Enter Category ID" value={formData.categoryId} onChange={handleChange} require />
//                         </div>

//                         <div className="mb-3">
//                             <label htmlFor="name-field" className="form-label">
//                                 Name
//                             </label>
//                             <input type="text" id="name-field" className="form-control" name="name" placeholder="Enter Name" value={formData.name} onChange={handleChange} require />
//                         </div>

//                         <div className="mb-3">
//                             <label htmlFor="hourlyrate-field" className="form-label">
//                                 Hourly Rate (INR)
//                             </label>
//                             <input type="number" id="hourlyrate-field" className="form-control" name="hourlyrate" placeholder="Enter Hourly Rate" value={formData.hourlyrate} onChange={handleChange} require />
//                         </div>

//                         <ModalFooter>
//                             <Button color="secondary" onClick={toggleListModal} disabled={posting}>
//                                 Cancel
//                             </Button>
//                             <Button color="success" type="submit" disabled={posting}>
//                                 {posting ? 'Adding...' : 'Add Variable'}
//                             </Button>
//                         </ModalFooter>
//                     </form>
//                 </ModalBody>
//             </Modal>  */}

//             {/* Edit modal */}
//             {/* <Modal isOpen={modal_edit} toggle={tog_edit} centered>
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

//                                         </ModalBody>
//                                         <ModalFooter>
//                                             <Button color="primary" type="submit" disabled={posting}>
//                                                 {posting ? 'Saving...' : 'Save'}
//                                             </Button>
//                                             <Button color="secondary" onClick={tog_edit} disabled={posting}>Cancel</Button>
//                                         </ModalFooter>
//                                     </form>
//             </Modal> */}

//             {/* Delete modal */}
//             {/* <Modal isOpen={modal_delete} toggle={tog_delete} centered>
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
//             </Modal> */}



//                   {/* Add modal */}
//       {/* <Modal isOpen={modal_add} toggle={tog_add}>
//         <ModalHeader toggle={tog_add}>Add RM Variable</ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//               <label htmlFor="id" className="form-label">
//                 Category ID
//               </label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="id"
//                 value={formData.id}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="name" className="form-label">
//                 Name
//               </label>
//               <Autocomplete
//                 options={manufacturingVariables}
//                 getOptionLabel={(option) => option.name}
//                 onChange={handleAutocompleteChange}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     label="Select Material"
//                     variant="outlined"
//                   />
//                 )}
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="hours" className="form-label">
//                 Hours
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="hours"
//                 value={formData.hours}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="hourlyRate" className="form-label">
//                 Hourly Rate
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="hourlyRate"
//                 value={formData.hourlyRate}
//                 // readOnly
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="totalRate" className="form-label">
//                 Total Rate
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="totalRate"
//                 value={totalRate}
//                 readOnly
//                 required
//               />
//             </div>
//             <ModalFooter>
//               <Button type="submit" color="primary" disabled={posting}>
//                 Add
//               </Button>
//               <Button type="button" color="secondary" onClick={tog_add}>
//                 Cancel
//               </Button>
//             </ModalFooter>
//           </form>
//         </ModalBody>
//       </Modal>  */}

//        {/* Edit modal */}
//       {/* <Modal isOpen={modal_edit} toggle={tog_edit}>
//         <ModalHeader toggle={tog_edit}>Edit Mwnufacturing</ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleEditSubmit}>
//             <div className="mb-3">
//               <label htmlFor="id" className="form-label">
//                 Category ID
//               </label>
//               <input
//                 type="text"
//                 className="form-control"
//                 name="id"
//                 value={formData.id}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="name" className="form-label">
//                 Name
//               </label>
//               <Autocomplete
//                 options={manufacturingVariables}
//                 getOptionLabel={(option) => option.name}
//                 value={SelectedManufacuturingVariable}
//                 onChange={handleAutocompleteChange}
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     label="Select Material"
//                     variant="outlined"
//                   />
//                 )}
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="hours" className="form-label">
//                 Hours
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="hours"
//                 value={formData.hours}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="hourlyRate" className="form-label">
//               Hourly Rate
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="hourlyRate"
//                 value={formData.hourlyRate}
//                 onChange={handleChange}
//                 // readOnly
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="totalRate" className="form-label">
//                 Total Rate
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="totalRate"
//                 value={totalRate}
//                 readOnly
//                 required
//               />
//             </div>
//             <ModalFooter>
//               <Button type="submit" color="primary" disabled={posting}>
//                 Update
//               </Button>
//               <Button type="button" color="secondary" onClick={tog_edit}>
//                 Cancel
//               </Button>
//             </ModalFooter>
//           </form>
//         </ModalBody>
//       </Modal> */}

//       {/* Delete modal */}
//       {/* <Modal isOpen={modal_delete} toggle={tog_delete} centered>
//         <ModalHeader className="bg-light p-3" toggle={tog_delete}>
//           Delete Record
//         </ModalHeader>
//         <ModalBody>
//           <div className="mt-2 text-center">
//             <lord-icon
//               src="https://cdn.lordicon.com/gsqxdxog.json"
//               trigger="loop"
//               colors="primary:#f7b84b,secondary:#f06548"
//               style={{ width: "100px", height: "100px" }}
//             ></lord-icon>
//             <div className="mt-4 pt-2 fs-15 mx-4 mx-sm-5">
//               <h4>Are you Sure?</h4>
//               <p className="text-muted mx-4 mb-0">
//                 Are you sure you want to remove this record?
//               </p>
//             </div>
//           </div>
//         </ModalBody>
//         <ModalFooter>
//           <Button
//             color="danger"
//             onClick={() => handleDelete(selectedId)}
//             disabled={posting}
//           >
//             {posting ? "Deleting..." : "Yes! Delete It"}
//           </Button>
//           <Button color="secondary" onClick={tog_delete} disabled={posting}>
//             Cancel
//           </Button>
//         </ModalFooter>
//       </Modal> */}
//         </React.Fragment>
//     );

// };

// export default ShipmentVariable;














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
    ModalHeader,
} from 'reactstrap';
import { Link } from 'react-router-dom';
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const ShipmentVariable = ({partDetails}) => {
    const [modal_add, setModalList] = useState(false);
    const [modal_edit, setModalEdit] = useState(false);
    const [modal_delete, setModalDelete] = useState(false);
    const [shipmentData, setShipmentData] = useState([]);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shipmentvars, setshipmentvars] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedShipment, setselectedShipment] = useState(null);
    const [editId, setEditId] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        hourlyRate: '',
    });

    // Toggles for modals
    const tog_add = () => {
      // Generate the next ID based on the existing data
      let nextId = "E1";  // Default if there's no previous data
      if (shipmentData.length > 0) {
          const lastId = shipmentData[shipmentData.length - 1].id;
          const lastNumber = parseInt(lastId.substring(1));  // Extract numeric part of the ID
          nextId = `E${lastNumber + 1}`;  // Increment the numeric part
      }
  
      // Set the formData with the new ID
      setFormData({
          id: nextId,
          name: '',
          hourlyRate: '',
      });
  
      setModalList(!modal_add);  // Open the modal
  };
    
      // Function to toggle 'Delete' modal
      const tog_delete = () => {
        setModalDelete(!modal_delete);
      };

    // Function to toggle 'Edit' modal
    const tog_edit = (item = null) => {
        if (item) {
            setFormData({
                id: item.id,
                name: item.name,
                hourlyRate: item.hourlyRate,
            });
            setEditId(item._id); // Set the ID of the item being edited
        } else {
            setFormData({
                id: '',
                name: '',
                hourlyRate: '',
            });
            setEditId(null); // Reset the ID if no item is selected
        }
        setModalEdit(!modal_edit);
    };



    const fetchShipmentData = useCallback(async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `http://localhost:4040/api/parts/${partDetails._id}/shipmentVariables`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setShipmentData(data);
          console.log(data);
        } catch (error) {
          console.error("Error fetching shipment data:", error);
        } finally {
          setLoading(false);
        }
      }, [partDetails?._id]); // Add partDetails._id as a dependency
    
      // Fetch data when partDetails changes
      useEffect(() => {
        if (partDetails && partDetails._id) {
          fetchShipmentData();
        }
      }, [partDetails, fetchShipmentData]);


    //   fetch snipment variable 
    useEffect(() => {
        const fetchShipment = async () => {
          try {
            const response = await fetch(`http://localhost:4040/api/shipment`);
            if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            setshipmentvars(data);
          } catch (error) {
            console.error("Error fetching RM variables:", error);
          }
        };
    
        fetchShipment();
      }, []);

      const handleAutocompleteChange = (event, newValue) => {
        setselectedShipment(newValue);
        if (newValue) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            name: newValue.name,
          }));
        }
      };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setPosting(true);
        setError(null);
        try {
          const response = await fetch(
            `http://localhost:4040/api/parts/${partDetails._id}/shipmentVariables`,
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
            await fetchShipmentData();
          } else {
            // Handle errors here
            throw new Error("Network response was not ok");
          }
    
          await fetchShipmentData();
          setFormData({
            id: "",
            name: "",
            hourlyRate: "",
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
                `http://localhost:4040/api/parts/${partDetails._id}/shipmentVariables/${editId}`,
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
                await fetchShipmentData();
              } else {
                // Handle errors here
                throw new Error("Network response was not ok");
              }
        
              setFormData({
                id: "",
                name: "",
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
        const response = await fetch(`http://localhost:4040/api/parts/${partDetails._id}/shipmentVariables/${_id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        await fetchShipmentData(); // Refetch the data to update the table
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
        return <div className="alert alert-danger">Error: {error}</div>;
    }

    // Calculate total cost
    const ShipmentTotalCost = shipmentData.reduce((total, item) => total + Number(item.hourlyRate || 0), 0);

    return (
        <React.Fragment>
            
            {/* <Row>
                <Col lg={12}>
                    <Card>
                        <CardHeader>
                            <h4 className="card-title mb-0">Shipment Variables</h4>
                        </CardHeader>
                        <CardBody> */}
                           
                                <Row className="g-4 mb-3">
                                    <Col className="col-sm-auto">
                                        <div>
                                            <Button
                                                color="success"
                                                className="add-btn me-1"
                                                onClick={tog_add}
                                                id="create-btn"
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
                                                <input
                                                    type="text"
                                                    className="form-control search"
                                                    placeholder="Search..."
                                                />
                                                <i className="ri-search-line search-icon"></i>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>



                                {/* Table */}
                                <div className="table-responsive table-card mt-3 mb-1">
                                    <table className="table align-middle table-nowrap" id="customerTable">
                                        <thead className="table-light">
                                            <tr>
                                                <th scope="col" style={{ width: '50px' }}>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="checkAll"
                                                            value="option"
                                                        />
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
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    name="chk_child"
                                                                    value="option1"
                                                                />
                                                            </div>
                                                        </th>
                                                        <td>{item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.hourlyRate}</td>
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
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        No Shipment Variables Found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                
                        {/* </CardBody>
                    </Card>
                </Col>
            </Row> */}

            {/* Add Modal */}
             <Modal isOpen={modal_add} toggle={tog_add} centered>
                <ModalHeader className="bg-light p-3" toggle={tog_add}>
                    {formData.id ? 'Edit Shipment Variable' : 'Add Shipment Variable'}
                </ModalHeader>
                <ModalBody>
                    <form className="tablelist-form" onSubmit={handleSubmit}>
                      
                        <div className="mb-3">
                            <label htmlFor="id-field" className="form-label">
                                ID
                            </label>
                            <input type="text" id="id-field" className="form-control" name="id" placeholder="Enter Category ID" value={formData.id} onChange={handleChange} require />
                        </div>

                        <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <Autocomplete
                options={shipmentvars}
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
                            <label htmlFor="hourlyRate-field" className="form-label">
                                Hourly Rate (INR)
                            </label>
                            <input type="number" id="hourlyRate-field" className="form-control" name="hourlyRate" placeholder="Enter Hourly Rate" value={formData.hourlyRate} onChange={handleChange} require />
                        </div>

                        <ModalFooter>
                            <Button color="secondary" onClick={tog_add} disabled={posting}>
                                Cancel
                            </Button>
                            <Button color="success" type="submit" disabled={posting}>
                                {posting ? 'Adding...' : 'Add Variable'}
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
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hourlyRate" className="form-label">
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
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

export default ShipmentVariable;
