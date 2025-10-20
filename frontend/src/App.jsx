import React, { useState } from 'react';
import Register from './components/Register.jsx';
import Login from './components/Login.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import OwnerLogin from './components/OwnerLogin.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import OwnerDashboard from './components/OwnerDashboard.jsx';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('register');
  const [user, setUser] = useState(null);

  const handleAuth = (userData, sessionId) => {
    const userWithSession = { ...userData, sessionId };
    setUser(userWithSession);
    
    if (userData.role === 'admin') setCurrentView('admin');
    else if (userData.role === 'owner') setCurrentView('owner');
    else setCurrentView('user');
  };

  const handleLogout = () => {
    if (user && user.sessionId) {
      fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: { Authorization: user.sessionId }
      });
    }
    setUser(null);
    setCurrentView('register');
  };

  return (
    <div className="App">
      {user && (
        <nav className="navbar navbar-dark bg-dark">
          <div className="container">
            <span className="navbar-text">
              Welcome, {user.name} ({user.role})
            </span>
            <button 
              className="btn btn-outline-light btn-sm" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </nav>
      )}

      {currentView === 'register' && !user && (
        <Register 
          onSuccess={handleAuth}
          onLoginClick={() => setCurrentView('login')}
          onAdminLogin={() => setCurrentView('admin-login')}
          onOwnerLogin={() => setCurrentView('owner-login')}
        />
      )}
      
      {currentView === 'login' && !user && (
        <Login 
          onSuccess={handleAuth}
          onRegisterClick={() => setCurrentView('register')}
          onForgotPassword={() => setCurrentView('forgot-password')}
        />
      )}

      {currentView === 'admin-login' && !user && (
        <AdminLogin 
          onSuccess={handleAuth}
          onSwitchView={() => setCurrentView('register')}
        />
      )}

      {currentView === 'owner-login' && !user && (
        <OwnerLogin 
          onSuccess={handleAuth}
          onSwitchView={() => setCurrentView('register')}
        />
      )}

      {currentView === 'forgot-password' && !user && (
        <ForgotPassword 
          onSuccess={handleAuth}
          onBackToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'user' && user && <UserDashboard user={user} />}
      {currentView === 'admin' && user && <AdminDashboard user={user} />}
      {currentView === 'owner' && user && <OwnerDashboard user={user} />}
    </div>
  );
}

export default App;