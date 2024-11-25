import React, { useState } from 'react';
import "./Matarials.css";
import { Button } from 'reactstrap';

const Manufacturing = ({ partName, manufacturingVariables, projectId, partId }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [updatedManufacturingVariables, setUpdatedManufacturingVariables] = useState(manufacturingVariables);
  const [backupVariables, setBackupVariables] = useState([]);

  // Handle edit button click
  const handleEditClick = (index) => {
    setBackupVariables([...updatedManufacturingVariables]); // Save a backup in case of cancellation
    setEditingIndex(index);
  };

  // Handle input change
  const handleInputChange = (event, index, field) => {
    const { value } = event.target;
    const updatedVars = [...updatedManufacturingVariables];
    if (field === 'hours' || field === 'hourlyRate') {
      updatedVars[index][field] = parseFloat(value) || 0;
      updatedVars[index].totalRate = updatedVars[index].hours * updatedVars[index].hourlyRate;
    } else {
      updatedVars[index][field] = value;
    }
    setUpdatedManufacturingVariables(updatedVars);
  };

  // Save changes
  const handleSaveChanges = async (index) => {
    const updatedVariable = updatedManufacturingVariables[index];
    
    // Ensure all required fields are present
    if (!updatedVariable.name || !updatedVariable.hours || !updatedVariable.hourlyRate || !updatedVariable.totalRate) {
      console.error("Incomplete manufacturing variable data");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/projects/${projectId}/allProjects/${partId}/manufacturingVariables/${updatedVariable._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedVariable.name,
          hours: updatedVariable.hours,
          hourlyRate: updatedVariable.hourlyRate,
          totalRate: updatedVariable.totalRate
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedData = await response.json();
      console.log('Changes saved successfully:', updatedData);
  
      // Update local state with the returned data
      setUpdatedManufacturingVariables(prev => prev.map((item, idx) => 
        idx === index ? updatedData.updatedVariable : item
      ));
      
      setEditingIndex(null); // Exit editing mode
    } catch (error) {
      console.error('Error saving changes:', error);
      // Restore the previous state in case of error
      setUpdatedManufacturingVariables(backupVariables);
    }
  };

  // Cancel edit
  const handleCancelChanges = () => {
    setUpdatedManufacturingVariables(backupVariables); // Revert changes
    setEditingIndex(null);
  };

  // Render editable cells
  const renderCellContent = (man, index, field) => {
    if (editingIndex === index && ['name', 'hours', 'hourlyRate'].includes(field)) {
      return (
        <input
          type={field === 'name' ? 'text' : 'number'}
          step={field === 'hours' || field === 'hourlyRate' ? 'any' : undefined}
          value={man[field]}
          onChange={(e) => handleInputChange(e, index, field)}
        />
      );
    }
    return man[field];
  };

  return (
    <div className="manufacturing-container">
      <h5 className="section-title">🔧 Manufacturing Variables for {partName}</h5>
      <table className="professional-table" striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Hours</th>
            <th>Hourly Rate</th>
            <th>Total Rate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {updatedManufacturingVariables.map((man, index) => (
            <tr key={index} className={editingIndex === index ? "editing-row" : ""}>
              <td>{renderCellContent(man, index, 'name')}</td>
              <td>{renderCellContent(man, index, 'hours')}</td>
              <td>{renderCellContent(man, index, 'hourlyRate')}</td>
              <td>{man.totalRate.toFixed(2)}</td>
              <td style={{ display: "flex", gap: "10px", justifyContent: "center", alignItems: "center" }}>
                {editingIndex === index ? (
                  <>
                    <Button className="bg-primary" onClick={() => handleSaveChanges(index)}>Save</Button>
                    <Button className="bg-secondary" onClick={handleCancelChanges}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button className="bg-success" onClick={() => handleEditClick(index)} disabled={editingIndex !== null}>Edit</Button>
                    <Button className="bg-danger" disabled={editingIndex !== null}>Delete</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Manufacturing;
