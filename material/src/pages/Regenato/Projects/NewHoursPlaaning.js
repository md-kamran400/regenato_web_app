import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row } from "reactstrap";
// import "./project.css";
import "./projectForProjects.css"

const NewHoursPlaaning = () => {
    const { _id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [partDetails, setPartDetails] = useState([]);
    const [parts, setParts] = useState([]);
    const [manufacturingVariables, setManufacturingVariables] = useState([]);
    const [expandedRows, setExpandedRows] = useState({});
    const [machineHoursPerDay, setMachineHoursPerDay] = useState({});
    const [numberOfMachines, setNumberOfMachines] = useState({});
    const [daysToWork, setDaysToWork] = useState({});

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [_id]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/parts`);
        const data = await response.json();
        setParts(data);
      } catch (err) {
        console.error("Error fetching parts:", err);
      }
    };

    const fetchManufacturingVariables = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/manufacturing`
        );
        const data = await response.json();
        setManufacturingVariables(data);
      } catch (err) {
        console.error("Error fetching manufacturing variables:", err);
      }
    };

    fetchParts();
    fetchManufacturingVariables();
  }, []);

  const processPartsMap = parts.reduce((acc, part) => {
    const matchingPart = partDetails.allProjects?.find(
      (item) => item.partName === part.partName
    );

    if (matchingPart) {
      part.manufacturingVariables.forEach((variable) => {
        if (!acc[variable.name]) acc[variable.name] = [];
        acc[variable.name].push({
          partName: part.partName,
          hours: variable.hours,
        });
      });
    }

    return acc;
  }, {});

  const getHoursForProcess = (partName, processName) => {
    const processData = processPartsMap[processName]?.find(
      (item) => item.partName === partName
    );
    const quantity =
      partDetails.allProjects.find((item) => item.partName === partName)?.quantity || 1;
    
    if (!processData || !processData.hours) {
      return "-";
    }
  
    const hours = processData.hours * quantity;
    
    return hours.toFixed(2);
  };
  

  const calculateTotalHoursForProcess = (processName) => {
    if (!processPartsMap[processName]) return 0;
    return processPartsMap[processName].reduce(
        (sum, part) => sum + part.hours * (partDetails.allProjects.find(item => item.partName === part.partName)?.quantity || 1),
        0
    ).toFixed(2);
};
  
  const handleInputChange = (event, type, processName) => {
    switch (type) {
      case "machineHoursPerDay":
        setMachineHoursPerDay(prev => ({...prev, [processName]: event.target.value ? Number(event.target.value) : 0}));
        break;
      case "numberOfMachines":
        setNumberOfMachines(prev => ({...prev, [processName]: event.target.value ? Number(event.target.value) : 0}));
        break;
      case "daysToWork":
        setDaysToWork(prev => ({...prev, [processName]: event.target.value ? Number(event.target.value) : 25}));
        break;
      default:
        break;
    }
  };

  const calculateMonthsRequired = (processName) => {
    const totalHours = calculateTotalHoursForProcess(processName);
    const availableMachineHoursPerMonth = (machineHoursPerDay[processName] || 0) * (numberOfMachines[processName] || 0) * (daysToWork[processName] || 0);
    
    if (availableMachineHoursPerMonth === 0) {
      return "--";
    }
    
    const monthsRequired = totalHours / availableMachineHoursPerMonth;
    return monthsRequired.toFixed(2);
  };


  return (
    <div className="table-container">
      <Row lg={12}>
        <Col>
          <CardBody>
            <div className="table-wrapper">
              <table className="table table-hover align-middle">
                <thead className="table-header">
                  <tr>
                    <th className="part-name-header" style={{ backgroundColor: "#F5F5F5" }}>
                      Part Name
                    </th>
                    <th className="child_parts">VMC Imported (C1)</th>
                    <th className="child_parts">VMC Local (C2)</th>
                    <th className="child_parts">Milling Manual (C3)</th>
                    <th className="child_parts">Grinding Final (C4)</th>
                    <th className="child_parts">CNC Lathe (C5)</th>
                    <th className="child_parts">Drill/Tap (C6)</th>
                    <th className="child_parts">Wire Cut Local (C7)</th>
                    <th className="child_parts">Wire Cut Rough (C8)</th>
                    <th className="child_parts">Wire Cut Imported (C9)</th>
                    <th className="child_parts">EDM (C10)</th>
                    <th className="child_parts">Black Oxide (C11)</th>
                    <th className="child_parts">Laser Marking (C12)</th>
                    <th className="child_parts">Lapping/Polishing (C13)</th>
                    <th className="child_parts">Grinding Blank/Rough (C14)</th>
                    <th className="child_parts">Gauges & Fixtures (C15)</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && !error && partDetails.allProjects?.length > 0 ? (
                    partDetails.allProjects.map((item) => (
                      <React.Fragment key={item._id}>
                        <tr className="table-row-main">
                          <td
                            style={{
                              backgroundColor: "#EFEBE9",
                              color: "black",
                            }}
                            className="part-name"
                            onClick={() => toggleRow(item.partName)}
                          >
                            {`${item.partName || "N/A"}  (${item.Uid})`}

                          </td>
                          <td>
    {getHoursForProcess(item.partName, "VMC Imported") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "VMC Imported")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "VMC Local") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "VMC Local")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Milling Manual") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Milling Manual")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Grinding Final") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Grinding Final")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "CNC Lathe") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "CNC Lathe")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Drill/Tap") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Drill/Tap")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Wire Cut Local") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Wire Cut Local")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Wire Cut Rough") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Wire Cut Rough")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Wire Cut Imported") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Wire Cut Imported")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "EDM") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "EDM")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Black Oxide") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Black Oxide")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Laser Marking") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Laser Marking")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Lapping/Polishing") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Lapping/Polishing")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Grinding Blank/Rough") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Grinding Blank/Rough")).toFixed(2)}
  </td>

  <td>
    {getHoursForProcess(item.partName, "Gauges & Fixtures") === "-"
      ? "-"
      : parseFloat(getHoursForProcess(item.partName, "Gauges & Fixtures")).toFixed(2)}
  </td>
                        </tr>
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="16" className="text-center">
                        {loading ? "Loading..." : error ? error : "No parts available"}
                      </td>
                    </tr>
                  )}
                </tbody>

               

                 {/* second table */}
                <br/>
                <br/>
                <thead className="table-header">
                  <tr>
                    <th className="part-name-header" style={{ backgroundColor: "#F5F5F5" }}>
                      Part Name
                    </th>
                    <th className="child_parts">VMC Imported (C1)</th>
                    <th className="child_parts">VMC Local (C2)</th>
                    <th className="child_parts">Milling Manual (C3)</th>
                    <th className="child_parts">Grinding Final (C4)</th>
                    <th className="child_parts">CNC Lathe (C5)</th>
                    <th className="child_parts">Drill/Tap (C6)</th>
                    <th className="child_parts">Wire Cut Local (C7)</th>
                    <th className="child_parts">Wire Cut Rough (C8)</th>
                    <th className="child_parts">Wire Cut Imported (C9)</th>
                    <th className="child_parts">EDM (C10)</th>
                    <th className="child_parts">Black Oxide (C11)</th>
                    <th className="child_parts">Laser Marking (C12)</th>
                    <th className="child_parts">Lapping/Polishing (C13)</th>
                    <th className="child_parts">Grinding Blank/Rough (C14)</th>
                    <th className="child_parts">Gauges & Fixtures (C15)</th>
                  </tr>
                </thead>
                <tbody>
  <React.Fragment>
  <tr className="table-row-main">
  <td className="part-name-header" style={{ backgroundColor: "#C8E6C9", color: "black" }}>
    Required Machinewise Total Hours
  </td>
  {["VMC Imported", "VMC Local", "Milling Manual", "Grinding Final", "CNC Lathe", "Drill/Tap", "Wire Cut Local", "Wire Cut Rough", "Wire Cut Imported", "EDM", "Black Oxide", "Laser Marking", "Lapping/Polishing", "Grinding Blank/Rough", "Gauges & Fixtures"].map((processName) => (
    <td key={processName}>
      {calculateTotalHoursForProcess(processName)}
    </td>
  ))}
