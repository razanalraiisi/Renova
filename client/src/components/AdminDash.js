import AdminCollectorRequests from "./AdminCollectorRequests";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

const AdminDash = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Admin Dashboard</h2>
      <p>Welcome, Admin!</p> 

      <button
        onClick={handleLogout}
        style={{
          marginTop: '20px',
          padding: '8px 16px',
          backgroundColor: '#006D90',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}
      >
        <FaSignOutAlt /> Logout
      </button>
<AdminCollectorRequests/>
    </div>
  );
};

export default AdminDash;
