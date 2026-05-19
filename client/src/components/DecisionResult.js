import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaExclamationCircle } from "react-icons/fa";
import axios from "axios";

import recycleImg from "../assets/recycle.png";
import upcycleImg from "../assets/Upcycle.png";
import disposeImg from "../assets/Dispose.png";

import "./Components.css";


const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const DecisionResult = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { recommendation, condition, detectedDevice, confidence } =
    location.state || {};

  
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [geolocationError, setGeolocationError] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [matchedCollector, setMatchedCollector] = useState(null);
  const [loadingCollectors, setLoadingCollectors] = useState(true);


  useEffect(() => {
    console.log(" [GEOLOCATION] Starting geolocation detection...");
    
    if (!navigator.geolocation) {
      console.warn(" [GEOLOCATION] Geolocation not supported");
      setGeolocationError("Geolocation not supported - use Test Mode");
      setLoadingCollectors(false);
      return;
    }

    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log(" [GEOLOCATION] Location detected:", { latitude, longitude });
        setUserLat(latitude);
        setUserLng(longitude);
        setGeolocationError(null); 
      },
      (error) => {
        console.warn(" [GEOLOCATION] Error:", error.message, "Code:", error.code);
        
        let message = "Location not available - use Test Mode to continue";
        if (error.code === 1) {
          message = "Location permission denied - use Test Mode to continue";
        } else if (error.code === 2) {
          message = "Location service unavailable - use Test Mode to continue";
        } else if (error.code === 3) {
          message = "Location request timed out - use Test Mode to continue";
        }
        
        setGeolocationError(message);
        setLoadingCollectors(false);
        console.warn(" [GEOLOCATION] Fallback message set:", message);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, 
        maximumAge: 0
      }
    );

    // Cleanup
    return () => {
      console.log(" [GEOLOCATION] Component unmounting");
    };
  }, []);

  
  useEffect(() => {
    console.log(" [COLLECTOR] Effect triggered:", { userLat, userLng, recommendation, hasError: !!geolocationError });
    
    
    if (userLat !== null && userLng !== null && recommendation) {
      console.log(" [COLLECTOR] All required data present - fetching collectors...");
      fetchAndMatchCollectors();
    } else {
      console.log(" [COLLECTOR] Waiting for location or recommendation...", { 
        hasLat: userLat !== null, 
        hasLng: userLng !== null, 
        hasRec: !!recommendation 
      });
    }
  }, [userLat, userLng, recommendation]);

  const fetchAndMatchCollectors = async () => {
    try {
      console.log(" [FETCH] Starting collector fetch...");
      console.log(" [FETCH] User location:", { userLat, userLng });
      setLoadingCollectors(true);

      
      let res;
      try {
        console.log(" [FETCH] Calling API: http://localhost:5000/admin/getApprovedCollectors");
        res = await axios.get("http://localhost:5000/admin/getApprovedCollectors");
        console.log(" [FETCH] API Response received! Count:", res.data?.length || 0);
        console.log(" [FETCH] Full response:", res.data);
      } catch (fetchErr) {
        console.error(" [FETCH] API call FAILED:", {
          message: fetchErr.message,
          status: fetchErr.response?.status,
          statusText: fetchErr.response?.statusText,
          url: fetchErr.config?.url
        });
        console.log(" [FETCH] Using fallback mock data for testing...");
        
        
        res = {
          data: [
            {
              _id: "mock-001",
              collectorId: "C001",
              companyName: "EcoTech Oman",
              location: { lat: 23.6150, lng: 58.5450 },
              acceptedCategories: ["Recycle", "Dispose"],
              isApproved: true,
            },
            {
              _id: "mock-002",
              collectorId: "C002",
              companyName: "Green Solutions",
              location: { lat: 23.5900, lng: 58.5600 },
              acceptedCategories: ["Upcycle", "Repair", "Refurbish"],
              isApproved: true,
            },
            {
              _id: "mock-003",
              collectorId: "C003",
              companyName: "E-Waste Center",
              location: { lat: 23.6300, lng: 58.5200 },
              acceptedCategories: ["E-Waste", "Disposal", "Recycle"],
              isApproved: true,
            },
          ]
        };
        console.log(" [FETCH] Mock data loaded - count:", res.data.length);
      }

      if (!res.data || res.data.length === 0) {
        console.error(" [FETCH] No collector data received!");
        setGeolocationError("No collectors available in database");
        return;
      }

      console.log(" [FETCH] Total collectors from API:", res.data.length);

      
      const activeCollectors = res.data.filter((c) => {
        const hasLocation = c.location && typeof c.location.lat === 'number' && typeof c.location.lng === 'number';
        const isApproved = c.isApproved === true || c.isApproved === "true";
        const isNotDeactivated = !c.deactivatedAt;
        
        console.log(` [FILTER] Checking ${c.companyName}:`, {
          hasLocation,
          lat: c.location?.lat,
          lng: c.location?.lng,
          isApproved,
          deactivatedAt: c.deactivatedAt
        });
        
        if (!hasLocation) {
          console.warn(" [FILTER] REJECTED - ${c.companyName} missing/invalid location");
        }
        if (!isApproved) {
          console.warn(` [FILTER] REJECTED - ${c.companyName} not approved`);
        }
        if (c.deactivatedAt) {
          console.warn(` [FILTER] REJECTED - ${c.companyName} is deactivated`);
        }
        
        return hasLocation && isApproved && isNotDeactivated;
      });

      console.log(" [FILTER] PASSED FILTERING:", activeCollectors.length, "collectors");
      activeCollectors.forEach(c => {
        console.log(`  ✓ ${c.companyName} (${c.location.lat}, ${c.location.lng}) - Categories:`, c.acceptedCategories);
      });
      setCollectors(activeCollectors);

      if (activeCollectors.length === 0) {
        console.error(" [MATCH] NO ACTIVE COLLECTORS - all were filtered out!");
        setGeolocationError("No active collectors found in database");
        return;
      }

      
      console.log("\n [MATCH] Starting category matching for recommendation:", recommendation);
      const nearest = findNearestCollector(activeCollectors, recommendation);
      
      if (nearest) {
        console.log(" [MATCH] SUCCESS! Matched collector:", {
          name: nearest.companyName,
          distance: nearest.distance,
          categories: nearest.acceptedCategories
        });
        setMatchedCollector(nearest);
      } else {
        console.error(" [MATCH] FAILED - No compatible collector found for category:", recommendation);
        console.log(" [DEBUG] Recommendation was:", recommendation);
        console.log(" [DEBUG] Available collectors:", activeCollectors.map(c => ({ name: c.companyName, categories: c.acceptedCategories })));
      }
    } catch (err) {
      console.error(" [ERROR] Unhandled error in fetchAndMatchCollectors:", {
        message: err.message,
        stack: err.stack
      });
      setGeolocationError("Error loading collectors: " + err.message);
    } finally {
      setLoadingCollectors(false);
    }
  };

  const findNearestCollector = (collectorsList, recommendedCategory) => {
    console.log("\n [NEAREST] ═══════════════════════════════════════════");
    console.log(" [NEAREST] STARTING COLLECTOR MATCHING");
    console.log(" [NEAREST] Input: Category =", recommendedCategory);
    console.log(" [NEAREST] Input: Total collectors =", collectorsList.length);
    console.log(" [NEAREST] Input: User location =", { userLat, userLng });
    
    // Filter collectors that support the recommended category
    const compatibleCollectors = collectorsToMatch(
      collectorsList,
      recommendedCategory
    );

    console.log(" [NEAREST] After category filter: Compatible collectors =", compatibleCollectors.length);
    compatibleCollectors.forEach(c => {
      console.log(`  ✓ ${c.companyName}`);
    });

    if (compatibleCollectors.length === 0) {
      console.error(" [NEAREST] NO COMPATIBLE COLLECTORS FOUND!");
      console.error(" [NEAREST] This means:");
      console.error("  - Either recommendation category is not recognized");
      console.error("  - Or no collectors support this category");
      console.error("  - Or collectors data is malformed");
      return null;
    }

    
    const withDistances = compatibleCollectors.map((collector) => {
      if (!userLat || !userLng) {
        console.error(" [NEAREST] ERROR: User location not set!", { userLat, userLng });
        return {
          ...collector,
          distance: 99999, 
        };
      }

      const distance = parseFloat(
        calculateDistance(
          userLat,
          userLng,
          collector.location.lat,
          collector.location.lng
        )
      );
      console.log(` [DISTANCE] ${collector.companyName}: ${distance} km from user`);
      return {
        ...collector,
        distance,
      };
    });

    
    withDistances.sort((a, b) => a.distance - b.distance);
    
    const matched = withDistances[0];
    console.log(`\n [NEAREST] SELECTED NEAREST COLLECTOR:`);
    console.log(`  Name: ${matched.companyName}`);
    console.log(`  Distance: ${matched.distance} km`);
    console.log(`  Categories: ${matched.acceptedCategories.join(", ")}`);
    console.log(" [NEAREST] ═══════════════════════════════════════════\n");
    
    return matched;
  };

  const collectorsToMatch = (collectorsForCategory, recommendedCategory) => {
    console.log(" [CATEGORY] Matching category:", recommendedCategory);
    console.log(" [CATEGORY] Type of recommendation:", typeof recommendedCategory);
    
    if (!recommendedCategory) {
      console.error(" [CATEGORY] CRITICAL: recommendedCategory is null/undefined!");
      return [];
    }

    return collectorsForCategory.filter((collector) => {
      console.log(`\n [CATEGORY] Checking collector: ${collector.companyName}`);
      
      if (!collector.acceptedCategories) {
        console.log(` [CATEGORY] ${collector.companyName} has NO acceptedCategories field - REJECT`);
        return false;
      }

      if (!Array.isArray(collector.acceptedCategories)) {
        console.warn(` [CATEGORY] ${collector.companyName} acceptedCategories is not an array:`, collector.acceptedCategories);
        return false;
      }

      if (collector.acceptedCategories.length === 0) {
        console.log(` [CATEGORY] ${collector.companyName} has empty acceptedCategories - REJECT`);
        return false;
      }

      const accepted = collector.acceptedCategories.map((cat) => {
        const lower = String(cat).toLowerCase().trim();
        return lower;
      });
      
      console.log(` [CATEGORY] ${collector.companyName} categories (normalized):`, accepted);

      
      const recLower = String(recommendedCategory).toLowerCase().trim();
      console.log(` [CATEGORY] Recommendation (normalized): "${recLower}"`);
      
      
      if (recLower === "recycle" || recLower.includes("recycle")) {
        console.log(" [CATEGORY] Strategy: Looking for RECYCLE matches...");
        const matches = accepted.some(
          (cat) =>
            cat.includes("recycle") ||
            cat.includes("recycling") ||
            cat.includes("e-waste") ||
            cat.includes("ewaste") ||
            cat.includes("electronic waste")
        );
        if (matches) {
          console.log(` [CATEGORY] ${collector.companyName} MATCHED - accepts recycle`);
          return true;
        }
      }
      
      if (recLower === "upcycle" || recLower.includes("upcycle")) {
        console.log(" [CATEGORY] Strategy: Looking for UPCYCLE matches...");
        const matches = accepted.some(
          (cat) =>
            cat.includes("upcycle") ||
            cat.includes("repair") ||
            cat.includes("refurbish") ||
            cat.includes("repairing") ||
            cat.includes("reuse") ||
            cat.includes("resale") ||
            cat.includes("refurb")
        );
        if (matches) {
          console.log(` [CATEGORY] ${collector.companyName} MATCHED - accepts upcycle`);
          return true;
        }
      }
      
      if (recLower === "dispose" || recLower.includes("dispose")) {
        console.log(" [CATEGORY] Strategy: Looking for DISPOSE matches...");
        const matches = accepted.some(
          (cat) =>
            cat.includes("dispose") ||
            cat.includes("disposal") ||
            cat.includes("e-waste") ||
            cat.includes("ewaste") ||
            cat.includes("waste") ||
            cat.includes("scrap") ||
            cat.includes("electronic waste")
        );
        if (matches) {
          console.log(` [CATEGORY] ${collector.companyName} MATCHED - accepts dispose`);
          return true;
        }
      }
      
      
      console.log(" [CATEGORY] Strategy: FALLBACK - accepting any collector with categories");
      console.log(` [CATEGORY] ${collector.companyName} has categories, so accepting as fallback`);
      console.log(` [CATEGORY] ${collector.companyName} MATCHED - via FALLBACK (has any categories)`);
      return true;
    });
  };

  if (!recommendation) {
    return (
      <div className="dr-page dr-error-page">
        <div className="dr-backWrapper">
          <FaArrowLeft
            className="dr-backIcon"
            onClick={() => navigate(-1)}
          />
        </div>
        <div className="dr-error-message">
          <FaExclamationCircle className="dr-error-icon" />
          <p>No recommendation available</p>
        </div>
      </div>
    );
  }

  
  const allCards = [
    {
      name: "Upcycle",
      img: upcycleImg,
      className: "dr-upcycle",
    },
    {
      name: "Recycle",
      img: recycleImg,
      className: "dr-recycle",
    },
    {
      name: "Dispose",
      img: disposeImg,
      className: "dr-dispose",
    },
  ];

 
  const sortedCards = [
    ...allCards.filter((card) => card.name === recommendation),
    ...allCards.filter((card) => card.name !== recommendation),
  ];



