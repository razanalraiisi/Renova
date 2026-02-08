import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcViewDetails, FcBusinessContact } from "react-icons/fc";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Modal,
} from '@mui/material';
import { Input } from "reactstrap";
import './Components.css';
import { requestHistoryData } from './DummyData';


const CancelModal = ({ open, close, confirm, request }) => {
  if (!request) return null;
  return (
    <Modal open={open} onClose={close} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box
        sx={{
          width: 400,
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 3,
          boxShadow: 24,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>
          Cancel Request
        </Typography>
        <Typography sx={{ mb: 3, textAlign: 'center' }}>
          Are you sure you want to cancel this request "{request.title}"?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" color="grey" onClick={close}>
            No
          </Button>
          <Button variant="contained" color="error" onClick={confirm}>
            Yes, Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const UserRequestHistory = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState(requestHistoryData);

  const [cancelModal, setCancelModal] = useState(null); 

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const filteredRequests = requests.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const handleCancel = (request) => {
    setCancelModal(request);
  };

 
  const confirmCancel = () => {
    setRequests(prev => prev.filter(r => r.id !== cancelModal.id));
    setSnackbar({
      open: true,
      message: `Request "${cancelModal.title}" cancelled successfully!`,
      severity: 'error',
    });
    setCancelModal(null);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, mt: 6 }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: 900,
          background: 'white',
          borderRadius: 3,
          p: 3,
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/start')}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={600}>
            My Requests
          </Typography>

          <div className="faq-search-wrapper" style={{ margin: 0 }}>
            <Input
              type="text"
              placeholder="Search Requests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faq-search-input"
            />
          </div>
        </Box>

        <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 1 }}>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((r) => (
              <Card key={r.id} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  <img src={r.image} alt={r.title} width={100} />

                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{r.title}</Typography>

                    {openId === r.id ? (
                      <>
                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                          <Box>
                            <Typography fontWeight={600}>
                              <FcViewDetails /> Request Details
                            </Typography>
                            <Typography fontSize={14}>Request ID: {r.id}</Typography>
                            <Typography fontSize={14}>Request Date: {r.requestDate}</Typography>
                            <Typography fontSize={14}>Condition: {r.condition}</Typography>
                            <Typography fontSize={14}>Electronic Category: {r.category}</Typography>
                            <Typography fontSize={14}>Collection Method: {r.method}</Typography>
                          </Box>

                          <Box>
                            <Typography fontWeight={600}>
                              <FcBusinessContact /> Collector Details
                            </Typography>
                            <Typography fontSize={14}>Collector Id: {r.userId}</Typography>
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
                        <Typography fontSize={14}>Request Date: {r.requestDate}</Typography>
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

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <div className={`history-status ${r.status.toLowerCase()}`}>
                      <span>{r.status}</span>
                      <span className="status-dot" />
                    </div>

                    {r.status.toLowerCase() === "pending" && openId === r.id && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleCancel(r)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography sx={{ textAlign: 'center', mt: 3, color: '#777' }}>
              No matching requests found.
            </Typography>
          )}
        </Box>
      </Box>

      
      <CancelModal
        open={!!cancelModal}
        request={cancelModal}
        close={() => setCancelModal(null)}
        confirm={confirmCancel}
      />

     
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

export default UserRequestHistory;
