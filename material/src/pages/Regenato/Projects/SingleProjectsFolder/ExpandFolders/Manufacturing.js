// import React, { useState, useEffect, useCallback } from "react";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import "./Matarials.css";
// import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

// const Manufacturing = ({
//   partName,
//   times,
//   manufacturingVariables,
//   projectId,
//   partId,
//   itemId,
//   source,
//   manufatcuringUpdate,
//   onUpdatePrts,
//   quantity,
// }) => {
//   const [modal_edit, setModalEdit] = useState(false);
//   const [modal_delete, setModalDelete] = useState(false);
//   const [posting, setPosting] = useState(false);
//   const [error, setError] = useState(null);
//   const [editId, setEditId] = useState(null);
//   const [deleteId, setDeleteId] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     hours: "",
//     hourlyRate: "",
//     totalRate: "",
//   });

//   const [updatedManufacturingVariables, setUpdatedManufacturingVariables] =
//     useState(
//       manufacturingVariables.map((item) => ({
//         ...item,
//         totalRate: item.totalRate || 0,
//       }))
//     );

//   // Sync with new manufacturing variables
//   useEffect(() => {
//     setUpdatedManufacturingVariables(
//       manufacturingVariables.map((item) => ({
//         ...item,
//         totalRate: item.totalRate || 0,
//       }))
//     );
//   }, [manufacturingVariables]);

//   // console.log(quantity);

//   // Toggle edit modal
//   const tog_edit = (item = null) => {
//     if (item) {
//       setFormData({
//         name: item.name,
//         hours: item.hours,
//         hourlyRate: item.hourlyRate,
//         totalRate: item.totalRate,
//       });
//       setEditId(item._id);
//     } else {
//       resetForm();
//     }
//     setModalEdit(!modal_edit);
//   };

//   const tog_delete = (id = null) => {
//     setDeleteId(id);
//     setModalDelete(!modal_delete);
//   };

