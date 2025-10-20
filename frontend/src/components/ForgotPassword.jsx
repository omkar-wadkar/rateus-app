import React, { useState } from 'react';

function ForgotPassword({ onSuccess, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: Email verification, 2: Set new password
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserId(data.userId);
        setStep(2);
        setMessage('Email verified. Please set your new password.');
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Failed to verify email');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (newPassword.length < 8 || newPassword.length > 16) {
      setMessage('Password must be 8-16 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          newPassword 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password updated successfully!');
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Failed to reset password');
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #00a1ff 0%, #00ff8f 100%)',
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <header className=" text-white shadow text-start" style={{  
        background: 'rgba(0, 0, 0, 0.3)', 
        backdropFilter: 'blur(6px)',
        width: '100vw', 
        margin: 0,
        padding: '0.75rem 1rem'
      }}>
        <h1 className="h3 mb-0" style={{ margin: 0 }}>RateUs</h1>
      </header>

      <main className="d-flex align-items-center justify-content-center" style={{ 
        height: 'calc(100vh - 76px)',
        margin: 0,
        padding: 0
      }}>
        <div className="container-fluid px-4">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <h1 className="text-center mb-4 text-white">
                {step === 1 ? 'Forgot Password' : 'Set New Password'}
              </h1>
              
              <div className="card shadow">
                <div className="card-body p-4">
                  {message && (
                    <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                      {message}
                    </div>
                  )}
                  
                  {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 mb-3"
                      >
                        Verify Email
                      </button>
                    </form>
                  )}
                  
                  {step === 2 && (
                    <form onSubmit={handlePasswordReset}>
                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label">New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          id="newPassword"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength="8"
                          maxLength="16"
                          required
                        />
                        <div className="form-text">
                          8-16 characters with at least one uppercase, one lowercase, and one special character
                        </div>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="btn btn-success w-100 mb-3"
                      >
                        Update Password
                      </button>
                    </form>
                  )}
                  
                  <div className="text-center">
                    <button 
                      className="btn btn-link p-0" 
                      onClick={onBackToLogin}
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;