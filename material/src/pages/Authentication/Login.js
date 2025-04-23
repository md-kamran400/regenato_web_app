import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Label,
  Row,
  Button,
  Form,
  Alert,
  Spinner,
} from "reactstrap";

const Login = () => {
 
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/regenato-home");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/api/userManagement/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId, password }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userRole", data.user.role);

      window.dispatchEvent(new Event("storage"));
      setToken(data.token);
    } catch (err) {
      setError(err.message || "Invalid employee ID or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper" style={{
      minHeight: "100vh",
      backgroundColor: "#f8f9fa",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}>
      <Container style={{ maxWidth: "1140px" }}>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5} className="mb-5">
            {/* Logo Section */}
            <div className="text-center mb-2">
              <h2 style={{
                color: "#2c7be5",
                fontWeight: "600",
                marginBottom: "0.5rem"
              }}>CCMPL</h2>
              {/* <p style={{
                color: "#95aac9",
                fontSize: "0.875rem"
              }}>Company Management Portal</p> */}
            </div>

            {/* Login Card */}
            <Card className="shadow-lg" style={{
              border: "none",
              borderRadius: "0.75rem",
              overflow: "hidden"
            }}>
              <CardBody className="p-4">
                <div className="text-center mb-4">
                  <h4 style={{
                    color: "#12263f",
                    fontWeight: "600",
                    marginBottom: "0.5rem"
                  }}>Welcome Back!</h4>
                  <p style={{
                    color: "#95aac9",
                    fontSize: "0.875rem"
                  }}>Please sign in to continue</p>
                </div>
                
                {error && (
                  <Alert color="danger" className="border-0 py-2" style={{
                    backgroundColor: "rgba(220, 53, 69, 0.1)",
                    color: "#d6336c",
                    fontSize: "0.875rem"
                  }}>
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Label htmlFor="employeeId" className="form-label" style={{
                      color: "#12263f",
                      fontWeight: "500",
                      fontSize: "0.875rem"
                    }}>
                      Employee ID
                    </Label>
                    <Input
                      name="employeeId"
                      className="form-control"
                      placeholder="Enter your employee ID"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        borderColor: "#e3ebf6",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="password" style={{
                      color: "#12263f",
                      fontWeight: "500",
                      fontSize: "0.875rem"
                    }}>
                      Password
                    </Label>
                    <Input
                      name="password"
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem 1rem",
                        borderColor: "#e3ebf6",
                        fontSize: "0.875rem"
                      }}
                    />
                  </div>

                  <div className="mb-3 text-end">
                    <a href="/" style={{
                      color: "#2c7be5",
                      fontSize: "0.8125rem",
                      textDecoration: "none"
                    }}>
                      Forgot password?
                    </a>
                  </div>

                  <div className="mt-4">
                    <Button
                      color="primary"
                      className="w-100"
                      type="submit"
                      disabled={loading}
                      style={{
                        borderRadius: "0.5rem",
                        padding: "0.75rem",
                        fontWeight: "600", // Made text bolder
                        fontSize: "0.9375rem",
                        boxShadow: "0 4px 6px rgba(44, 123, 229, 0.3)",
                        border: "none",
                        height: "46px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner 
                            size="sm" 
                            style={{ 
                              width: "1rem", 
                              height: "1rem",
                              borderWidth: "0.15em"
                            }} 
                          />
                          <span>Signing in...</span>
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>

            {/* Footer */}
            <div className="text-center mt-4" style={{
              color: "#95aac9",
              fontSize: "0.8125rem"
            }}>
              © {new Date().getFullYear()} CCMPL. All rights reserved.
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;


// import { Link, useNavigate } from "react-router-dom";
// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   CardBody,
//   Col,
//   Container,
//   Input,
//   Label,
//   Row,
//   Button,
//   Form,
//   Alert,
//   Spinner,
// } from "reactstrap";

// const Login = () => {
//   const [employeeId, setEmployeeId] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [token, setToken] = useState(localStorage.getItem("token") || null);
//   const navigate = useNavigate();

//   // Redirect if token exists
//   useEffect(() => {
//     if (token) {
//       console.log("Token found, redirecting...");
//       navigate("/regenato-home");
//     }
//   }, [token, navigate]);

//   // In Login.js, modify the handleSubmit function:
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch(
//         `${process.env.REACT_APP_BASE_URL}/api/userManagement/login`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ employeeId, password }),
//         }
//       );

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Login failed");

//       // Store token and user data with role information
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));
//       localStorage.setItem("userRole", data.user.role); // Store user role

//       // Trigger storage event to update all components
//       window.dispatchEvent(new Event("storage"));

//       setToken(data.token);
//     } catch (err) {
//       setError(err.message || "Invalid employee ID or password");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page-content">
//       <Container>
//         <Row>
//           <Col lg={12}>
//             <div className="text-center mt-sm-5 mb-4 text-white-50">
//               <div>
//                 <span className="auth-logo">CCMPL</span>
//               </div>
//             </div>
//           </Col>
//         </Row>

//         <Row className="justify-content-center">
//           <Col md={8} lg={6} xl={5}>
//             <Card className="mt-4">
//               <CardBody className="p-4">
//                 <div className="text-center mt-2">
//                   <h5 className="text-primary">Welcome Back!</h5>
//                   <p className="text-muted">Login to continue to CCMPL.</p>
//                 </div>
//                 {error && <Alert color="danger">{error}</Alert>}

//                 <Form onSubmit={handleSubmit}>
//                   <div className="mb-3">
//                     <Label htmlFor="employeeId" className="form-label">
//                       Employee ID
//                     </Label>
//                     <Input
//                       name="employeeId"
//                       className="form-control"
//                       placeholder="Employee ID"
//                       type="text"
//                       value={employeeId}
//                       onChange={(e) => setEmployeeId(e.target.value)}
//                       required
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <Label className="form-label" htmlFor="password">
//                       Password
//                     </Label>
//                     <Input
//                       name="password"
//                       type="password"
//                       className="form-control"
//                       placeholder="Password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       required
//                     />
//                   </div>

//                   <div className="mt-4">
//                     <Button
//                       color="success"
//                       className="btn btn-success w-100"
//                       type="submit"
//                       disabled={loading}
//                     >
//                       {loading ? <Spinner size="sm" className="me-2" /> : null}
//                       {loading ? "Logging in..." : "Login"}
//                     </Button>
//                   </div>
//                 </Form>
//               </CardBody>
//             </Card>
//           </Col>
//         </Row>
//       </Container>
//     </div>
//   );
// };

// export default Login;