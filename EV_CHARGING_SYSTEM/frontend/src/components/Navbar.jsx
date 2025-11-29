import { Link, useLocation } from 'react-router-dom';
import { Zap, Home, MapPin, Car, Calendar, Battery, CreditCard, LogOut, User } from 'lucide-react';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/stations', label: 'Stations', icon: MapPin },
    { path: '/vehicles', label: 'My Vehicles', icon: Car },
    { path: '/reservations', label: 'Reservations', icon: Calendar },
    { path: '/sessions', label: 'Sessions', icon: Battery },
    { path: '/billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-500 rounded-lg p-2">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EV Charge</span>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user.first_name}</span>
                {user.account_type === 'Premium' && (
                  <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                     Premium
                  </span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
