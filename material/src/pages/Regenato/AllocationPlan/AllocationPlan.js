
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "reactstrap";
import axios from "axios";
import { FiPrinter, FiDownload, FiFilter } from "react-icons/fi";
import { FaProjectDiagram, FaTasks } from "react-icons/fa";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import * as XLSX from "xlsx";

const AllocationPlan = () => {
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloadModal, setDownloadModal] = useState(false);
  const [selectionValues, setSelectionValues] = useState({});

  useEffect(() => {
    fetchAllocations();
  }, []);

  useEffect(() => {
    if (startDate || endDate) {
      handleFilter();
    }
  }, [startDate, endDate]);

  const fetchAllocations = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/api/defpartproject/all-allocations`
      );
      const data = response.data.data;
      setAllocations(data);
      console.log(data)
      setFilteredAllocations(data);
      
      // Initialize selection values with default data
      const initialSelections = {};
      data.forEach(project => {
        project.allocations.forEach(process => {
          process.allocations.forEach(allocation => {
            const key = `${allocation._id}`;
            initialSelections[key] = {
              status: allocation.status || "Fresh",
              materialFrom: allocation.materialFrom || "GR",
              materialTo: allocation.materialTo || "MS"
            };
          });
        });
      });
      setSelectionValues(initialSelections);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      setLoading(false);
    }
  };

  const handleSelectionChange = (allocationId, field, value) => {
    setSelectionValues(prev => ({
      ...prev,
      [allocationId]: {
        ...prev[allocationId],
        [field]: value
      }
    }));
  };

  const handleFilter = () => {
    if (!startDate && !endDate) {
      setFilteredAllocations(allocations);
      return;
    }

    const filtered = allocations
      .map((project) => ({
        ...project,
        allocations: project.allocations
          .map((process) => ({
            ...process,
            allocations: process.allocations.filter((allocation) => {
              const allocationStartDate = new Date(allocation.startDate);
              const filterStartDate = startDate ? new Date(startDate) : null;
              const filterEndDate = endDate ? new Date(endDate) : null;

              return (
                (!filterStartDate || allocationStartDate >= filterStartDate) &&
                (!filterEndDate || allocationStartDate <= filterEndDate)
              );
            }),
          }))
          .filter((process) => process.allocations.length > 0),
      }))
      .filter((project) => project.allocations.length > 0);

    setFilteredAllocations(filtered);
  };

  const handlePrint = () => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        .no-print {
          display: none !important;
        }
        .print-only {
          display: block !important;
        }
        body, html {
          background: white !important;
          font-size: 12px !important;
        }
        .card {
          border: none !important;
          box-shadow: none !important;
        }
        table {
          width: 100% !important;
          font-size: 10px !important;
        }
        th, td {
          padding: 4px !important;
        }
        .table-responsive {
          overflow: visible !important;
        }
        .print-page-break {
          page-break-after: always;
        }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Clean up after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  };

  const handleDownloadExcel = () => {
    setDownloadModal(true);
  };

  const confirmDownload = () => {
    // Prepare data with current selection values
    const excelData = filteredAllocations.flatMap((project) =>
      project.allocations.flatMap((process) =>
        process.allocations.map((allocation) => {
          const selectionKey = `${allocation._id}`;
          const currentSelection = selectionValues[selectionKey] || {};
          
          return {
            Section: `${process.processName} (${
              allocation.machineId || process.processId || "N/A"
            }) - ${allocation.operator || "N/A"}`,
            "Part No": allocation.splitNumber || allocation.partNo || "N/A",
            Description: process.partName || "N/A",
            "Nature of Work": process.processId || "N/A",
            "QTY Planned": allocation.plannedQuantity || 0,
            "Target Time (Minutes)": allocation.plannedTime || 0,
            "Completion Time (Minutes)": "",
            "Target Date": allocation.startDate
              ? new Date(allocation.startDate)
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                  .replace(/\//g, ".")
              : "",
            "Completion Date": "",
            Status: currentSelection.status || "Fresh",
            "Material Location From": currentSelection.materialFrom || "GR",
            "Material Location To": currentSelection.materialTo || "MS",
            "Next Location/Process":
              allocation.nextProcess || process.processName || "N/A",
          };
        })
      )
    );

    // Create worksheet with column order matching the template
    const ws = XLSX.utils.json_to_sheet(excelData, {
      header: [
        "Section",
        "Part No",
        "Description",
        "Nature of Work",
        "QTY Planned",
        "Target Time (Minutes)",
        "Completion Time (Minutes)",
        "Target Date",
        "Completion Date",
        "Status",
        "Material Location From",
        "Material Location To",
        "Next Location/Process",
      ],
    });

    // Set column widths to match the template
    const wscols = [
      { wch: 30 }, // Section
      { wch: 12 }, // Part No
      { wch: 25 }, // Description
      { wch: 15 }, // Nature of Work
      { wch: 12 }, // QTY Planned
      { wch: 20 }, // Target Time
      { wch: 20 }, // Completion Time
      { wch: 12 }, // Target Date
      { wch: 15 }, // Completion Date
      { wch: 10 }, // Status
      { wch: 20 }, // Material From
      { wch: 18 }, // Material To
      { wch: 20 }, // Next Process
    ];
    ws["!cols"] = wscols;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan");

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "production_plan.xlsx");
    setDownloadModal(false);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3">Loading production data...</span>
      </div>
    );
  }

  const getBadgeColor = (status) => {
    if (!status) return "secondary";

    switch (status.toLowerCase()) {
      case "fresh":
        return "success";
      case "pending":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Container fluid className="py-4">
      <BreadCrumb title="Allocation Plan" pageTitle="Allocation Plan" />

      {/* Download Confirmation Modal */}
      <Modal isOpen={downloadModal} toggle={() => setDownloadModal(false)}>
        <ModalHeader toggle={() => setDownloadModal(false)}>
          Confirm Download
        </ModalHeader>
        <ModalBody>
          <p>
            Are you sure you want to download the production plan as an Excel
            file?
          </p>
          <p className="text-muted small">
            This will generate a file named "production_plan.xlsx" with the
            current filtered data including your selections.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDownloadModal(false)}>
            Cancel
          </Button>
          <Button color="primary" onClick={confirmDownload}>
            <FiDownload className="me-1" />
            Download Excel
          </Button>
        </ModalFooter>
      </Modal>

      <Card className="shadow-sm">
        <CardHeader className="bg-white border-bottom-0 py-3">
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="mb-0 d-flex align-items-center">
                <FaProjectDiagram className="me-2 text-primary no-print" />
                Production Allocation Plan
              </h2>
              {/* Print-only date range display */}
              {(startDate || endDate) && (
                <div className="print-only" style={{ display: 'none' }}>
                  <p className="mb-0">
                    <strong>Date Range:</strong> {startDate ? formatDate(startDate) : 'Start'} to {endDate ? formatDate(endDate) : 'End'}
                  </p>
                </div>
              )}
            </Col>
            <Col md={6} className="d-flex justify-content-end">
              <div className="d-flex align-items-center no-print">
                <Button
                  color="outline-primary"
                  className="me-2 d-flex align-items-center"
                  onClick={handleDownloadExcel}
                >
                  <FiDownload className="me-1" />
                  Download Excel
                </Button>
                <Button
                  color="outline-secondary"
                  className="d-flex align-items-center"
                  onClick={handlePrint}
                >
                  <FiPrinter className="me-1" />
                  Print
                </Button>
              </div>
            </Col>
          </Row>
        </CardHeader>

        <CardBody>
          <Row className="mb-4 no-print">
            <Col md={3}>
              <FormGroup>
                <Label for="startDate" className="form-label small text-muted">
                  From Date
                </Label>
                <Input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-control-sm"
                />
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup>
                <Label for="endDate" className="form-label small text-muted">
                  To Date
                </Label>
                <Input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-control-sm"
                />
              </FormGroup>
            </Col>
            <Col md={6} className="d-flex align-items-end justify-content-end">
              <small className="text-muted">
                {startDate || endDate ? (
                  <span className="d-flex align-items-center">
                    <FiFilter className="me-1" />
                    Showing filtered results
                  </span>
                ) : (
                  "Showing all records"
                )}
              </small>
            </Col>
          </Row>

          {filteredAllocations.length === 0 ? (
            <div className="alert alert-info text-center py-4">
              <h5 className="mb-3">
                <FaTasks className="me-2" />
                No production data found
              </h5>
              <p className="mb-0">
                {startDate || endDate
                  ? "Try adjusting your date filters"
                  : "No allocations available"}
              </p>
            </div>
          ) : (
            filteredAllocations.map((project, projectIndex) => (
              <div key={project.projectName}>
                <Card
                  className="mb-4 shadow-none border"
                  style={{ pageBreakInside: 'avoid' }}
                >
                  {project.allocations.map((process) => (
                    <div
                      key={`${process.processId}-${process._id}`}
                      className="mb-3"
                    >
                      <div className="bg-light p-2 px-3 small d-flex justify-content-between align-items-center">
                        <div>
                          <h5 style={{ fontWeight: "bold" }}>
                            {process.processName} (
                            {process.allocations[0]?.machineId || "N/A"}) -{" "}
                            {process.allocations[0]?.operator || "N/A"}
                          </h5>
                        </div>
                      </div>

                      <div className="table-responsive">
                        <Table bordered hover className="mb-3">
                          <thead className="table-light">
                            <tr>
                              <th rowSpan="2" className="align-middle">
                                Part No.
                              </th>
                              <th rowSpan="2" className="align-middle">
                                Description
                              </th>
                              <th rowSpan="2" className="align-middle">
                                Nature of Work
                              </th>
                              <th
                                rowSpan="2"
                                className="align-middle text-center"
                              >
                                QTY Planned
                              </th>
                              <th
                                rowSpan="2"
                                className="align-middle text-center"
                              >
                                Time (min)
                              </th>
                              <th colSpan="2" className="text-center">
                                Date
                              </th>
                              <th
                                rowSpan="2"
                                className="align-middle text-center"
                              >
                                Status
                              </th>
                              <th colSpan="2" className="text-center">
                                Material Location
                              </th>
                              <th rowSpan="2" className="align-middle">
                                Next Location/Process
                              </th>
                            </tr>
                            <tr>
                              <th className="text-center">Target</th>
                              <th className="text-center">Completion</th>
                              <th className="text-center">From</th>
                              <th className="text-center">To</th>
                            </tr>
                          </thead>
                          <tbody>
                            {process.allocations.map((allocation) => {
                              const selectionKey = `${allocation._id}`;
                              const currentSelection = selectionValues[selectionKey] || {};
                              
                              return (
                                <tr key={allocation._id}>
                                  <td className="fw-semibold">
                                    {process.partsCodeId}
                                  </td>
                                  <td className="text-nowrap">
                                    {process.partName}
                                  </td>
                                  <td>{process.processId}</td>
                                  <td className="text-center">
                                    {allocation.plannedQuantity}
                                  </td>
                                  <td className="text-center">
                                    {allocation.plannedTime}
                                  </td>
                                  <td className="text-center">
                                    {formatDate(allocation.startDate)}
                                  </td>
                                  <td className="text-center">-</td>
                                  <td className="text-center">
                                    <select
                                      className="form-select form-select-sm no-print"
                                      style={{ width: "120px" }}
                                      value={currentSelection.status || "Fresh"}
                                      onChange={(e) => handleSelectionChange(selectionKey, 'status', e.target.value)}
                                    >
                                      <option value="Fresh">Fresh</option>
                                      <option value="Pending">Pending</option>
                                      <option value="Completed">Completed</option>
                                    </select>
                                    <span className="print-only">
                                      {currentSelection.status || "Fresh"}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <select
                                      className="form-select form-select-sm no-print"
                                      style={{ width: "120px" }}
                                      value={currentSelection.materialFrom || "GR"}
                                      onChange={(e) => handleSelectionChange(selectionKey, 'materialFrom', e.target.value)}
                                    >
                                      <option value="GR">GR</option>
                                      <option value="MS">MS</option>
                                      <option value="Store">Store</option>
                                      <option value="Heat Treatment">
                                        Heat Treatment
                                      </option>
                                      <option value="Auto Black">Auto Black</option>
                                    </select>
                                    <span className="print-only">
                                      {currentSelection.materialFrom || "GR"}
                                    </span>
                                  </td>
                                  <td className="text-center">
                                    <select
                                      className="form-select form-select-sm no-print"
                                      style={{ width: "120px" }}
                                      value={currentSelection.materialTo || "MS"}
                                      onChange={(e) => handleSelectionChange(selectionKey, 'materialTo', e.target.value)}
                                    >
                                      <option value="GR">GR</option>
                                      <option value="MS">MS</option>
                                      <option value="Store">Store</option>
                                      <option value="Heat Treatment">
                                        Heat Treatment
                                      </option>
                                      <option value="Auto Black">Auto Black</option>
                                    </select>
                                    <span className="print-only">
                                      {currentSelection.materialTo || "MS"}
                                    </span>
                                  </td>
                                  <td>{process.processName}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </Card>
                {/* Add page break after each project except the last one */}
                {projectIndex < filteredAllocations.length - 1 && (
                  <div className="print-page-break"></div>
                )}
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </Container>
  );
};

export default AllocationPlan;