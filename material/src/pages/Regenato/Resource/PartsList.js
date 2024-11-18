import React, { useCallback, useState } from 'react'
import {
    Card,
    CardBody,
    Col,
    Row,
    CardHeader,
    Button,
  } from "reactstrap";

const PartsList = () => {
  const [modal_add, setModalList] = useState(false);
  const [singProjectData, setsingProjectData] = useState([]); // Local state to store project list
  const tog_add = ()=>{
    setModalList(!modal_add)
  }

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/projects/${_id}`
      );
      const data = await response.json();
      setPartDetails(data);
      console.log(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  });


  return (
    <div>
        <Col>
          <Card>
            <CardHeader>
              <h4 className="card-title mb-0">Parts List</h4>
              <div className="d-flex justify-content-sm-start mt-2">
                <div className="search-box ">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search..."
                  />
                  <i className="ri-search-line search-icon"></i>
                </div>
                
              </div>
            </CardHeader>
            <CardBody>
            <div className="table-responsive table-card mb-1">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>Part Name</th>
              <th>Required</th>
              <th>Produced</th>
              <th>Daily Production</th>
            </tr>
          </thead>
          <tbody>
              <tr>
                <td>Base(48A47015001)</td>
                <td>500</td>
                <td>125</td>
                <td><Button className="bg-success" onClick={tog_add}>Update</Button></td>
              </tr>
              <tr>
                <td>Ram(48A47002001)</td>
                <td>250</td>
                <td>75</td>
                <td><Button className="bg-success" onClick={tog_add}>Update</Button></td>
              </tr>
              <tr>
                <td>SHSNK(48A47030)</td>
                <td>100</td>
                <td>25</td>
                <td><Button className="bg-success" onClick={tog_add}>Update</Button></td>
              </tr>

          </tbody>
        </table>
            </div>
            </CardBody>
          </Card>
        </Col>
    </div>
  )
}

export default PartsList