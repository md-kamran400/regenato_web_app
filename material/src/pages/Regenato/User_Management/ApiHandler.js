// ApiHandler.jsx - Complete API configurations
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Table,
  Button,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Spinner,
  Row,
  Col,
  InputGroup,
  InputGroupText,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import {
  FaEye,
  FaEdit,
  FaSearch,
  FaSyncAlt,
  FaClock,
  FaFileCode,
  FaServer,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import classnames from "classnames";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

// Complete API response structures for all endpoints
const apiResponses = {
  // 1. ClsIncoming API
  ClsIncoming: {
    endpoint: "http://182.77.56.228:85/api/ClsIncoming",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
    responseFields: [
      { name: "ItemCode", type: "string", description: "Item code identifier" },
      { name: "ItemName", type: "string", description: "Name of the item" },
      { name: "ItmsGrpNam", type: "string", description: "Item group name" },
      { name: "Warehouse", type: "string", description: "Warehouse code" },
      { name: "Onhand", type: "number", description: "Current stock quantity" },
      {
        name: "InvntryUom",
        type: "string",
        description: "Inventory unit of measure",
      },
      { name: "AvgPrice", type: "number", description: "Average price" },
    ],
    sampleResponse: `[
  {
    "ItemCode": "01-111-00",
    "ItemName": "test1",
    "ItmsGrpNam": "PART NO",
    "Warehouse": "test1",
    "Onhand": "3.000000",
    "InvntryUom": "test1",
    "AvgPrice": "25.500000"
  }
]`,
  },

  // 2. Product API (Production)
  Product: {
    endpoint: "http://182.77.56.228:90/Production/Product",
    method: "GET / POST",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
    responseFields: [
      { name: "Series", type: "string", description: "Series identifier" },
      {
        name: "postingdate",
        type: "date",
        description: "Document posting date",
      },
      {
        name: "Status",
        type: "string",
        description: "Production status (R=Released)",
      },
      {
        name: "DocEntry",
        type: "number",
        description: "Document entry number",
      },
      { name: "DocNum", type: "number", description: "Document number" },
      { name: "ItemCode", type: "string", description: "Item code" },
      { name: "ProdName", type: "string", description: "Product name" },
      { name: "PlannedQty", type: "number", description: "Planned quantity" },
      { name: "Warehouse", type: "string", description: "Warehouse code" },
    ],
    sampleResponse: `[
  {
    "Series": "f12001",
    "postingdate": "2020-08-21",
    "Status": "R",
    "DocEntry": 12555,
    "DocNum": 2648,
    "ItemCode": "TEST-101",
    "ProdName": "TEST Unit",
    "PlannedQty": 20.000000,
    "Warehouse": "TEST",
  }
]`,
  },

  // 3. GetGoodsIssue API
  GetGoodsIssue: {
    endpoint: "http://182.77.56.228:90/GoodsIssue/GetGoodsIssue",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
    responseFields: [
      {
        name: "Series",
        type: "string",
        description: "Series identifier (e.g., GI2025)",
      },
      { name: "postingdate", type: "date", description: "Posting date" },
      { name: "Itemcode", type: "string", description: "Item code" },
      { name: "Descrption", type: "string", description: "Item description" },
      { name: "Quantity", type: "number", description: "Issued quantity" },
      { name: "UnitPrice", type: "number", description: "Unit price" },
      { name: "WhsCode", type: "string", description: "Warehouse code" },
      {
        name: "ProductionNo",
        type: "string",
        description: "Production number",
      },
      { name: "LineTotal", type: "number", description: "Total amount" },
      { name: "Project", type: "string", description: "Project code" },
    ],
    sampleResponse: `[
  {
    "Series": "TEST2025",
    "postingdate": "2025-12-02",
    "Itemcode": "TEST0020",
    "Descrption": "TEST",
    "Quantity": 19.557000,
    "UnitPrice": 90.570000,
    "WhsCode": "TST",
    "ProductionNo": "TEOD001",
    "LineTotal": 1770.85,
    "Project": "TEST2024"
  }
]`,
  },

  // 4. GetGoodsReceipt API
  GetGoodsReceipt: {
    endpoint: "http://182.77.56.228:90/GoodsReceipt/GetGoodsReceipt",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    timeout: 5000,
    responseFields: [
      {
        name: "Series",
        type: "string",
        description: "Series identifier (e.g., GR2025)",
      },
      { name: "postingdate", type: "date", description: "Posting date" },
      { name: "Itemcode", type: "string", description: "Item code" },
      { name: "Descrption", type: "string", description: "Item description" },
      { name: "Quantity", type: "number", description: "Received quantity" },
      { name: "UnitPrice", type: "number", description: "Unit price" },
      { name: "WhsCode", type: "string", description: "Warehouse code" },
      {
        name: "ProductionNo",
        type: "string",
        description: "Production number",
      },
      { name: "Supplier", type: "string", description: "Supplier code" },
      { name: "BatchNo", type: "string", description: "Batch number" },
    ],
    sampleResponse: `[
  {
    "Series": "TEST2025",
    "postingdate": "2025-12-02",
    "Itemcode": "TEST0087A-0",
    "Descrption": "TEST",
    "Quantity": 1.000000,
    "UnitPrice": 390.000000,
    "WhsCode": "TEST",
    "ProductionNo": "TESTOD001",
    "Supplier": "TEST001",
    "BatchNo": "TEST2025-12"
  }
]`,
  },

  // 5. PostInventory API
  PostInventory: {
    endpoint: "http://182.77.56.228:90/Inventory/PostInventory",
    method: "POST",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 1000,
    requestBody: {
      DocDate: "2025-09-05T18:30:00.000Z",
      ItemCode: "01-008-00",
      Dscription: "C2 - VMC Local",
      Quantity: 10,
      WhsCode: "BLNK-H",
      FromWhsCod: "01",
    },
    responseFields: [
      {
        name: "DocDate",
        type: "string",
        description: "Document date in ISO format",
      },
      { name: "ItemCode", type: "string", description: "Item code identifier" },
      { name: "Dscription", type: "string", description: "Item description" },
      { name: "Quantity", type: "number", description: "Quantity to post" },
      {
        name: "WhsCode",
        type: "string",
        description: "Destination warehouse code",
      },
      {
        name: "FromWhsCod",
        type: "string",
        description: "Source warehouse code",
      },
    ],
    sampleRequest: `{
  "DocDate": "2025-09-05T18:30:00.000Z",
  "ItemCode": "01-008-00",
  "Dscription": "TEST-V2",
  "Quantity": 10,
  "WhsCode": "TEST-H",
  "FromWhsCod": "01",
}`,
    successResponse: `{
  "success": true,
  "message": "Inventory posted successfully",
  "data": {
  "DocDate": "2025-09-05T18:30:00.000Z",
  "ItemCode": "01-008-00",
  "Dscription": "C2 - TEST",
  "Quantity": 10,
  "WhsCode": "TEST-H",
  "FromWhsCod": "01",
  }
}`,
  },

  // 6. GetProductionOrders API (if exists)
  GetProductionOrders: {
    endpoint: "http://182.77.56.228:90/Production/GetProductionOrders",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
      "X-Production-Key": "prod_key_2024",
    },
    timeout: 5000,
    responseFields: [
      {
        name: "OrderNo",
        type: "string",
        description: "Production order number",
      },
      { name: "OrderDate", type: "date", description: "Order date" },
      { name: "ItemCode", type: "string", description: "Product item code" },
      { name: "ItemName", type: "string", description: "Product name" },
      { name: "PlannedQty", type: "number", description: "Planned quantity" },
      {
        name: "CompletedQty",
        type: "number",
        description: "Completed quantity",
      },
      { name: "Status", type: "string", description: "Order status" },
      { name: "DueDate", type: "date", description: "Due date" },
      { name: "Priority", type: "string", description: "Priority level" },
    ],
    sampleResponse: `[
  {
    "OrderNo": "TEST-2024-001",
    "OrderDate": "2024-01-15",
    "ItemCode": "TEST-01",
    "ItemName": "TEST Unit",
    "PlannedQty": 100,
    "CompletedQty": 75,
    "Status": "In Progress",
    "DueDate": "2024-01-30",
    "Priority": "High"
  }
]`,
  },

  // 7. GetStockTransfer API (if exists)
  GetStockTransfer: {
    endpoint: "http://182.77.56.228:90/Inventory/GetStockTransfer",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer transfer_token",
    },
    timeout: 5000,
    responseFields: [
      {
        name: "TransferNo",
        type: "string",
        description: "Transfer document number",
      },
      { name: "TransferDate", type: "date", description: "Transfer date" },
      {
        name: "FromWarehouse",
        type: "string",
        description: "Source warehouse",
      },
      {
        name: "ToWarehouse",
        type: "string",
        description: "Destination warehouse",
      },
      { name: "ItemCode", type: "string", description: "Item code" },
      { name: "Quantity", type: "number", description: "Transfer quantity" },
      { name: "Status", type: "string", description: "Transfer status" },
      { name: "Remarks", type: "string", description: "Transfer remarks" },
    ],
    sampleResponse: `[
  {
    "TransferNo": "ST-2024-001",
    "TransferDate": "2024-01-15",
    "FromWarehouse": "WH01",
    "ToWarehouse": "WH02",
    "ItemCode": "01-008-00",
    "Quantity": 50,
    "Status": "Completed",
    "Remarks": "Regular transfer"
  }
]`,
  },

  // 8. GetItems API (if exists)
  GetItems: {
    endpoint: "http://182.77.56.228:90/MasterData/GetItems",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
    responseFields: [
      { name: "ItemCode", type: "string", description: "Item code" },
      { name: "ItemName", type: "string", description: "Item name" },
      { name: "ItemGroup", type: "string", description: "Item group" },
      { name: "Uom", type: "string", description: "Unit of measure" },
      { name: "Price", type: "number", description: "Standard price" },
      { name: "Active", type: "string", description: "Active status (Y/N)" },
      { name: "CreatedDate", type: "date", description: "Creation date" },
    ],
    sampleResponse: `[
  {
    "ItemCode": "01-001-00",
    "ItemName": "Bolt 10mm",
    "ItemGroup": "FASTENERS",
    "Uom": "PCS",
    "Price": 5.25,
    "Active": "Y",
    "CreatedDate": "2023-01-01"
  }
]`,
  },

  // 9. GetWarehouses API (if exists)
  GetWarehouses: {
    endpoint: "http://182.77.56.228:90/MasterData/GetWarehouses",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 5000,
    responseFields: [
      { name: "WhsCode", type: "string", description: "Warehouse code" },
      { name: "WhsName", type: "string", description: "Warehouse name" },
      { name: "Location", type: "string", description: "Physical location" },
      { name: "Manager", type: "string", description: "Warehouse manager" },
      { name: "Status", type: "string", description: "Active status" },
    ],
    sampleResponse: `[
  {
    "WhsCode": "WH01",
    "WhsName": "Main Warehouse",
    "Location": "Building A",
    "Manager": "John Doe",
    "Status": "Active"
  }
]`,
  },

  // 10. PostGoodsReceipt API (if exists)
  PostGoodsReceipt: {
    endpoint: "http://182.77.56.228:90/GoodsReceipt/PostGoodsReceipt",
    method: "POST",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-GR-Key": "goods_receipt_key",
    },
    timeout: 1000,
    responseFields: [
      { name: "DocDate", type: "string", description: "Document date" },
      { name: "Supplier", type: "string", description: "Supplier code" },
      { name: "ItemCode", type: "string", description: "Item code" },
      { name: "Quantity", type: "number", description: "Received quantity" },
      { name: "Price", type: "number", description: "Unit price" },
      { name: "Warehouse", type: "string", description: "Warehouse code" },
      { name: "BatchNo", type: "string", description: "Batch number" },
      { name: "Remarks", type: "string", description: "Receipt remarks" },
    ],
    sampleRequest: `{
  "DocDate": "2025-01-15T10:30:00.000Z",
  "Supplier": "SUP001",
  "ItemCode": "01-008-00",
  "Quantity": 100,
  "Price": 25.50,
  "Warehouse": "BLNK-H",
  "BatchNo": "BATCH2025-01",
  "Remarks": "Monthly stock receipt"
}`,
    successResponse: `{
  "success": true,
  "message": "Goods receipt posted successfully",
  "data": {
    "DocNum": 54321,
    "DocEntry": 98765,
    "ReferenceNo": "GR-2025-001",
    "TotalAmount": 2550.00
  }
}`,
  },

  // 11. PostGoodsIssue API (if exists)
  PostGoodsIssue: {
    endpoint: "http://182.77.56.228:90/GoodsIssue/PostGoodsIssue",
    method: "POST",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-GI-Key": "goods_issue_key",
    },
    timeout: 1000,
    responseFields: [
      { name: "DocDate", type: "string", description: "Document date" },
      { name: "Project", type: "string", description: "Project code" },
      { name: "ItemCode", type: "string", description: "Item code" },
      { name: "Quantity", type: "number", description: "Issued quantity" },
      { name: "Warehouse", type: "string", description: "Warehouse code" },
      { name: "CostCenter", type: "string", description: "Cost center" },
      { name: "Remarks", type: "string", description: "Issue remarks" },
    ],
    sampleRequest: `{
  "DocDate": "2025-01-15T14:30:00.000Z",
  "Project": "PRJ2024",
  "ItemCode": "01-008-00",
  "Quantity": 25,
  "Warehouse": "BLNK-H",
  "CostCenter": "CC001",
  "Remarks": "For production line"
}`,
    successResponse: `{
  "success": true,
  "message": "Goods issue posted successfully",
  "data": {
    "DocNum": 67890,
    "DocEntry": 12345,
    "ReferenceNo": "GI-2025-001",
    "TotalCost": 637.50
  }
}`,
  },

  // 12. GetDashboardStats API (if exists)
  GetDashboardStats: {
    endpoint: "http://182.77.56.228:90/Dashboard/GetStats",
    method: "GET",
    status: "Active",
    headers: {
      "Content-Type": "application/json",
      "X-Dashboard-Key": "dashboard_stats_key",
    },
    timeout: 3000,
    responseFields: [
      {
        name: "totalItems",
        type: "number",
        description: "Total items in inventory",
      },
      {
        name: "activeOrders",
        type: "number",
        description: "Active production orders",
      },
      {
        name: "pendingReceipts",
        type: "number",
        description: "Pending goods receipts",
      },
      {
        name: "pendingIssues",
        type: "number",
        description: "Pending goods issues",
      },
      {
        name: "lowStockItems",
        type: "number",
        description: "Items with low stock",
      },
      {
        name: "monthlyProduction",
        type: "number",
        description: "Monthly production quantity",
      },
      {
        name: "monthlyConsumption",
        type: "number",
        description: "Monthly consumption",
      },
    ],
    sampleResponse: `{
  "totalItems": 1250,
  "activeOrders": 45,
  "pendingReceipts": 12,
  "pendingIssues": 8,
  "lowStockItems": 23,
  "monthlyProduction": 12500,
  "monthlyConsumption": 9800,
  "updatedAt": "2025-01-15T15:30:00.000Z"
}`,
  },

  // Add more APIs as needed...
};

