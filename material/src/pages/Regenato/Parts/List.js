import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import "./project.css";
import {
  Card,
  CardBody,
  Col,
  DropdownItem,
  Button,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  UncontrolledDropdown,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PaginatedList from "../Pagination/PaginatedList";

const categories = [
  { name: "Category 1" },
  { name: "Category 2" },
  { name: "Category 3" },
  { name: "Category 4" },
  { name: "Category 5" },
];

const List = () => {
  //   const [modal_category, setModal_category] = useState(false);
  const [modal_list, setModalList] = useState(false);
  const [modal_edit, setModalEdit] = useState(false);
  const [modal_delete, setModalDelete] = useState(false);
  const [newPartId, setNewPartId] = useState("");

  const [newPartName, setNewPartName] = useState(""); // For storing new part name
  const [newCodeName, setnewCodeName] = useState(""); // For storing new part name
  const [newclientNumber, setnewclientNumber] = useState(""); // For storing new part name

  const [listData, setListData] = useState([]); // Local state to store project list
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State for handling errors
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [timePerUnit, setTimePerUnit] = useState(0);
  const [stockPOQty, setStockPOQty] = useState(0);
  const [posting, setPosting] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [modal_duplicate, setModalDuplicate] = useState(false); // For duplicate modal
  const [duplicatePartData, setDuplicatePartData] = useState({
    partName: "",
    id: "",
  });
  const [selectedPart, setSelectedPart] = useState(null); // Holds the part to duplicate

  const [formData, setFormData] = useState({
    partName: "",
    costPerUnit: "",
    timePerUnit: "",
    stockPOQty: "",
  });

  const toggleModal = () => {
    setModalList(!modal_list);
  };

  

  // Function to toggle 'Delete' modal
  const tog_delete = () => {
    setModalDelete(!modal_delete);
  };

  const toggleDuplicateModal = (item) => {
    if (item) {
      setSelectedPart(item); // Save the original part data for duplication
      setDuplicatePartData({
        partName: `${item.partName}2`, // Append '2' to the part name
        id: "", // Leave the new ID empty for user input
        costPerUnit: item.costPerUnit,
        clientNumber: item.clientNumber,
        codeName: item.codeName,
        timePerUnit: item.timePerUnit,
        stockPOQty: item.stockPOQty,
        generalVariables: [...item.generalVariables],
        rmVariables: [...item.rmVariables], // Deep clone nested arrays
        manufacturingVariables: [...item.manufacturingVariables],
        shipmentVariables: [...item.shipmentVariables],
        overheadsAndProfits: [...item.overheadsAndProfits],
        partsCalculations: [...item.partsCalculations],
      });
    }
    setModalDuplicate(!modal_duplicate);
  };

  const toggleEditModal = (item = null) => {
    if (item) {
      // Pre-fill the modal with data from the selected item
      setFormData({
        partName: item.partName,
        costPerUnit: item.costPerUnit,
        timePerUnit: item.timePerUnit,
        stockPOQty: item.stockPOQty,
      });
      setEditId(item._id); // Save the ID for the PUT request
    } else {
      // Clear form data if no item is selected
      setFormData({
        partName: "",
        costPerUnit: 0,
        timePerUnit: 0,
        stockPOQty: 0,
      });
      setEditId(null);
    }
    setModalEdit(!modal_edit);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch parts");
      }
      const data = await response.json();
      setListData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  //paginations

  // Filtered and Paginated Data
  const filteredData = listData.filter((item) =>
    item.partName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to the first page on search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setnewCodeName(inputValue === '' ? '-' : inputValue);
  };

  const handleAddPart = async () => {
    // Extract only the numeric part of the ID
    // const numericId = newPartId.replace(/[^\d]/g, "");
    const numericId = newPartId.replace(/[^-\d]/g, "");

    const newPart = {
      id: numericId,
      partName: newPartName,
      clientNumber: newclientNumber,
      codeName: newCodeName || 0,
      costPerUnit: costPerUnit || 0,
      timePerUnit: timePerUnit || 0,
      stockPOQty: stockPOQty || 0,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPart),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add part");
      }

      // If the request is successful, refresh the list data
      await fetchData();

      // Reset form fields
      setNewPartId("");
      setNewPartName("");
      setnewCodeName("")
      setnewclientNumber("")
      setCostPerUnit(0);
      setTimePerUnit(0);
      setStockPOQty(0);

      // Close the modal
      toggleModal();

      toast.success("Records added successfully!");
    } catch (error) {
      console.error("Error adding part:", error);
      toast.error("Failed to add part. Please try again.");
    }
  };

  // creating handleDuplicate
  const handleCreateDuplicate = async () => {
    try {
      console.log("Duplicate Part Data:", duplicatePartData);

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: duplicatePartData.id,
            partName: duplicatePartData.partName,
            clientNumber: duplicatePartData.clientNumber,
            codeName: duplicatePartData.codeName,  //code name new added here
            costPerUnit: duplicatePartData.costPerUnit,
            timePerUnit: duplicatePartData.timePerUnit,
            stockPOQty: duplicatePartData.stockPOQty,
            generalVariables: duplicatePartData.generalVariables,
            rmVariables: duplicatePartData.rmVariables,
            manufacturingVariables: duplicatePartData.manufacturingVariables,
            shipmentVariables: duplicatePartData.shipmentVariables,
            overheadsAndProfits: duplicatePartData.overheadsAndProfits,
            partsCalculations: duplicatePartData.partsCalculations,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Backend Error Response:", errorText);
        throw new Error(
          `Failed to create duplicate part. Response: ${errorText}`
        );
      }

      const result = await response.json();
      console.log("Duplicate Part Created:", result);

      // Refresh the parts list and close the modal
      await fetchData();
      setModalDuplicate(false);

      toast.success("Duplicate part created successfully!");
    } catch (error) {
      console.error("Error creating duplicate:", error.message);
      toast.error(error.message);
    }
  };

  // Calculate totals for each part
  const partTotals = listData.reduce((acc, part) => {
    console.log("Processing item:", part.id);

    const rmTotal = part.rmVariables.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );
    const manufacturingTotal = part.manufacturingVariables.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );
    const shipmentTotal = part.shipmentVariables.reduce(
      (sum, item) => sum + Number(item.hourlyRate || 0),
      0
    );
    const overheadsTotal = part.overheadsAndProfits.reduce(
      (sum, item) => sum + Number(item.totalRate || 0),
      0
    );

    acc[part.id] = {
      rmTotal,
      manufacturingTotal,
      shipmentTotal,
      overheadsTotal,
      totalCost: (acc[part.id]?.totalCost || 0) + part.costPerUnit,
      costPerUnitAvg:
        rmTotal + manufacturingTotal + shipmentTotal + overheadsTotal, // Calculate avg
      manufacturingHours: part.manufacturingVariables.reduce(
        (sum, item) => sum + Number(item.hours || 0),
        0
      ),
    };

    return acc;
  }, {});

  console.log("Final Part Totals:", partTotals);

  Object.entries(partTotals).forEach(([partId, totals]) => {
    console.log(`Part ${partId}:`);
    console.log("RM Total:", totals.rmTotal);
    console.log("Manufacturing Total:", totals.manufacturingTotal);
    console.log("Shipment Total:", totals.shipmentTotal);
    console.log("Overheads Total:", totals.overheadsTotal);
    console.log("Cost Per Unit Avg:", totals.costPerUnitAvg);
  });

  const handleDelete = async (_id) => {
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/${_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      await fetchData(); // Refetch the data to update the table
      toast.success('Records Deleted Successfully')
      tog_delete(); // Close the modal
    } catch (error) {
      setError(error.message);
    } finally {
      setPosting(false);
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
            <Button
              color="success"
              className="add-btn me-1"
              onClick={toggleModal}
              id="create-btn"
            >
              <i className="ri-add-line align-bottom me-1"></i> Add Part 
            </Button>
          </div>
        </div>
        <div className="col-sm-7 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2">
            <div className="d-flex search-box ms-2 col-sm-7">
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <i
                className="ri-search-line search-icon ml-2"
                style={{ marginTop: "-1px" }}
              ></i>
            </div>
          </div>
        </div>
      </Row>

      {/* {loading && <p>Loading...</p>} */}
      {error && <p>Error: {error}</p>}
      <>
      {loading && (
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Drawing Number</th>
            <th>Client Number</th>
            <th>Cost per Unit</th>
            <th>Total Hours</th>
            <th>On Hand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
           {paginatedData.map((item, index) => (
            <tr key={index}>
              <td>
                <Link to={`/singlepart/${item._id}`} className="text-body">
                  {/* {item.partName} ({item.id}) {item.codeName} */}
                  {item.partName} {item.codeName}
                </Link>
              </td>
              <td>{item.id}</td>
              <td>{item.clientNumber}</td>
              <td>
                {item.partsCalculations && item.partsCalculations.length > 0
                  ? item.partsCalculations[0].AvgragecostPerUnit.toFixed(2)
                  : "-"}
              </td>
              <td>
                {item.partsCalculations && item.partsCalculations.length > 0
                  ? item.partsCalculations[0].AvgragetimePerUnit.toFixed(2)
                  : "-"}
              </td>
              <td></td> {/* On Hand column */}
              <td>
                <UncontrolledDropdown direction="start">
                  <DropdownToggle
                    tag="button"
                    className="btn btn-link text-muted p-1 mt-n2 py-0 text-decoration-none fs-15 shadow-none"
                  >
                    <FeatherIcon icon="more-horizontal" className="icon-sm" />
                  </DropdownToggle>
                  <DropdownMenu className="dropdown-menu-end">
                    {/* <div className="dropdown-divider"></div> */}
                    <DropdownItem
                      href="#"
                      onClick={() => {
                        setSelectedId(item._id);
                        tog_delete();
                      }}
                    >
                      <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                      Remove
                    </DropdownItem>

                    <DropdownItem
                      href="#"
                      onClick={() => toggleDuplicateModal(item)}
                    >
                      <i className="ri-file-copy-line align-bottom me-2 text-muted"></i>{" "}
                      Duplicate
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <PaginatedList
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />      
      </>
      {/* Modal for adding a new item */}
      <Modal isOpen={modal_list} toggle={toggleModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleModal}>
          {" "}
          Add Part{" "}
        </ModalHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddPart();
          }}
        >
          <ModalBody>
            <div className="mb-3">
              <label htmlFor="parts-id" className="form-label">
                Drawing Number
              </label>
              <Input
                type="text"
                className="form-control"
                placeholder="Enter Drawing Number (e.g, 48A47015099)"
                value={newPartId}
                onChange={(e) => setNewPartId(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="parts-name" className="form-label">
                Common Name
              </label>
              <input
                type="text"
                id="parts-name"
                className="form-control"
                placeholder="Enter Name"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="client-number" className="form-label">
                Client Number
              </label>
              <input
                type="text"
                id="client-number"
                className="form-control"
                placeholder="Enter Client Number"
                value={newclientNumber}
                onChange={(e) => setnewclientNumber(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="code-name" className="form-label">
                 Code Name
              </label>
              <input
                type="text"
                id="code-name"
                className="form-control"
                placeholder="Enter Code Name"
                value={newCodeName}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3 mt-3">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choose Category"
                    variant="outlined"
                  />
                )}
              />
            </div>
            <Button type="submit" color="success" className="add-btn me-1">
              <i className="ri-add-line align-bottom me-1"></i> Add
            </Button>
          </ModalBody>
        </form>
      </Modal>

      <Modal
        isOpen={modal_duplicate}
        toggle={() => setModalDuplicate(false)}
        centered
      >
        <ModalHeader toggle={() => setModalDuplicate(false)}>
          Duplicate Part
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label htmlFor="duplicate-part-name" className="form-label">
              Part Name
            </label>
            <Input
              type="text"
              id="duplicate-part-name"
              className="form-control"
              value={duplicatePartData.partName}
              onChange={(e) =>
                setDuplicatePartData({
                  ...duplicatePartData,
                  partName: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="duplicate-part-id" className="form-label">
              Part ID
            </label>
            <Input
              type="text"
              id="duplicate-part-id"
              className="form-control"
              placeholder="Enter a unique ID"
              value={duplicatePartData.id}
              onChange={(e) =>
                setDuplicatePartData({
                  ...duplicatePartData,
                  id: e.target.value,
                })
              }
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleCreateDuplicate}>
            Create Duplicate
          </Button>
          <Button color="secondary" onClick={() => setModalDuplicate(false)}>
            Cancel
          </Button>
        </ModalFooter>
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

export default List;

{
  /* <DropdownItem onClick={() => toggleEditModal(item)}>
<i className="ri-pencil-fill align-bottom me-2 text-muted"></i>{" "}
Edit
</DropdownItem> */
}
{
  /* Edit Modal */
}
{
  /* <Modal isOpen={modal_edit} toggle={toggleEditModal}>
        <ModalHeader toggle={toggleEditModal}>Edit Part</ModalHeader>
        <ModalBody>
          <form onSubmit={handleEditSubmit}>
            <div className="mb-3">
              <label htmlFor="partName" className="form-label">
                Name
              </label>
              <Input
                type="text"
                id="partName"
                value={formData.partName}
                onChange={(e) =>
                  setFormData({ ...formData, partName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="costPerUnit" className="form-label">
                Cost Per Unit
              </label>
              <Input
                type="number"
                id="costPerUnit"
                value={formData.costPerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPerUnit: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="timePerUnit" className="form-label">
                Total Hours
              </label>
              <Input
                type="number"
                id="timePerUnit"
                value={formData.timePerUnit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timePerUnit: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="stockPOQty" className="form-label">
                On Hand
              </label>
              <Input
                type="number"
                id="stockPOQty"
                value={formData.stockPOQty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockPOQty: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <ModalFooter>
              <Button type="submit" color="primary" disabled={posting}>
                Update
              </Button>
              <Button type="button" color="secondary" onClick={toggleEditModal}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </Modal> */
}

//     const handleEditSubmit = async (e) => {
//       e.preventDefault();
//       setPosting(true);
//       setError(null);
//       try {
//         const response = await fetch(
//           `http://localhost:4040/api/parts/${editId}`,
//           {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify(formData),
//           }
//         );
//         if (response.ok) {
//           // Refresh the page after successful POST request
//           await fetchData();
//         } else {
//           // Handle errors here
//           throw new Error("Network response was not ok");
//         }

//     await fetchData();
//     setFormData({
//       partName: "",
//       costPerUnit: "",
//       timePerUnit: "",
//       stockPOQty: "",
//     });

//     toggleEditModal();
//   } catch (error) {
//     setError(error.message);
//   } finally {
//     setPosting(false);
//   }
// };