const handlePickup = () => {
  navigate("/PickupRequest", {
    state: {
      fromDecision: true,
      lockCollector: true,
      recommendation,
      assignedCollectorId: matchedCollector?._id || matchedCollector?.collectorId || null,
      assignedCollectorName: matchedCollector?.companyName || null,
      collectorLat: matchedCollector?.location?.lat || null,
      collectorLng: matchedCollector?.location?.lng || null,
    },
  });
};

const handleDropOff = () => {
  navigate("/DropOff", {
    state: {
      fromDecision: true,
      lockCollector: true,
      category: recommendation || "DropOff",
      assignedCollectorId: matchedCollector?._id || matchedCollector?.collectorId || null,
      assignedCollectorName: matchedCollector?.companyName || null,
      collectorLat: matchedCollector?.location?.lat || null,
      collectorLng: matchedCollector?.location?.lng || null,
    },
  });
};

  const handleDemoMode = () => {
    console.log(" [DEMO] Activating demo mode with test location and collector");
    
    
    const demoLat = 23.6100;
    const demoLng = 58.5400;
    
    setUserLat(demoLat);
    setUserLng(demoLng);
    setGeolocationError(null); 
    
    
    const mockCollector = {
      _id: "demo-collector-001",
      collectorId: "C001",
      companyName: "EcoTech Oman Demo",
      location: {
        lat: 23.6150,
        lng: 58.5450,
      },
      acceptedCategories: ["Recycle", "Dispose", "Repair", "Upcycle"],
      isApproved: true,
    };
    
    const distance = parseFloat(
      calculateDistance(demoLat, demoLng, mockCollector.location.lat, mockCollector.location.lng)
    );
    
    setMatchedCollector({
      ...mockCollector,
      distance,
    });
    
    setCollectors([mockCollector]);
    setLoadingCollectors(false);
    console.log(" [DEMO] Demo mode activated with mock collector at", distance, "km");
  };

  return (
    <div className="dr-page">
     
      <div style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "#000",
        color: "#0f0",
        padding: "10px",
        borderRadius: "4px",
        fontSize: "11px",
        fontFamily: "monospace",
        maxWidth: "250px",
        zIndex: 9999,
        maxHeight: "150px",
        overflowY: "auto",
        border: "1px solid #0f0"
      }}>
        <div> Lat: {userLat ? userLat.toFixed(4) : "null"}</div>
        <div> Lng: {userLng ? userLng.toFixed(4) : "null"}</div>
        <div> Collectors: {collectors.length}</div>
        <div> Matched: {matchedCollector?.companyName || "none"}</div>
        <div> Loading: {loadingCollectors ? "yes" : "no"}</div>
        <div> Rec: {recommendation}</div>
        {geolocationError && <div style={{ color: "#f00" }}> {geolocationError}</div>}
      </div>

     
      <div className="dr-backWrapper">
        <FaArrowLeft
          className="dr-backIcon"
          onClick={() => navigate(-1)}
          title="Go back"
        />
      </div>

      <main className="dr-main">
        
        <div className="dr-detected-section">
          <div className="dr-detected-card">
            <h2 className="dr-detected-title">Detection Result</h2>
            <div className="dr-detected-content">
              <p className="dr-detected-item">
                <span className="dr-label">Device:</span>
                <span className="dr-value">
                  <strong>{detectedDevice}</strong> ({confidence}% confidence)
                </span>
              </p>
              <p className="dr-detected-item">
                <span className="dr-label">Condition:</span>
                <span className="dr-value">
                  <strong>{condition}</strong>
                </span>
              </p>
            </div>
          </div>
        </div>

        
        {geolocationError && !userLat && !userLng && (
          <div className="dr-geo-warning">
            <FaExclamationCircle className="dr-warning-icon" />
            <p>{geolocationError}</p>
            <button 
              onClick={handleDemoMode}
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                background: "#0080aa",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold"
              }}
            >
               Use Test Mode
            </button>
          </div>
        )}

        
        {userLat && userLng && !geolocationError && (
          <div style={{
            textAlign: "center",
            marginBottom: "15px",
            padding: "10px",
            background: "#d4edda",
            border: "1px solid #28a745",
            borderRadius: "8px",
            color: "#155724",
            fontSize: "0.9rem",
            fontWeight: "500"
          }}>
             Location detected • Searching for collectors...
          </div>
        )}

        
        {!userLat && !userLng && !geolocationError && (
          <div style={{
            textAlign: "center",
            marginBottom: "20px"
          }}>
            <button 
              onClick={handleDemoMode}
              style={{
                padding: "10px 18px",
                background: "#666",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontWeight: "bold",
                opacity: 0.8,
                transition: "opacity 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.opacity = "1"}
              onMouseLeave={(e) => e.target.style.opacity = "0.8"}
              title="Use mock location and collector for testing"
            >
               Demo Mode (Testing)
            </button>
          </div>
        )}

        
        <div className="dr-options-header">
          <h2 className="dr-options-title">Choose What to Do</h2>
          <p className="dr-options-subtitle">
            We recommend <strong>{recommendation}</strong> for this device
          </p>
        </div>

       
        <div className="dr-cardContainer">
          {sortedCards.map((card, idx) => {
            const isRecommended = card.name === recommendation;
            const collectorDistance = matchedCollector?.distance;
            const collectorName = matchedCollector?.companyName;

            return (
              <div
                key={card.name}
                className={`dr-card ${card.className} ${
                  isRecommended ? "dr-highlighted dr-recommended" : ""
                }`}
              >
               
                {!isRecommended && (
                  <div className="dr-numberBadge">
                    {isRecommended ? 1 : sortedCards.indexOf(card) + 1}
                  </div>
                )}

                
                {isRecommended && (
                  <div className="dr-recommendedBadge">
                     RECOMMENDED
                  </div>
                )}

                
                <div className="dr-cardImageWrapper">
                  <img
                    src={card.img}
                    alt={card.name}
                    className="dr-cardImage"
                  />
                </div>

               
                <h3 className="dr-cardTitle">{card.name}</h3>

                
                {isRecommended && matchedCollector && (
                  <div className="dr-collectorSection">
                    <div className="dr-collectorHeader">
                      <FaMapMarkerAlt className="dr-locationIcon" />
                      <span>Recommended Collector</span>
                    </div>
                    <p className="dr-collectorName">{collectorName}</p>
                    <div className="dr-ratingSection">
                      <FaStar className="dr-starIcon" />
                      <span className="dr-rating">5.0</span>
                    </div>
                    <p className="dr-collectorDistance">
                      {collectorDistance} km away
                    </p>
                  </div>
                )}

                
                {isRecommended && !matchedCollector && !loadingCollectors && (
                  <div className="dr-noCollectorMessage">
                    <p>No nearby collector available</p>
                    <p className="dr-fallbackText">
                      Proceed with your request
                    </p>
                  </div>
                )}

                
                {isRecommended && loadingCollectors && (
                  <div className="dr-loadingMessage">
                    <p>Finding nearest collector...</p>
                  </div>
                )}

                
                {!isRecommended && (
                  <p className="dr-cardDescription">
                    {card.name === "Upcycle"
                      ? "Restore or refurbish your device"
                      : card.name === "Recycle"
                      ? "Recycle your device responsibly"
                      : "Dispose of your device safely"}
                  </p>
                )}

               
                <div className="dr-cardButtons">
                  <button
                    className="dr-cardButton dr-pickupBtn"
                    onClick={handlePickup}
                    disabled={loadingCollectors}
                  >
                    Pick Up
                  </button>
                  <button
                    className="dr-cardButton dr-dropoffBtn"
                    onClick={handleDropOff}
                    disabled={loadingCollectors}
                  >
                    Drop Off
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default DecisionResult;