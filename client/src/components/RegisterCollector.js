import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Navbar, NavbarBrand } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addUser } from '../features/UserSlice';
import { UserRegisterSchemaValidation } from '../validations/UserRegisterSchemaValidation';
import ValidationInput from '../components/ValidationInput';
import logo from '../assets/logo.png';

const DEFAULT_PROFILE_PIC = "https://icon-library.com/images/profiles-icon/profiles-icon-0.jpg";

const RegisterCollector = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [uname, setUname] = useState('');
  const [pic, setPic] = useState('');
  const [phone, setPhone] = useState('');
  const [collectorType, setCollectorType] = useState('');
  const [acceptedCategories, setAcceptedCategories] = useState([]);
  const [address, setAddress] = useState('');
  const [openHr, setOpenHr] = useState("8:00 AM - 6:00 PM");

  const [collectorTypeError, setCollectorTypeError] = useState('');
  const [categoriesError, setCategoriesError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [openHrError, setOpenHrError] = useState('');
  const [locationConsent, setLocationConsent] = useState(false);
  const [coords, setCoords] = useState(null);
  const [locationError, setLocationError] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { message, isSuccess, isError } = useSelector(state => state.users);

  const { register: hookRegister, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(UserRegisterSchemaValidation)
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  const handleNextStep = () => {
    let ok = true;
    if (!collectorType) {
      setCollectorTypeError("Collector type is required");
      ok = false;
    } else setCollectorTypeError('');

    if (ok) setStep(2);
  };

  const submitCollector = () => {
    let ok = true;

    if (acceptedCategories.length === 0) {
      setCategoriesError("Select at least one category");
      ok = false;
    } else setCategoriesError('');

    if (!openHr.trim()) {
      setOpenHrError("Opening hours are required");
      ok = false;
    } else setOpenHrError('');

    if (!address.trim()) {
      setAddressError("Address is required");
      ok = false;
    } else setAddressError('');

    // ✅ LOCATION VALIDATION (ADDED ONLY THIS BLOCK)
    if (!locationConsent) {
      setLocationError("You must consent to share your location to appear on the map.");
      ok = false;
    } else if (!coords) {
      setLocationError("Location not detected. Please allow location access.");
      ok = false;
    } else {
      setLocationError('');
    }

    if (!ok) return;

    const data = {
      role: 'collector',
      companyName: uname,
      collectorType,
      acceptedCategories,
      address,
      openHr,
      email,
      password,
      phone,
      pic: pic.trim() ? pic : DEFAULT_PROFILE_PIC,
      location: coords,            // ✅ ADDED
      locationConsent              // ✅ ADDED
    };

    dispatch(addUser(data));
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch({ type: "users/resetUser" });
      alert("Collector registration submitted. Please wait for admin approval.");
      navigate('/login');
    }

    if (isError) {
      alert(message || "Registration failed");
    }
  }, [isSuccess, isError, message, navigate, dispatch]);

  return (
    <>
      <Navbar className="my-2" style={{ backgroundColor: "#0080AA" }}>
        <NavbarBrand href="/" style={{ color: "white" }}>
          <img alt="logo" src={logo} style={{ height: 40, width: 40, marginRight: 10 }} />
          ReNova
        </NavbarBrand>

        <div className="ms-auto d-flex gap-2">
          <Button href="/Login" style={{ backgroundColor: "white", color: "#0080AA", border: "none" }}>Sign In</Button>
          <Button href="/Register" style={{ backgroundColor: "#006D90", color: "white", border: "none" }}>Sign Up</Button>
        </div>
      </Navbar>

      {/* STEP 1 */}
      {step === 1 && (
        <Container fluid>
          <Row className="div-row">
            <Col md="6" className="div-col">
              <form className="div-form" onSubmit={handleSubmit(handleNextStep)}>
                <div className="text-center">
                  <img src={logo} width="150" height="150" alt="Logo" />
                </div>

                <div className="text-center mb-4">
                  <label>
                    <input type="radio" name="choice" value="user" onClick={() => navigate('/register')} /> User
                  </label>
                  <label style={{ marginLeft: "15px" }}>
                    <input type="radio" name="choice" value="collector" defaultChecked /> Collector
                  </label>
                </div>

                <ValidationInput label="Company Name" error={errors.uname?.message}>
                  <input
                    {...hookRegister('uname')}
                    value={uname}
                    onChange={e => setUname(e.target.value)}
                    className={`form-control ${errors.uname ? "input-error" : ""}`}
                    placeholder="Company Name"
                  />
                </ValidationInput>

                <ValidationInput label="Collector Type" error={collectorTypeError}>
                  <select
                    value={collectorType}
                    onChange={e => setCollectorType(e.target.value)}
                    className={`form-control ${collectorTypeError ? "input-error" : ""}`}
                  >
                    <option value="">Select Collector Type</option>
                    <option value="individual">Individual Collector</option>
                    <option value="private_company">Private Collection Company</option>
                    <option value="government_approved">Government-Approved Collector</option>
                    <option value="recycling_center">Recycling Center</option>
                    <option value="scrap_dealer">Scrap Dealer / Scrap Yard</option>
                    <option value="ngo">NGO / Community Organization</option>
                    <option value="retailer_program">Retailer Take-Back Program</option>
                    <option value="corporate_collector">Corporate Collector</option>
                    <option value="logistics_partner">Transport & Logistics Partner</option>
                    <option value="hazardous_specialist">Specialized Hazardous Waste Collector</option>
                  </select>
                </ValidationInput>

                <ValidationInput label="Email" error={errors.email?.message}>
                  <input
                    {...hookRegister('email')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`form-control ${errors.email ? "input-error" : ""}`}
                    placeholder="Email"
                  />
                </ValidationInput>

                <ValidationInput
                  label="Password"
                  error={errors.password?.message}
                  showPasswordRules={true}
                >
                  <input
                    {...hookRegister('password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`form-control ${errors.password ? "input-error" : ""}`}
                    placeholder="Create password"
                    type="password"
                  />
                </ValidationInput>

                <ValidationInput label="Phone" error={errors.phone?.message}>
                  <input
                    {...hookRegister('phone')}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className={`form-control ${errors.phone ? "input-error" : ""}`}
                    placeholder="Omani phone (8 digits, starts 2/7/9)"
                  />
                </ValidationInput>

                <ValidationInput label="Profile Picture URL" error={errors.pic?.message}>
                  <input
                    {...hookRegister('pic')}
                    value={pic}
                    onChange={e => setPic(e.target.value)}
                    className={`form-control ${errors.pic ? "input-error" : ""}`}
                    placeholder="Profile Pic URL"
                  />
                </ValidationInput>

                <div className="d-flex justify-content-center">
                  <Button type="submit" style={{ backgroundColor: "#006D90" }}>Next</Button>
                </div>

              </form>
            </Col>
          </Row>
        </Container>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Container fluid>
          <Row className="div-row">
            <Col md="6" className="div-col">
              <form className="div-form" onSubmit={handleSubmit(submitCollector)}>
                <div className="text-center mb-4">
                  <h5>Accepted Categories & Location</h5>
                </div>

                {/* LOCATION CONSENT UI (ADDED ONLY THIS SECTION) */}
                <div style={{ marginBottom: "15px" }}>
                  <input
                    type="checkbox"
                    checked={locationConsent}
                    onChange={(e) => {
                      setLocationConsent(e.target.checked);
                      if (e.target.checked) {
                        getCurrentLocation();
                      } else {
                        setCoords(null);
                      }
                    }}
                    style={{ marginRight: 8 }}
                  />
                  I consent to share my current location to appear on the map.
                  {locationError && (
                    <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
                      {locationError}
                    </div>
                  )}
                </div>

                <ValidationInput label="Accepted Categories" error={categoriesError}>
                  <div
                    className={`category-box ${categoriesError ? "input-error" : ""}`}
                    style={{
                      height: "180px",
                      overflowY: "auto",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      padding: "10px",
                      backgroundColor: "#F8F9FA"
                    }}
                  >
                    {[
                      "Small Electronics", "Large Electronics", "Home Appliances (Small)", "Home Appliances (Large)",
                      "IT & Office Equipment", "Kitchen & Cooking Appliances", "Entertainment Devices", "Personal Care Electronics",
                      "Tools & Outdoor Equipment", "Lighting Equipment", "Medical & Fitness Devices", "Batteries & Accessories"
                    ].map(cat => (
                      <div key={cat}>
                        <input
                          type="checkbox"
                          checked={acceptedCategories.includes(cat)}
                          onChange={() =>
                            setAcceptedCategories(prev =>
                              prev.includes(cat)
                                ? prev.filter(c => c !== cat)
                                : [...prev, cat]
                            )
                          }
                          style={{ marginRight: 8 }}
                        />
                        {cat}
                      </div>
                    ))}
                  </div>
                </ValidationInput>

                <ValidationInput label="Opening Hours" error={openHrError}>
                  <input
                    value={openHr}
                    onChange={e => setOpenHr(e.target.value)}
                    className={`form-control ${openHrError ? "input-error" : ""}`}
                    placeholder="8:00 AM - 6:00 PM"
                  />
                </ValidationInput>

                <ValidationInput label="Address" error={addressError}>
                  <input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className={`form-control ${addressError ? "input-error" : ""}`}
                    placeholder="Address"
                  />
                </ValidationInput>

                <div className="d-flex justify-content-between mt-4">
                  <Button type="button" style={{ backgroundColor: "#6c757d" }} onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" style={{ backgroundColor: "#006D90" }}>
                    Register
                  </Button>
                </div>

              </form>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default RegisterCollector;