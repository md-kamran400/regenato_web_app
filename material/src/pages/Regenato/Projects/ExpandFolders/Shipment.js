import React from 'react';
import "./Matarials.css"
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
const Shipment = ({ partName, shipmentVariables }) => {
  return (
    <div className="shipment-container">
      <h5 className="section-title"><TbTruckDelivery/> Shipment Variables for {partName}</h5>
      <table className="table align-middle table-nowrap" striped bordered hover size="sm">
       <thead className="table-light">
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

export default Shipment;
