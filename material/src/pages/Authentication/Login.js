import { Link, useNavigate } from "react-router-dom";
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

  // Redirect if token exists
  useEffect(() => {
    if (token) {
      console.log("Token found, redirecting...");
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

      // Store token and user data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Trigger storage event to update all components
      window.dispatchEvent(new Event("storage"));

      setToken(data.token);
    } catch (err) {
      setError(err.message || "Invalid employee ID or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-content">
      <Container>
        <Row>
          <Col lg={12}>
            <div className="text-center mt-sm-5 mb-4 text-white-50">
              <div>
                <span className="auth-logo">CCMPL</span>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="mt-4">
              <CardBody className="p-4">
                <div className="text-center mt-2">
                  <h5 className="text-primary">Welcome Back!</h5>
                  <p className="text-muted">Login to continue to CCMPL.</p>
                </div>
                {error && <Alert color="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Label htmlFor="employeeId" className="form-label">
                      Employee ID
                    </Label>
                    <Input
                      name="employeeId"
                      className="form-control"
                      placeholder="Employee ID"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <Label className="form-label" htmlFor="password">
                      Password
                    </Label>
                    <Input
                      name="password"
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <Button
                      color="success"
                      className="btn btn-success w-100"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? <Spinner size="sm" className="me-2" /> : null}
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
