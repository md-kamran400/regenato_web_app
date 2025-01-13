import React, { useEffect, useState } from "react";
import {
  Row,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import { Link } from "react-router-dom";

export const SubAssmeblies = () => {
  const [ListData, setListData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPartName, setNewPartName] = useState("");

  const FetchAllProjectForList = async () => {
    try {
      const data = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
      );
      const res = await data.json();
      setListData(res);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    FetchAllProjectForList();
  }, []);

  const getSubAssemblyNames = () => {
    return ListData.map(
      (project) =>
        project.subAssemblyListFirst?.map(
          (subAssembly) => subAssembly.subAssemblyListName
        ) || []
    ).flat();
  };

  const handleAddPart = () => {
    // Here you would typically call an API to add the new part
    console.log("Adding new part:", newPartName);
    setIsModalOpen(false);
    setNewPartName("");
  };
  //${process.env.REACT_APP_BASE_URL}
  return (
    <React.Fragment>
      <div className="p-3">
        <Row className="g-4 mb-3">
          <div className="col-sm-auto">
            <div>
              <Button
                color="success"
                className="add-btn me-1"
                id="create-btn"
                onClick={() => setIsModalOpen(true)}
              >
                <i className="ri-add-line align-bottom me-1"></i> Add Sub
                Assembly
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Row>

        <table className="table table-striped">
          <thead>
            <tr>
              <th style={{ fontWeight: "bold" }}>Sub-Assembly Name</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link to={`/regenato-single-subAssmebly`} className="text-body">
                  Sub Assembly 1
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <Link to={`/regenato-single-subAssmebly`} className="text-body">
                  Sub Assembly 2
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <Link to={`/regenato-single-subAssmebly`} className="text-body">
                  Sub Assembly 3
                </Link>
              </td>
            </tr>

            <tr>
              <td>
                <Link to={`/regenato-single-subAssmebly`} className="text-body">
                  Sub Assembly 4
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <Link to={`/regenato-single-subAssmebly`} className="text-body">
                  Sub Assembly 6
                </Link>
              </td>
            </tr>
            <tr>
              <td>
                <Link to={`/regenato-single-subAssmebly`} className="text-body">
                  Sub Assembly 5
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* add Modal */}
      <Modal isOpen={isModalOpen} toggle={() => setIsModalOpen(!isModalOpen)}>
        <ModalHeader toggle={() => setIsModalOpen(false)}>
          Add Sub Assembly
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Part Name"
            value={newPartName}
            onChange={(e) => setNewPartName(e.target.value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={handleAddPart}>
            Add
          </Button>{" "}
          <Button color="secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

// import React, { useEffect, useState } from "react";
// // ... other imports

// export const SubAssmeblies = () => {
//   const [ListData, setListData] = useState([]);

//   const FetchAllProjectForList = async () => {
//     try {
//       const data = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/defpartproject/projects`
//       );
//       const res = await data.json();
//       setListData(res);
//       console.log(res);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     FetchAllProjectForList();
//   }, []);

//   // Function to extract subAssemblyListName from ListData
//   const getSubAssemblyNames = () => {
//     return ListData.map(project =>
//       project.subAssemblyListFirst?.map(subAssembly => subAssembly.subAssemblyListName) || []
//     ).flat();
//   };

//   // ... rest of your component code

//   return (
//     <React.Fragment>
//       {/* ... other JSX */}

//       <table className="table table-striped">
//         <thead>
//           <tr>
//             <th style={{ fontWeight: "bold" }}>Sub-Assembly Name</th>
//           </tr>
//         </thead>
//         <tbody>
//           {getSubAssemblyNames().map((name, index) => (
//             <tr key={index}>
//               <td>{name}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* ... rest of your JSX */}
//     </React.Fragment>
//   );
// };
