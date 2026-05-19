import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcViewDetails, FcBusinessContact } from "react-icons/fc";
import { MdSimCardDownload, MdCategory } from "react-icons/md";
import { FaFlag } from "react-icons/fa";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';

import { Input } from "reactstrap";
import './Components.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
import logo from '../assets/logo.png';

const RequestHistory = () => {
  const navigate = useNavigate();

  const [openId, setOpenId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [collector, setCollector] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // --- Report User States ---
  const [reportOpen, setReportOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [reportData, setReportData] = useState({
    requestId: "",
    userId: "",
    reason: "",
  });

  const open = Boolean(anchorEl);

  const categoryOptions = [
     "All",
  "Small Electronics",
  "Large Electronics",
  "Home Appliances (Small)",
  "Home Appliances (Large)",
  "IT & Office Equipment",
  "Kitchen & Cooking Appliances",
  "Entertainment Devices",
  "Personal Care Electronics",
  "Tools & Outdoor Equipment",
  "Lighting Equipment",
  "Medical & Fitness Devices",
  "Batteries & Accessories",
  "Other",
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (category) => {
    if (category) {
      setActiveCategory(category);
    }

    setAnchorEl(null);
  };

  const fetchRequests = async () => {
    try {
      const collectorData =
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(sessionStorage.getItem("user"));

      if (!collectorData || !collectorData._id) return;

      setCollector(collectorData);

      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      // Fetch pickup history
      const pickupRes = await fetch(
        `http://localhost:5000/api/pickups/history/${collectorData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const pickupData = await pickupRes.json();

     
      const dropOffRes = await fetch(
        `http://localhost:5000/api/dropoffs/history/${collectorData._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dropOffData = await dropOffRes.json();

      
      const allRequests = [
        ...(Array.isArray(pickupData) ? pickupData : []),
        ...(Array.isArray(dropOffData) ? dropOffData : [])
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRequests(allRequests);

    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("http://localhost:5000/api/reports/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchUsers();
  }, []);

  // --- Report User Dialog UI ---
  

  const filteredRequests = requests.filter((r) => {

    const matchesSearch =
      (r.device || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.status || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.requestType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      (r.deviceCategory || "").toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });
 const getScheduledDate = (r) => {
  return r.scheduledDate || r.dateTime || null;
};
  const updateStatus = async (id, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setMessage({
          text: "Login required to update status.",
          type: "error"
        });
        return;
      }

     
      const request = requests.find(r => r._id === id);

      if (!request) {
        setMessage({
          text: "Request not found.",
          type: "error"
        });
        return;
      }

      const endpoint = request.requestType === "DropOff"
        ? `http://localhost:5000/api/dropoffs/${newStatus}/${id}`
        : `http://localhost:5000/api/pickups/${newStatus}/${id}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();

        setMessage({
          text: err.message || "Failed to update status.",
          type: "error"
        });

        return;
      }

      const updated = await res.json();

      setRequests((prev) =>
        prev.map((r) => (r._id === updated._id ? updated : r))
      );

      setMessage({
        text: `Status updated to ${updated.status}.`,
        type: "success"
      });

    } catch (error) {
      console.error("Error updating status:", error);

      setMessage({
        text: "Error updating status.",
        type: "error"
      });
    }
  };

  // --- Report User Logic ---
  const handleReportSubmit = async () => {
    if (!reportData.reason.trim()) {
      return setSnackbar({
        open: true,
        message: "Please enter your complaint",
        severity: "warning",
      });
    }

    if (!reportData.userId) {
      return setSnackbar({
        open: true,
        message: "Please select a user",
        severity: "warning",
      });
    }

    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/reports/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
  requestId: reportData.requestId,
  userId: reportData.userId,
  reason: reportData.reason,
}),
        }
      );

      if (res.ok) {
        setSnackbar({
          open: true,
          message: "Report submitted successfully",
          severity: "success",
        });

        setReportOpen(false);

        setReportData({
          requestId: "",
          userId: "",
          reason: "",
        });

      } else {
        const error = await res.json();

        setSnackbar({
          open: true,
          message: error.message || "Failed to submit report",
          severity: "error",
        });
      }

    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: "Server error",
        severity: "error",
      });
    }
  };

  
  

  
  const downloadPDF = async () => {

    if (filteredRequests.length === 0) {
      alert("No requests to download");
      return;
    }

    
    const totalRequests = filteredRequests.length;

    const acceptedRequests =
      filteredRequests.filter(
        r => r.status === "Accepted"
      ).length;

    const completedRequests =
      filteredRequests.filter(
        r => r.status === "Completed"
      ).length;

    const pickupRequests =
      filteredRequests.filter(
        r => r.requestType === "Pickup"
      ).length;

    const dropoffRequests =
      filteredRequests.filter(
        r => r.requestType === "DropOff"
      ).length;

  
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let yPosition = 15;

    
    doc.setFillColor(0, 128, 170);
    doc.rect(0, 0, pageWidth, 35, 'F');

   
    try {
      const img = new Image();

      img.src = logo;

      await new Promise((resolve) => {
        img.onload = () => {
          doc.addImage(img, 'PNG', 12, 5, 12, 12);
          resolve();
        };
      });

    } catch (error) {
      console.log("Logo not found, skipping");
    }

    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);

    doc.text("Collector Request Report", 28, 15);

    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);

    const collectorName =
      collector?.companyName || "Unknown Collector";

    doc.text(`Collector: ${collectorName}`, 28, 22);

    
    doc.setFontSize(9);

    const currentDate = new Date().toLocaleString();

    doc.text(`Generated on: ${currentDate}`, 28, 28);

    
    doc.setTextColor(0, 0, 0);

    yPosition = 42;

    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 128, 170);

    doc.text("Summary Statistics", 12, yPosition);

    yPosition += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    const statsData = [
      [`Total Requests:`, totalRequests.toString()],
      [`Accepted Requests:`, acceptedRequests.toString()],
      [`Completed Requests:`, completedRequests.toString()],
      [`Pickup Requests:`, pickupRequests.toString()],
      [`Drop-off Requests:`, dropoffRequests.toString()],
    ];

    statsData.forEach((stat) => {

      doc.setFont("Helvetica", "bold");
      doc.text(stat[0], 15, yPosition);

      doc.setFont("Helvetica", "normal");
      doc.text(stat[1], 65, yPosition);

      yPosition += 5;
    });

    yPosition += 8;

   
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 128, 170);

    doc.text("Request Type Distribution", 12, yPosition);

    yPosition += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Pickup: ${pickupRequests} (${((pickupRequests / totalRequests) * 100).toFixed(1)}%)`,
      15,
      yPosition
    );

    yPosition += 5;

    doc.text(
      `Drop-off: ${dropoffRequests} (${((dropoffRequests / totalRequests) * 100).toFixed(1)}%)`,
      15,
      yPosition
    );

    yPosition += 10;

    
    try {

      const canvas = document.createElement('canvas');

      canvas.width = 300;
      canvas.height = 200;
      canvas.style.display = 'none';

      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');

      const statusCounts = {
        Accepted: acceptedRequests,
        Completed: completedRequests,
      };

      const statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Accepted', 'Completed'],
          datasets: [
            {
              data: [
                statusCounts.Accepted,
                statusCounts.Completed
              ],
              backgroundColor: ['#4CAF50', '#2196F3'],
              borderColor: ['#388E3C', '#1976D2'],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { size: 10 },
              },
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const total =
                    context.dataset.data.reduce((a, b) => a + b, 0);

                  const percentage =
                    ((context.parsed / total) * 100).toFixed(1);

                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
              }
            },
            datalabels: {
              color: '#fff',
              font: {
                weight: 'bold',
                size: 12
              },
              formatter: (value, ctx) => {
                const total =
                  ctx.dataset.data.reduce((a, b) => a + b, 0);

                const percentage =
                  ((value / total) * 100).toFixed(1);

                return `${percentage}%`;
              }
            }
          },
        },
        plugins: [
          {
            id: 'datalabels',
            afterDatasetsDraw(chart) {

              const { data, ctx } = chart;

              if (!data.datasets) return;

              data.datasets.forEach((dataset, i) => {

                const { data: values } = dataset;

                const total =
                  values.reduce((a, b) => a + b, 0);

                const meta =
                  chart.getDatasetMeta(i);

                if (!meta.data) return;

                meta.data.forEach((datapoint, index) => {

                  const { x, y } =
                    datapoint.tooltipPosition();

                  const value = values[index];

                  const percentage =
                    ((value / total) * 100).toFixed(1);

                  ctx.fillStyle = 'white';
                  ctx.font = 'bold 11px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';

                  ctx.fillText(
                    `${percentage}%`,
                    x,
                    y
                  );
                });
              });
            }
          }
        ]
      });

      
      await new Promise(resolve =>
        setTimeout(resolve, 500)
      );

      
      const chartImage =
        canvas.toDataURL('image/png');

      
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 15;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 128, 170);

      doc.text("Status Distribution", 12, yPosition);

      yPosition += 8;

      doc.addImage(
        chartImage,
        'PNG',
        45,
        yPosition,
        120,
        60
      );

      yPosition += 70;

    
      statusChart.destroy();

      document.body.removeChild(canvas);

    } catch (error) {
      console.error("Error creating chart:", error);
    }

    
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 15;
    }

   
    const tableData = filteredRequests.map(r => [
      r.device,
      r.deviceCategory,
      r.name,
      r.email,
      r.phone,
      r.requestType,
      r.status,
      r.dateTime
        ? new Date(r.dateTime).toLocaleDateString()
        : "Not scheduled",
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    
    autoTable(doc, {
      head: [[
        'Device',
        'Category',
        'Name',
        'Email',
        'Phone',
        'Type',
        'Status',
        'Scheduled',
        'Date'
      ]],
      body: tableData,
      startY: yPosition,
      margin: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
      },
      styles: {
        font: 'Helvetica',
        fontSize: 8,
        cellPadding: 3,
        textColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [0, 128, 170],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [245, 248, 250],
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'left' },
        3: { halign: 'left' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { halign: 'center' },
      },
    });

    
    doc.save('collector_request_report.pdf');
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

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap'
          }}
        >

          {message.text && (
            <Box
              sx={{
                width: '100%',
                p: 1,
                borderRadius: 1,
                backgroundColor:
                  message.type === 'success'
                    ? '#d4edda'
                    : '#f8d7da',
                color:
                  message.type === 'success'
                    ? '#155724'
                    : '#721c24',
                mb: 1,
                fontSize: 13,
              }}
            >
              {message.text}
            </Box>
          )}

          <IconButton onClick={() => navigate('/CollectorDash')}>
            <ArrowBackIcon />
          </IconButton>

          <Typography variant="h6" fontWeight={600}>
            Request History
          </Typography>

          <div
            className="faq-search-wrapper"
            style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >

            <Input
              type="text"
              placeholder="Search Requests"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="faq-search-input"
            />

            <IconButton
              aria-label="category"
              onClick={handleMenuOpen}
              className="category-icon-button"
              size="small"
            >
              <MdCategory size={22} />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => handleMenuClose(null)}
            >
              {categoryOptions.map((cat) => (
                <MenuItem
                  key={cat}
                  selected={activeCategory === cat}
                  onClick={() => handleMenuClose(cat)}
                >
                  {cat}
                </MenuItem>
              ))}
            </Menu>

          </div>

          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setReportOpen(true)}
            startIcon={<FaFlag />}
          >
            Report User
          </Button>

          <Button
            variant="outlined"
            size="small"
            sx={{ ml: 'auto' }}
            onClick={downloadPDF}
          >
            <MdSimCardDownload size={21} />
            Download PDF
          </Button>

        </Box>

        <Box sx={{ maxHeight: 420, overflowY: 'auto', pr: 1 }}>

          {filteredRequests.length > 0 ? (

            filteredRequests.map((r) => {

              const statusClass =
                String(r.status || "")
                  .toLowerCase()
                  .trim();

              return (
                <Card
                  key={r._id}
                  sx={{ mb: 2, borderRadius: 3 }}
                >

                  <CardContent sx={{ display: 'flex', gap: 2 }}>

                    <img
                      src={`http://localhost:5000/uploads/${r.image}`}
                      alt={r.device}
                      width={100}
                    />

                    <Box sx={{ flex: 1 }}>

                      <Typography fontWeight={600}>
                        {r.device}
                      </Typography>

                      {openId === r._id ? (
                        <>
                          <Divider sx={{ my: 1 }} />

                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: 3,
                            }}
                          >

                            <Box>

                              <Typography fontWeight={600}>
                                <FcViewDetails /> Request Details
                              </Typography>

                              <Typography fontSize={14}>
                                Request ID: {r._id}
                              </Typography>

                              <Typography fontSize={14}>
                                Request Date & Time:
                                {new Date(r.createdAt).toLocaleString()}
                              </Typography>

                              <Typography fontSize={14}>
                                Condition: {r.condition}
                              </Typography>

                              <Typography fontSize={14}>
                                Collection Method: {r.requestType}
                              </Typography>

                              <Typography fontSize={14}>
                                Electronics Category: {r.deviceCategory}
                              </Typography>

                              <Typography fontSize={14}>
                               Scheduled Date:{" "}
{getScheduledDate(r)
  ? new Date(getScheduledDate(r)).toLocaleString()
  : "Not scheduled"}
                              </Typography>

                            </Box>

                            <Box>

                              <Typography fontWeight={600}>
                                <FcBusinessContact /> User Details
                              </Typography>

                              <Typography fontSize={14}>
                                Name: {r.name}
                              </Typography>

                              <Typography fontSize={14}>
                                Phone: {r.phone}
                              </Typography>

                              <Typography fontSize={14}>
                                Email: {r.email}
                              </Typography>

                            </Box>

                          </Box>

                          <Typography
                            sx={{
                              mt: 1,
                              color: '#1976D2',
                              cursor: 'pointer',
                              fontSize: 14,
                            }}
                            onClick={() => setOpenId(null)}
                          >
                            Less information
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography fontSize={14}>
                            Request Date:
                            {new Date(r.createdAt).toLocaleString()}
                          </Typography>

                          <Typography fontSize={14}>
                            Condition: {r.condition}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 1,
                              color: '#1976D2',
                              cursor: 'pointer',
                              fontSize: 14,
                            }}
                            onClick={() => setOpenId(r._id)}
                          >
                            More information
                          </Typography>
                        </>
                      )}

                    </Box>

                    <div>

                      <div className={`history-status ${statusClass}`}>
                        <span>{r.status}</span>
                        <span className="status-dot" />
                      </div>

                      {r.status === "Accepted" && (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor: '#1976D2',
                            fontWeight: 600
                          }}
                          onClick={() =>
                            updateStatus(r._id, 'complete')
                          }
                        >
                          Mark Completed
                        </Button>
                      )}

                    </div>

                  </CardContent>

                </Card>
              );
            })

          ) : (

            <Typography
              sx={{
                textAlign: 'center',
                mt: 3,
                color: '#777'
              }}
            >
              No matching requests found.
            </Typography>

          )}

        </Box>

        {/* Report User Dialog */}
        <Dialog
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        >
          <DialogTitle>Report User</DialogTitle>

          <DialogContent sx={{ pt: 2, minWidth: 400 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Please select the user and describe the issue.
            </Typography>

            <TextField
              select
              fullWidth
              label="Select User"
              value={reportData.userId}
              onChange={(e) =>
                setReportData({ ...reportData, userId: e.target.value })
              }
              sx={{ mb: 2 }}
              disabled={loadingUsers}
            >
              {loadingUsers ? (
                <MenuItem disabled>Loading users...</MenuItem>
              ) : users.length === 0 ? (
                <MenuItem disabled>No users available</MenuItem>
              ) : (
                users.map((u) => (
                  <MenuItem key={u._id} value={u._id}>
                    {u.uname || u.email}
                  </MenuItem>
                ))
              )}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Describe the issue"
              value={reportData.reason}
              onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={handleReportSubmit} variant="contained" color="error">
              Submit Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RequestHistory;