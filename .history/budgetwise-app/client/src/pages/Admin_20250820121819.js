import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You must be logged in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You do not have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <AdminDashboard />
    </div>
  );
};

export default Admin;