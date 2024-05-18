"use client";

// import node module libraries
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import Link from "next/link";
import { auth } from "components/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useState } from "react";

// import hooks
import useMounted from "hooks/useMounted";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import axios from "axios";
import secureLocalStorage from "react-secure-storage";

// import custom values
import values from "values";

const SignIn = (req) => {
  const hasMounted = useMounted();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [successLogin, setSuccessLogin] = useState(false);
  const [errorLogin, setErrorLogin] = useState(false);
  const [errorLoginMessage, setErrorLoginMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activationRedirect, setActivationRedirect] = useState(false);

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
      const url = `${pathname}?${searchParams}`;
      setActivationRedirect(
        searchParams.get("activationRedirect") == "true" ? true : false
      );

      if (secureLocalStorage.getItem("rememberMe")) {
        setEmail(secureLocalStorage.getItem("email"))
        setRememberMe(true)
      }
    }
  }, [pathname, searchParams, router]);

  //Sign in function
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (rememberMe) {
      secureLocalStorage.setItem("email", email);
      secureLocalStorage.setItem("rememberMe", true);
    } else {
      secureLocalStorage.setItem("email", "");
      secureLocalStorage.setItem("rememberMe", false);
    }

    setActivationRedirect(false);
    setSuccessLogin(false);
    setErrorLogin(false);
    setErrorLoginMessage("");

    try {
      signInWithEmailAndPassword(auth, email, password)
        .then(async (user) => {
          // Signed in
          if (user?.user?.emailVerified == false) {
            setErrorLoginMessage(
              "Verify your email before Sign In!"
            );
            setErrorLogin(true);
            return;
          } else {
            await getSignInData(e, user?.user);
          }
        })
        .catch((error) => {
          // Error Signing in
          if (error?.code == "auth/invalid-credential") {
            setErrorLoginMessage("Invalid Credentials!");
          } else if (error?.code == "auth/too-many-requests") {
            setErrorLoginMessage("Too many attempts, please try again later!");
          }
          setErrorLogin(true);
        });
    } catch (error) {
      setErrorLogin(true);
    }
  };

  const getSignInData = async (e, user) => {
    e.preventDefault();

    try {
      let headers = {
        FirebaseToken: `${user?.accessToken}`,
      };

      await axios({
        url: `${values.serverURL}/graphql`,
        method: "POST",
        headers: headers,
        data: {
          query: `
          query SignInUser {
            signInUser
        }
          `,
        },
      })
        .then(async (res) => {
          if (res?.data?.errors) {
            setErrorLogin(true);
            signOut(auth);
          } else if (res?.data?.data?.signInUser == null){
            setErrorLogin(true);
            signOut(auth);
          } else if (res?.data?.data?.signInUser == `SELLER`) {
            setSuccessLogin(true);
            secureLocalStorage.setItem("loggedIn",true)
            secureLocalStorage.setItem("role","SELLER")
            router.push("/seller");
          } else if (res?.data?.data?.signInUser == `BUYER`) {
            setSuccessLogin(true);
            secureLocalStorage.setItem("loggedIn",true)
            secureLocalStorage.setItem("role",'BUYER')
            router.push("/buyer");
          } else {
            setErrorLogin(true);
            signOut(auth);
          }
        })
        .catch((error) => {
          setErrorLogin(true);
          signOut(auth);
        });
    } catch (error) {
      console.log("CONSOLE LOG IN SIGN IN ADMIN CATCH::::: ", error);
      setErrorLogin(true);
      signOut(auth);
    }
  };

  return (
    hasMounted && (
      <Row className="align-items-center justify-content-center g-0 min-vh-100">
        <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
          {/* Card */}
          <Card className="smooth-shadow-md">
            {/* Card body */}
            <Card.Body className="p-6">
              <div className="mb-4">
                <h1 className="text-center">Sign In</h1>
                <p className="mb-6 text-center">
                  Please enter login credentials
                </p>
              </div>
              {/* Form */}
              {hasMounted && (
                <Form onSubmit={(e) => handleSubmit(e)}>
                  {/* Username */}
                  <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email here"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required={true}
                    />
                  </Form.Group>

                  {/* Password */}
                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Enter password here"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required={true}
                      autoComplete="on"
                    />
                  </Form.Group>

                  {/* Checkbox */}
                  <div className="d-lg-flex justify-content-between align-items-center mb-4">
                    <Form.Check type="checkbox" id="rememberme">
                      <Form.Check.Input
                        type="checkbox"
                        checked={rememberMe}
                        onClick={(e) => setRememberMe(!rememberMe)} 
                      />
                      <Form.Check.Label>Remember me</Form.Check.Label>
                    </Form.Check>
                  </div>

                  {/* Error Login Message */}
                  {errorLogin ? (
                    errorLoginMessage != "" ? (
                      <Alert variant="danger">{errorLoginMessage}</Alert>
                    ) : (
                      <Alert variant="danger">
                        Failed to Login, please try again!
                      </Alert>
                    )
                  ) : (
                    <></>
                  )}

                  {/* Success Login Message */}
                  {successLogin && (
                    <Alert variant="success">Logged in Successfully!</Alert>
                  )}

                  {/* Admin approval notice after email verification */}
                  {activationRedirect && (
                    <Alert variant="info">
                      <Alert.Heading>
                        Email Verified Successfully!
                      </Alert.Heading>
                      <p>
                        After email verification your account also requires
                        approval by our admins before you can access the
                        platform. Once approved, you will receive another email
                        notifying you that your account has been activated and
                        is ready for use.
                      </p>
                    </Alert>
                  )}

                  <div>
                    {/* Button */}
                    <div className="d-grid">
                      <Button variant="primary" type="submit">
                        Sign In
                      </Button>
                    </div>
                    <div className="d-md-flex justify-content-between mt-4">
                      <div className="mb-2 mb-md-0">
                        <Link href="/authentication/sign-up" className="fs-5">
                          Sign Up
                        </Link>
                      </div>
                      <div>
                        <Link
                          href="/authentication/forget-password"
                          className="text-inherit fs-5"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    )
  );
};

export default SignIn;