// Helper function to get API configuration
const getApiConfig = (apiKey, apiUrl = "") => {
  // Direct match for predefined APIs
  if (apiResponses[apiKey]) {
    return apiResponses[apiKey];
  }

  // Check for partial matches based on common patterns
  const lowerKey = apiKey.toLowerCase();
  const lowerUrl = apiUrl.toLowerCase();

  // Pattern matching for common API types
  if (lowerKey.includes("inventory") || lowerUrl.includes("inventory")) {
    return apiResponses.PostInventory || apiResponses.GetStockTransfer;
  }
  if (lowerKey.includes("product") || lowerUrl.includes("product")) {
    return apiResponses.Product;
  }
  if (lowerKey.includes("goodsissue") || lowerUrl.includes("goodsissue")) {
    return apiResponses.GetGoodsIssue;
  }
  if (lowerKey.includes("goodsreceipt") || lowerUrl.includes("goodsreceipt")) {
    return apiResponses.GetGoodsReceipt;
  }
  if (lowerKey.includes("incoming") || lowerKey.includes("cls")) {
    return apiResponses.ClsIncoming;
  }
  if (lowerKey.includes("warehouse") || lowerUrl.includes("warehouse")) {
    return apiResponses.GetWarehouses;
  }
  if (lowerKey.includes("item") || lowerUrl.includes("item")) {
    return apiResponses.GetItems;
  }
  if (lowerKey.includes("dashboard") || lowerUrl.includes("dashboard")) {
    return apiResponses.GetDashboardStats;
  }

  // Determine method from URL or key
  const isPostRequest = lowerKey.includes("post") || lowerUrl.includes("post");

  // Return appropriate configuration
  if (isPostRequest) {
    // For POST APIs, use PostInventory as template
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 1000,
      responseFields: apiResponses.PostInventory.responseFields,
      sampleRequest: apiResponses.PostInventory.sampleRequest,
      successResponse: apiResponses.PostInventory.successResponse,
      errorResponse: apiResponses.PostInventory.errorResponse,
    };
  } else {
    // For GET APIs, use ClsIncoming as template
    return {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 5000,
      responseFields: apiResponses.ClsIncoming.responseFields,
      sampleResponse: apiResponses.ClsIncoming.sampleResponse,
    };
  }
};

