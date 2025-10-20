import React, { useState, useEffect } from 'react';
import UpdatePassword from './UpdatePassword.jsx';

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'stores') fetchStores();
  }, [activeTab]);

  const fetchStats = async () => {
    const response = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: user.sessionId }
    });
    const data = await response.json();
    setStats(data);
  };

  const fetchUsers = async () => {
    const response = await fetch('http://localhost:5000/api/admin/users', {
      headers: { Authorization: user.sessionId }
    });
    const data = await response.json();
    setUsers(data);
  };

  const fetchStores = async () => {
    const response = await fetch('http://localhost:5000/api/admin/stores', {
      headers: { Authorization: user.sessionId }
    });
    const data = await response.json();
    setStores(data);
  };

  if (showUpdatePassword) {
    return (
      <UpdatePassword 
        user={user}
        onSuccess={() => setShowUpdatePassword(false)}
        onCancel={() => setShowUpdatePassword(false)}
      />
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setShowUpdatePassword(true)}
        >
          Update Password
        </button>
      </div>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            Stores
          </button>
        </li>
      </ul>

      {activeTab === 'dashboard' && (
        <div>
          <h3 className="mb-4">Statistics</h3>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Users</h5>
                  <h2 className="text-primary">{stats.totalUsers || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Stores</h5>
                  <h2 className="text-success">{stats.totalStores || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Ratings</h5>
                  <h2 className="text-warning">{stats.totalRatings || 0}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3 className="mb-3">Users</h3>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stores' && (
        <div>
          <h3 className="mb-3">Stores</h3>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {store.average_rating} ⭐
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;