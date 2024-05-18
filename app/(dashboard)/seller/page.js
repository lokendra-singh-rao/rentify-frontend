"use client";
// import node module libraries
import { Fragment, useEffect, useState } from "react";
import {
  Container,
  Col,
  Row,
  Card,
  Image,
  Alert,
  Form,
  Button,
  ListGroup,
  ListGroupItem,
} from "react-bootstrap";
import Link from "next/link";

// import firebase
import { auth } from "components/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import axios from "axios";
import Loading from "app/(auth)/authentication/loading";

// import custom values
import values from "values";

const Home = () => {
  const router = useRouter();
  const [userData, setUserData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorFetchingData, setErrorFetchingData] = useState(false);
  const [addProperty, setAddProperty] = useState(false);
  const [sellerProperties, setSellerProperties] = useState([]);

  //property states
  const [area, setArea] = useState("");
  const [place, setPlace] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [nearbyPlaces, setNearbyPlaces] = useState("");
  const [rent, setRent] = useState('');
  const [errorAddingProperty, setErrorAddingProperty] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        getUserdata(user?.accessToken);
        getSellerProperties(user?.accessToken);
      } else {
        router.push("/authentication/sign-in?activationRedirect=false");
      }
    });
  }, []);

  const getUserdata = async (token) => {
    try {
      setIsLoading(true);

      let headers = {
        FirebaseToken: `${token}`,
      };

      await axios({
        url: `${values.serverURL}/graphql`,
        method: "POST",
        headers: headers,
        data: {
          query: `
              query GetUserData {
                getUserData {
                  fullname
                  email
                  phone
                  role
                }
              }
              `,
        },
      })
        .then(async (res) => {
          if (res?.data?.errors) {
            setErrorFetchingData(true);
          } else if (res?.data?.data?.getUserData == null) {
            setErrorFetchingData(true);
          } else {
            if (res?.data?.data?.getUserData?.role == "BUYER") {
              router.push("/buyer");
            }
            setUserData(res?.data?.data?.getUserData);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getSellerProperties = async (token) => {
    try {
      setIsLoading(true);

      let headers = {
        FirebaseToken: `${token}`,
      };

      await axios({
        url: `${values.serverURL}/graphql`,
        method: "POST",
        headers: headers,
        data: {
          query: `
              query GetSellerProperties {
                getSellerProperties {
                  id
                  area
                  place
                  bedrooms
                  bathrooms
                  nearbyPlaces
                  rent
                  createdAt
                }
              }
              `,
        },
      })
        .then(async (res) => {
          if (res?.data?.errors) {
            setErrorFetchingData(true);
          } else if (res?.data?.data?.getSellerProperties == null) {
            setErrorFetchingData(true);
          } else {
            console.log(
              "SELLER PROPERTIES :: ",
              res?.data?.data?.getSellerProperties
            );
            setSellerProperties(res?.data?.data?.getSellerProperties);
            setIsLoading(false);
          }
        })
        .catch((error) => {
          setIsLoading(false);
        });
    } catch (error) {
      setIsLoading(false);
    }
  };

  const logout = async (e) => {
    await signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signed out successfully");
        router.push("/authentication/sign-in?activationRedirect=false");
      })
      .catch((error) => {});
  };

  const handleAddProperty = async (e) => {
    try {
      setErrorAddingProperty(false);
      setIsLoading(true);

      let headers = {
        FirebaseToken: `${await auth.currentUser.getIdToken()}`,
      };

      await axios({
        url: `${values.serverURL}/graphql`,
        method: "POST",
        headers: headers,
        data: {
          query: `mutation AddProperty {
            addProperty(
                propertyDetailsModel: { 
                  area: ${area}, 
                  place: "${place}", 
                  bedrooms: ${bedrooms}, 
                  bathrooms: ${bathrooms},
                nearbyPlaces: "${nearbyPlaces}",
              rent: ${rent} }
            ) {
              id
              area
              place
              bedrooms
              bathrooms
              rent
              nearbyPlaces
              createdAt
            }
        }`,
        },
      })
        .then(async (res) => {
          if (res?.data?.errors) {
            setErrorAddingProperty(true);
            setIsLoading(false);
          } else if (res?.data?.data?.addProperty == null) {
            setErrorAddingProperty(true);
            setIsLoading(false);
          } else {
            setSellerProperties(res?.data?.data?.addProperty);
            setAddProperty(false);
            setArea('')
            setPlace('')
            setBedrooms('')
            setBathrooms('')
            setNearbyPlaces('')
            setRent('')
            setIsLoading(false);
          }
        })
        .catch((error) => {
          setErrorAddingProperty(true);
          setIsLoading(false);
        });
    } catch (error) {
      setErrorAddingProperty(true);
      setIsLoading(false);
    }
  };

  const deleteProperty = async (id) => {
    try {

      let headers = {
        FirebaseToken: `${await auth.currentUser.getIdToken()}`,
      };

      await axios({
        url: `${values.serverURL}/graphql`,
        method: "POST",
        headers: headers,
        data: {
          query: `mutation DeleteProperty {
            deleteProperty(id : "${id}") {
              id
              area
              place
              bedrooms
              bathrooms
              nearbyPlaces
              rent
              createdAt
            }
        }`,
        },
      })
        .then(async (res) => {
          if (res?.data?.errors) {
            window.alert("Error in deleting")
          } else if (res?.data?.data?.deleteProperty == null) {
            window.alert("Error in deleting")
          } else {
            setSellerProperties(res?.data?.data?.deleteProperty);
          }
        })
        .catch((error) => {
          window.alert("Error in deleting")
        });
    } catch (error) {
      window.alert("Error in deleting")
    }
  };

  return (
    <Fragment>
      {errorFetchingData ? (
        <h1 className="text-center mt-16 pd-16">
          Error in fetching data, please try reloading the page!
        </h1>
      ) : isLoading ? (
        <Loading></Loading>
      ) : (
        <Container fluid className="p-6">
          {/* PROFILE HEADER */}
          <Row className="align-items-center mb-6">
            <Col xl={12} lg={12} md={12} xs={12}>
              {/* Bg */}
              <div
                className="pt-20 rounded-top"
                style={{
                  background:
                    "url(/images/background/profile-cover.jpg) no-repeat",
                  backgroundSize: "cover",
                }}
              ></div>
              <div className="bg-white smooth-shadow-sm ">
                <div className="d-flex align-items-center justify-content-between pt-4 pb-6 px-4">
                  <div className="d-flex align-items-center">
                    {/* avatar */}
                    <div className="avatar-xxl me-2 position-relative d-flex justify-content-end align-items-end mt-n10">
                      <Image
                        src="/images/avatar/avatar.png"
                        className="avatar-xxl rounded-circle border border-4 border-white-color-40"
                        alt=""
                      />
                      <Link
                        href="#!"
                        className="position-absolute top-0 right-0 me-2"
                        data-bs-toggle="tooltip"
                        data-placement="top"
                        title=""
                        data-original-title="Verified"
                      >
                        <Image
                          src="/images/svg/checked-mark.svg"
                          alt=""
                          height="30"
                          width="30"
                        />
                      </Link>
                    </div>
                    {/* text */}
                    <div className="lh-1">
                      <h2 className="mb-0">
                        {userData?.fullname}
                        <Link
                          href="#!"
                          className="text-decoration-none"
                          data-bs-toggle="tooltip"
                          data-placement="top"
                          title=""
                          data-original-title="Beginner"
                        ></Link>
                      </h2>
                      <p className="mb-0 d-block">({userData?.role})</p>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <Link
                      href="#"
                      className="btn btn-outline-primary d-none d-md-block"
                      onClick={(e) => {
                        e.preventDefault();
                        setAddProperty(!addProperty);
                      }}
                    >
                      {!addProperty ? `Add Property` : `See Properties`}
                    </Link>
                    <Link
                      href="#"
                      className="btn btn-outline-primary d-none d-md-block"
                      onClick={(e) => logout(e)}
                    >
                      Log Out
                    </Link>
                  </div>
                </div>
              </div>

              {/* ABOUT ME SECTION */}

              {/* card */}
              <Card className="rounded-bottom" style={{ borderRadius: "0" }}>
                {/* card body */}
                <Card.Body>
                  {/* card title */}
                  <Card.Title as="h4">Account Information</Card.Title>
                  <Row>
                    <Col xs={6} className="mb-5">
                      <h6 className="text-uppercase fs-5 ls-2">Email</h6>
                      <p className="mb-0">{userData?.email}</p>
                    </Col>
                    <Col xs={6} className="mb-5">
                      <h6 className="text-uppercase fs-5 ls-2">Phone</h6>
                      <p className="mb-0">{userData?.phone}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {addProperty ? (
            <Row className="align-items-center mb-6">
              <Col xl={12} lg={12} md={12} xs={12}>
                <div className="bg-white smooth-shadow-sm ">
                  <div className="d-flex align-items-center pt-4 px-4">
                    {/* text */}
                    <div className="lh-1">
                      <h2 className="mb-0">Add Property</h2>
                    </div>
                  </div>

                  <Form
                    className="pt-4 pb-6 px-4"
                    onSubmit={(e) => handleAddProperty(e)}
                  >
                    {/* Area */}
                    <Form.Group className="mb-2" controlId="username">
                      <Form.Label>Property Area (in sq. feet)</Form.Label>
                      <Form.Control
                        type="number"
                        name="area"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="In square feet"
                        required={true}
                      />
                    </Form.Group>

                    {/* Place */}
                    <Form.Group className="mb-2" controlId="email">
                      <Form.Label>Place (Address)</Form.Label>
                      <Form.Control
                        type="text"
                        name="place"
                        value={place}
                        onChange={(e) => setPlace(e.target.value)}
                        placeholder="Address"
                        required={true}
                      />
                    </Form.Group>

                    {/* Number of bedrooms */}
                    <Form.Group className="mb-2" controlId="phone">
                      <Form.Label>Number of Bedrooms</Form.Label>
                      <Form.Control
                        type="number"
                        name="bedrooms"
                        value={bedrooms}
                        onChange={(e) => setBedrooms(e.target.value)}
                        placeholder="Number of Bedrooms"
                        required={true}
                      />
                    </Form.Group>

                    {/* Number of bathrooms */}
                    <Form.Group className="mb-2" controlId="phone">
                      <Form.Label>Number of Bathrooms</Form.Label>
                      <Form.Control
                        type="number"
                        name="bathrooms"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        placeholder="Number of Bathrooms"
                        required={true}
                      />
                    </Form.Group>

                    {/* Nearby Places */}
                    <Form.Group className="mb-2" controlId="email">
                      <Form.Label>Nearby Places</Form.Label>
                      <Form.Control
                        type="text"
                        name="nearbyPlace"
                        value={nearbyPlaces}
                        onChange={(e) => setNearbyPlaces(e.target.value)}
                        placeholder="Nearby Places"
                        required={true}
                      />
                    </Form.Group>

                    {/* Rent */}
                    <Form.Group className="mb-6" controlId="email">
                      <Form.Label>Expected Rent (INR)</Form.Label>
                      <Form.Control
                        type="number"
                        name="rent"
                        value={rent}
                        onChange={(e) => setRent(e.target.value)}
                        placeholder="Rent"
                        required={true}
                      />
                    </Form.Group>

                    {/* Proeprty Add Error */}
                    {errorAddingProperty && (
                      <Alert variant="danger">
                        Error Adding Property, please try again!
                      </Alert>
                    )}
                    <div>
                      {/* Button */}
                      <div className="d-grid">
                        <Button variant="primary" type="submit">
                          Add Property
                        </Button>
                      </div>
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="align-items-center mb-6">
              <Col xl={12} lg={12} md={12} xs={12}>
                <div className="bg-white smooth-shadow-sm ">
                  <div className="d-flex flex-column align-items-start justify-content-between pt-4 pb-6 px-4">
                    <div className="d-flex flex-column gap-4 align-items-center mb-4">
                      {/* text */}
                      <div className="lh-1">
                        <h2 className="mb-0">Your Properties</h2>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap justify-content-between gap-4 align-items-center">
                      {sellerProperties.length > 0 ? (
                        sellerProperties.map((property) => (
                          <Card key={property.id} style={{ width: "20rem" }}>
                            <Card.Body className="mb-0 pb-0">
                              <Card.Title>Id : {property?.id}</Card.Title>
                            </Card.Body>
                            <ListGroup className="list-group-flush">
                              <ListGroupItem>
                                Place : {property?.place}
                              </ListGroupItem>
                              <ListGroupItem>
                                Rent (INR) : {property?.rent}
                              </ListGroupItem>
                              <ListGroupItem>
                                Area (Sq feet) : {property?.area}
                              </ListGroupItem>
                              <ListGroupItem>
                                Bedrooms : {property?.bedrooms}
                              </ListGroupItem>
                              <ListGroupItem>
                                Bathrooms : {property?.bathrooms}
                              </ListGroupItem>
                              <ListGroupItem>
                                Nearby Places : {property?.nearbyPlaces}
                              </ListGroupItem>
                            </ListGroup>
                            <Card.Body className="d-flex gap-2">
                            <Button onClick={(e) => {deleteProperty(property?.id)}} variant="primary" type="submit">
                                Edit
                              </Button>
                              <Button onClick={(e) => {deleteProperty(property?.id)}} variant="primary" type="submit">
                                Delete
                              </Button>
                            </Card.Body>
                          </Card>
                        ))
                      ) : (
                        <>No properties added</>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Container>
      )}
    </Fragment>
  );
};
export default Home;
