import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, ModalHeader, ModalBody, Button, Spinner } from "reactstrap";
import Dropzone from "react-dropzone";
import { IoCloudUploadOutline, IoCamera } from "react-icons/io5";
import { toast } from "react-toastify";
import Webcam from "react-webcam";
import { IoImage } from "react-icons/io5";

const ImageUploader = ({
  partDetails,
  defaultImageSrc,
  partId,
  currentImage,
  onImageUpdate,
}) => {
  const [showUploadIcon, setShowUploadIcon] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(
    partDetails?.image || defaultImageSrc
  );
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [hasImage, setHasImage] = useState(false);
  // const [listsetListData]

  // Webcam reference
  const webcamRef = useRef(null);

  const GetImage = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/parts/image/${partId}`
      );

      if (!response.ok) {
        throw new Error("No image found");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      setImageUrl(imageUrl);
      setHasImage(true);
    } catch (error) {
      console.error("Error fetching image:", error);
      setHasImage(false);
    }
  }, [partId]);

  useEffect(() => {
    if (partId) {
      GetImage();
    }
  }, [partId, GetImage]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleImageError = (e) => {
    e.target.src = defaultImageSrc;
    setSelectedImage(defaultImageSrc);
  };

  const handleDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    setUploading(true);
    toast.info("Uploading image...");

    try {
      let formData = new FormData();
      let headers = {};

      if (imageFile) {
        formData.append("image", imageFile);
      } else if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        formData.append("base64Image", screenshot);
        headers["Content-Type"] = "application/json";
      } else {
        toast.error("No image selected");
        setUploading(false);
        return;
      }

      const url = hasImage
        ? `${process.env.REACT_APP_BASE_URL}/api/parts/update-image/${partId}`
        : `${process.env.REACT_APP_BASE_URL}/api/parts/upload-image/${partId}`;

      const method = hasImage ? "PUT" : "POST";

      const response = await fetch(url, { method, body: formData, headers });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      await GetImage();
      onImageUpdate(data.imageUrl); // Call the callback function
      setSelectedImage(data.imageUrl);
      setHasImage(true);

      toast.success(
        hasImage
          ? "Image updated successfully!"
          : "Image uploaded successfully!"
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setShowCameraModal(false);
    }
  };

  return (
    <div className="col-md-auto position-relative">
      <div
        className="avatar-xl rounded-circle overflow-hidden border shadow-2xl position-relative"
        onMouseEnter={() => setShowUploadIcon(true)}
        onMouseLeave={() => setShowUploadIcon(false)}
        style={{
          width: "120px",
          height: "120px",
          position: "relative",
          boxShadow:
            "rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px",
        }}
      >
        <img
          src={imageUrl || selectedImage}
          alt="Part"
          className="image-style-parts "
          style={{
            objectFit: "cover",
            width: "120px",
            height: "120px",
            margin: "auto",
          }}
          onError={handleImageError}
        />

        {showUploadIcon && !uploading && (
          <div
            className="upload-icon d-flex align-items-center justify-content-center"
            onClick={() => setShowUploadModal(true)}
          >
            <IoCloudUploadOutline size={40} color="#fff" />
          </div>
        )}

        {uploading && (
          <div
            className="uploading-overlay d-flex align-items-center justify-content-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <Spinner color="light" />
          </div>
        )}
      </div>

      {/* <Modal
        isOpen={showUploadModal}
        toggle={() => setShowUploadModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowUploadModal(false)}>
          Upload Image
        </ModalHeader>
        <ModalBody>
          <div className="d-flex flex-column align-items-center">
            {imageUrl && (
              <div className="mt-4 d-flex flex-column align-items-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="shadow-sm"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "180px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>
            )}
            <Dropzone onDrop={handleDrop} accept="image/*">
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="dropzone text-center d-flex flex-column align-items-center justify-content-center"
                  style={{
                    border: "2px dashedrgb(3, 16, 30)",
                    padding: "40px",
                    cursor: "pointer",
                    borderRadius: "12px",
                    background: "#f8f9fa",
                    transition: "all 0.3s ease",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                >
                  <input {...getInputProps()} />
                  <IoCloudUploadOutline size={50} color="#007bff" />
                  <p
                    className="mt-2 text-secondary"
                    style={{ fontSize: "15px" }}
                  >
                    Drag & drop an image here, or click to select one
                  </p>
                </div>
              )}
            </Dropzone>

            <div className="d-flex gap-3 mt-4">
              <Button
                onClick={() => setShowCameraModal(true)}
                color="secondary"
                className="d-flex align-items-center gap-2"
              >
                <IoCamera size={18} />
                Take Photo
              </Button>

              <Button
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                className="d-flex align-items-center gap-2"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal> */}
      <Modal
        isOpen={showUploadModal}
        toggle={() => setShowUploadModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowUploadModal(false)}>
          Upload Image
        </ModalHeader>
        <ModalBody>
          <div className="d-flex flex-column align-items-center">
            {/* Image Preview */}
            {imageUrl && (
              <div className="mt-4 d-flex flex-column align-items-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  onClick={() => window.open(imageUrl, "_blank")}
                  className="shadow-sm img-preview"
                  style={{
                    width: "300px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid #ddd",
                    cursor: "pointer",
                  }}
                />
              </div>
            )}
            {/* Dropzone */}
            <Dropzone onDrop={handleDrop} accept="image/*">
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps()}
                  className="text-center d-flex flex-column align-items-center justify-content-center"
                  style={{
                    border: "2px dashed #007bff",
                    padding: "5px 20px",
                    cursor: "pointer",
                    borderRadius: "12px",
                    background: "#f8f9fa",
                    transition: "all 0.3s ease",
                    marginTop: "10px",
                  }}
                >
                  <input {...getInputProps()} />
                  <IoCloudUploadOutline size={50} color="#007bff" />
                  <p
                    className="mt-2 text-secondary"
                    style={{ fontSize: "12px" }}
                  >
                    Drag & drop or click to select
                  </p>
                </div>
              )}
            </Dropzone>

            {/* Buttons */}
            <div className="d-flex gap-3 mt-4">
              <Button
                onClick={() => setShowCameraModal(true)}
                color="secondary"
                className="d-flex align-items-center gap-2"
              >
                <IoCamera size={18} />
                Take Photo
              </Button>

              <Button
                color="primary"
                onClick={handleUpload}
                disabled={uploading}
                className="d-flex align-items-center gap-2"
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Camera Modal */}
      <Modal
        isOpen={showCameraModal}
        toggle={() => setShowCameraModal(false)}
        centered
      >
        <ModalHeader toggle={() => setShowCameraModal(false)}>
          Take Photo
        </ModalHeader>
        <ModalBody className="d-flex flex-column align-items-center">
          {/* Webcam Preview */}
          <div
            className="webcam-container d-flex align-items-center justify-content-center"
            style={{
              width: "320px",
              height: "320px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              background: "#f8f9fa",
            }}
          >
            <Webcam
              ref={webcamRef}
              screenshotFormat="jpeg"
              width="100%"
              height="100%"
              style={{ objectFit: "cover" }}
            />
          </div>

          {/* Capture Button */}
          <Button
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            className="d-flex align-items-center gap-2 mt-4"
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
            }}
          >
            <IoCamera size={18} />
            {uploading ? <Spinner size="sm" /> : "Take Photo"}
          </Button>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default ImageUploader;
