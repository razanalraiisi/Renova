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

      // Fetch drop-off history
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

      // Combine and sort by createdAt descending
      const allRequests = [...(Array.isArray(pickupData) ? pickupData : []), ...(Array.isArray(dropOffData) ? dropOffData : [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setRequests(allRequests);

    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) =>
    (r.device || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.status || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.requestType || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateStatus = async (id, newStatus) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        setMessage({ text: "Login required to update status.", type: "error" });
        return;
      }

      // Find the request to determine its type
      const request = requests.find(r => r._id === id);
      if (!request) {
        setMessage({ text: "Request not found.", type: "error" });
        return;
      }

      const endpoint = request.requestType === "DropOff" ? 
        `http://localhost:5000/api/dropoffs/${newStatus}/${id}` : 
        `http://localhost:5000/api/pickups/${newStatus}/${id}`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage({ text: err.message || "Failed to update status.", type: "error" });
        return;
      }

      const updated = await res.json();
      setRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setMessage({ text: `Status updated to ${updated.status}.`, type: "success" });
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage({ text: "Error updating status.", type: "error" });
    }
  };



  /* DOWNLOAD FUNCTION (NEW) */
  const downloadCSV = () => {

    if (filteredRequests.length === 0) return;

    const headers = [
      "Request ID",
      "Device",
      "Category",
      "Condition",
      "Status",
      "Request Type",
      "Scheduled Date & Time",
      "Name",
      "Email",
      "Phone",
      "Request Date"
    ];

    const rows = filteredRequests.map(r => [
      r._id,
      r.device,
      r.deviceCategory,
      r.condition,
      r.status,
      r.requestType,
      r.dateTime ? new Date(r.dateTime).toLocaleString() : "Not scheduled",
      r.name,
      r.email,
      r.phone,
      new Date(r.createdAt).toLocaleString()
    ]);

    const collectorName = collector?.companyName || "Unknown Collector";
    let csvContent =
      "data:text/csv;charset=utf-8," +
      `Collector: ${collectorName}\n\n` +
      [headers, ...rows]
        .map(e => e.join(","))
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "collector_request_history.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* DOWNLOAD PDF FUNCTION (NEW) */
  const downloadPDF = async () => {
    if (filteredRequests.length === 0) {
      alert("No requests to download");
      return;
    }

    // Calculate statistics
    const totalRequests = filteredRequests.length;
    const acceptedRequests = filteredRequests.filter(r => r.status === "Accepted").length;
    const completedRequests = filteredRequests.filter(r => r.status === "Completed").length;
    const pickupRequests = filteredRequests.filter(r => r.requestType === "Pickup").length;
    const dropoffRequests = filteredRequests.filter(r => r.requestType === "DropOff").length;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Add header background color
    doc.setFillColor(0, 128, 170);
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Add logo
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

    // Title - white text on colored background
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("Collector Request Report", 28, 15);

    // Collector Name - white text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    const collectorName = collector?.companyName || "Unknown Collector";
    doc.text(`Collector: ${collectorName}`, 28, 22);

    // Date and Time - white text
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    const currentDate = new Date().toLocaleString();
    doc.text(`Generated on: ${currentDate}`, 28, 28);

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPosition = 42;

    // Summary Statistics Section - No background
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

    // Request Type Breakdown Section
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 128, 170);
    doc.text("Request Type Distribution", 12, yPosition);
    yPosition += 7;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Pickup: ${pickupRequests} (${((pickupRequests / totalRequests) * 100).toFixed(1)}%)`, 15, yPosition);
    yPosition += 5;
    doc.text(`Drop-off: ${dropoffRequests} (${((dropoffRequests / totalRequests) * 100).toFixed(1)}%)`, 15, yPosition);
    yPosition += 10;

    // Create Status Distribution Chart - SMALLER SIZE
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
              data: [statusCounts.Accepted, statusCounts.Completed],
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
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                  return `${context.label}: ${context.parsed} (${percentage}%)`;
                }
              }
            },
            datalabels: {
              color: '#fff',
              font: { weight: 'bold', size: 12 },
              formatter: (value, ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${percentage}%`;
              }
            }
          },
        },
        plugins: [
          {
            id: 'datalabels',
            afterDatasetsDraw(chart) {
              const {data, ctx} = chart;
              if (!data.datasets) return;
              
              data.datasets.forEach((dataset, i) => {
                const {data: values} = dataset;
                const total = values.reduce((a, b) => a + b, 0);
                
                const meta = chart.getDatasetMeta(i);
                if (!meta.data) return;
                
                meta.data.forEach((datapoint, index) => {
                  const {x, y} = datapoint.tooltipPosition();
                  const value = values[index];
                  const percentage = ((value / total) * 100).toFixed(1);
                  
                  ctx.fillStyle = 'white';
                  ctx.font = 'bold 11px Arial';
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(`${percentage}%`, x, y);
                });
              });
            }
          }
        ]
      });

      // Wait for chart to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert chart to image
      const chartImage = canvas.toDataURL('image/png');

      // Add chart to PDF
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 15;
      }

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0, 128, 170);
      doc.text("Status Distribution", 12, yPosition);
      yPosition += 8;

      // Smaller chart - reduced from 180x80 to 120x60
      doc.addImage(chartImage, 'PNG', 45, yPosition, 120, 60);
      yPosition += 70;

      // Destroy chart to free memory
      statusChart.destroy();
      
      // Clean up canvas
      document.body.removeChild(canvas);
    } catch (error) {
      console.error("Error creating chart:", error);
    }

    // Add new page for table if needed
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 15;
    }

    // Prepare table data with user details
    const tableData = filteredRequests.map(r => [
      r.device,
      r.deviceCategory,
      r.name,
      r.email,
      r.phone,
      r.requestType,
      r.status,
      r.dateTime ? new Date(r.dateTime).toLocaleDateString() : "Not scheduled",
      new Date(r.createdAt).toLocaleDateString(),
    ]);

    // Add table with improved styling
    autoTable(doc, {
      head: [['Device', 'Category', 'Name', 'Email', 'Phone', 'Type', 'Status', 'Scheduled', 'Date']],
      body: tableData,
      startY: yPosition,
      margin: { top: 10, right: 10, bottom: 10, left: 10 },
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

    // Save PDF
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
                backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
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

          <div className="faq-search-wrapper" style={{ margin: 0 }}>
            <Input
              type="text"
              placeholder="Search Requests"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faq-search-input"
            />
          </div>

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

              const statusClass = String(r.status || "")
                .toLowerCase()
                .trim();

              return (
                <Card key={r._id} sx={{ mb: 2, borderRadius: 3 }}>
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
                                Request Date & Time: {new Date(
                                  r.createdAt
                                ).toLocaleString()}
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
                                Scheduled Date & Time: {r.dateTime ? new Date(r.dateTime).toLocaleString() : "Not scheduled"}
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
                            Request Date: {new Date(
                              r.createdAt
                            ).toLocaleString()}
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
                          sx={{ mt: 1, backgroundColor: '#1976D2', fontWeight: 600 }}
                          onClick={() => updateStatus(r._id, 'complete')}
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
              sx={{ textAlign: 'center', mt: 3, color: '#777' }}
            >
              No matching requests found.
            </Typography>
          )}

        </Box>
      </Box>
    </Box>
  );
};

export default RequestHistory;