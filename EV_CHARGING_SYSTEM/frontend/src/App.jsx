import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Stations from './pages/Stations';
import MyVehicles from './pages/MyVehicles';
import Reservations from './pages/Reservations';
import ChargingSessions from './pages/ChargingSessions';
import Billing from './pages/Billing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OperatorDashboard from './pages/OperatorDashboard';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
          <Route path="/operator" element={<OperatorDashboard />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // If logged in, show main app
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-white">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard userId={user.user_id} />} />
            <Route path="/stations" element={<Stations userId={user.user_id} />} />
            <Route path="/vehicles" element={<MyVehicles userId={user.user_id} />} />
            <Route path="/reservations" element={<Reservations userId={user.user_id} />} />
            <Route path="/sessions" element={<ChargingSessions userId={user.user_id} />} />
            <Route path="/billing" element={<Billing userId={user.user_id} />} />
            <Route path="/operator" element={<OperatorDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
