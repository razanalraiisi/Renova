import React from "react";
import { useNavigate } from "react-router-dom";
import recycle from "../assets/recycle.png";
import Dispose from "../assets/Dispose.jpg";
import ddc from "../assets/ddc.png";
import Upcycle from "../assets/Upcycle.jpg";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Start = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <style>{`
        .action-page {
          min-height: 70vh;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #ffffff;
        }

        .action-grid {
          display: grid;
          grid-template-columns: repeat(2, 280px);
          gap: 40px;
        }

        .action-card {
          height: 200px;
          border-radius: 18px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .action-card img {
          width: 70px;
          margin-bottom: 15px;
        }

        .action-card h3 {
          font-size: 16px;
          font-weight: bold;
          letter-spacing: 1px;
          color: #0b4f6c;
        }

        .recycle {
          background-color: #c9f0dc;
        }

        .upcycle {
          background-color: #cfe8f3;
        }

        .dispose {
          background-color: #fff1b8;
        }

        .decide {
          background-color: #ffffff;
          border: 2px solid #dcdcdc;
        }

        .action-card:hover {
          transform: translateY(-8px);
          box-shadow: 0px 12px 25px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 700px) {
          .action-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="action-page">
        <div className="action-grid">

          <div
            className="action-card recycle"
            onClick={() => navigate("/recycle")}
          >
            <img src= {recycle}/>
            <h3>RECYCLE</h3>
          </div>

          <div
            className="action-card upcycle"
            onClick={() => navigate("/upcycle")}
          >
            <img src= {Upcycle}  />
            <h3>UPCYCLE</h3>
          </div>

          <div
            className="action-card dispose"
            onClick={() => navigate("/dispose")}
          >
            <img src= {Dispose} />
            <h3>DISPOSE</h3>
          </div>

          <div
            className="action-card decide"
            onClick={() => navigate("/decide")}
          >
            <img src= {ddc} />
            <h3>DECIDE FOR ME</h3>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default Start;
