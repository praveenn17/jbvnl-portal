
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ConsumerDashboard from '../components/dashboard/ConsumerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import HomePage from '../components/home/HomePage';
import LoginPage from '../components/home/LoginPage';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'consumer':
        return <ConsumerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'manager':
        return <ManagerDashboard />;
      default:
        return <ConsumerDashboard />;
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        {renderDashboard()}
      </div>
    );
  }

  if (showLogin) {
    return (
      <LoginPage 
        onBack={() => setShowLogin(false)}
        onSuccess={() => setShowLogin(false)}
      />
    );
  }

  return (
    <HomePage onLoginClick={() => setShowLogin(true)} />
  );
};

export default Index;
