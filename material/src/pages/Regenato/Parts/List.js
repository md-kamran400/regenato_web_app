import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
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
} from "reactstrap";
import DeleteModal from "../../../Components/Common/DeleteModal";
import { ToastContainer, toast } from "react-toastify";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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
  const [listData, setListData] = useState([]); // Local state to store project list
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(null); // State for handling errors
  const [editId, setEditId] = useState(null); // ID for the item being edited
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [timePerUnit, setTimePerUnit] = useState(0);
  const [stockPOQty, setStockPOQty] = useState(0);
  const [posting, setPosting] = useState(false);

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
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setListData(data); // Set the fetched data to state
    } catch (error) {
      setError(error.message); // Set error message
    } finally {
      setLoading(false); // Set loading to false once fetch is complete
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle adding a new part
  // Inside the handleAddPart function

  const handleAddPart = async () => {
    if (newPartName !== "") {
      const newPart = {
        id: parseInt(newPartId),
        partName: newPartName,
        costPerUnit: costPerUnit || 0,
        timePerUnit: timePerUnit || 0,
        stockPOQty: stockPOQty || 0,
      };
  
      setPosting(true);
      setError(null);
  
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/parts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPart),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("New part added:", data);
  
          // Update the local state
          const updatedListData = [...listData];
          const index = updatedListData.findIndex(item => item.id === data.id);
          
          if (index !== -1) {
            updatedListData[index] = data;
            toast.info("Part updated successfully!");
          } else {
            updatedListData.push(data);
            toast.success("New part added successfully!");
          }
  
          setListData(updatedListData);
          // Close the modal
          setModalList(false);
        } else {
          throw new Error("Network response was not ok");
        }
      } catch (error) {
        setError(error.message);
        console.error("Error adding/updating part:", error);
        toast.error(`Error: ${error.message}`);
      } finally {
        setPosting(false);
      }
    } else {
      toast.error("Please fill all fields");
    }
  };

  // Handle removing a part
  const handleRemovePart = (indexToRemove) => {
    const updatedParts = listData.filter((_, index) => index !== indexToRemove);
    setListData(updatedParts); // Update the project list with the part removed
  };

  const activebtn = (ele) => {
    if (ele.closest("button").classList.contains("active")) {
      ele.closest("button").classList.remove("active");
    } else {
      ele.closest("button").classList.add("active");
    }
  };

  // Debugging logs
  console.log("Debugging logs:");
  console.log("listData:", listData);
  console.log("listData.rmVariables:", listData?.rmVariables);
  console.log(
    "listData.manufacturingVariables:",
    listData?.manufacturingVariables
  );
  console.log("listData.shipmentVariables:", listData?.shipmentVariables);
  console.log("listData.overheadsAndProfits:", listData?.overheadsAndProfits);

  // Calculate totals for each part
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

  // Calculate overall totals
  const rmTotalCount = Object.values(partTotals).reduce(
    (sum, part) => sum + part.rmTotal,
    0
  );
  const manufacturingTotalCount = Object.values(partTotals).reduce(
    (sum, part) => sum + part.manufacturingTotal,
    0
  );
  const shipmentTotalCount = Object.values(partTotals).reduce(
    (sum, part) => sum + part.shipmentTotal,
    0
  );
  const overheadsTotalCount = Object.values(partTotals).reduce(
    (sum, part) => sum + part.overheadsTotal,
    0
  );
  const totalCost = Object.values(partTotals).reduce(
    (sum, part) => sum + part.totalCost,
    0
  );
  const costPerUnitAvg =
    Object.values(partTotals).reduce(
      (sum, part) => sum + part.costPerUnitAvg,
      0
    ) / Object.keys(partTotals).length;
  const manufacturingTotalCountHours = Object.values(partTotals).reduce(
    (sum, part) => sum + part.manufacturingHours,
    0
  );

  // console.log('Final values:');
  // console.log('rmTotalCount:', rmTotalCount);
  // console.log('manufacturingTotalCount:', manufacturingTotalCount);
  // console.log('shipmentTotalCount:', shipmentTotalCount);
  // console.log('overheadsTotalCount:', overheadsTotalCount);
  // console.log('totalCost which dont want:', totalCost);
  // console.log('costPerUnitAvg:', costPerUnitAvg);
  // console.log('manufacturingTotalCountHours:', manufacturingTotalCountHours);

  // Logging intermediate results for debugging
  Object.entries(partTotals).forEach(([partId, totals]) => {
    console.log(`Part ${partId}:`);
    console.log("RM Total:", totals.rmTotal);
    console.log("Manufacturing Total:", totals.manufacturingTotal);
    console.log("Shipment Total:", totals.shipmentTotal);
    console.log("Overheads Total:", totals.overheadsTotal);
    console.log("Cost Per Unit Avg:", totals.costPerUnitAvg);
  });

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

            <Button className="btn btn-success">
              <i className="ri-add-line align-bottom me-1"></i> Choose Category
            </Button>
          </div>
        </div>
        <div className="col-sm-3 ms-auto">
          <div className="d-flex justify-content-sm-end gap-2">
            <div className="search-box ms-2 col-sm-7">
              <Input
                type="text"
                className="form-control"
                placeholder="Search..."
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </div>
        </div>
      </Row>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Cost per Unit</th>
            <th>Total Hours</th>
            <th>On Hand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listData.map((item, index) => (
            <tr key={index}>
              <td>
                <Link to={`/singlepart/${item._id}`} className="text-body">
                  {item.partName} ({item.id})
                </Link>
              </td>
              <td>
                {item.partsCalculations && item.partsCalculations.length > 0
                  ? item.partsCalculations[0].AvgragecostPerUnit.toFixed(2)
                  : "N/A"}
              </td>
              <td>
                {item.partsCalculations && item.partsCalculations.length > 0
                  ? item.partsCalculations[0].AvgragetimePerUnit.toFixed(2)
                  : "N/A"}
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
                      onClick={() => handleRemovePart(index)}
                    >
                      <i className="ri-delete-bin-fill align-bottom me-2 text-muted"></i>{" "}
                      Remove
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                ID
              </label>
              <input
                type="text"
                id="parts-id"
                className="form-control"
                placeholder="Enter ID"
                value={newPartId}
                onChange={(e) => setNewPartId(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="parts-name" className="form-label">
                Parts Name
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
            <div className="mb-3 mt-3">
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
