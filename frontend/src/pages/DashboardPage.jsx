import { useState } from 'react';
import confetti from 'canvas-confetti';
import { parseJsonResponse } from '../api';
import './DashboardPage.css';

function DashboardPage() {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);

  const triggerConfetti = () => {
    // Create a burst of confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Additional bursts for more effect
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 400);
  };

  const checkBalance = async () => {
    setLoading(true);
    setError('');
    setBalance(null);
    setShowAnimation(false);

    try {
      const response = await fetch('/api/user/balance', {
        credentials: 'include'
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch balance');
      }

      setBalance(data.balance);
      setShowAnimation(true);
      triggerConfetti();
    } catch (err) {
      setError(err.message);
      if (err.message.includes('token') || err.message.includes('401')) {
        setError('Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome to Your Dashboard</h1>
        <p className="dashboard-subtitle">Manage your Kodbank account</p>

        <div className="balance-section">
          <button
            onClick={checkBalance}
            disabled={loading}
            className="check-balance-button"
          >
            {loading ? 'Checking...' : 'Check Balance'}
          </button>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {balance !== null && (
            <div className={`balance-display ${showAnimation ? 'animate' : ''}`}>
              <div className="balance-content">
                <p className="balance-label">Your balance is</p>
                <p className="balance-amount">₹{balance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