const ApiHandler = () => {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState(null);
  const [modalType, setModalType] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm, setEditForm] = useState({
    key: "",
    url: "",
    alternateUrlKey: "",
  });
  const [activeTab, setActiveTab] = useState("1");

  // Fetch all APIs
  const fetchApis = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:4040/api/externalLink_list"
      );
      const data = await response.json();

      // Enhance API data with specific configurations
      const enhancedApis = data.map((api) => {
        const apiConfig = getApiConfig(api.key, api.url);

        // Merge API configuration with database data
        return {
          ...api,
          ...apiConfig,
          endpoint: api.url || apiConfig.endpoint,
          // Ensure all required fields exist
          responseFields: apiConfig.responseFields || [],
          sampleResponse:
            apiConfig.sampleResponse ||
            apiConfig.successResponse ||
            "No sample response available",
          sampleRequest: apiConfig.sampleRequest || "",
          successResponse: apiConfig.successResponse || "",
          errorResponse: apiConfig.errorResponse || "",
          headers: apiConfig.headers || { "Content-Type": "application/json" },
          timeout:
            apiConfig.timeout || (apiConfig.method === "POST" ? 1000 : 5000),
        };
      });

      setApis(enhancedApis);
    } catch (error) {
      toast.error("Failed to fetch APIs");
      console.error("Error fetching APIs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, []);

  // Filter APIs based on search term
  const filteredApis = apis.filter(
    (api) =>
      api.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (api.alternateUrlKey &&
        api.alternateUrlKey.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Toggle API status
  const toggleApiStatus = async (key, currentStatus) => {
    try {
      const response = await fetch(
        "http://localhost:4040/api/externalLink_toggle",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            active: !currentStatus,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setApis(
          apis.map((api) =>
            api.key === key ? { ...api, active: !currentStatus } : api
          )
        );
        toast.success(
          result.message ||
            `API ${!currentStatus ? "activated" : "deactivated"} successfully`
        );
      } else {
        toast.error(result.error || "Failed to toggle API status");
      }
    } catch (error) {
      toast.error("Error toggling API status");
      console.error("Error:", error);
    }
  };

  // Update API URL
  const updateApiUrl = async () => {
    try {
      const response = await fetch(
        "http://localhost:4040/api/externalLink_update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key: editForm.key,
            url: editForm.url,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setApis(
          apis.map((api) =>
            api.key === editForm.key ? { ...api, url: editForm.url } : api
          )
        );
        toast.success("API URL updated successfully");
        setModalOpen(false);
      } else {
        toast.error(result.error || "Failed to update API URL");
      }
    } catch (error) {
      toast.error("Error updating API URL");
      console.error("Error:", error);
    }
  };

  // Handle modal open for view
  const handleView = (api) => {
    setSelectedApi(api);
    setModalType("view");
    setModalOpen(true);
    setActiveTab("1");
  };

  // Handle modal open for edit
  const handleEdit = (api) => {
    setSelectedApi(api);
    setEditForm({
      key: api.key,
      url: api.url,
      alternateUrlKey: api.alternateUrlKey || "",
    });
    setModalType("edit");
    setModalOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Toggle between tabs
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };

  // Format headers for display
  const formatHeaders = (headers) => {
    if (!headers) return "No headers configured";
    return JSON.stringify(headers, null, 2);
  };

  // Get API type badge color
  const getApiTypeColor = (method) => {
    switch (method) {
      case "GET":
        return "info";
      case "POST":
        return "success";
      case "PUT":
        return "warning";
      case "DELETE":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      {/* <Container className="mt-4"> */}
      <div style={{ marginTop: "25px" }} className="p-2">
        <BreadCrumb title="API Management" pageTitle="API" />
      </div>
      <Card className="shadow-sm border-0 p-3">
        <CardHeader className="text-white d-flex justify-content-between align-items-center py-1">
          <div>
            <h4 className="mb-0">API Configuration Handler</h4>
            <small className="opacity-75">
              Manage and monitor all API endpoints
            </small>
          </div>
          <div className="d-flex gap-2">
            <Button color="light" onClick={fetchApis} disabled={loading}>
              <FaSyncAlt className={loading ? "spin" : ""} />{" "}
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          {/* Search Bar */}
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <InputGroupText>
                  <FaSearch />
                </InputGroupText>
                <Input
                  type="text"
                  placeholder="Search APIs by name, endpoint, or alternate key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col
              md={6}
              className="d-flex justify-content-end align-items-center"
            >
              <Badge color="black" className="text-dark me-2">
                <div
                  style={{
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  <FaServer className="me-1" /> {apis.length} APIs
                </div>
              </Badge>
              <Badge color="success" className="me-2">
                <div
                  style={{
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  Active: {apis.filter((a) => a.active).length}
                </div>
              </Badge>
              <Badge color="danger">
                <div
                  style={{
                    padding: "3px",
                    fontWeight: "bold",
                  }}
                >
                  Inactive: {apis.filter((a) => !a.active).length}
                </div>
              </Badge>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner color="primary" size="lg" />
              <p className="mt-3 text-muted">Loading API configurations...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="20%">API Name</th>
                    <th width="40%">Endpoint URL</th>
                    <th width="10%">Method</th>
                    <th width="15%">Status</th>
                    <th width="10%" className="text-center">
                      Toggle
                    </th>
                    <th width="15%" className="text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApis.map((api) => (
                    <tr
                      key={api._id || api.key}
                      className={!api.active ? "table-secondary" : ""}
                    >
                      <td>
                        <div>
                          <strong className="d-block">{api.key}</strong>
                          {/* <small className="text-muted">
                            {api.alternateUrlKey || "No alternate key"}
                          </small> */}
                        </div>
                      </td>
                      <td>
                        <div
                          className="text-truncate fw-bold"
                          style={{ maxWidth: "350px" }}
                          title={api.url}
                        >
                          <code className="small">{api.url}</code>
                        </div>
                      </td>
                      <td>
                        <Badge
                          color={getApiTypeColor(api.method)}
                          pill
                          className="px-3 py-1"
                        >
                          <div
                            style={{
                              padding: "3px",
                              fontWeight: "bold",
                            }}
                          >
                            {api.method || "GET"}
                          </div>
                        </Badge>
                      </td>
                      <td>
                        <Badge
                          color={api.active ? "success" : "danger"}
                          pill
                          className="px-3 py-1"
                        >
                          <div
                            style={{
                              padding: "3px",
                              fontWeight: "bold",
                            }}
                          >
                            {api.active ? "ACTIVE" : "INACTIVE"}
                          </div>
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="form-check form-switch d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`switch-${api.key}`}
                            checked={api.active}
                            onChange={() =>
                              toggleApiStatus(api.key, api.active)
                            }
                            style={{
                              width: "3em",
                              height: "1.5em",
                              cursor: "pointer",
                            }}
                          />
                          <label
                            className="form-check-label ms-2"
                            htmlFor={`switch-${api.key}`}
                            style={{ cursor: "pointer" }}
                          >
                            {api.active ? "ON" : "OFF"}
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            onClick={() => handleView(api)}
                            title="View API Details"
                            className="btn btn-sm btn-success"
                          >
                            <FaEye size={15} />
                          </Button>
                          <button
                            onClick={() => handleEdit(api)}
                            title="Edit API Configuration"
                            className="btn btn-sm btn-success"
                          >
                            <FaEdit size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredApis.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <FaSearch size={24} className="mb-2" />
                          <p>No APIs found matching "{searchTerm}"</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={modalOpen && modalType === "view"}
        toggle={() => setModalOpen(false)}
        size="xl"
        className="modal-dialog-scrollable"
      >
        <ModalHeader
          toggle={() => setModalOpen(false)}
          className=" text-white"
        >
          <div>
            <h5 className="mb-0">
              <FaFileCode className="me-2" />
              API Details - {selectedApi?.key}
            </h5>
            <small className="opacity-75">
              {selectedApi?.alternateUrlKey &&
                `Alt Key: ${selectedApi.alternateUrlKey} | `}
              Method: {selectedApi?.method} | Status:{" "}
              {selectedApi?.active ? "Active" : "Inactive"}
            </small>
          </div>
        </ModalHeader>
        <ModalBody>
          {selectedApi && (
            <>
              <Nav tabs className="mb-3">
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      toggleTab("1");
                    }}
                  >
                    <FaEye className="me-2" />
                    Overview
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      toggleTab("2");
                    }}
                  >
                    <FaFileCode className="me-2" />
                    Response Structure
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggleTab("3");
                    }}
                  >
                    <FaClock className="me-2" />
                    Request Details
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab}>
                {/* Tab 1: Overview */}
                <TabPane tabId="1">
                  <Row>
                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FaServer className="me-2" />
                          API Information
                        </h6>
                        <div className="p-3 bg-light rounded border">
                          <p className="mb-2 d-flex justify-content-between">
                            <span>
                              <strong>API Key:</strong>
                            </span>
                            <code className="ms-2">{selectedApi.key}</code>
                          </p>
                          {selectedApi.alternateUrlKey && (
                            <p className="mb-2 d-flex justify-content-between">
                              <span>
                                <strong>Alternate Key:</strong>
                              </span>
                              <span className="text-muted">
                                {selectedApi.alternateUrlKey}
                              </span>
                            </p>
                          )}
                          <p className="mb-3 d-flex justify-content-between align-items-center">
                            <span className="text-muted">
                              <strong>Status</strong>
                            </span>
                            <Badge
                              className="px-4 py-2 text-uppercase"
                              color={selectedApi.active ? "success" : "danger"}
                              pill
                            >
                              <div
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                  padding: "3px",
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedApi.active ? "Active" : "Inactive"}
                              </div>
                            </Badge>
                          </p>

                          <p className="mb-3 d-flex justify-content-between align-items-center">
                            <span className="text-muted">
                              <strong>Method</strong>
                            </span>
                            <Badge
                              className="px-4 py-2 text-uppercase"
                              color={getApiTypeColor(selectedApi.method)}
                              pill
                            >
                              <div
                                className="d-flex justify-content-center align-items-center"
                                style={{
                                  padding: "3px",
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedApi.method || "GET"}
                              </div>
                            </Badge>
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FaClock className="me-2" />
                          Request Configuration
                        </h6>
                        <div className="p-3 bg-light rounded border">
                          <p className="mb-2">
                            <strong>Headers:</strong>
                          </p>
                          <pre className="bg-white p-2 rounded border small">
                            {formatHeaders(selectedApi.headers)}
                          </pre>
                          <p className="mt-2 mb-0 d-flex justify-content-between">
                            <span>
                              <strong>Timeout:</strong>
                            </span>
                            <Badge color="warning" pill>
                              <div
                                style={{
                                  padding: "3px",
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedApi.timeout || 5000}ms
                              </div>
                            </Badge>
                          </p>
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FaFileCode className="me-2" />
                          Endpoint Details
                        </h6>
                        <div className="p-3 bg-light rounded border">
                          <p className="mb-2">
                            <strong>Endpoint URL:</strong>
                          </p>
                          <code className="d-block bg-white p-2 rounded border small text-break">
                            {selectedApi.endpoint || selectedApi.url}
                          </code>
                          <p className="mt-2 mb-0">
                            <strong>Port:</strong>
                            <Badge color="info" className="ms-2">
                              <div
                                style={{
                                  padding: "3px",
                                  fontWeight: "bold",
                                }}
                              >
                                {selectedApi.url?.match(/:(\d+)/)?.[1] ||
                                  "Default"}
                              </div>
                            </Badge>
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="text-muted mb-2">API Description</h6>
                        <div className="p-3 bg-light rounded border">
                          <p className="mb-0 text-muted">
                            {selectedApi.description ||
                              `This is a ${
                                selectedApi.method || "GET"
                              } API endpoint for ${selectedApi.key}. 
                              ${
                                selectedApi.method === "POST"
                                  ? "It accepts JSON request body and returns operation status."
                                  : "It returns data in JSON format."
                              }`}
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </TabPane>

                {/* Tab 2: Response Structure */}
                <TabPane tabId="2">
                  <div className="mb-4">
                    <h6 className="text-muted mb-3">
                      <FaFileCode className="me-2" />
                      Response Fields Structure
                    </h6>
                    <div className="table-responsive">
                      <Table size="sm" bordered hover>
                        <thead className="table-dark">
                          <tr>
                            <th width="25%">Field Name</th>
                            <th width="15%">Type</th>
                            <th width="60%">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedApi.responseFields &&
                          selectedApi.responseFields.length > 0 ? (
                            selectedApi.responseFields.map((field, index) => (
                              <tr key={index}>
                                <td>
                                  <code className="text-primary">
                                    {field.name}
                                  </code>
                                </td>
                                <td>
                                  <Badge
                                    color={
                                      field.type === "string"
                                        ? "info"
                                        : field.type === "number"
                                        ? "success"
                                        : field.type === "date"
                                        ? "warning"
                                        : field.type === "boolean"
                                        ? "danger"
                                        : "secondary"
                                    }
                                    className="text-uppercase"
                                  >
                                    {field.type}
                                  </Badge>
                                </td>
                                <td>{field.description}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="3"
                                className="text-center text-muted py-4"
                              >
                                <FaFileCode size={24} className="mb-2" />
                                <p>No response field information available</p>
                                <small className="text-muted">
                                  Check the API documentation for field details
                                </small>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h6 className="text-muted mb-2">Sample Response</h6>
                    <pre
                      className="bg-dark text-light p-3 rounded border"
                      style={{
                        fontSize: "0.85rem",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {selectedApi.sampleResponse ||
                        selectedApi.successResponse ||
                        "No sample response available"}
                    </pre>
                  </div>

                  {selectedApi.method === "POST" &&
                    selectedApi.errorResponse && (
                      <div className="mb-3">
                        <h6 className="text-muted mb-2">
                          Error Response Example
                        </h6>
                        <pre
                          className="bg-danger text-light p-3 rounded border"
                          style={{
                            fontSize: "0.85rem",
                            maxHeight: "200px",
                            overflowY: "auto",
                          }}
                        >
                          {selectedApi.errorResponse}
                        </pre>
                      </div>
                    )}
                </TabPane>

                {/* Tab 3: Request Details */}
                <TabPane tabId="3">
                  {selectedApi.method === "POST" ? (
                    <>
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          Request Body Structure
                        </h6>
                        <div className="table-responsive">
                          <Table size="sm" bordered hover>
                            <thead className="table-dark">
                              <tr>
                                <th width="20%">Field Name</th>
                                <th width="15%">Type</th>
                                <th width="45%">Description</th>
                                <th width="20%">Required</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedApi.responseFields &&
                              selectedApi.responseFields.length > 0 ? (
                                selectedApi.responseFields.map(
                                  (field, index) => (
                                    <tr key={index}>
                                      <td>
                                        <code className="text-primary">
                                          {field.name}
                                        </code>
                                      </td>
                                      <td>
                                        <Badge
                                          color={
                                            field.type === "string"
                                              ? "info"
                                              : field.type === "number"
                                              ? "success"
                                              : field.type === "date"
                                              ? "warning"
                                              : "secondary"
                                          }
                                          className="text-uppercase"
                                        >
                                          {field.type}=
                                        </Badge>
                                      </td>
                                      <td>{field.description}</td>
                                      <td>
                                        <Badge
                                          color={
                                            field.name === "DocDate" ||
                                            field.name === "ItemCode" ||
                                            field.name === "Quantity"
                                              ? "danger"
                                              : "warning"
                                          }
                                        >
                                          {field.name === "DocDate" ||
                                          field.name === "ItemCode" ||
                                          field.name === "Quantity"
                                            ? "Required"
                                            : "Optional"}
                                        </Badge>
                                      </td>
                                    </tr>
                                  )
                                )
                              ) : (
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="text-center text-muted py-4"
                                  >
                                    <FaFileCode size={24} className="mb-2" />
                                    <p>
                                      No request field information available
                                    </p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </Table>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h6 className="text-muted mb-2">Sample Request Body</h6>
                        <pre
                          className="bg-dark text-light p-3 rounded border"
                          style={{
                            fontSize: "0.85rem",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {selectedApi.sampleRequest ||
                            (selectedApi.requestBody
                              ? JSON.stringify(selectedApi.requestBody, null, 2)
                              : "No sample request available")}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <FaFileCode size={48} className="text-muted mb-3" />
                        <h5 className="text-muted mb-2">GET Request Details</h5>
                        <p className="text-muted">
                          This is a GET endpoint. No request body is required.
                        </p>
                      </div>
                      <div className="mt-4">
                        <Badge color="info" className="me-2 p-2">
                          <strong>Headers:</strong> Content-Type:
                          application/json
                        </Badge>
                        <Badge color="warning" className="me-2 p-2">
                          <strong>Timeout:</strong>{" "}
                          {selectedApi.timeout || 5000}ms
                        </Badge>
                      </div>
                    </div>
                  )}
                </TabPane>
              </TabContent>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modalOpen && modalType === "edit"}
        toggle={() => setModalOpen(false)}
      >
        <ModalHeader
          toggle={() => setModalOpen(false)}
          className=" text-white"
        >
          Edit API Configuration
        </ModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label for="key" className="fw-bold">
                API Key
              </Label>
              <Input
                type="text"
                name="key"
                id="key"
                value={editForm.key}
                disabled
                className="bg-light"
              />
              <small className="text-muted">API key cannot be modified</small>
            </FormGroup>
            <FormGroup>
              <Label for="url" className="fw-bold">
                Endpoint URL *
              </Label>
              <Input
                type="text"
                name="url"
                id="url"
                value={editForm.url}
                onChange={handleInputChange}
                placeholder="Enter API endpoint URL"
                className="font-monospace"
              />
              <small className="text-muted">
                Full URL including protocol and path
              </small>
            </FormGroup>
            {/* <FormGroup>
              <Label for="alternateUrlKey" className="fw-bold">
                Alternate URL Key
              </Label>
              <Input
                type="text"
                name="alternateUrlKey"
                id="alternateUrlKey"
                value={editForm.alternateUrlKey}
                disabled
                className="bg-light"
              />
              <small className="text-muted">For reference purposes only</small>
            </FormGroup> */}
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button color="warning" onClick={updateApiUrl} className="px-4">
            Update URL
          </Button>
          <Button color="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .form-switch .form-check-input {
          background-color: #dc3545;
          border-color: #dc3545;
        }
        .form-switch .form-check-input:checked {
          background-color: #198754;
          border-color: #198754;
        }
        .nav-tabs .nav-link {
          cursor: pointer;
          border: 1px solid transparent;
          border-bottom: none;
        }
        .nav-tabs .nav-link.active {
          background-color: #f8f9fa;
          border-color: #dee2e6 #dee2e6 #f8f9fa;
          color: #495057;
          font-weight: 500;
        }
        .modal-dialog-scrollable .modal-body {
          max-height: 70vh;
          overflow-y: auto;
        }
        code {
          font-family: "Courier New", Courier, monospace;
        }
      `}</style>
      {/* </Container> */}
    </div>
  );
};

export default ApiHandler;
