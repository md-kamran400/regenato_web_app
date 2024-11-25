import React from 'react';
import "./Matarials.css"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const Shipment = ({ partName, shipmentVariables }) => {
  return (
    <div className="shipment-container">
      <h5 className="section-title">🚚 Shipment Variables for {partName}</h5>
      <table className="professional-table" striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Hourly Rate</th>
            <th>Total Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {shipmentVariables.map((ship, index) => (
            <tr key={index}>
              <td>{ship.name}</td>
              <td>{ship.hourlyRate}</td>
              <td>{ship.totalRate}</td>
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

export default Shipment;
