import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CardBody, Col, Row } from "reactstrap";
import "./project.css";

const HoursSummary = () => {
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
    if (!processData || !processData.hours) {
      return "-";
    }
    return (processData.hours).toFixed(2);
  };

  const calculateTotalHoursForProcess = (processName) => {
    if (!processPartsMap[processName]) return 0;
    return processPartsMap[processName].reduce(
      (sum, part) => sum + part.hours,
      0
    );
  };

  const handleInputChange = (event, type, processName) => {
    switch (type) {
      case "machineHoursPerDay":
        setMachineHoursPerDay(prev => ({...prev, [processName]: Number(event.target.value)}));
        break;
      case "numberOfMachines":
        setNumberOfMachines(prev => ({...prev, [processName]: Number(event.target.value)}));
        break;
      case "daysToWork":
        setDaysToWork(prev => ({...prev, [processName]: Number(event.target.value)}));
        break;
      default:
        break;
    }
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
              </table>
            </div>
          </CardBody>
        </Col>
      </Row>
    </div>
  );
};

export default HoursSummary