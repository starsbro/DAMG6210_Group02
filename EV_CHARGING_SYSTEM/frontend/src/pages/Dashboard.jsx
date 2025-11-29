import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Battery, Zap, Calendar, CreditCard, Car, MapPin 
} from 'lucide-react';

const Dashboard = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, profileRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/${userId}/dashboard`),
        fetch(`http://localhost:5000/api/users/${userId}/profile`)
      ]);
      
      const statsData = await statsRes.json();
      const profileData = await profileRes.json();
      
      setStats(statsData);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {profile?.first_name}! 
        </h1>
        <p className="text-emerald-100">
          {profile?.account_type === 'Premium' ? ' Premium Member' : ' Standard Member'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Car className="w-8 h-8" />}
          title="My Vehicles"
          value={stats?.total_vehicles || 0}
          color="bg-blue-500"
          link="/vehicles"
        />
        
        <StatCard
          icon={<Calendar className="w-8 h-8" />}
          title="Active Reservations"
          value={stats?.confirmed_reservations || 0}
          color="bg-purple-500"
          link="/reservations"
        />
        
        <StatCard
          icon={<Zap className="w-8 h-8" />}
          title="Total Sessions"
          value={stats?.total_sessions || 0}
          color="bg-emerald-500"
          link="/sessions"
        />
        
        <StatCard
          icon={<Battery className="w-8 h-8" />}
          title="Energy Used"
          value={`${(stats?.total_energy_consumed || 0).toFixed(1)} kWh`}
          color="bg-yellow-500"
          link="/sessions"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-emerald-500" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/stations"
            className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all hover:scale-105 border border-slate-600"
          >
            <MapPin className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Find Stations</h3>
            <p className="text-slate-400 text-sm">Discover nearby charging stations</p>
          </Link>
          
          <Link
            to="/stations"
            className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all hover:scale-105 border border-slate-600"
          >
            <Calendar className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Book Charging</h3>
            <p className="text-slate-400 text-sm">Reserve a charge point</p>
          </Link>
          
          <Link
            to="/billing"
            className="p-6 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all hover:scale-105 border border-slate-600"
          >
            <CreditCard className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-lg mb-1">View Bills</h3>
            <p className="text-slate-400 text-sm">Check invoices and payments</p>
          </Link>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Billed</p>
          <p className="text-3xl font-bold text-white">${(stats?.total_billed || 0).toFixed(2)}</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Total Paid</p>
          <p className="text-3xl font-bold text-emerald-400">${(stats?.total_paid || 0).toFixed(2)}</p>
        </div>
        
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
          <p className="text-slate-400 text-sm mb-2">Balance Due</p>
          <p className="text-3xl font-bold text-yellow-400">
            ${((stats?.total_billed || 0) - (stats?.total_paid || 0)).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color, link }) => (
  <Link
    to={link}
    className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-slate-700"
  >
    <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4`}>
      {icon}
    </div>
    <p className="text-slate-400 text-sm mb-1">{title}</p>
    <p className="text-3xl font-bold">{value}</p>
  </Link>
);

export default Dashboard;
