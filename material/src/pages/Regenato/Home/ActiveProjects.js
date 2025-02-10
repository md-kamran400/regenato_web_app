import React from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Col } from "reactstrap";

const dummyProjects = [
  {
    projectName: "Project Alpha",
    projectLead: "John Doe",
    percentage: "75%",
    subItem: [{ id: 1 }, { id: 2 }, { id: 3 }],
    badgeClass: "success",
    badge: "On Track",
    dueDate: "2024-09-15",
  },
  {
    projectName: "Project Beta",
    projectLead: "Jane Smith",
    percentage: "50%",
    subItem: [{ id: 4 }, { id: 5 }],
    badgeClass: "warning",
    badge: "At Risk",
    dueDate: "2024-10-05",
  },
  {
    projectName: "Project Gamma",
    projectLead: "Alice Johnson",
    percentage: "30%",
    subItem: [{ id: 6 }],
    badgeClass: "danger",
    badge: "Delayed",
    dueDate: "2024-08-25",
  },
  {
    projectName: "Project Gamma",
    projectLead: "Alice Johnson",
    percentage: "30%",
    subItem: [{ id: 6 }],
    badgeClass: "danger",
    badge: "Delayed",
    dueDate: "2024-08-25",
  },
  {
    projectName: "Project Gamma",
    projectLead: "Alice Johnson",
    percentage: "30%",
    subItem: [{ id: 6 }],
    badgeClass: "danger",
    badge: "Delayed",
    dueDate: "2024-08-25",
  },
  {
    projectName: "Project Gamma",
    projectLead: "Alice Johnson",
    percentage: "30%",
    subItem: [{ id: 6 }],
    badgeClass: "danger",
    badge: "Delayed",
    dueDate: "2024-08-25",
  },
];

const ActiveProjects = () => {
  return (
    <Col xl={7}>
      <Card className="card-height-100">
        <CardHeader className="d-flex align-items-center">
          <h4 className="card-title flex-grow-1 mb-0">Active Projects</h4>
          <div className="flex-shrink-0">
            <Link to="#" className="btn btn-soft-info btn-sm shadow-none">
              Export Report
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          <div className="table-responsive table-card">
            <table className="table table-nowrap table-centered align-middle">
              <thead className="bg-light text-muted">
                <tr>
                  <th scope="col">Project Name</th>
                  <th scope="col">Project Lead</th>
                  <th scope="col">Progress</th>
                  <th scope="col">Assignee</th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ width: "10%" }}>
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {dummyProjects.map((item, index) => (
                  <tr key={index}>
                    <td className="fw-medium">{item.projectName}</td>
                    <td>
                      <i className="mdi mdi-24px mdi-account"></i>
                      <Link to="#" className="text-reset">
                        {item.projectLead}
                      </Link>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-1 text-muted fs-13">
                          {item.percentage}
                        </div>
                        <div
                          className="progress progress-sm flex-grow-1"
                          style={{ width: "68%" }}
                        >
                          <div
                            className="progress-bar bg-primary rounded"
                            role="progressbar"
                            style={{ width: item.percentage }}
                            aria-valuenow={parseInt(item.percentage)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="avatar-group flex-nowrap">
                        {item.subItem.map((sub, subIndex) => (
                          <div className="avatar-group-item" key={subIndex}>
                            <Link to="#" className="d-inline-block">
                              <i className="mdi mdi-24px mdi-account"></i>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span
                        className={
                          "badge bg-" +
                          item.badgeClass +
                          "-subtle text-" +
                          item.badgeClass
                        }
                      >
                        {item.badge}
                      </span>
                    </td>
                    <td className="text-muted">{item.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ActiveProjects;
