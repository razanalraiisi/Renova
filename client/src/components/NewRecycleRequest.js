import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcViewDetails, FcBusinessContact } from "react-icons/fc";
import { PiBellRingingDuotone } from "react-icons/pi";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';

import './Components.css';
import { requests } from './DummyData';

// Import your ready modals
import AcceptModal from './AcceptModal';
import RejectModal from './RejectModal';

const NewRecycleRequest = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(1);
  const [acceptModal, setAcceptModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Snackbar for client-side messages
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error'
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        p: 3,
        mt: 6,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 900, // Limits width of the content
          background: 'white',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate('/CollectorDash')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              <PiBellRingingDuotone /> New Recycling Requests
            </Typography>
          </Box>
          
        </Box>

        {/* Scrollable Requests */}
        <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 1 }}>
          {requests.map((r) => (
            <Card key={r.id} sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent sx={{ display: 'flex', gap: 2 }}>
                <img src={r.image} alt={r.type} width={100} />
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600}>{r.type}</Typography>

                  {openId === r.id ? (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                        <Box>
                          <Typography fontWeight={600}><FcViewDetails /> Request Details</Typography>
                          <Typography fontSize={14}>Request Date: {r.date}</Typography>
                          <Typography fontSize={14}>Request Time: {r.time}</Typography>
                          <Typography fontSize={14}>Condition: {r.condition}</Typography>
                          <Typography fontSize={14}>Collection Method: {r.method}</Typography>
                        </Box>
                        <Box>
                          <Typography fontWeight={600}><FcBusinessContact /> User Details</Typography>
                          <Typography fontSize={14}>Phone: 98765432</Typography>
                          <Typography fontSize={14}>Email: mohammed@gmail.com</Typography>
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
                      <Typography fontSize={14}>Request Date: {r.date}</Typography>
                      <Typography fontSize={14}>Request Time: {r.time}</Typography>
                      <Typography fontSize={14}>Condition: {r.condition}</Typography>
                      <Typography
                        sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }}
                        onClick={() => setOpenId(r.id)}
                      >
                        More information
                      </Typography>
                    </>
                  )}
                </Box>

                {/* Accept / Reject Buttons */}
                <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-end' }}>
                  <Button size="small" variant="contained" color="success" onClick={() => setAcceptModal(r)}>
                    Accept
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => { setRejectModal(r); setRejectReason(''); }}>
                    Reject
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Modals */}
      {acceptModal && (
        <AcceptModal
          request={acceptModal}
          close={() => setAcceptModal(null)}
          confirm={() => {
            setSnackbar({
              open: true,
              message: `Request "${acceptModal.type}" accepted successfully!`,
              severity: 'success',
            });
            setAcceptModal(null);
          }}
        />
      )}

      {rejectModal && (
        <RejectModal
          request={rejectModal}
          reason={rejectReason}
          setReason={setRejectReason}
          close={() => setRejectModal(null)}
          confirm={() => {
            setSnackbar({
              open: true,
              message: `Request "${rejectModal.type}" rejected. Reason: ${rejectReason}`,
              severity: 'error',
            });
            setRejectModal(null);
          }}
        />
      )}

      {/* Snackbar */}
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
