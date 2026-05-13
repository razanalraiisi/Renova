import React from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
} from "react-icons/fa";

import recycleImg from "../assets/recycle.png";
import upcycleImg from "../assets/Upcycle.png";
import disposeImg from "../assets/Dispose.png";

import "./Components.css";

const DecisionResult = () => {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const {
    recommendation,
    condition,
    detectedDevice,
    confidence,
  } = location.state || {};

  if (!recommendation) {

    return (
      <p>
        No recommendation available
      </p>
    );
  }

  const cards = [

    {
      name: "Upcycle",
      img: upcycleImg,
      className:
        "dr-upcycle",
    },

    {
      name: "Recycle",
      img: recycleImg,
      className:
        "dr-recycle",
    },

    {
      name: "Dispose",
      img: disposeImg,
      className:
        "dr-dispose",
    },
  ];

  return (
    <div className="dr-page">

      {/* BACK */}
      <div className="dr-backWrapper">

        <FaArrowLeft
          className="dr-backIcon"
          onClick={() =>
            navigate(-1)
          }
        />

      </div>

      <main className="dr-main">

        {/* RESULT */}
        <div className="dr-detected">

          <p>
            The electronic is{" "}
            <strong>
              {confidence}%
            </strong>{" "}
            a{" "}
            <strong>
              {detectedDevice}
            </strong>
          </p>

          <p>
            Condition:{" "}
            <strong>
              {condition}
            </strong>
          </p>

        </div>

        {/* CARDS */}
        <div className="dr-cardContainer">

          {cards.map(
            (card, idx) => (

            <div
              key={card.name}
              className={`dr-card ${
                card.className
              } ${
                card.name ===
                recommendation
                  ? "dr-highlighted"
                  : ""
              }`}
            >

              <div className="dr-numberBadge">
                {idx + 1}
              </div>

              <img
                src={card.img}
                alt={card.name}
                className="dr-cardImage"
              />

              <h3>
                {card.name}
              </h3>

              {card.name ===
                recommendation && (

                <p className="dr-recommendedText">
                  Recommended
                </p>
              )}

              {card.name ===
                "Upcycle" &&
                card.name ===
                  recommendation && (

                <p className="dr-collectorInfo">
                  Matched Collector:
                  Muscat Tech Repairs ★★★★☆
                  (300) • Est. 1h
                </p>
              )}

              {card.name ===
                "Recycle" &&
                card.name ===
                  recommendation && (

                <p className="dr-collectorInfo">
                  Certified centers can recycle your device
                </p>
              )}

              {card.name ===
                "Dispose" &&
                card.name ===
                  recommendation && (

                <p className="dr-collectorInfo">
                  Use if device cannot be reused or safely recycled
                </p>
              )}

              <div className="dr-cardButtons">

                <button
                  className="dr-cardButton"
                  onClick={() =>
                    navigate(
                      "/PickupRequest"
                    )
                  }
                >
                  PickUp
                </button>

                <button
                  className="dr-cardButton"
                  onClick={() =>
                    navigate(
                      "/DropOff",
                      {
                        state: {
                          category:
                            recommendation ||
                            "DropOff",
                        },
                      }
                    )
                  }
                >
                  Drop Off
                </button>

              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DecisionResult;