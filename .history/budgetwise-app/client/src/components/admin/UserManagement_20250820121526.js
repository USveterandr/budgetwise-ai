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
    { id: 3, firstName: 'Robert', lastName: 'Johnson', email: 'robert.j@example.com', role: 'user', status: 'inactive', joinDate: '2023-03-10', lastLogin: '2023-05-15' },
    { id: 4, firstName: 'Emily', lastName: 'Williams', email: 'emily.w@example.com', role: 'admin', status: 'active', joinDate: '2023-01-05', lastLogin: '2023-06-20' },
    { id: 5, firstName: 'Michael', lastName: 'Brown', email: 'michael.b@example.com', role: 'user', status: 'suspended', joinDate: '2023-04-12', lastLogin: '2023-06-01' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleSuspendUser = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'suspended' ? 'active' : 'suspended' }
        : user
    ));
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary">Add New User</button>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.firstName} {user.lastName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>{user.lastLogin}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </button>
                    <button 
                      className={`btn-${user.status === 'suspended' ? 'activate' : 'suspend'}`}
                      onClick={() => handleSuspendUser(user.id)}
                    >
                      {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <EditUserModal 
          user={selectedUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

const EditUserModal = ({ user, onSave, onClose }) => {
  const [editedUser, setEditedUser] = useState({ ...user });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedUser);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Edit User</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={editedUser.firstName}
              onChange={handleChange}
            />