</tr>

    
<tr className="table-row-main">
  <td className="part-name-header" style={{ backgroundColor: "#FFF59D", color: "black" }}>Available machine hours per day</td>
  {["VMC Imported", "VMC Local", "Milling Manual", "Grinding Final", "CNC Lathe", "Drill/Tap", "Wire Cut Local", "Wire Cut Rough", "Wire Cut Imported", "EDM", "Black Oxide", "Laser Marking", "Lapping/Polishing", "Grinding Blank/Rough", "Gauges & Fixtures"].map((processName) => (
    <td key={processName}>
      <input
        className="input-field"
        type="number"
        value={machineHoursPerDay[processName] || 0}
        onChange={(e) => handleInputChange(e, "machineHoursPerDay", processName)}
      />
    </td>
  ))}
</tr>


<tr className="table-row-main">
  <td className="part-name-header" style={{ backgroundColor: "#FFF59D", color: "black" }}>Number of Machines TBU</td>
  {["VMC Imported", "VMC Local", "Milling Manual", "Grinding Final", "CNC Lathe", "Drill/Tap", "Wire Cut Local", "Wire Cut Rough", "Wire Cut Imported", "EDM", "Black Oxide", "Laser Marking", "Lapping/Polishing", "Grinding Blank/Rough", "Gauges & Fixtures"].map((processName) => (
    <td key={processName}>
      <input
        className="input-field"
        type="number"
        value={numberOfMachines[processName] || 0}
        onChange={(e) => handleInputChange(e, "numberOfMachines", processName)}
      />
    </td>
  ))}
