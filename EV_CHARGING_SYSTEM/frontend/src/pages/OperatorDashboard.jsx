import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, MapPin, Zap, AlertTriangle, CheckCircle, 
  XCircle, Power, Wrench, Clock, ChevronDown, ChevronUp, Home
} from 'lucide-react';

const OperatorDashboard = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [chargePoints, setChargePoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStation, setExpandedStation] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/operator/stations');
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChargePoints = async (stationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/operator/stations/${stationId}/charge-points`
      );
      const data = await response.json();
      setChargePoints(data);
    } catch (error) {
      console.error('Error fetching charge points:', error);
    }
  };

  const handleStationClick = async (station) => {
    if (expandedStation === station.station_id) {
      setExpandedStation(null);
      setChargePoints([]);
    } else {
      setExpandedStation(station.station_id);
      await fetchChargePoints(station.station_id);
    }
  };

  const updateChargePointStatus = async (chargePointId, newStatus) => {
    setUpdating(chargePointId);
    try {
      const response = await fetch(
        `http://localhost:5000/api/operator/charge-points/${chargePointId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        // Refresh charge points
        await fetchChargePoints(expandedStation);
        // Refresh stations to update counts
        await fetchStations();
      }
    } catch (error) {
      console.error('Error updating charge point status:', error);
      alert('Failed to update charge point status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500';
      case 'In Use':
        return 'bg-blue-500';
      case 'Out of Service':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="w-5 h-5" />;
      case 'In Use':
        return <Zap className="w-5 h-5" />;
      case 'Out of Service':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-slate-400">Loading operator dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Simple Operator Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 rounded-lg p-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">EV Charge Operator</span>
            </div>
            <Link 
              to="/login" 
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Login</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 rounded-full p-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Operator Dashboard
            </h1>
            <p className="text-slate-300">
              Manage charging stations and monitor charge points
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Stations</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stations.length}
              </p>
            </div>
            <MapPin className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Charge Points</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stations.reduce((sum, s) => sum + (s.total_charge_points || 0), 0)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Available</p>
              <p className="text-3xl font-bold text-emerald-500 mt-1">
                {stations.reduce((sum, s) => sum + (s.available_points || 0), 0)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Out of Service</p>
              <p className="text-3xl font-bold text-red-500 mt-1">
                {stations.reduce((sum, s) => sum + (s.out_of_service_points || 0), 0)}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Stations List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Charging Stations</h2>
        
        {stations.map((station) => (
          <div
            key={station.station_id}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden"
          >
            {/* Station Header */}
            <div
              className="p-6 cursor-pointer hover:bg-slate-750 transition-colors"
              onClick={() => handleStationClick(station)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">
                      {station.station_name}
                    </h3>
                    {expandedStation === station.station_id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {station.street}, {station.city}, {station.state} {station.postal_code}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>
                      {station.opening_time} - {station.closing_time || '24 Hours'}
                    </span>
                  </div>
                </div>

                {/* Status Summary */}
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-emerald-500 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-2xl font-bold">{station.available_points || 0}</span>
                    </div>
                    <p className="text-xs text-slate-400">Available</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 text-blue-500 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-2xl font-bold">{station.in_use_points || 0}</span>
                    </div>
                    <p className="text-xs text-slate-400">In Use</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-2 text-red-500 mb-1">
                      <XCircle className="w-4 h-4" />
                      <span className="text-2xl font-bold">{station.out_of_service_points || 0}</span>
                    </div>
                    <p className="text-xs text-slate-400">Out of Service</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charge Points Details */}
            {expandedStation === station.station_id && (
              <div className="border-t border-slate-700 bg-slate-750">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-emerald-500" />
                    Charge Points Management
                  </h4>

                  {chargePoints.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">
                      No charge points found for this station
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {chargePoints.map((cp) => (
                        <div
                          key={cp.charge_point_id}
                          className="bg-slate-800 rounded-lg p-4 border border-slate-600"
                        >
                          {/* Charge Point Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`${getStatusColor(cp.status)} rounded-full p-1.5 text-white`}>
                                {getStatusIcon(cp.status)}
                              </div>
                              <div>
                                <p className="text-white font-semibold">
                                  CP #{cp.charge_point_id}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {cp.charger_type}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Power Rating */}
                          <div className="mb-3">
                            <div className="flex items-center gap-2 text-slate-300 text-sm">
                              <Power className="w-4 h-4" />
                              <span>{cp.power_rating} kW</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-3">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              cp.status === 'Available' 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : cp.status === 'In Use'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {cp.status}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {cp.status !== 'In Use' && (
                            <div className="flex gap-2">
                              {cp.status === 'Available' ? (
                                <button
                                  onClick={() => updateChargePointStatus(
                                    cp.charge_point_id,
                                    'Out of Service'
                                  )}
                                  disabled={updating === cp.charge_point_id}
                                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  {updating === cp.charge_point_id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-4 h-4" />
                                      Set Maintenance
                                    </>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateChargePointStatus(
                                    cp.charge_point_id,
                                    'Available'
                                  )}
                                  disabled={updating === cp.charge_point_id}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                  {updating === cp.charge_point_id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Updating...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Set Available
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                          {/* In Use Message */}
                          {cp.status === 'In Use' && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 text-center">
                              <p className="text-blue-400 text-xs font-medium">
                                Currently charging - cannot modify
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {stations.length === 0 && (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              No Stations Found
            </h3>
            <p className="text-slate-500">
              There are no charging stations in the system yet.
            </p>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorDashboard;
