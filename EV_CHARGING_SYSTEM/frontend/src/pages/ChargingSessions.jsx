import { useState, useEffect } from 'react';
import { Battery, Zap, Clock, DollarSign } from 'lucide-react';

const ChargingSessions = ({ userId }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/charging-sessions/user/${userId}`);
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching charging sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Battery className="w-8 h-8 text-emerald-500" />
        Charging Sessions
      </h1>

      {sessions.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <Battery className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No charging sessions</h3>
          <p className="text-slate-400">Your charging history will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{session.station_name}</h3>
                  <p className="text-slate-400 text-sm">{session.city}, {session.state}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-400">${session.total_cost}</p>
                  <p className="text-sm text-slate-400">{session.energy_consumed} kWh</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Vehicle</p>
                  <p className="font-semibold">{session.brand} {session.model}</p>
                  <p className="text-sm text-slate-400">{session.license_plate}</p>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Duration</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold">
                      {new Date(session.start_time).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {new Date(session.start_time).toLocaleTimeString()} - {new Date(session.end_time).toLocaleTimeString()}
                  </p>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">Charger</p>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">{session.charger_type}</span>
                  </div>
                  <p className="text-sm text-slate-400">{session.power_rating} kW</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChargingSessions;
