"use client";
// import node module libraries
import { Col, Row, Image, Container, Button } from "react-bootstrap";
import Link from "next/link";

// import hooks
import useMounted from "hooks/useMounted";
import { Fragment, useEffect } from "react";
import { auth } from "components/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const NotFound = () => {
  const hasMounted = useMounted();
  const router = useRouter()

  useEffect(() => {
    handleNotFound()
  })

  const handleNotFound = async () => {
    try {
      const user = auth.currentUser;
  
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
            signOut(auth);
            router.push("/authentication/sign-in?activationRedirect=false");
          } else if (res?.data?.data?.signInUser == null){
            signOut(auth);
            router.push("/authentication/sign-in?activationRedirect=false");
          } else if (res?.data?.data?.signInUser == `SELLER`) {
            secureLocalStorage.setItem("loggedIn",true)
            secureLocalStorage.setItem("role","SELLER")
            router.push("/seller");
          } else if (res?.data?.data?.signInUser == `BUYER`) {
            secureLocalStorage.setItem("loggedIn",true)
            secureLocalStorage.setItem("role",'BUYER')
            router.push("/buyer");
          } else {
            signOut(auth);
            router.push("/authentication/sign-in?activationRedirect=false");
          }
        })
        .catch((error) => {
          signOut(auth);
          router.push("/authentication/sign-in?activationRedirect=false");
        });
    } catch (error) {
      signOut(auth);
      router.push("/authentication/sign-in?activationRedirect=false");
    }  
  };

  return (
    <Fragment>
      {hasMounted && (
        <Container>
          <Row>
            <Col sm={12}>
              <div className="text-center">
                <div className="mb-3">
                  <Image
                    src="/images/error/404-error-img.png"
                    alt=""
                    className="img-fluid"
                  />
                </div>
                <h1 className="display-4 fw-bold">Oops! the page not found.</h1>
                <Button
                  onClick={handleNotFound()}
                  variant="primary"
                  type="submit"
                >
                  Go Home
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </Fragment>
  );
};

export default NotFound;
