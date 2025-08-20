import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock user data
  const mockUsers = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', role: 'user', status: 'active', joinDate: '2023-01-15', lastLogin: '2023-06-20' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', role: 'user', status: 'active', joinDate: '2023-02-20', lastLogin: '2023-06-19' },
