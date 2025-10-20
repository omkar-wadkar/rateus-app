import React, { useState } from 'react';

function Login({ onSuccess, onRegisterClick, onForgotPassword }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onSuccess(data.user, data.sessionId);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Login failed');
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
              <h1 className="text-center mb-4 display-4 text-white">Sign In</h1>
              
              <div className="card shadow">
                <div className="card-body p-4">
                  {message && (
                    <div className="alert alert-danger">
                      {message}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter your Email"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your Password"
                        value={form.password}
                        onChange={(e) => setForm({...form, password: e.target.value})}
                        required
                      />
                    </div>

                    <div className="mb-4 text-end">
                      <button 
                        type="button" 
                        className="btn btn-link p-0"
                        onClick={onForgotPassword}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-success btn-lg w-100"
                    >
                      Sign In
                    </button>
                  </form>
                  
                  <div className="text-center mt-4 pt-3 border-top">
                    <p className="mb-2 text-muted">Don't have an account?</p>
                    <button 
                      className="btn btn-link p-0" 
                      onClick={onRegisterClick}
                    >
                      Sign Up
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

export default Login;