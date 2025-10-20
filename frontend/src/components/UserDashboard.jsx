import React, { useState, useEffect } from 'react';

function UserDashboard({ user }) {
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stores', {
        headers: { Authorization: user.sessionId }
      });
      const data = await response.json();
      setStores(data);
    } catch (error) {
      setMessage('Failed to load stores');
    }
  };

  const rateStore = async (storeId, rating) => {
    try {
      const response = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: user.sessionId
        },
        body: JSON.stringify({ storeId, rating })
      });
      
      if (response.ok) {
        fetchStores();
        setMessage('Rating submitted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to submit rating');
      }
    } catch (error) {
      setMessage('Failed to submit rating');
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">User Dashboard</h2>
          
          {message && (
            <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}
          
          <h3 className="mb-3">Stores</h3>
          
          <div className="row">
            {stores.map(store => (
              <div key={store.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100 card-hover">
                  <div className="card-body">
                    <h5 className="card-title">{store.name}</h5>
                    <p className="card-text">
                      <small className="text-muted">{store.address}</small>
                    </p>
                    <div className="mb-2">
                      <strong>Overall Rating:</strong> {store.average_rating} ⭐
                    </div>
                    <div className="mb-3">
                      <strong>Your Rating:</strong> {store.user_rating ? `${store.user_rating} ⭐` : 'Not rated yet'}
                    </div>
                    
                    <div>
                      <p className="mb-2"><strong>Rate this store:</strong></p>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            className={`btn btn-sm me-1 ${store.user_rating === star ? 'btn-primary active' : 'btn-outline-primary'}`}
                            onClick={() => rateStore(store.id, star)}
                          >
                            {star} ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;