import React from 'react';
import "./Matarials.css"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const RawMaterial = ({ partName, rmVariables }) => {
  return (
    <div className="raw-material-container">
      <h5 className="section-title">📦 Raw Materials for {partName}</h5>
      <table className="professional-table" striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Net Weight</th>
            <th>Price per Kg</th>
            <th>Total Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rmVariables.map((rm, index) => (
            <tr key={index}>
              <td>{rm.name}</td>
              <td>{rm.netWeight}</td>
              <td>{rm.pricePerKg}</td>
              <td>{rm.totalRate}</td>
              <div style={{ display: "flex", margin: "auto", fontSize: "20px", justifyContent: "center", alignItems: "center" }}>
                <i><FaEdit /></i>
                <i><MdDelete /></i>
              </div>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RawMaterial;
