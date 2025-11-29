import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, X } from 'lucide-react';

const Reservations = ({ userId }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, [userId]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/user/${userId}`);
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    
    try {
      await fetch(`http://localhost:5000/api/reservations/${reservationId}`, {
        method: 'DELETE'
      });
      fetchReservations(); // Refresh
    } catch (error) {
      console.error('Error cancelling reservation:', error);
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
        <Calendar className="w-8 h-8 text-emerald-500" />
        My Reservations
      </h1>

      {reservations.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No reservations</h3>
          <p className="text-slate-400">Book your first charging session at a station</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.reservation_id}
              className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{reservation.station_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reservation.status === 'Confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                      reservation.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      reservation.status === 'Cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {reservation.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">{reservation.street}, {reservation.city}, {reservation.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">
                        {new Date(reservation.start_time).toLocaleString()} - {new Date(reservation.end_time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-400">
                    Charge Point #{reservation.charge_point_id} • {reservation.charger_type} • {reservation.power_rating} kW
                  </div>
                </div>

                {reservation.status === 'Confirmed' || reservation.status === 'Pending' ? (
                  <button
                    onClick={() => cancelReservation(reservation.reservation_id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;
