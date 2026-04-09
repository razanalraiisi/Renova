/**
 * Forward geocoding for collector map pin when browser GPS is unavailable.
 * Uses Nominatim; see https://operations.osmfoundation.org/policies/nominatim/
 */
export const geocodeAddress = async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 3) {
    return res.status(400).json({ message: "Enter a more specific address." });
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "1");

    const r = await fetch(url.toString(), {
      headers: {
        "User-Agent": "ReNova/1.0 (collector registration)",
        Accept: "application/json",
      },
    });

    if (!r.ok) {
      return res.status(502).json({ message: "Map lookup service is temporarily unavailable." });
    }

    const data = await r.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (!first?.lat || !first?.lon) {
      return res.status(404).json({ message: "No match for this address. Try adding city or area." });
    }

    return res.json({
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
    });
  } catch (err) {
    console.error("geocodeAddress:", err);
    return res.status(500).json({ message: "Map lookup failed." });
  }
};
