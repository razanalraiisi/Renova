const API_BASE = "http://localhost:5000/admin/ai-recommendations";

function getStoredUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("user") || "null") ||
      JSON.parse(sessionStorage.getItem("user") || "null")
    );
  } catch {
    return null;
  }
}

/** Log AI recommendation when user runs Decide For Me */
export async function logAIRecommendation({
  aiRecommendation,
  itemName,
  itemCategory,
  condition,
  confidenceScore,
}) {
  const user = getStoredUser();
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user?._id || user?.id || null,
      userName: user?.uname || user?.name || "",
      userEmail: user?.email || "",
      itemName: itemName || "",
      itemCategory: itemCategory || itemName || "",
      condition: condition || "",
      aiRecommendation,
      confidenceScore,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Failed to log AI recommendation");
  }
  return res.json();
}

/** Update record when user proceeds to pickup or drop-off */
export async function finalizeAIRecommendation(analyticsId, { userFinalChoice, requestMethod }) {
  if (!analyticsId) return null;
  const res = await fetch(`${API_BASE}/${analyticsId}/finalize`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userFinalChoice, requestMethod }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    console.warn("finalizeAIRecommendation:", body.message || res.status);
    return null;
  }
  return res.json();
}

export async function fetchAIRecommendations() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("Failed to load AI recommendation history");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchAIRecommendationSummary() {
  const res = await fetch(`${API_BASE}/summary`);
  if (!res.ok) throw new Error("Failed to load AI recommendation summary");
  return res.json();
}
