import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Col,
  Row,
  Input,
  CardHeader,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { FaTrash, FaCheck, FaUpload } from "react-icons/fa";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { ToastContainer, toast } from "react-toastify";

const LogoHandler = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [modalUpload, setModalUpload] = useState(false);
  const [modalDelete, setModalDelete] = useState(false);
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const API_BASE_URL = `${process.env.REACT_APP_BASE_URL}/api`;

  // Fetch all logos
  const fetchLogos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/logos`);
      const data = await response.json();
      setLogos(data);
    } catch (err) {
      toast.error("Failed to fetch logos!");
      console.error("Error fetching logos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logos on component mount
  useEffect(() => {
    fetchLogos();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        setSelectedFile(null);
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
      if (!validTypes.includes(file.type)) {
        toast.error("Only image files are allowed (JPEG, PNG, GIF, WebP, SVG)");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      
      // Set default name if not provided
      if (!logoName) {
        setLogoName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  // Toggle upload modal
  const toggleUploadModal = () => {
    setModalUpload(!modalUpload);
    if (modalUpload) {
      setSelectedFile(null);
      setLogoName("");
      setPreviewUrl("");
    }
  };

  // Toggle delete modal
  const toggleDeleteModal = (logo = null) => {
    setSelectedLogo(logo);
    setModalDelete(!modalDelete);
  };

  // Handle logo upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("logo", selectedFile);
      formData.append("name", logoName || selectedFile.name);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/logos/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result.message);

      toast.success("Logo uploaded successfully!");
      toggleUploadModal();
      fetchLogos();
    } catch (err) {
      toast.error(err.message || "Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // Handle setting active logo
  const handleSetActive = async (logoId) => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/logos/set-active/${logoId}`, {
        method: "PUT",
      });
      
      if (response.ok) {
        toast.success("Active logo updated successfully!");
        fetchLogos();
      } else {
        throw new Error("Failed to set active logo");
      }
    } catch (err) {
      toast.error("Failed to set active logo!");
    } finally {
      setLoading(false);
    }
  };

  // Handle logo deletion
  const handleDelete = async () => {
    if (!selectedLogo) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/logos/${selectedLogo._id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        toast.success("Logo deleted successfully!");
        toggleDeleteModal();
        fetchLogos();
      } else {
        throw new Error("Failed to delete logo");
      }
    } catch (err) {
      toast.error("Failed to delete logo!");
    } finally {
      setLoading(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <Col>
        <div style={{ marginTop: "25px" }} className="p-2">
          <BreadCrumb title="Logo Management" pageTitle="Logos" />
        </div>
        
        <Card>
          <CardHeader>
            <Row className="g-4 mb-3">
              <div className="col-sm-auto d-flex">
                <Button color="primary" className="me-1" onClick={toggleUploadModal}>
                  <FaUpload className="me-1" /> Upload Logo
                </Button>
              </div>
            </Row>
          </CardHeader>
          
          <CardBody>
            <div className="table-responsive p-3">
              {loading && logos.length === 0 ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading logos...</p>
                </div>
              ) : logos.length === 0 ? (
                <div className="text-center py-5">
                  <p>No logos uploaded yet.</p>
                </div>
              ) : (
                <table className="table table-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>LOGO</th>
                      <th>NAME</th>
                      <th>SIZE</th>
                      <th>UPLOADED</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logos.map((logo) => (
                      <tr key={logo._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={`http://localhost:4040${logo.imageUrl}`}
                              alt={logo.name}
                              style={{ width: "50px", height: "50px", objectFit: "contain", backgroundColor: "#f8f9fa", padding: "5px", borderRadius: "4px" }}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/50x50?text=Logo";
                              }}
                            />
                          </div>
                        </td>
                        <td>{logo.name}</td>
                        <td>{formatFileSize(logo.fileSize)}</td>
                        <td>{formatDate(logo.uploadedAt)}</td>
                        <td>
                          {logo.isActive ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-secondary">Inactive</span>
                          )}
                        </td>
                        <td>
                          {!logo.isActive && (
                            <Button
                              color="success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleSetActive(logo._id)}
                              disabled={loading}
                            >
                              <FaCheck />
                            </Button>
                          )}
                          <Button
                            color="danger"
                            size="sm"
                            onClick={() => toggleDeleteModal(logo)}
                            disabled={loading}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardBody>
        </Card>
      </Col>

      {/* Upload Modal */}
      <Modal isOpen={modalUpload} toggle={toggleUploadModal} centered>
        <ModalHeader className="bg-light p-3" toggle={toggleUploadModal}>
          Upload New Logo
        </ModalHeader>
        <ModalBody>
          <div className="mb-3">
            <label className="form-label">Select Logo Image (max 2MB)</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control"
            />
            <div className="form-text">
              Supported formats: JPEG, PNG, GIF, WebP, SVG
            </div>
          </div>

          {previewUrl && (
            <div className="mb-3">
              <label className="form-label">Preview</label>
              <div className="border p-3 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ maxWidth: "200px", maxHeight: "100px", objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Logo Name</label>
            <Input
              type="text"
              value={logoName}
              onChange={(e) => setLogoName(e.target.value)}
              placeholder="Enter logo name"
              className="form-control"
            />
          </div>

          <div className="d-flex gap-2">
            <Button
              color="primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? "Uploading..." : "Upload Logo"}
            </Button>
            <Button
              color="secondary"
              onClick={toggleUploadModal}
            >
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={modalDelete} toggle={() => toggleDeleteModal(null)}>
        <ModalHeader className="bg-light p-3" toggle={() => toggleDeleteModal(null)}>
          Confirm Deletion
        </ModalHeader>
        <ModalBody>
          <p>Are you sure you want to delete the logo "{selectedLogo?.name}"?</p>
          <div className="d-flex gap-2">
            <Button
              color="danger"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
            <Button
              color="secondary"
              onClick={() => toggleDeleteModal(null)}
            >
              Cancel
            </Button>
          </div>
        </ModalBody>
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default LogoHandler;