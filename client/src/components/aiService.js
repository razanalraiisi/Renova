// Frontend service to call the AI endpoint
export const getAIRecommendation = async (file, category) => {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);

    // Call your backend AI endpoint
    const response = await fetch("http://localhost:5000/predict", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.recommendation; // returns "Recycle", "Upcycle", or "Dispose"
  } catch (error) {
    console.error("AI detection error:", error);
    return "Recycle"; // fallback in case of error
  }
};