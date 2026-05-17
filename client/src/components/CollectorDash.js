import { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { FcViewDetails, FcBusinessContact } from "react-icons/fc";
import { PiBellRingingDuotone } from "react-icons/pi";
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { months, pieColors } from './DummyData';

const cardWidth = 600;
const cardHeight = 400;

const CollectorDash = () => {
  const navigate = useNavigate();
  const loggedUser = useSelector((state) => state.users.user);
  const [openId, setOpenId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [historyCounts, setHistoryCounts] = useState({
    recycled: 0,
    upcycled: 0,
    todayPickups: 0,
  });
  const [monthCounts, setMonthCounts] = useState(Array(months.length).fill(0));
  const [monthData, setMonthData] = useState(months.map(() => ({ accepted: 0, rejected: 0, completed: 0 })));
  const [categoryCounts, setCategoryCounts] = useState([]);

  // ✅ NEW STATES (same as NewRecycleRequest)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetRequest, setCancelTargetRequest] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchRequests = async () => {
    try {
      const collector = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
      if (!collector?._id) return;

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const [pickupRes, dropOffRes] = await Promise.all([
        fetch(`http://localhost:5000/api/pickups/all/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/dropoffs/all/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [pickupData, dropOffData] = await Promise.all([pickupRes.json(), dropOffRes.json()]);
      
      const allRequests = [...(Array.isArray(pickupData) ? pickupData : []), ...(Array.isArray(dropOffData) ? dropOffData : [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(allRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const countHistory = (pickupHistory, dropOffHistory) => {
    const historyRequests = [...(Array.isArray(pickupHistory) ? pickupHistory : []), ...(Array.isArray(dropOffHistory) ? dropOffHistory : [])];
    const recycled = historyRequests.filter(r => String(r.category || "").toLowerCase() === "recycle").length;
    const upcycled = historyRequests.filter(r => String(r.category || "").toLowerCase() === "upcycle").length;

    const today = new Date();
    const currentYear = today.getFullYear();
    const isToday = (dateString) => {
      const date = new Date(dateString);
      return date.getFullYear() === currentYear && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    };

    const todayPickups = (Array.isArray(pickupHistory) ? pickupHistory : []).filter((request) => {
      return request.status === "Accepted" && isToday(request.createdAt);
    }).length;

    const counts = Array(months.length).fill(0);
    const statusCounts = months.map(() => ({ accepted: 0, rejected: 0, completed: 0 }));
    const categoryMap = {};

    historyRequests.forEach((request) => {
      const date = new Date(request.createdAt);
      if (!isNaN(date) && date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth();
        counts[monthIndex] += 1;

        const status = String(request.status || "").toLowerCase().trim();
        if (status === "accepted") {
          statusCounts[monthIndex].accepted += 1;
        } else if (status === "rejected") {
          statusCounts[monthIndex].rejected += 1;
        } else if (status === "completed") {
          statusCounts[monthIndex].completed += 1;
        }
      }

      const category = String(request.deviceCategory || request.category || "Other").trim() || "Other";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryMap)
      .map(([label, value], index) => ({ id: index, label, value }))
      .sort((a, b) => b.value - a.value);

    setHistoryCounts({ recycled, upcycled, todayPickups });
    setMonthCounts(counts);
    setMonthData(statusCounts);
    setCategoryCounts(categoryData);
  };

  const fetchHistory = async () => {
    try {
      const collector = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
      if (!collector?._id) return;

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const [pickupRes, dropOffRes] = await Promise.all([
        fetch(`http://localhost:5000/api/pickups/history/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:5000/api/dropoffs/history/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [pickupHistory, dropOffHistory] = await Promise.all([pickupRes.json(), dropOffRes.json()]);
      countHistory(pickupHistory, dropOffHistory);
    } catch (error) {
      console.error("Error fetching collector history:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchHistory();
    const interval = setInterval(() => {
      fetchRequests();
      fetchHistory();
    }, 15000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = categoryCounts.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="collector-dash-page">
      <div className="collector-dash-body" style={{ padding: '40px', minHeight: '100vh', background: '#f5f7fa' }}>
        <h2 style={{ marginBottom: '5px' }}>Collector Dashboard</h2>
        <p style={{ color: '#555' }}>
          Welcome, {loggedUser?.companyName || "Collector"}!
        </p>

        <Box sx={{ borderRadius: 3, p: 3, mt: 6, display: 'flex', gap: 3, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'white',
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <h5 style={{ marginBottom: '25px' }}>Distribution of Collected Electronic Waste by Device Category</h5>
            <PieChart
              colors={pieColors}
              series={[{ 
                data: categoryCounts, 
                highlightScope: { fade: 'global', highlight: 'item' }, 
                faded: { innerRadius: 30, additionalRadius: -30, color: '#E3F2FD' }, 
                valueFormatter: (params) => `${params.value} (${((params.value / total) * 100).toFixed(1)}%)`
              }]}
              height={220}
              width={220}
              legend={{ show: false }}
            />
          </div>

          <div style={{
            background: 'white',
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <h5 style={{ marginBottom: '10px' }}>Monthly Performance of Electronics Processing Status</h5>
            <BarChart
              xAxis={[{ scaleType: 'band', data: months, label: 'Months' }]}
              series={[
                { data: monthData.map(m => m.accepted), label: 'Accepted', color: '#4CAF50', stack: 'total' },
                { data: monthData.map(m => m.rejected), label: 'Rejected', color: '#F44336', stack: 'total' },
                { data: monthData.map(m => m.completed), label: 'Completed', color: '#2196F3', stack: 'total' }
              ]}
              height={220}
              width={460}
            />
          </div>
        </Box>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px', flexWrap: 'wrap' }}>
          {[
            { number: historyCounts.recycled, label: 'Electronics Recycled' },
            { number: historyCounts.upcycled, label: 'Electronics Upcycled' },
            { number: historyCounts.todayPickups, label: 'Upcoming Pickups Today' }
          ].map((widget, index) => (
            <div key={index} style={{
              width: '140px',
              padding: '15px',
              backgroundColor: 'rgba(195, 210, 229, 0.7)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.2s',
              cursor: 'default',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <div style={{ fontSize: '25px', fontWeight: 'bold', color: '#006D90', marginBottom: '8px' }}>
                {widget.number}
              </div>
              <div style={{ fontSize: '14px', color: '#006D90' }}>{widget.label}</div>
            </div>
          ))}
        </div>

        <Box sx={{ background: 'white', borderRadius: 3, p: 3, mt: 6, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              <PiBellRingingDuotone /> New Requests
            </Typography>
            <Button
              variant="text"
              sx={{ textTransform: 'none', fontWeight: 500, color: '#1976D2' }}
              onClick={() => navigate('/CollectorNewRecycleRequest')}
            >
              View all
            </Button>
          </Box>

          <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 1 }}>
            {requests.length > 0 ? requests.map((r) => (
              <Card key={r._id} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <img
                    src={`http://localhost:5000/uploads/${r.image}`}
                    alt="device"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px"
                    }}
                  />

                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{r.device}</Typography>

                    {openId === r._id ? (
                      <>
                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                          <Box>
                            <Typography fontWeight={600}><FcViewDetails /> Request Details</Typography>
                            <Typography fontSize={14}>Request Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                            <Typography fontSize={14}>Condition: {r.condition}</Typography>
                            <Typography fontSize={14}>Collection Method: {r.requestType}</Typography>
                            <Typography fontSize={14}>Address: {r.address}</Typography>
                            <Typography fontSize={14}>Electronics Category: {r.deviceCategory}</Typography>
                            <Typography fontSize={14}>Scheduled Date & Time: {r.dateTime ? new Date(r.dateTime).toLocaleString() : "Not scheduled"}</Typography>
                          </Box>

                          <Box>
                            <Typography fontWeight={600}><FcBusinessContact /> User Details</Typography>
                            <Typography fontSize={14}>Name: {r.name}</Typography>
                            <Typography fontSize={14}>Phone: {r.phone}</Typography>
                            <Typography fontSize={14}>Email: {r.email}</Typography>
                          </Box>
                        </Box>

                        <Typography
                          sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }}
                          onClick={() => setOpenId(null)}
                        >
                          Less information
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography fontSize={14}>Request Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                        <Typography fontSize={14}>Condition: {r.condition}</Typography>
                        <Typography fontSize={14}>Category: {r.deviceCategory}</Typography>
                        <Typography fontSize={14}>Scheduled: {r.dateTime ? new Date(r.dateTime).toLocaleString() : "Not scheduled"}</Typography>

                        <Typography
                          sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }}
                          onClick={() => setOpenId(r._id)}
                        >
                          More information
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-end' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={async () => {
                        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                        if (!token) {
                          setSnackbar({
                            open: true,
                            message: "Authentication required.",
                            severity: 'error'
                          });
                          return;
                        }

                        const endpoint = r.requestType === "DropOff" ? 
                          `http://localhost:5000/api/dropoffs/accept/${r._id}` : 
                          `http://localhost:5000/api/pickups/accept/${r._id}`;

                        await fetch(endpoint, {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${token}` }
                        });

                        setRequests(prev => prev.filter(req => req._id !== r._id));
                        await fetchHistory();

                        setSnackbar({
                          open: true,
                          message: `Request "${r.device}" accepted successfully!`,
                          severity: 'success'
                        });
                      }}
                    >
                      Accept
                    </Button>

                    {/* ✅ UPDATED REJECT BUTTON */}
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => {
                        setCancelTargetRequest(r);
                        setCancelConfirmOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                  </Box>

                </CardContent>
              </Card>
            )) : <Typography sx={{ textAlign: 'center', mt: 3 }}>No requests found</Typography>}
          </Box>
        </Box>

        {/* ✅ NEW DIALOG (same as NewRecycleRequest) */}
        <Dialog
          open={cancelConfirmOpen}
          onClose={() => setCancelConfirmOpen(false)}
        >
          <DialogTitle>Reject Request</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to reject this request?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCancelConfirmOpen(false)}>No</Button>
            <Button
              onClick={async () => {
                const request = cancelTargetRequest;
                setCancelConfirmOpen(false);
                setCancelTargetRequest(null);

                if (!request) return;

                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) {
                  setSnackbar({
                    open: true,
                    message: "Authentication required.",
                    severity: 'error'
                  });
                  return;
                }

                const endpoint = request.requestType === "DropOff" ? 
                  `http://localhost:5000/api/dropoffs/reject/${request._id}` : 
                  `http://localhost:5000/api/pickups/reject/${request._id}`;

                try {
                  const res = await fetch(endpoint, {
                    method: "PUT",
                    headers: { 
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ reason: "Rejected by collector" })
                  });

                  if (!res.ok) {
                    const err = await res.json();
                    setSnackbar({
                      open: true,
                      message: err.message || "Failed to reject request.",
                      severity: 'error'
                    });
                    return;
                  }

                  setRequests(prev => prev.filter(req => req._id !== request._id));
                  await fetchHistory();

                  setSnackbar({
                    open: true,
                    message: `Request rejected successfully!`,
                    severity: 'success'
                  });
                } catch (error) {
                  console.error("Reject error:", error);
                  setSnackbar({
                    open: true,
                    message: "Error rejecting request.",
                    severity: 'error'
                  });
                }
              }}
              variant="contained"
              color="error"
            >
              Yes, reject
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

      </div>
    </div>
  );
};

export default CollectorDash;