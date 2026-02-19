import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { parseJsonResponse } from './api';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by trying to fetch balance
    // This is a simple check - in production you might want a dedicated endpoint
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/balance', {
          credentials: 'include'
        });

        // Use safe parser
        const data = await parseJsonResponse(response);

        if (response.ok && data.success) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage setIsAuthenticated={setIsAuthenticated} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <DashboardPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
