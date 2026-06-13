
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import ConsumerDashboard from '../components/dashboard/ConsumerDashboard';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';
import HomePage from '../components/home/HomePage';
import LoginPage from '../components/home/LoginPage';
import Footer from '../components/home/Footer';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showAuth) {
      setShowLogin(true);
    }
  }, [location.state]);

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
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          {renderDashboard()}
        </main>
        <Footer />
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
