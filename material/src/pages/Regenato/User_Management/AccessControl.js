import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Badge,
} from "reactstrap";
import { toast } from "react-toastify";

const AccessControl = () => {
  const [selectedRole, setSelectedRole] = useState("super-admin");
  const [hasChanges, setHasChanges] = useState(false);

  // Define permissions structure based on your requirements
  const [permissions, setPermissions] = useState({
    "super-admin": {
      // Home Page
      homePage: true,
      
      // Production Order List
      productionOrderList: true,
      addNewPO: true,
      addProductionOrder: true,
      syncPO: true,
      editPO: true,
      removePO: true,
      duplicatePO: true,
      
      // Production Order Details
      productionOrderDetails: true,
      addPart: true,
      addSubAssembly: true,
      addAssembly: true,
      deleteFromDetails: true,
      editPartQty: true,
      approveBlankStore: true,
      confirmAllocation: true,
      
      // After Allocation
      afterAllocation: true,
      dailyTracking: true,
      completeAllocation: true,
      cancelAllocation: true,
      
      // Part List
      partList: true,
      addNewPart: true,
      removePart: true,
      duplicatePart: true,
      duplicateTo: true,
      editPart: true,
      
      // Single Part Pages (CRUD operations)
      generalVariable: true,
      rawMaterial: true,
      manufacturingVariable: true,
      shipment: true,
      overheads: true,
      
      // Variables Page
      variablesPage: true,
      variablesGeneral: true,
      variablesRawMaterial: true,
      variablesManufacturing: true,
      variablesShipment: true,
      variablesOverheads: true,
      variablesOperator: true,
      variablesShift: true,
      variablesEventScheduler: true,
      variablesIncharge: true,
      variablesWarehouse: true,
      
      // All Other Pages
      inventory: true,
      plan: true,
      processView: true,
      operatorView: true,
      planView: true,
      machineCapacity: true,
      operatorCapacity: true,
      settingsPage: true,
    },
    admin: {
      // Home Page
      homePage: true,
      
      // Production Order List
      productionOrderList: true,
      addNewPO: true,
      addProductionOrder: true,
      syncPO: true,
      editPO: true,
      removePO: true,
      duplicatePO: true,
      
      // Production Order Details
      productionOrderDetails: true,
      addPart: true,
      addSubAssembly: true,
      addAssembly: true,
      deleteFromDetails: true,
      editPartQty: true,
      approveBlankStore: true,
      confirmAllocation: true,
      
      // After Allocation
      afterAllocation: true,
      dailyTracking: true,
      completeAllocation: true,
      cancelAllocation: true,
      
      // Part List
      partList: true,
      addNewPart: true,
      removePart: true,
      duplicatePart: true,
      duplicateTo: true,
      editPart: true,
      
      // Single Part Pages (CRUD operations)
      generalVariable: true,
      rawMaterial: true,
      manufacturingVariable: true,
      shipment: true,
      overheads: true,
      
      // Variables Page
      variablesPage: true,
      variablesGeneral: true,
      variablesRawMaterial: true,
      variablesManufacturing: true,
      variablesShipment: true,
      variablesOverheads: true,
      variablesOperator: true,
      variablesShift: true,
      variablesEventScheduler: true,
      variablesIncharge: true,
      variablesWarehouse: true,
      
      // All Other Pages
      inventory: true,
      plan: true,
      processView: true,
      operatorView: true,
      planView: true,
      machineCapacity: true,
      operatorCapacity: true,
      settingsPage: false,
    },
    incharge: {
      // Home Page
      homePage: true,
      
      // Production Order List
      productionOrderList: true,
      addNewPO: false,
      addProductionOrder: false,
      syncPO: false,
      editPO: false,
      removePO: false,
      duplicatePO: false,
      
      // Production Order Details
      productionOrderDetails: true,
      addPart: false,
      addSubAssembly: false,
      addAssembly: false,
      deleteFromDetails: false,
      editPartQty: true,
      approveBlankStore: true,
      confirmAllocation: true,
      
      // After Allocation
      afterAllocation: true,
      dailyTracking: true,
      completeAllocation: true,
      cancelAllocation: false,
      
      // Part List
      partList: true,
      addNewPart: false,
      removePart: false,
      duplicatePart: false,
      duplicateTo: false,
      editPart: false,
      
      // Single Part Pages (CRUD operations)
      generalVariable: false,
      rawMaterial: false,
      manufacturingVariable: false,
      shipment: false,
      overheads: false,
      
      // Variables Page
      variablesPage: true,
      variablesGeneral: false,
      variablesRawMaterial: false,
      variablesManufacturing: false,
      variablesShipment: false,
      variablesOverheads: false,
      variablesOperator: false,
      variablesShift: false,
      variablesEventScheduler: false,
      variablesIncharge: false,
      variablesWarehouse: false,
      
      // All Other Pages
      inventory: true,
      plan: true,
      processView: true,
      operatorView: true,
      planView: true,
      machineCapacity: true,
      operatorCapacity: true,
      settingsPage: false,
    },
  });

  // Organized modules by categories
  const modules = [
    {
      category: "Main Pages",
      items: [
        { key: "homePage", label: "Home Page" },
        { key: "inventory", label: "Inventory" },
        { key: "plan", label: "Plan" },
        { key: "partList", label: "Parts Page" },
        { key: "variablesPage", label: "Variables Page" },
        { key: "processView", label: "Process View" },
        { key: "operatorView", label: "Operator View" },
        { key: "planView", label: "Plan View" },
        { key: "machineCapacity", label: "Machine Capacity" },
        { key: "operatorCapacity", label: "Operator Capacity" },
        { key: "settingsPage", label: "Settings Page" },
      ]
    },
    {
      category: "Production Order List",
      items: [
        { key: "productionOrderList", label: "Production Order List" },
        { key: "addNewPO", label: "Add New PO" },
        { key: "addProductionOrder", label: "Add Production Order" },
        { key: "syncPO", label: "Sync PO" },
        { key: "editPO", label: "Edit PO" },
        { key: "removePO", label: "Remove PO" },
        { key: "duplicatePO", label: "Duplicate PO" },
      ]
    },
    {
      category: "Production Order Details",
      items: [
        { key: "productionOrderDetails", label: "Production Order Details" },
        { key: "addPart", label: "Add Part" },
        { key: "addSubAssembly", label: "Add Sub Assembly" },
        { key: "addAssembly", label: "Add Assembly" },
        { key: "deleteFromDetails", label: "Delete" },
        { key: "editPartQty", label: "Edit Part Qty" },
        { key: "approveBlankStore", label: "Approve Blank Store" },
        { key: "confirmAllocation", label: "Confirm Allocation" },
      ]
    },
    {
      category: "After Allocation",
      items: [
        { key: "afterAllocation", label: "After Allocation" },
        { key: "dailyTracking", label: "Daily Tracking" },
        { key: "completeAllocation", label: "Complete Allocation" },
        { key: "cancelAllocation", label: "Cancel Allocation" },
      ]
    },
    {
      category: "Part List Operations",
      items: [
        { key: "addNewPart", label: "Add New" },
        { key: "removePart", label: "Remove" },
        { key: "duplicatePart", label: "Duplicate" },
        { key: "duplicateTo", label: "Duplicate To" },
        { key: "editPart", label: "Edit" },
      ]
    },
    {
      category: "Single Part Operations",
      items: [
        { key: "generalVariable", label: "General Variable" },
        { key: "rawMaterial", label: "Raw Material" },
        { key: "manufacturingVariable", label: "Manufacturing Variable" },
        { key: "shipment", label: "Shipment" },
        { key: "overheads", label: "Overheads" },
      ]
    },
    {
      category: "Variables Page",
      items: [
        { key: "variablesGeneral", label: "General" },
        { key: "variablesRawMaterial", label: "Raw Material" },
        { key: "variablesManufacturing", label: "Manufacturing" },
        { key: "variablesShipment", label: "Shipment" },
        { key: "variablesOverheads", label: "Overheads" },
        { key: "variablesOperator", label: "Operator" },
        { key: "variablesShift", label: "Shift" },
        { key: "variablesEventScheduler", label: "Event Scheduler" },
        { key: "variablesIncharge", label: "Incharge" },
        { key: "variablesWarehouse", label: "Warehouse" },
      ]
    },
  ];

  const roles = [
    { key: "super-admin", label: "Super Admin" },
    { key: "admin", label: "Admin" },
    { key: "incharge", label: "Incharge" },
  ];

  const handlePermissionChange = (moduleKey) => {
    setPermissions((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [moduleKey]: !prev[selectedRole][moduleKey],
      },
    }));
    setHasChanges(true);
  };

  const handleSelectAllCategory = (category) => {
    setPermissions((prev) => {
      const updatedPermissions = { ...prev[selectedRole] };
      category.items.forEach(item => {
        updatedPermissions[item.key] = true;
      });
      return {
        ...prev,
        [selectedRole]: updatedPermissions,
      };
    });
    setHasChanges(true);
  };

  const handleDeselectAllCategory = (category) => {
    setPermissions((prev) => {
      const updatedPermissions = { ...prev[selectedRole] };
      category.items.forEach(item => {
        updatedPermissions[item.key] = false;
      });
      return {
        ...prev,
        [selectedRole]: updatedPermissions,
      };
    });
    setHasChanges(true);
  };

  const handleSavePermissions = () => {
    // In production, this would save to backend
    toast.success("Permissions saved successfully!");
    setHasChanges(false);
  };

  const handleResetPermissions = () => {
    // Reset to original state (would fetch from backend in production)
    toast.info("Permissions reset to last saved state");
    setHasChanges(false);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h5 className="mb-1 fw-semibold">
            <i className="ri-lock-line me-2 text-primary"></i>
            Access Control
          </h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.8rem" }}>
            Manage role-based permissions for pages and functionalities
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0 me-2 fw-medium" style={{ fontSize: "0.875rem" }}>Role:</label>
          <Input
            type="select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{ width: "180px" }}
            className="form-select-sm"
          >
            {roles.map(role => (
              <option key={role.key} value={role.key}>{role.label}</option>
            ))}
          </Input>
          {hasChanges && (
            <>
              <Button
                size="sm"
                color="secondary"
                className="ms-2"
                onClick={handleResetPermissions}
              >
                <i className="ri-refresh-line me-1"></i>
                Reset
              </Button>
              <Button size="sm" color="success" onClick={handleSavePermissions}>
                <i className="ri-save-line me-1"></i>
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <Row>
        <Col lg={12}>
          <Card className="shadow-sm mb-2">
            <CardHeader className="bg-light py-2 px-3">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="card-title mb-0 fw-semibold">
                  Permission Matrix
                </h6>
                <Badge color="primary" className="px-2 py-1" style={{ fontSize: "0.75rem" }}>
                  {roles.find(role => role.key === selectedRole)?.label}
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table table-sm table-bordered table-hover align-middle mb-0" style={{ fontSize: "0.875rem" }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40%" }} className="fw-semibold">Functionality / Page</th>
                      {roles.map(role => (
                        <th key={role.key} className="text-center" style={{ width: "20%" }}>
                          {role.label}
                        </th>
                      ))}
                      <th className="text-center" style={{ width: "20%" }}>
                        Quick Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map((category, catIndex) => (
                      <React.Fragment key={category.category}>
                        <tr className="table-active">
                          <td colSpan="5" className="fw-bold py-2" style={{ backgroundColor: "#f8f9fa" }}>
                            <i className="ri-folder-2-line me-2 text-primary"></i>
                            <span className="text-uppercase" style={{ fontSize: "0.8rem", letterSpacing: "0.5px" }}>
                              {category.category}
                            </span>
                          </td>
                        </tr>
                        {category.items.map((module) => (
                          <tr key={module.key} style={{ transition: "background-color 0.2s" }}>
                            <td className="py-2">
                              <div className="d-flex align-items-center ps-3">
                                <i className="ri-checkbox-blank-line me-2 text-muted" style={{ fontSize: "1rem" }}></i>
                                <span className="text-dark">{module.label}</span>
                              </div>
                            </td>
                            {roles.map(role => (
                              <td key={role.key} className="text-center py-2">
                                <div className="form-check form-switch d-flex justify-content-center mb-0">
                                  <Input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={permissions[role.key][module.key]}
                                    onChange={() => {
                                      if (role.key === selectedRole) {
                                        handlePermissionChange(module.key);
                                      }
                                    }}
                                    disabled={role.key !== selectedRole}
                                    style={{ cursor: role.key === selectedRole ? "pointer" : "not-allowed", width: "2.5rem", height: "1.25rem" }}
                                  />
                                </div>
                              </td>
                            ))}
                            <td className="text-center py-2">
                              <div className="btn-group btn-group-sm" role="group">
                                <Button
                                  size="sm"
                                  outline
                                  color="success"
                                  onClick={() => handleSelectAllCategory(category)}
                                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                >
                                  All
                                </Button>
                                <Button
                                  size="sm"
                                  outline
                                  color="danger"
                                  onClick={() => handleDeselectAllCategory(category)}
                                  style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                                >
                                  None
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <div className="alert alert-info d-flex align-items-start mt-2 mb-0 py-2" role="alert" style={{ fontSize: "0.8rem" }}>
        <i className="ri-information-line me-2 mt-1" style={{ fontSize: "1rem" }}></i>
        <div className="w-100">
          <strong className="d-block mb-1" style={{ fontSize: "0.85rem" }}>Usage Guidelines:</strong>
          <div className="row g-1">
            <div className="col-md-4">
              <small style={{ fontSize: "0.75rem" }}>
                <strong>Toggle Switch:</strong> Click to enable/disable permission for selected role
              </small>
            </div>
            <div className="col-md-4">
              <small style={{ fontSize: "0.75rem" }}>
                <strong>All Button:</strong> Enable all permissions in the category
              </small>
            </div>
            <div className="col-md-4">
              <small style={{ fontSize: "0.75rem" }}>
                <strong>None Button:</strong> Disable all permissions in the category
              </small>
            </div>
          </div>
          <div className="mt-1">
            <small style={{ fontSize: "0.75rem" }}>
              <strong>Note:</strong> You can only modify permissions for the currently selected role
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessControl;