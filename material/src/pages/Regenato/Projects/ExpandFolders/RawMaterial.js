// import React, { useState, useEffect, useCallback } from 'react';
// import "./Matarials.css";
// import { FaEdit } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import {
//   Button,
//   Card,
//   CardBody,
//   CardHeader,
//   Col,
//   Row,
//   Modal,
//   ModalBody,
//   ModalFooter,
//   ModalHeader,
// } from "reactstrap";

// const RawMaterial = ({ partName, rmVariables, projectId, partId }) => {
//   const [modal_edit, setModalEdit] = useState(false);
//   const [posting, setPosting] = useState(false);
//   const [error, setError] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [rawmatarialsData, setrawmatarialsData] = useState([]);
//   const [formData, setFormData] = useState({
//     name: "",
//     netWeight: "",
//     pricePerKg: "",
//     totalRate: "",
//   });

//   const tog_edit = (item = null) => {
//     if (item) {
//       setFormData({
//         name: item.name,
//         netWeight: item.netWeight,
//         pricePerKg: item.pricePerKg,
//         totalRate: item.totalRate,
//       });
//       setEditId(item._id);
//     } else {
//       setFormData({
//         name: "",
//         netWeight: "",
//         pricePerKg: "",
//         totalRate: "",
//       });
//       setEditId(null);
//     }
//     setModalEdit(!modal_edit);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: value,
//     }));
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setPosting(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/rmVariables/${editId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             name: formData.name,
//             netWeight: formData.netWeight,
//             pricePerKg: formData.pricePerKg,
//             totalRate: formData.totalRate,
//           }),
//         }
//       );

//       if (response.ok) {
//         const updatedData = await response.json();
//         setrawmatarialsData((prevData) =>
//           prevData.map((item) =>
//             item._id === editId ? updatedData : item
//           )
//         );
//         setFormData({
//           name: "",
//           netWeight: "",
//           pricePerKg: "",
//           totalRate: "",
//         });
//         setModalEdit(false);
//       } else {
//         const errorData = await response.json();
//         console.error("API Error:", errorData);
//         setError(errorData.message || "Something went wrong");
//       }
//     } catch (error) {
//       console.error("Edit Error:", error.message);
//       setError(error.message);
//     } finally {
//       setPosting(false);
//     }
//   };

//   return (
//     <div className="raw-material-container">
//       <h5 className="section-title">📦 Raw Materials for {partName}</h5>
//       <table
//         className="table align-middle table-nowrap"
//         striped
//         bordered
//         hover
//         size="sm"
//       >
//         <thead className="table-light">
//           <tr>
//             <th>Name</th>
//             <th>Net Weight</th>
//             <th>Price per Kg</th>
//             <th>Total Rate</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rmVariables.map((rm, index) => (
//             <tr key={index}>
//               <td>{rm.name}</td>
//               <td>{rm.netWeight}</td>
//               <td>{rm.pricePerKg}</td>
//               <td>{rm.totalRate}</td>
//               <div className="d-flex gap-2">
//                       <button
//                         className="btn btn-sm btn-success edit-item-btn"
//                         data-bs-toggle="modal"
//                         data-bs-target="#showModal"
//                         onClick={() => tog_edit(rm)}
//                       >
//                         Edit
//                       </button>
//                     </div>
//             </tr>
//           ))}
//         </tbody>
//       </table>


//                   {/* Edit modal */}
//       <Modal isOpen={modal_edit} toggle={tog_edit}>
//         <ModalHeader toggle={tog_edit}>
//           Edit Raw Matarials Variables
//         </ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleEditSubmit}>
//             <div className="mb-3">
//               <label htmlFor="name" className="form-label">
//                 Name
//               </label>
//               <input
//                 type="number "
//                 className="form-control"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="netWeight" className="form-label">
//                 Net Weight
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="netWeight"
//                 value={formData.netWeight}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="pricePerKg" className="form-label">
//                 Hourly Rate
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="pricePerKg"
//                 value={formData.pricePerKg}
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
//                 value={formData.totalRate}
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
//       </Modal>
//     </div>
//   );
// };

// export default RawMaterial;








import React, { useState, useEffect, useCallback } from 'react';
import "./Matarials.css";
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

const RawMaterial = ({ partName, rmVariables, projectId, partId }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [backupVariables, setBackupVariables] = useState([]);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [manufacturingData, setManufacturingData] = useState([]);
  const [updatedrmVariables, setUpdatedrmVariables] = useState(
    rmVariables.map(item => ({
      ...item,
      totalRate: item.totalRate || 0,
    }))
  );

  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        netWeight: item.netWeight,
        pricePerKg: item.pricePerKg,
        totalRate: item.totalRate,
      });
      setEditId(item._id);
    } else {
      setFormData({
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };
    // Form state
    const [formData, setFormData] = useState({
      name: "",
      netWeight: "",
      pricePerKg: "",
      totalRate: "",
    });


    // const fetchrmVariables = async () => {
    //   try {
    //     const response = await fetch(
    //       `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/rmVariables`,
    //       {
    //         method: "GET",
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       }
    //     );
        
    //     if (response.ok) {
    //       const data = await response.json();
    //       return data.map(item => ({
    //         ...item,
    //         totalRate: item.totalRate || 0,
    //       }));
    //     } else {
    //       throw new Error("Failed to fetch manufacturing variables");
    //     }
    //   } catch (error) {
    //     console.error("Error fetching manufacturing variables:", error);
    //     return [];
    //   }
    // };


    const fetchManufacturingData = useCallback(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/rmVariables`,
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setManufacturingData(data);
        console.log("Set manufacturing data:", data); // Add this line
      } catch (error) {
        console.error("Error fetching rmVariables data:", error);
      } finally {
        setLoading(false);
      }
    }, [partId?._id]);

    useEffect(() => {
      if (partId && partId._id) {
        fetchManufacturingData();
      }
    }, [partId, fetchManufacturingData]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
      // Calculate totalRate using the updated pricePerKg and netWeight
      updatedFormData.totalRate =
        (parseFloat(updatedFormData.pricePerKg) || 0) *
        (parseFloat(updatedFormData.netWeight) || 0);

      return updatedFormData;
    });
  };

  // Save changes
const handleEditSubmit = async (e) => {
  e.preventDefault();
  setPosting(true);
  setError(null);
  try {
    const response = await fetch(
      `${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/rmVariables/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          totalRate: formData.pricePerKg * formData.netWeight,
        }),
      }
    );
    
    if (response.ok) {
      // Fetch updated data after successful PUT request
      await fetchManufacturingData();
      // Reset form data
      setFormData({
        name: "",
        netWeight: "",
        pricePerKg: "",
        totalRate: "",
      });
      setModalEdit(false); // Close the edit modal
    } else {
      throw new Error("Network response was not ok");
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setPosting(false);
  }
};

  // Render editable cells

  return (
    <div className="manufacturing-container">
      <h5 className="section-title">🔧 Manufacturing Variables for {partName}</h5>
      <table className="table align-middle table-nowrap" striped bordered hover size="sm">
       <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>netWeight</th>
            <th>Hourly Rate</th>
            <th>Total Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rmVariables.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.netWeight}</td>
              <td>{item.pricePerKg}</td>
              <td>{item.totalRate}</td>
              <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success edit-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#showModal"
                        onClick={() => tog_edit(item)}
                      >
                        Edit
                      </button>
                      {/* <button
                        className="btn btn-sm btn-danger remove-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteRecordModal"
                        onClick={() => {
                          setSelectedId(item._id);
                          tog_delete();
                        }}
                      >
                        Remove
                      </button> */}
                    </div>
            </tr>
          ))}
        </tbody>
      </table>
            {/* Edit modal */}
      <Modal isOpen={modal_edit} toggle={tog_edit}>
        <ModalHeader toggle={tog_edit}>
          Edit Manufacturing Variables
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="number "
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="netWeight" className="form-label">
                netWeight
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
                Hourly Rate
              </label>
              <input
                type="number"
                className="form-control"
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
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
                value={formData.totalRate}
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
    </div>
  );
};

export default RawMaterial;