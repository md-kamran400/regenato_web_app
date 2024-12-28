// File: Login.js

// import { Link } from 'feather-icons-react/build/IconComponents';
import { Link } from "react-router-dom";
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
  FormFeedback,
  Alert,
  Spinner,
} from "reactstrap";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (email !== "admin@ccmpl.com" || password !== "12345") {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to Regenato home page
      window.location.href = "/regenato-home";
    } catch (err) {
      setError("Failed to log in");
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
                  <h5 className="text-primary">Welcome Back !</h5>
                  <p className="text-muted">Sign in to continue to CCMPL.</p>
                </div>
                {error && <Alert color="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <Label htmlFor="email" className="form-label">
                      Email
                    </Label>
                    <Input
                      name="email"
                      className="form-control"
                      placeholder="admin@ccmpl.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <Label className="form-label" htmlFor="password-input">
                      Password
                    </Label>
                    <Input
                      name="password"
                      value={password}
                      type="password"
                      className="form-control pe-5"
                      placeholder="12345"
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mt-4">
                    <Link>
                      <Button
                        color="success"
                        className="btn btn-success w-100"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <Spinner size="sm" className="me-2">
                            Loading...
                          </Spinner>
                        ) : null}
                        Sign In
                      </Button>
                    </Link>
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