</tr>


<tr className="table-row-main">
  <td className="part-name-header" style={{ backgroundColor: "#FFF59D", color: "black" }}>Number of Days to be worked</td>
  {["VMC Imported", "VMC Local", "Milling Manual", "Grinding Final", "CNC Lathe", "Drill/Tap", "Wire Cut Local", "Wire Cut Rough", "Wire Cut Imported", "EDM", "Black Oxide", "Laser Marking", "Lapping/Polishing", "Grinding Blank/Rough", "Gauges & Fixtures"].map((processName) => (
    <td key={processName}>
      <input
        className="input-field"
        type="number"
        value={daysToWork[processName] || 0}
        onChange={(e) => handleInputChange(e, "daysToWork", processName)}
      />
    </td>
  ))}
</tr>


<tr className="table-row-main">
  <td className="part-name-header" style={{ backgroundColor: "#C8E6C9", color: "black" }}>Available machine hours per month</td>
  {["VMC Imported", "VMC Local", "Milling Manual", "Grinding Final", "CNC Lathe", "Drill/Tap", "Wire Cut Local", "Wire Cut Rough", "Wire Cut Imported", "EDM", "Black Oxide", "Laser Marking", "Lapping/Polishing", "Grinding Blank/Rough", "Gauges & Fixtures"].map((processName) => (
    <td key={processName}>
      {(
        (machineHoursPerDay[processName] || 0) * 
        (numberOfMachines[processName] || 0) * 
        (daysToWork[processName] || 0)
      ).toFixed(2)}
    </td>
  ))}
</tr>



<tr className="table-row-main">
  <td className="part-name-header" style={{ backgroundColor: "#C8E6C9", color: "black" }}>Months Required to complete</td>
  {["VMC Imported", "VMC Local", "Milling Manual", "Grinding Final", "CNC Lathe", "Drill/Tap", "Wire Cut Local", "Wire Cut Rough", "Wire Cut Imported", "EDM", "Black Oxide", "Laser Marking", "Lapping/Polishing", "Grinding Blank/Rough", "Gauges & Fixtures"].map((processName) => (
    <td key={processName}>
      {calculateMonthsRequired(processName)}
    </td>
  ))}
</tr>


  </React.Fragment>
                </tbody>

              </table>
            </div>
          </CardBody>
        </Col>
      </Row>
    </div>
  );
};
export default NewHoursPlaaning;