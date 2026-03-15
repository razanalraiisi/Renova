import { useState, useEffect } from 'react';
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
} from '@mui/material';

import { Input } from "reactstrap";
import './Components.css';
import { MdSimCardDownload } from "react-icons/md";

const RequestHistory = () => {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const collector = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
        if (!collector?._id) return;

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/pickups/history/${collector._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) =>
    r.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <IconButton onClick={() => navigate('/CollectorDash')}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={600}>
            Request History
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

          
          <Button variant="outlined" size="small" sx={{ ml: 'auto' }}>
            <MdSimCardDownload
            size={21} />Download
          </Button>
        </Box>

        
        <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 1 }}>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((r) => (
              <Card key={r._id} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
                  
                  <img src={`http://localhost:5000/uploads/${r.image}`} alt={r.device} width={100} />

                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>{r.device}</Typography>

                    {openId === r._id ? (
                      <>
                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                          <Box>
                            <Typography fontWeight={600}>
                              <FcViewDetails /> Request Details
                            </Typography>
                            <Typography fontSize={14}>Request ID: {r._id}</Typography>
                            <Typography fontSize={14}>Request Date: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                            <Typography fontSize={14}>Condition: {r.condition}</Typography>
                            <Typography fontSize={14}>Collection Method: Pickup</Typography>
                          </Box>

                          <Box>
                            <Typography fontWeight={600}>
                              <FcBusinessContact /> User Details
                            </Typography>
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

                  
                  <div className={`history-status ${r.status.toLowerCase()}`}>
                    <span>{r.status}</span>
                    <span className="status-dot" />
                  </div>

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
    </Box>
  );
};

export default RequestHistory;
