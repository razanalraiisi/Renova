import React, {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
} from "react-icons/fa";

import {
  getAIRecommendation,
} from "./aiService.js";

import "./Components.css";

const DecideForMe = () => {

  const navigate =
    useNavigate();

  const [condition,
    setCondition] =
    useState("");

  const [image,
    setImage] =
    useState(null);

  const [preview,
    setPreview] =
    useState(null);

  const [userName,
    setUserName] =
    useState("");

  const [fileError,
    setFileError] =
    useState("");

  const [conditionError,
    setConditionError] =
    useState(false);

  const [imageError,
    setImageError] =
    useState(false);

  const [loading,
    setLoading] =
    useState(false);

 
  useEffect(() => {

    const storedUser =
      JSON.parse(
        localStorage.getItem("user")
      ) ||

      JSON.parse(
        sessionStorage.getItem("user")
      );

    if (storedUser) {
      setUserName(
        storedUser.uname || ""
      );
    }

  }, []);

  
  const handleImageUpload =
    (e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        setFileError(
          "Only image files are allowed!"
        );

        setImage(null);

        setPreview(null);

        setImageError(true);

        e.target.value = "";

        return;
      }

      setFileError("");

      setImage(file);

      setPreview(
        URL.createObjectURL(file)
      );

      setImageError(false);
    };

  
  const handleDecision =
    async () => {

      let hasError = false;

      if (!condition) {

        setConditionError(true);

        hasError = true;

      } else {

        setConditionError(false);
      }

      if (!image) {

        setImageError(true);

        hasError = true;

      } else {

        setImageError(false);
      }

      if (hasError) return;

      try {

        setLoading(true);

        const aiResult =
          await getAIRecommendation(
            image,
            condition
          );

        navigate(
          "/decision-result",
          {
            state: {

              recommendation:
                aiResult.recommendation,

              detectedDevice:
                aiResult.detectedDevice,

              confidence:
                aiResult.confidence,

              imagePreview:
                preview,

              condition:
                condition,
            },
          }
        );

      } catch (error) {

        console.error(error);

        alert(
          "AI failed to analyze image."
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="dfm-page">

      {/* BACK */}
      <div className="dfm-backWrapper">

        <FaArrowLeft
          className="dfm-backIcon"
          onClick={() =>
            navigate("/start")
          }
        />

      </div>

      
      <h2 className="dfm-pageTitle">
        Let AI Decide For You
      </h2>

      
      <main className="dfm-main">

        <div className="dfm-card">

          <h2 className="dfm-title">
            Decide for Me!
          </h2>

          <label>
            Device Condition
          </label>

          <select
            className={`dfm-select ${
              conditionError
                ? "dfm-selectError"
                : ""
            }`}
            value={condition}
            onChange={(e) =>
              setCondition(
                e.target.value
              )
            }
          >

            <option value="">
              Please Select...
            </option>

            <option value="working">
              Working / Reusable
            </option>

            <option value="damaged">
              Damaged / Not Working
            </option>

            <option value="dangerous">
              Burned / Hazardous
            </option>

          </select>

          {conditionError && (
            <p className="dfm-error">
              Please select a device condition
            </p>
          )}

          <label>
            Upload photo of device here...
          </label>

          <div
            className={`dfm-uploadBox ${
              imageError
                ? "dfm-uploadBoxError"
                : ""
            }`}
          >

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageUpload
              }
            />

            <p>
              Drag and drop files here to upload
            </p>

          </div>

          {(imageError || fileError) && (
            <p className="dfm-error">
              {fileError ||
                "Please upload an image of your device"}
            </p>
          )}

          {preview && (

            <img
              src={preview}
              alt="Preview"
              className="dfm-preview"
            />

          )}

          <button
            className="dfm-button"
            onClick={handleDecision}
            disabled={loading}
          >

            {loading
              ? "Analyzing..."
              : "Upload"}

          </button>

        </div>

      </main>
    </div>
  );
};

export default DecideForMe;