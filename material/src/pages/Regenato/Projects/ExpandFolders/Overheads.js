import React from 'react';
import "./Matarials.css"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
const Overheads = ({ partName, overheadsAndProfits }) => {
  return (
    <div className="overheads-container">
      <h5 className="section-title">💰 Overheads and Profits for {partName}</h5>
      <table className="table align-middle table-nowrap" striped bordered hover size="sm">
      <thead className="table-light"> 
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
              <td className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success edit-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#showModal"
                        // onClick={() => tog_edit(item)}
                      >
                        Edit
                      </button>
                       <button
                        className="btn btn-sm btn-danger remove-item-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteRecordModal"
                        // onClick={() => {
                        //   setSelectedId(item._id);
                        //   tog_delete();
                        // }}
                      >
                        Remove
                      </button> 
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Overheads;