//   // Reset form data
//   const resetForm = () => {
//     setFormData({
//       name: "",
//       hours: "",
//       hourlyRate: "",
//       totalRate: "",
//     });
//     setEditId(null);
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevFormData) => {
//       const updatedFormData = {
//         ...prevFormData,
//         [name]: value,
//       };
//       // Calculate totalRate using the updated hourlyRate and hours
//       // if (name === "hourlyRate" || name === "hours") {
//       //   updatedFormData.totalRate =
//       //     (parseFloat(updatedFormData.hourlyRate) || 0) *
//       //     (parseFloat(updatedFormData.hours) || 0);
//       // }
//       if (name === "hourlyRate" || name === "hours") {
//         updatedFormData.totalRate =
//           (parseFloat(updatedFormData.hourlyRate) || 0) *
//           (parseFloat(updatedFormData.hours) || 0) *
//           quantity;
//       }

//       return updatedFormData;
//     });
//   };
//   // "/projects/:projectId/partsLists/:partsListId/items/:itemId/:variableType/:variableId",

//   // Construct API endpoint based on the source
//   const getApiEndpoint = (id) => {
//     if (source === "partList") {
//       return `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/partsLists/${partId}/items/${itemId}/manufacturingVariables/${id}`;
//     } else if (source === "subAssemblyListFirst") {
//       return `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects/${projectId}/subAssemblyListFirst/${partId}/items/${itemId}/manufacturingVariables/${id}`;
//     }
//     throw new Error("Invalid source");
//   };

//   // Submit edited data
//   // const handleEditSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setPosting(true);
//   //   setError(null);

//   //   try {
//   //     const endpoint = getApiEndpoint();
//   //     const response = await fetch(endpoint, {
//   //       method: "PUT",
//   //       headers: {
//   //         "Content-Type": "application/json",
//   //       },
//   //       body: JSON.stringify({
//   //         name: formData.name,
//   //         hours: parseFloat(formData.hours),
//   //         hourlyRate: parseFloat(formData.hourlyRate),
//   //         totalRate: parseFloat(formData.totalRate),
//   //       }),
//   //     });

//   //     if (!response.ok) {
//   //       const errorData = await response.json();
//   //       throw new Error(
//   //         errorData.message || "Failed to update manufacturing variable"
//   //       );
//   //     }

//   //     const updatedData = await response.json();
//   //     onUpdateVariable(updatedData); // Notify parent about the update
//   //     toast.success("Raw material updated successfully");
//   //     setModalEdit(false);
//   //     resetForm();
//   //   } catch (error) {
//   //     console.error("Error updating manufacturing variable:", error);
//   //     setError(error.message);
//   //     toast.error(error.message);
//   //   } finally {
//   //     setPosting(false);
//   //   }
//   // };
//   const handleEditSubmit = async (e) => {
//     e.preventDefault();
//     setPosting(true);
//     setError(null);

//     try {
//       const endpoint = getApiEndpoint(editId); // Pass editId here
//       const response = await fetch(endpoint, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: formData.name,
//           hours: parseFloat(formData.hours),
//           hourlyRate: parseFloat(formData.hourlyRate),
//           totalRate: parseFloat(formData.totalRate),
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.message || "Failed to update manufacturing variable"
//         );
//       }

//       const updatedData = await response.json();
//       onUpdatePrts(updatedData); // Notify parent about the update

//       toast.success("Records updated successfully");
//       setModalEdit(false);
//       resetForm();
//     } catch (error) {
//       console.error("Error updating manufacturing variable:", error);
//       setError(error.message);
//       toast.error(error.message);
//     } finally {
//       setPosting(false);
//     }
//   };

//   const handleDelete = async () => {
//     setPosting(true);
//     setError(null);

//     try {
//       const endpoint = getApiEndpoint(deleteId); // Pass deleteId here
//       const response = await fetch(endpoint, {
//         method: "DELETE",
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.message || "Failed to delete manufacturing variable"
//         );
//       }

//       const updatedData = await response.json();
//       manufatcuringUpdate(updatedData); // Notify parent about the update
//       // Update the local state to remove the deleted item
//       // setUpdatedManufacturingVariables((prevVariables) =>
//       //   prevVariables.filter((item) => item._id !== deleteId)
//       // );

//       toast.success("Records deleted successfully");
//       setModalDelete(false);
//     } catch (error) {
//       console.error("Error deleting manufacturing variable:", error);
//       setError(error.message);
//       toast.error(error.message);
//     } finally {
//       setPosting(false);
//     }
//   };

//   const formatTime = (time) => {
//     if (time === 0) {
//       return 0;
//     }

//     let result = "";

//     const hours = Math.floor(time);
//     const minutes = Math.round((time - hours) * 60);

//     if (hours > 0) {
//       result += `${hours}h `;
//     }

//     if (minutes > 0 || (hours === 0 && minutes !== 0)) {
//       result += `${minutes}m`;
//     }

//     return result.trim();
//   };

//   return (
//     <div className="manufacturing-container">
//       <h5 className="section-title">
//         🔧 Manufacturing Variables for {partName}
//       </h5>
//       <table className="table align-middle table-nowrap">
//         <thead className="table-light">
//           <tr>
//             <th>Name</th>
//             {/* <th>Time</th> */}
//             <th>Hours</th>
//             <th>Hourly Rate</th>
//             <th>Total Rate</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {updatedManufacturingVariables.map((item, index) => (
//             <tr key={index}>
//               <td>{item.name}</td>
//               {/* <td>{item.times || "--"}</td> */}
//               <td>{formatTime(item.hours * quantity)}</td>
//               {/* <td>{item.hours * 60 >= 0 ? `${Math.floor(item.hours * 60)} Min` : '--'}</td> */}
//               {/* <td>
//                 {Math.floor(item.hours)} hours {(item.hours % 1) * 60} minutes
//               </td> */}
//               <td>{item.hourlyRate}</td>
//               <td>{Math.ceil(item.totalRate * quantity)}</td>
//               <td className="d-flex gap-2">
//                 <button
//                   className="btn btn-sm btn-success edit-item-btn"
//                   onClick={() => tog_edit(item)}
//                 >
//                   Edit
//                 </button>
//                 {/* <button
//                   className="btn btn-sm btn-danger remove-item-btn"
//                   onClick={() => tog_delete(item._id)}
//                 >
//                   Remove
//                 </button> */}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Edit Modal */}
//       <Modal isOpen={modal_edit} toggle={tog_edit}>
//         <ModalHeader toggle={tog_edit}>
//           Edit Manufacturing Variables
//         </ModalHeader>
//         <ModalBody>
//           <form onSubmit={handleEditSubmit}>
//             <div className="mb-3">
//               <label htmlFor="name" className="form-label">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 className="form-control"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 required
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="hours" className="form-label">
//                 Minutes
//               </label>
//               <input
//                 type="number"
//                 className="form-control"
//                 name="hours"
//                 // value={formData.hours}
//                 value={(formData.hours * 60).toFixed(0)}
//                 onChange={handleChange}
//                 readOnly
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
//             {error && <div className="alert alert-danger">{error}</div>}
//             <ModalFooter>
//               <Button type="submit" color="primary" disabled={posting}>
//                 {posting ? "Updating..." : "Update"}
//               </Button>
//               <Button type="button" color="secondary" onClick={tog_edit}>
//                 Cancel
//               </Button>
//             </ModalFooter>
//           </form>
//         </ModalBody>
//       </Modal>

//       {/* hadndel delete */}
//       <Modal isOpen={modal_delete} toggle={tog_delete}>
//         <ModalHeader toggle={tog_delete}>Confirm Deletion</ModalHeader>
//         <ModalBody>
//           Are you sure you want to delete this manufacturing variable?
//         </ModalBody>
//         <ModalFooter>
//           <Button color="danger" onClick={handleDelete} disabled={posting}>
//             {posting ? "Deleting..." : "Delete"}
//           </Button>
//           <Button color="secondary" onClick={tog_delete}>
//             Cancel
//           </Button>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// };

// export default Manufacturing;

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Matarials.css";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

const Manufacturing = ({
  partName,
  manufacturingVariables,
  partId,
  // itemId,
  source,
  subAssemblyId,
  onUpdatePrts,
  quantity,
}) => {
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    hours: "",
    hourlyRate: "",
    totalRate: "",
  });

  const [updatedManufacturingVariables, setUpdatedManufacturingVariables] =
    useState(
      manufacturingVariables.map((item) => ({
        ...item,
        totalRate: item.totalRate || 0,
      }))
    );

  // Sync with new manufacturing variables
  useEffect(() => {
    setUpdatedManufacturingVariables(
      manufacturingVariables.map((item) => ({
        ...item,
        totalRate: item.totalRate || 0,
      }))
    );
  }, [manufacturingVariables]);

  // console.log(quantity);

  // Toggle edit modal
  const tog_edit = (item = null) => {
    if (item) {
      setFormData({
        name: item.name,
        hours: item.hours,
        hourlyRate: item.hourlyRate,
        totalRate: item.totalRate,
      });
      setEditId(item._id);
    } else {
      resetForm();
    }
    setModalEdit(!modal_edit);
  };

  const tog_delete = (id = null) => {
    setDeleteId(id);
    setModalDelete(!modal_delete);
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      hours: "",
      hourlyRate: "",
      totalRate: "",
    });
    setEditId(null);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
      // Calculate totalRate using the updated hourlyRate and hours
      // if (name === "hourlyRate" || name === "hours") {
      //   updatedFormData.totalRate =
      //     (parseFloat(updatedFormData.hourlyRate) || 0) *
      //     (parseFloat(updatedFormData.hours) || 0);
      // }
      if (name === "hourlyRate" || name === "hours") {
        updatedFormData.totalRate =
          (parseFloat(updatedFormData.hourlyRate) || 0) *
          (parseFloat(updatedFormData.hours) || 0) *
          quantity;
      }

      return updatedFormData;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setError(null);

    console.log("🔍 Debugging IDs:");
    console.log("subAssemblyId:", subAssemblyId);
    console.log("partId:", partId);
    console.log("editId (manufacturingVariableId):", editId);

    try {
      const endpoint = `${process.env.REACT_APP_BASE_URL}/api/subAssembly/${subAssemblyId}/parts/${partId}/manufacturing/${editId}`;
      console.log("🚀 PUT Request to:", endpoint);

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          hours: parseFloat(formData.hours),
          hourlyRate: parseFloat(formData.hourlyRate),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update manufacturing variable"
        );
      }

      const updatedData = await response.json();
      onUpdatePrts(updatedData);

      toast.success("Manufacturing variable updated successfully");
      setModalEdit(false);
      resetForm();
    } catch (error) {
      console.error("❌ Error updating manufacturing variable:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async () => {
    setPosting(true);
    setError(null);

    try {
      const endpoint = getApiEndpoint(deleteId); // Pass deleteId here
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to delete manufacturing variable"
        );
      }

      const updatedData = await response.json();
      manufatcuringUpdate(updatedData); // Notify parent about the update
      // Update the local state to remove the deleted item
      // setUpdatedManufacturingVariables((prevVariables) =>
      //   prevVariables.filter((item) => item._id !== deleteId)
      // );

      toast.success("Records deleted successfully");
      setModalDelete(false);
    } catch (error) {
      console.error("Error deleting manufacturing variable:", error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (time) => {
    if (time === 0) {
      return 0;
    }

    let result = "";

    const hours = Math.floor(time);
    const minutes = Math.round((time - hours) * 60);

    if (hours > 0) {
      result += `${hours}h `;
    }

    if (minutes > 0 || (hours === 0 && minutes !== 0)) {
      result += `${minutes}m`;
    }

    return result.trim();
  };

  return (
    <div className="manufacturing-container">
      <h5 className="section-title">
        🔧 Manufacturing Variables for {partName}
      </h5>
      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            {/* <th>Time</th> */}
            <th>Hours</th>
            <th>Hourly Rate</th>
            <th>Total Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {updatedManufacturingVariables.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              {/* <td>{item.times || "--"}</td> */}
              <td>{formatTime(item.hours * quantity)}</td>
              {/* <td>{item.hours * 60 >= 0 ? `${Math.floor(item.hours * 60)} Min` : '--'}</td> */}
              {/* <td>
                {Math.floor(item.hours)} hours {(item.hours % 1) * 60} minutes
              </td> */}
              <td>{item.hourlyRate}</td>
              <td>{Math.ceil(item.totalRate * quantity)}</td>
              <td className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-success edit-item-btn"
                  onClick={() => tog_edit(item)}
                >
                  Edit
                </button>
                {/* <button
                  className="btn btn-sm btn-danger remove-item-btn"
                  onClick={() => tog_delete(item._id)}
                >
                  Remove
                </button> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
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
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="hours" className="form-label">
                Minutes
              </label>
              <input
                type="number"
                className="form-control"
                name="hours"
                // value={formData.hours}
                value={(formData.hours * 60).toFixed(0)}
                onChange={handleChange}
                readOnly
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
            {error && <div className="alert alert-danger">{error}</div>}
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                {posting ? "Updating..." : "Update"}
              </Button>
              <Button type="button" color="secondary" onClick={tog_edit}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal>

      {/* hadndel delete */}
      <Modal isOpen={modal_delete} toggle={tog_delete}>
        <ModalHeader toggle={tog_delete}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this manufacturing variable?
        </ModalBody>
        <ModalFooter>
          <Button color="danger" onClick={handleDelete} disabled={posting}>
            {posting ? "Deleting..." : "Delete"}
          </Button>
          <Button color="secondary" onClick={tog_delete}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Manufacturing;
