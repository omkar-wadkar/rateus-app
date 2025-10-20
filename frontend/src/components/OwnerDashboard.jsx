import React, { useState, useEffect } from 'react';
import UpdatePassword from './UpdatePassword.jsx';

function OwnerDashboard({ user }) {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState('0.0');
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [activeTab, setActiveTab] = useState('ratings');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/owner/ratings', {
        headers: { Authorization: user.sessionId }
      });
      const data = await response.json();
      setRatings(data.ratings);
      setAverageRating(data.average_rating);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    }
  };

  const getUniqueUsers = () => {
    const uniqueUsers = {};
    ratings.forEach(rating => {
      if (!uniqueUsers[rating.user_email]) {
        uniqueUsers[rating.user_email] = {
          user_name: rating.user_name,
          user_email: rating.user_email,
          total_ratings: 0,
          average_rating: 0,
          stores_rated: []
        };
      }
      uniqueUsers[rating.user_email].total_ratings++;
      uniqueUsers[rating.user_email].stores_rated.push({
        store_name: rating.store_name,
        rating: rating.rating,
        created_at: rating.created_at
      });
    });

    Object.values(uniqueUsers).forEach(user => {
      const total = user.stores_rated.reduce((sum, store) => sum + store.rating, 0);
      user.average_rating = (total / user.stores_rated.length).toFixed(1);
    });

    return Object.values(uniqueUsers);
  };

  const uniqueUsers = getUniqueUsers();

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
        <h2>Store Owner Dashboard</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => setShowUpdatePassword(true)}
        >
          Update Password
        </button>
      </div>
      
      <div className="card bg-primary text-white mb-4">
        <div className="card-body text-center">
          <h3 className="card-title">Store Average Rating</h3>
          <h1 className="display-1">{averageRating} ⭐</h1>
          <p className="mb-0">Based on {ratings.length} total ratings</p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className="nav-link"
          >
            All Ratings ({ratings.length})
          </button>
        </li>
       
      </ul>



      {activeTab === 'ratings' && (
        <div>
          <h3 className="mb-3">Customer Ratings</h3>
          
          {ratings.length === 0 ? (
            <div className="alert alert-info">
              No ratings yet for your stores.
            </div>
          ) : (
            <div className="row">
              {ratings.map((rating, index) => (
                <div key={index} className="col-md-6 col-lg-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{rating.user_name}</h5>
                        <span className="badge bg-warning text-dark fs-6">
                          {rating.rating} ⭐
                        </span>
                      </div>
                      <h6 className="card-subtitle mb-2 text-muted">{rating.user_email}</h6>
                      <p className="card-text">
                        <strong>Store:</strong> {rating.store_name}
                      </p>
                      <small className="text-muted">
                        Rated on: {new Date(rating.created_at).toLocaleDateString()} at{' '}
                        {new Date(rating.created_at).toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      
      
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Total Ratings</h5>
              <h2 className="text-primary">{ratings.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Unique Users</h5>
              <h2 className="text-success">{uniqueUsers.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center">
            <div className="card-body">
              <h5 className="card-title">Average Rating</h5>
              <h2 className="text-warning">{averageRating} ⭐</h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;