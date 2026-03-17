import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcViewDetails, FcBusinessContact } from "react-icons/fc";
import { PiBellRingingDuotone } from "react-icons/pi";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Card, CardContent, Typography, Button, Divider, IconButton, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AcceptModal from './AcceptModal';
import './Components.css';

const NewRecycleRequest = () => {
  const navigate = useNavigate();

  const [openId, setOpenId] = useState(null);
  const [acceptModal, setAcceptModal] = useState(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [requests, setRequests] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {

    const fetchRequests = async () => {

      try {

        const collector = JSON.parse(localStorage.getItem("user"));

        const res = await fetch(`http://localhost:5000/api/pickups/all/${collector._id}`);

        const data = await res.json();

        console.log("Fetched requests:", data);

        setRequests(data);

      } catch (error) {
        console.error("Error fetching requests:", error);
      }

    };

    fetchRequests();

  }, []);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, mt: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 900, background: 'white', borderRadius: 3, p: 3, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <IconButton onClick={() => navigate('/CollectorDash')}><ArrowBackIcon /></IconButton>
          <Typography variant="h6" fontWeight={600}><PiBellRingingDuotone /> New Requests</Typography>
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
                      <Typography sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }} onClick={() => setOpenId(null)}>
                        Less information
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography fontSize={14}>Request Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                      <Typography fontSize={14}>Condition: {r.condition}</Typography>
                      <Typography sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }} onClick={() => setOpenId(r._id)}>
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
                        headers: {
                          Authorization: `Bearer ${token}`
                        }
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

      {acceptModal && (
        <AcceptModal
          request={acceptModal}
          close={() => setAcceptModal(null)}
          confirm={() => {
            setSnackbar({
              open: true,
              message: `Request "${acceptModal.device}" accepted successfully!`,
              severity: 'success'
            });
            setAcceptModal(null);
          }}
        />
      )}

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

                const updated = await res.json();
                setRequests(prev => prev.map(req => req._id === updated._id ? updated : req));
                setSnackbar({
                  open: true,
                  message: `Request "${updated.device}" rejected successfully!`,
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

    </Box>
  );
};

export default NewRecycleRequest;