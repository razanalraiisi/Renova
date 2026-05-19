import AIRecommendation from "../models/AIRecommendationModel.js";

const VALID_RECOMMENDATIONS = ["Dispose", "Recycle", "Upcycle"];

function normalizeRecommendation(value) {
  const s = String(value || "").trim().toLowerCase();
  if (s.includes("dispose")) return "Dispose";
  if (s.includes("recycl")) return "Recycle";
  if (s.includes("upcycl")) return "Upcycle";
  return null;
}

function recommendationsMatch(a, b) {
  return normalizeRecommendation(a) === normalizeRecommendation(b);
}

/** POST /admin/ai-recommendations — log a new AI recommendation session */
export const createAIRecommendation = async (req, res) => {
  try {
    const aiRecommendation = normalizeRecommendation(req.body.aiRecommendation);
    if (!aiRecommendation) {
      return res.status(400).json({ message: "Valid aiRecommendation is required." });
    }

    const confidenceRaw = req.body.confidenceScore ?? req.body.confidence;
    const confidenceScore =
      confidenceRaw != null && confidenceRaw !== ""
        ? Number.parseFloat(confidenceRaw)
        : null;

    const doc = await AIRecommendation.create({
      userId: req.body.userId || null,
      userName: String(req.body.userName || "").trim(),
      userEmail: String(req.body.userEmail || "").trim(),
      itemName: String(req.body.itemName || req.body.detectedDevice || "").trim(),
      itemCategory: String(req.body.itemCategory || req.body.itemName || "").trim(),
      condition: String(req.body.condition || "").trim(),
      aiRecommendation,
      confidenceScore: Number.isFinite(confidenceScore) ? confidenceScore : null,
    });

    res.status(201).json(doc);
  } catch (err) {
    console.error("createAIRecommendation:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/** PATCH /admin/ai-recommendations/:id/finalize — user selected pickup/drop-off path */
export const finalizeAIRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const userFinalChoice = normalizeRecommendation(
      req.body.userFinalChoice || req.body.finalChoice || req.body.category
    );
    const requestMethod =
      String(req.body.requestMethod || "").toLowerCase() === "dropoff"
        ? "dropoff"
        : String(req.body.requestMethod || "").toLowerCase() === "pickup"
          ? "pickup"
          : null;

    const existing = await AIRecommendation.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Recommendation record not found." });
    }

    const followed =
      userFinalChoice != null
        ? recommendationsMatch(existing.aiRecommendation, userFinalChoice)
        : null;

    const updated = await AIRecommendation.findByIdAndUpdate(
      id,
      {
        userFinalChoice: userFinalChoice || existing.aiRecommendation,
        requestMethod,
        wasRecommendationFollowed: followed,
        completedAt: new Date(),
      },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    console.error("finalizeAIRecommendation:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/** GET /admin/ai-recommendations — full history for admin report */
export const getAIRecommendations = async (req, res) => {
  try {
    const rows = await AIRecommendation.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(rows);
  } catch (err) {
    console.error("getAIRecommendations:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/** GET /admin/ai-recommendations/summary — dashboard + report summary stats */
export const getAIRecommendationSummary = async (req, res) => {
  try {
    const rows = await AIRecommendation.find({}).lean();

    const summary = {
      totalUses: rows.length,
      disposeCount: 0,
      recycleCount: 0,
      upcycleCount: 0,
      followedCount: 0,
      ignoredCount: 0,
      pendingChoiceCount: 0,
      uniqueUsers: 0,
      followRatePercent: 0,
      mostSuggestedAction: "—",
    };

    const userKeys = new Set();
    const recCounts = { Dispose: 0, Recycle: 0, Upcycle: 0 };

    for (const r of rows) {
      const rec = normalizeRecommendation(r.aiRecommendation);
      if (rec) recCounts[rec] += 1;

      if (r.userId) userKeys.add(String(r.userId));
      else if (r.userEmail) userKeys.add(`email:${r.userEmail}`);
      else if (r.userName) userKeys.add(`name:${r.userName}`);

      if (r.wasRecommendationFollowed === true) summary.followedCount += 1;
      else if (r.wasRecommendationFollowed === false) summary.ignoredCount += 1;
      else summary.pendingChoiceCount += 1;
    }

    summary.disposeCount = recCounts.Dispose;
    summary.recycleCount = recCounts.Recycle;
    summary.upcycleCount = recCounts.Upcycle;
    summary.uniqueUsers = userKeys.size;

    const top = Object.entries(recCounts).sort((a, b) => b[1] - a[1])[0];
    summary.mostSuggestedAction = top && top[1] > 0 ? top[0] : "—";

    const decided = summary.followedCount + summary.ignoredCount;
    summary.followRatePercent =
      decided > 0 ? Math.round((summary.followedCount / decided) * 100) : 0;

    res.json(summary);
  } catch (err) {
    console.error("getAIRecommendationSummary:", err);
    res.status(500).json({ message: "Server error." });
  }
};
