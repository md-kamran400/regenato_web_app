import React from 'react'

const AssemblyHoursPlanning = () => {
  return (
    <div>
        
              {/* for assembly */}
              {!loading && !error && partDetails.assemblyList?.length > 0
                ? partDetails.assemblyList.map((assemblyList) => (
                    <React.Fragment key={assemblyList._id}>
                      <Card
                        className="mb-4"
                        style={{
                          boxSizing: "border-box",
                          borderTop: "20px solid rgb(75, 56, 179)",
                          borderRadius: "5px",
                          padding: "10px",
                        }}
                      >
                        <CardBody>
                          <ul
                            style={{
                              listStyleType: "none",
                              padding: 0,
                              fontWeight: "600",
                            }}
                          >
                            <li
                              style={{
                                fontSize: "23px",
                                marginBottom: "5px",
                              }}
                            >
                              {assemblyList.AssemblyName}
                            </li>

                            <li style={{ fontSize: "19px" }}>
                              <span class="badge bg-primary-subtle text-primary">
                                Assembly
                              </span>
                            </li>
                          </ul>
                          <div className="table-wrapper">
                            <div className="table-responsive">
                              <table className="project-table">
                                <thead className="table-header">
                                  <tr>
                                    <th
                                      className="part-name-header"
                                      style={{ backgroundColor: "#F5F5F5" }}
                                    >
                                      Assembly Part Name
                                    </th>
                                    <th className="child_parts">Quantity</th>
                                    <th className="child_parts">Total Cost</th>
                                    <th className="child_parts">Total Hours</th>

                                    {columnNames
                                      .filter((column) =>
                                        assemblyList.partsListItems.some(
                                          (item) =>
                                            getHoursForPartListItems(
                                              column,
                                              item.quantity,
                                              item.manufacturingVariables
                                            ) > 0
                                        )
                                      )
                                      .map((column) => (
                                        <th
                                          key={column}
                                          className="child_parts"
                                        >
                                          {column}
                                        </th>
                                      ))}
                                    <th>Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {!loading &&
                                  !error &&
                                  assemblyList.partsListItems?.length > 0 ? (
                                    assemblyList.partsListItems.map((item) => (
                                      <React.Fragment key={item.Uid}>
                                        <tr className="table-row-main">
                                          <td
                                            style={{
                                              backgroundColor: "#EFEBE9",
                                              color: "black",
                                            }}
                                            className="part-name"
                                          >
                                            {`${item.partName || "N/A"} `}
                                          </td>
                                          <td>{item.quantity}</td>
                                          <td>
                                            {item.quantity * item.costPerUnit}
                                          </td>
                                          <td>
                                            {formatTime(
                                              item.quantity * item.timePerUnit
                                            )}
                                          </td>
                                          {columnNames
                                            .filter((column) =>
                                              assemblyList.partsListItems.some(
                                                (item) =>
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  ) > 0
                                              )
                                            )
                                            .map((column) => (
                                              <th
                                                key={column}
                                                className="child_parts"
                                                onClick={() => {
                                                  const tableInfo =
                                                    getTableInfo(item, column);
                                                  const columnValue =
                                                    getHoursForPartListItems(
                                                      column,
                                                      item.quantity,
                                                      item.manufacturingVariables
                                                    );
                                                  const formattedValue =
                                                    formatTime(columnValue);

                                                  // Fetch the manufacturingVariable and categoryId based on column
                                                  const matchingVariable =
                                                    manufacturingVariables.find(
                                                      (variable) =>
                                                        variable.name.toLowerCase() ===
                                                        column.toLowerCase()
                                                    );
                                                  const categoryId =
                                                    matchingVariable?.categoryId ||
                                                    null;

                                                  handleCellClick(
                                                    item.partName,
                                                    column,
                                                    item.manufacturingVariables,
                                                    tableInfo,
                                                    formattedValue,
                                                    categoryId,
                                                    item.quantity
                                                  );
                                                }}
                                                style={{ color: "#2563EB" }}
                                              >
                                                {formatTime(
                                                  getHoursForPartListItems(
                                                    column,
                                                    item.quantity,
                                                    item.manufacturingVariables
                                                  )
                                                ) || ""}
                                              </th>
                                            ))}
                                          <td>
                                            <div className="action-buttons">
                                              <span
                                                style={{
                                                  color: "blue",
                                                  cursor: "pointer",
                                                  marginRight: "2px",
                                                }}
                                              >
                                                <FiSettings size={20} />
                                              </span>
                                              <span
                                                style={{
                                                  color: "red",
                                                  cursor: "pointer",
                                                  marginLeft: "3px",
                                                }}
                                              >
                                                <MdOutlineDelete size={25} />
                                              </span>
                                            </div>
                                          </td>
                                        </tr>
                                      </React.Fragment>
                                    ))
                                  ) : (
                                    <tr></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>



                          {/* //assemblyList */}
                          {assemblyList.subAssemblies?.map(
                            (subAssemblyList) => (
                              <React.Fragment key={subAssemblyList._id}>
                                <br />
                                <br />
                                <ul
                                  style={{
                                    listStyleType: "none",
                                    padding: 0,
                                    fontWeight: "600",
                                  }}
                                >
                                  <li
                                    style={{
                                      fontSize: "23px",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    {subAssemblyList.subAssemblyName}
                                  </li>

                                  <li style={{ fontSize: "19px" }}>
                                    <span class="badge bg-danger-subtle text-danger">
                                      Sub Assembly
                                    </span>
                                  </li>
                                </ul>
                                <h4></h4>
                                <div className="parts-lists">
                                  <div className="table-wrapper">
                                    <div className="table-responsive">
                                      <table className="table table-hover align-middle">
                                        <thead className="table-header">
                                          <tr>
                                            <th
                                              className="part-name-header"
                                              style={{
                                                backgroundColor: "#F5F5F5",
                                              }}
                                            >
                                              Sub-Assembly Part Name
                                            </th>
                                            <th className="child_parts">
                                              Quantity
                                            </th>
                                            <th className="child_parts">
                                              Total Cost
                                            </th>
                                            <th className="child_parts">
                                              Total Hours
                                            </th>

                                            {columnNames
                                              .filter((column) =>
                                                assemblyList.partsListItems.some(
                                                  (item) =>
                                                    getHoursForPartListItems(
                                                      column,
                                                      item.quantity,
                                                      item.manufacturingVariables
                                                    ) > 0
                                                )
                                              )
                                              .map((column) => (
                                                <th
                                                  key={column}
                                                  className="child_parts"
                                                >
                                                  {column}
                                                </th>
                                              ))}
                                            <th>Action</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {!loading &&
                                          !error &&
                                          subAssemblyList.partsListItems
                                            ?.length > 0 ? (
                                            subAssemblyList.partsListItems.map(
                                              (item) => (
                                                <React.Fragment key={item.Uid}>
                                                  <tr className="table-row-main">
                                                    <td
                                                      style={{
                                                        backgroundColor:
                                                          "#EFEBE9",
                                                        color: "black",
                                                      }}
                                                      className="part-name"
                                                    >
                                                      {`${
                                                        item.partName || "N/A"
                                                      }  `}
                                                    </td>
                                                    <td className="child_parts">
                                                      {item.quantity}
                                                    </td>
                                                    <td>
                                                      {item.quantity *
                                                        item.costPerUnit}
                                                    </td>
                                                    <td>
                                                      {formatTime(
                                                        item.quantity *
                                                          item.timePerUnit
                                                      )}
                                                    </td>

                                                    {columnNames
                                                      .filter((column) =>
                                                        assemblyList.partsListItems.some(
                                                          (item) =>
                                                            getHoursForPartListItems(
                                                              column,
                                                              item.quantity,
                                                              item.manufacturingVariables
                                                            ) > 0
                                                        )
                                                      )
                                                      .map((column) => (
                                                        <th
                                                          key={column}
                                                          className="child_parts"
                                                          onClick={() => {
                                                            const tableInfo =
                                                              getTableInfo(
                                                                item,
                                                                column
                                                              );
                                                            const columnValue =
                                                              getHoursForPartListItems(
                                                                column,
                                                                item.quantity,
                                                                item.manufacturingVariables
                                                              );
                                                            const formattedValue =
                                                              formatTime(
                                                                columnValue
                                                              );

                                                            // Fetch the manufacturingVariable and categoryId based on column
                                                            const matchingVariable =
                                                              manufacturingVariables.find(
                                                                (variable) =>
                                                                  variable.name.toLowerCase() ===
                                                                  column.toLowerCase()
                                                              );
                                                            const categoryId =
                                                              matchingVariable?.categoryId ||
                                                              null;

                                                            handleCellClick(
                                                              item.partName,
                                                              column,
                                                              item.manufacturingVariables,
                                                              tableInfo,
                                                              formattedValue,
                                                              categoryId,
                                                              item.quantity
                                                            );
                                                          }}
                                                          style={{
                                                            color: "#2563EB",
                                                          }}
                                                        >
                                                          {formatTime(
                                                            getHoursForPartListItems(
                                                              column,
                                                              item.quantity,
                                                              item.manufacturingVariables
                                                            )
                                                          ) || ""}
                                                        </th>
                                                      ))}
                                                    <td>
                                                      {" "}
                                                      <div className="action-buttons">
                                                        <span
                                                          style={{
                                                            color: "blue",
                                                            cursor: "pointer",
                                                            marginRight: "2px",
                                                          }}
                                                        >
                                                          <FiSettings
                                                            size={20}
                                                          />
                                                        </span>
                                                        <span
                                                          style={{
                                                            color: "red",
                                                            cursor: "pointer",
                                                            marginLeft: "3px",
                                                          }}
                                                        >
                                                          <MdOutlineDelete
                                                            size={25}
                                                          />
                                                        </span>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                </React.Fragment>
                                              )
                                            )
                                          ) : (
                                            <tr>
                                              <td
                                                colSpan="16"
                                                className="text-center"
                                              >
                                                {loading
                                                  ? "Loading..."
                                                  : error
                                                  ? error
                                                  : "No sub-assembly parts available"}
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                  <br />
                                  <br />
                                </div>
                              </React.Fragment>
                            )
                          )}
                        </CardBody>
                      </Card>
                    </React.Fragment>
                  ))
                : null}

    </div>
  )
}

export default AssemblyHoursPlanning