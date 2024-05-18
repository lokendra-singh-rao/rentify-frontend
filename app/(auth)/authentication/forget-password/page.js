"use client";

// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import Link from "next/link";
import { auth } from "components/firebase";

// import hooks
import useMounted from "hooks/useMounted";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgetPassword = () => {
  const hasMounted = useMounted();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorResetPassword, setErrorResetPassword] = useState(false)
  const [successResetPassword, setSuccessResetPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const user = auth?.currentUser;
    if (
      user?.emailVerified &&
      user?.emailVerified != undefined &&
      user?.emailVerified != null &&
      user != null
    ) {
      router.push("/");
    } else {
      if (secureLocalStorage.getItem("rememberMe")) {
        setEmail(secureLocalStorage.getItem("email"));
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorResetPassword(false)
    setSuccessResetPassword(false)
    
    try {
      sendPasswordResetEmail(auth, email)
        .then((res) => {
          setSuccessResetPassword(true)
        })
        .catch((error) => {
          setErrorResetPassword(true)
        });
    } catch (error) {
      setErrorResetPassword(true)
    }
  };

  return (
    <Row className="align-items-center justify-content-center g-0 min-vh-100">
      <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
        {/* Card */}
        <Card className="smooth-shadow-md">
          {/* Card body */}
          <Card.Body className="p-6">
            <div className="mb-4">
              <h1 className="text-center">Forgot Password ?</h1>
              <p className="mb-6">
                Don&apos;t worry, we&apos;ll send you an email to reset your
                password.
              </p>
            </div>
            {/* Form */}
            {hasMounted && (
              <Form onSubmit={(e) => handleSubmit(e)}>
                {/* Email */}
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    value={email}
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    name="email"
                    placeholder="Enter your email"
                  />
                </Form.Group>

                {/* Alert message for success/error */}
                {errorResetPassword ? errorMessage != '' ? <Alert variant="danger">
                  {errorMessage}
                </Alert> : <Alert variant="danger">
                  Unable to reset password, please try again!
                </Alert> : <></>}

                {successResetPassword ? <Alert variant="success">
                  Password reset link sent to mail!
                </Alert> : <></>}


                {/* Button */}
                <div className="mb-3 d-grid">
                  <Button variant="primary" type="submit">
                    Reset Password
                  </Button>
                </div>
                <span>
                  Don&apos;t have an account?{" "}
                  <Link href="/authentication/sign-in">Sign In</Link>
                </span>
              </Form>
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default ForgetPassword;
