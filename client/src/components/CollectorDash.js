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
import CollectorNav from './CollectorNav';
import { desktopOS, valueFormatter, months, deviceCounts, pieColors, widgetData } from './DummyData';

const cardWidth = 600;
const cardHeight = 400;

const CollectorDash = () => {
  const navigate = useNavigate();
  const loggedUser = useSelector((state) => state.users.user);
  const [openId, setOpenId] = useState(null);
  const [requests, setRequests] = useState([]);

  // ✅ NEW STATES (same as NewRecycleRequest)
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);

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
      const res = await fetch(`http://localhost:5000/api/pickups/all/${collector._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log("Fetched requests:", data);
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="collector-dash-page"><CollectorNav />
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
            <h5 style={{ marginBottom: '25px' }}>Recycled/Upcycled Electronics by Category</h5>
            <PieChart
              colors={pieColors}
              series={[{ data: desktopOS, highlightScope: { fade: 'global', highlight: 'item' }, faded: { innerRadius: 30, additionalRadius: -30, color: '#E3F2FD' }, valueFormatter }]}
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
            <h5 style={{ marginBottom: '10px' }}>Your Highest Recycling/Upcycling Months</h5>
            <BarChart
              xAxis={[{ scaleType: 'band', data: months, label: 'Months' }]}
              series={[{ data: deviceCounts, label: 'Number of Electronics', color: '#90CAF9' }]}
              height={220}
              width={460}
            />
          </div>
        </Box>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', marginTop: '30px', flexWrap: 'wrap' }}>
          {widgetData.map((widget, index) => (
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
                            <Typography fontSize={14}>Collection Method: Pickup</Typography>
                            <Typography fontSize={14}>Address: {r.address}</Typography>
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

                        await fetch(`http://localhost:5000/api/pickups/accept/${r._id}`, {
                          method: "PUT",
                          headers: { Authorization: `Bearer ${token}` }
                        });

                        setRequests(prev => prev.filter(req => req._id !== r._id));

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
                        setCancelTargetId(r._id);
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
                const id = cancelTargetId;
                setCancelConfirmOpen(false);
                setCancelTargetId(null);

                const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                if (!token) {
                  setSnackbar({
                    open: true,
                    message: "Authentication required.",
                    severity: 'error'
                  });
                  return;
                }

                try {
                  const res = await fetch(`http://localhost:5000/api/pickups/cancel/${id}`, {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` }
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

                  setRequests(prev => prev.filter(req => req._id !== id));

                  setSnackbar({
                    open: true,
                    message: `Request rejecting successfully!`,
                    severity: 'success'
                  });
                } catch (error) {
                  console.error("Cancel error:", error);
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