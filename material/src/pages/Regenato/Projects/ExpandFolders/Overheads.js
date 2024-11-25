import React from 'react';
import "./Matarials.css"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const Overheads = ({ partName, overheadsAndProfits }) => {
  return (
    <div className="overheads-container">
      <h5 className="section-title">💰 Overheads and Profits for {partName}</h5>
      <table className="professional-table" striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Percentage</th>
            <th>Total Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {overheadsAndProfits.map((overhead, index) => (
            <tr key={index}>
              <td>{overhead.name}</td>
              <td>{overhead.percentage}%</td>
              <td>{overhead.totalRate}</td>
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

export default Overheads;
