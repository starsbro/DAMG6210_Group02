import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Zap, ChevronRight, X, CheckCircle, Car, AlertCircle } from 'lucide-react';

const Stations = ({ userId = 1 }) => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [bookingForm, setBookingForm] = useState({
    charge_point_id: null,
    start_time: '',
    end_time: '',
    vehicle_id: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchStations();
    fetchVehicles();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stations');
      const data = await response.json();
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/user/${userId}`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchStationDetails = async (stationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stations/${stationId}`);
      const data = await response.json();
      setSelectedStation(data);
    } catch (error) {
      console.error('Error fetching station details:', error);
    }
  };

  const openBookingModal = (chargePoint) => {
    if (chargePoint.status !== 'Available') {
      alert('This charge point is not available');
      return;
    }

    if (vehicles.length === 0) {
      if (confirm('You need to add a vehicle before making a reservation. Would you like to add one now?')) {
        navigate('/vehicles');
      }
      return;
    }
    
    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    setBookingForm({
      charge_point_id: chargePoint.charge_point_id,
      start_time: startTime.toISOString().slice(0, 16),
      end_time: endTime.toISOString().slice(0, 16),
      vehicle_id: vehicles[0]?.vehicle_id || ''
    });
    setSelectedVehicle(vehicles[0]);
    setBookingModal(chargePoint);
  };

  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicles.find(v => v.vehicle_id === parseInt(vehicleId));
    setSelectedVehicle(vehicle);
    setBookingForm({...bookingForm, vehicle_id: parseInt(vehicleId)});
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.vehicle_id) {
      alert('Please select a vehicle');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          charge_point_id: bookingForm.charge_point_id,
          start_time: bookingForm.start_time,
          end_time: bookingForm.end_time
        })
      });

      if (response.ok) {
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingModal(null);
          setBookingSuccess(false);
          setSelectedStation(null);
        }, 2000);
      } else {
        const error = await response.json();
        alert(error.details || 'Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Failed to create reservation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p className="mt-4 text-slate-400">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {vehicles.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-200 font-medium mb-1">No vehicles added</p>
            <p className="text-yellow-200/80 text-sm mb-3">You need to add a vehicle before making reservations.</p>
            <button
              onClick={() => navigate('/vehicles')}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Add Vehicle Now
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MapPin className="w-8 h-8 text-emerald-500" />
          Charging Stations
        </h1>
        <div className="text-slate-400">
          {stations.length} stations available
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((station) => (
          <div
            key={station.station_id}
            className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer"
            onClick={() => fetchStationDetails(station.station_id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {station.station_name}
                </h3>
                <p className="text-slate-400 text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {station.street}, {station.city}, {station.state}
                </p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-400" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {station.available_points}
                </div>
                <div className="text-xs text-slate-400">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {station.in_use_points}
                </div>
                <div className="text-xs text-slate-400">In Use</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {station.out_of_service_points}
                </div>
                <div className="text-xs text-slate-400">Out of Service</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400 pt-4 border-t border-slate-700">
              <Clock className="w-4 h-4" />
              <span>
                {station.opening_time && station.closing_time 
                  ? `${station.opening_time.slice(0,5)} - ${station.closing_time.slice(0,5)}`
                  : '24/7 Open'}
              </span>
              <Zap className="w-4 h-4 ml-auto" />
              <span>{station.total_charge_points} Charge Points</span>
            </div>
          </div>
        ))}
      </div>

      {selectedStation && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedStation(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedStation.station_name}</h2>
              <button 
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-slate-400 text-sm">Address</p>
                <p className="text-white">
                  {selectedStation.street}, {selectedStation.city}, {selectedStation.state} {selectedStation.postal_code}
                </p>
              </div>
              
              <div>
                <p className="text-slate-400 text-sm">Operating Hours</p>
                <p className="text-white">
                  {selectedStation.opening_time && selectedStation.closing_time 
                    ? `${selectedStation.opening_time.slice(0,5)} - ${selectedStation.closing_time.slice(0,5)}`
                    : 'Open 24/7'}
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4">Available Charge Points</h3>
            <div className="space-y-3">
              {selectedStation.charge_points?.map((cp) => (
                <div 
                  key={cp.charge_point_id}
                  className="bg-slate-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Charge Point #{cp.charge_point_id}</p>
                      <p className="text-sm text-slate-400">
                        {cp.charger_type}  {cp.power_rating} kW
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cp.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' :
                        cp.status === 'In Use' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {cp.status}
                      </span>
                      {cp.status === 'Available' && (
                        <button
                          onClick={() => openBookingModal(cp)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {bookingModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => !bookingSuccess && setBookingModal(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {bookingSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Booking Confirmed!</h3>
                <p className="text-slate-400">Your reservation has been created successfully</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Book Charge Point</h3>
                    <p className="text-slate-400 text-sm">
                      {bookingModal.charger_type}  {bookingModal.power_rating} kW
                    </p>
                  </div>
                  <button 
                    onClick={() => setBookingModal(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Vehicle *</label>
                    <select
                      value={bookingForm.vehicle_id}
                      onChange={(e) => handleVehicleChange(e.target.value)}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Choose a vehicle...</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                          {vehicle.brand} {vehicle.model} ({vehicle.license_plate})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedVehicle && (
                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-5 h-5 text-emerald-400" />
                        <p className="font-medium">{selectedVehicle.brand} {selectedVehicle.model}</p>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>Battery: {selectedVehicle.battery_capacity} kWh</p>
                        <p>Connector: {selectedVehicle.connector_type}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      value={bookingForm.start_time}
                      onChange={(e) => setBookingForm({...bookingForm, start_time: e.target.value})}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={bookingForm.end_time}
                      onChange={(e) => setBookingForm({...bookingForm, end_time: e.target.value})}
                      required
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-2">Booking Summary</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Station:</span>
                        <span className="font-medium">{selectedStation?.station_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Charge Point:</span>
                        <span className="font-medium">#{bookingModal.charge_point_id}</span>
                      </div>
                      {selectedVehicle && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Vehicle:</span>
                          <span className="font-medium">{selectedVehicle.license_plate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Confirm Booking
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
