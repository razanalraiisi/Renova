import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { FcViewDetails, FcBusinessContact } from "react-icons/fc";
import { PiBellRingingDuotone } from "react-icons/pi";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import './Components.css';
import {
  desktopOS,
  valueFormatter,
  months,
  deviceCounts,
  pieColors,
  widgetData,
  requests,
} from './DummyData';
import AcceptModal from './AcceptModal';
import RejectModal from './RejectModal';
import CollectorNavbar from './CollectorNav';

const CollectorDash = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(1);
  const [acceptModal, setAcceptModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

 
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', 
  });

 

  const top6Indices = deviceCounts
    .map((count, index) => ({ count, index }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((item) => item.index);

  const topMonths = top6Indices.map((i) => months[i]);
  const topCounts = top6Indices.map((i) => deviceCounts[i]);

  const cardWidth = 500;
  const cardHeight = 350;

  return (
    <div><CollectorNavbar/>
    <div style={{ padding: '40px', minHeight: '100vh', background: '#f5f7fa' }}>
      <h2 style={{ marginBottom: '5px' }}>Collector Dashboard</h2>
      <p style={{ color: '#555' }}>Welcome, Collector!</p>
      

      
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
        
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
            xAxis={[{ scaleType: 'band', data: topMonths, label: 'Months' }]}
            series={[{ data: topCounts, label: 'Number of Electronics', color: '#90CAF9' }]}
            height={220}
            width={460}
          />
        </div>
      </div>

     
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
            <PiBellRingingDuotone /> New Recycling Requests
          </Typography>
          <Button
            variant="text"
            sx={{ textTransform: 'none', fontWeight: 500, color: '#1976D2' }}
            onClick={() => navigate('/NewRecycleRequest')}
          >
            View all
          </Button>
        </Box>

        
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
                      <Typography sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }} onClick={() => setOpenId(null)}>
                        Less information
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography fontSize={14}>Request Date: {r.date}</Typography>
                      <Typography fontSize={14}>Request Time: {r.time}</Typography>
                      <Typography fontSize={14}>Condition: {r.condition}</Typography>
                      <Typography sx={{ mt: 1, color: '#1976D2', cursor: 'pointer', fontSize: 14 }} onClick={() => setOpenId(r.id)}>
                        More information
                      </Typography>
                    </>
                  )}
                </Box>

                
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
