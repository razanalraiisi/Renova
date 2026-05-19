import React, { useEffect, useState } from "react";

const AdminRatings = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/admin/report-requests-all");
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading ratings", err);
      }
    };

    fetchData();
  }, []);

  const ratedRequests = requests.filter(r => typeof r.rating === "number");

  return (
    <div style={{ padding: 20 }}>
      <h2>Collector Ratings</h2>

      {ratedRequests.length === 0 ? (
        <p>No ratings yet</p>
      ) : (
        ratedRequests.map((r) => (
          <div key={r._id} style={{ borderBottom: "1px solid #ddd", padding: 10 }}>
            <p><b>Collector:</b> {r.collectorName || "Unknown"}</p>
            <p><b>User Rating:</b> {r.rating} ⭐</p>
            <p><b>Request:</b> {r.device}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminRatings;