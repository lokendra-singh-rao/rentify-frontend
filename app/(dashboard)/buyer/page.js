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
  Modal,
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
  const [allProperties, setAllProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [sellerInfo, setSellerInfo] = useState({});
  const [modalShow, setModalShow] = useState(false);
  const [filter, setFilter] = useState("date");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user?.emailVerified) {
        console.log("======= uid", user.uid);
        getUserdata(user?.accessToken);
        getAllProperties(user?.accessToken);
      } else {
        router.push("/authentication/sign-in?activationRedirect=false");
      }
    });
  }, [router]);

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
            if (res?.data?.data?.getUserData?.role == "SELLER") {
              router.push("/seller");
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

  const getAllProperties = async (token) => {
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
              query GetAllProperties {
                getAllProperties {
                  id
                  sellerId
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
          } else if (res?.data?.data?.getAllProperties == null) {
            setErrorFetchingData(true);
          } else {
            setAllProperties(res?.data?.data?.getAllProperties);
            setFilteredProperties(res?.data?.data?.getAllProperties);
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
    e.preventDefault();
    await signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("Signed out successfully");
        router.push("/authentication/sign-in?activationRedirect=false");
      })
      .catch((error) => {});
  };

  const getSellerInfo = async (id) => {
    try {
      let headers = {
        FirebaseToken: `${await auth.currentUser.getIdToken()}`,
      };

      await axios({
        url: `${values.serverURL}/graphql`,
        method: "POST",
        headers: headers,
        data: {
          query: `mutation GetSellerInfo {
            getSellerInfo (id : "${id}") {
              fullname
              email
              phone
            }
        }`,
        },
      })
        .then(async (res) => {
          if (res?.data?.errors) {
            window.alert("Error fetching seller info");
          } else if (res?.data?.data?.getSellerInfo == null) {
            window.alert("Error fetching seller info");
          } else {
            setSellerInfo(res?.data?.data?.getSellerInfo);
            setModalShow(true);
          }
        })
        .catch((error) => {
          window.alert("Error fetching seller info");
        });
    } catch (error) {
      window.alert("Error fetching seller info");
    }
  };

const updateProperties = async (filterValue) => {
  console.log("Filtering for :: ", filterValue)
  if (filterValue == "rent") {
      filteredProperties.sort((a, b) => {
        if (a.rent !== b.rent) {
          return a.rent - b.rent;
        }
      });
    } else if (filterValue == "date") {
      filteredProperties.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
    } else if (filterValue == "area") {
      filteredProperties.sort((a, b) => {
        if (a.area !== b.area) {
          return a.area - b.area;
        }
      });
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
          <Row className="align-items-center mb-6">
            <Col xl={12} lg={12} md={12} xs={12}>
              <div className="bg-white smooth-shadow-sm ">
                <div className="d-flex flex-column align-items-start justify-content-between pt-4 pb-6 px-4">
                  <div className="d-flex gap-4 align-items-center mb-4">
                    {/* text */}
                    <div className="lh-1">
                      <h2 className="mb-0">Find Properties</h2>
                    </div>
                    {/* Filter */}
                    <Form.Select
                      name="filter"
                      placeholder="Select Filter"
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        updateProperties(e.target.value);
                      }}
                    >
                      <option value="date">Date</option>
                      <option value="rent">Rent</option>
                      <option value="area">Area</option>
                    </Form.Select>
                  </div>
                  <div className="d-flex flex-wrap justify-content-between gap-4 align-items-center">
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property) => (
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
                            <ListGroupItem>
                              Added on : {property?.createdAt}
                            </ListGroupItem>
                          </ListGroup>
                          <Card.Body className="d-flex gap-2">
                            <Button
                              onClick={(e) => {
                                getSellerInfo(property?.sellerId);
                              }}
                              variant="primary"
                              type="submit"
                            >
                              Interested
                            </Button>
                          </Card.Body>
                        </Card>
                      ))
                    ) : (
                      <>No properties found</>
                    )}
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      )}

      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            Seller Information
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup className="list-group-flush">
            <ListGroupItem>Fullname : {sellerInfo?.fullname}</ListGroupItem>
            <ListGroupItem>Email : {sellerInfo?.email}</ListGroupItem>
            <ListGroupItem>Phone : {sellerInfo?.phone}</ListGroupItem>
          </ListGroup>
        </Modal.Body>
      </Modal>
    </Fragment>
  );
};
export default Home;
