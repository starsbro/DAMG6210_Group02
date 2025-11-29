import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, X, Zap, Battery, CreditCard, CheckCircle, Loader, Play, Square } from 'lucide-react';

const Reservations = ({ userId }) => {
  const [reservations, setReservations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showStartModal, setShowStartModal] = useState(null);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [energyConsumed, setEnergyConsumed] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    fetchData();
  }, [userId]);

  // Separate effect for timer
  useEffect(() => {
    if (!activeSession) {
      setElapsedTime(0);
      return;
    }

    const updateTimer = () => {
      const start = new Date(activeSession.start_time);
      const now = new Date();
      setElapsedTime(Math.floor((now - start) / 1000));
    };

    // Update immediately
    updateTimer();

    // Then update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSession]);

  const fetchData = async () => {
    try {
      const [resRes, sessionRes, vehiclesRes, paymentsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reservations/user/${userId}`),
        fetch(`http://localhost:5000/api/reservations/user/${userId}/active-session`),
        fetch(`http://localhost:5000/api/vehicles/user/${userId}`),
        fetch(`http://localhost:5000/api/payments/user/${userId}/methods`)
      ]);
      
      const resData = await resRes.json();
      const sessionData = await sessionRes.json();
      const vehiclesData = await vehiclesRes.json();
      const paymentsData = await paymentsRes.json();
      
      setReservations(resData);
      setActiveSession(sessionData);
      setVehicles(vehiclesData);
      setPaymentMethods(paymentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      fetchData();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  const openStartModal = (reservation) => {
    const now = new Date();
    const startTime = new Date(reservation.start_time);
    
    if (now < startTime) {
      alert('Reservation time has not arrived yet!');
      return;
    }

    setShowStartModal(reservation);
    setSelectedVehicle(vehicles[0]?.vehicle_id);
  };

  const handleStartCharging = async () => {
    if (!selectedVehicle) {
      alert('Please select a vehicle');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reservations/start-charging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: showStartModal.reservation_id,
          vehicle_id: selectedVehicle
        })
      });

      if (response.ok) {
        setShowStartModal(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(error.details || 'Failed to start charging');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleStopCharging = async () => {
    if (!energyConsumed || energyConsumed <= 0) {
      alert('Please enter energy consumed');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reservations/stop-charging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: activeSession.session_id,
          energy_consumed: parseFloat(energyConsumed)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowStopModal(false);
        setShowInvoiceModal(data.invoice);
        setActiveSession(null);
        setEnergyConsumed('');
        fetchData();
      } else {
        alert(data.details || 'Failed to stop charging');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handlePayNow = async (invoice) => {
    setShowPaymentModal(invoice);
  };

  const processPayment = async () => {
    if (!paymentMethods || paymentMethods.length === 0) {
      alert('No payment method found');
      return;
    }

    setLoading(true);

    // Simulate card tap animation (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const response = await fetch('http://localhost:5000/api/payments/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: showPaymentModal.payment_id,
          payment_method_id: paymentMethods[0].payment_method_id
        })
      });

      if (response.ok) {
        setShowPaymentModal(null);
        setShowInvoiceModal(null);
        setLoading(false);
        alert(' Payment successful! Check your billing history.');
        fetchData();
      } else {
        const error = await response.json();
        setLoading(false);
        alert(error.details || 'Payment failed');
      }
    } catch (error) {
      setLoading(false);
      alert('Network error. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

      {/* Active Charging Session */}
      {activeSession && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 shadow-xl border-2 border-emerald-400 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6" />
                Charging In Progress
              </h3>
              <p className="text-emerald-100">{activeSession.station_name}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{formatTime(elapsedTime)}</div>
              <div className="text-emerald-100 text-sm">Elapsed Time</div>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-white">
              <div>
                <p className="text-emerald-100">Vehicle</p>
                <p className="font-semibold">{activeSession.brand} {activeSession.model}</p>
              </div>
              <div>
                <p className="text-emerald-100">Charge Point</p>
                <p className="font-semibold">#{activeSession.charge_point_id}  {activeSession.charger_type}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowStopModal(true)}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5" />
            Stop Charging
          </button>
        </div>
      )}

      {/* Upcoming Reservations */}
      {reservations.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No reservations</h3>
          <p className="text-slate-400">Book your first charging session at a station</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const now = new Date();
            const startTime = new Date(reservation.start_time);
            const canStart = now >= startTime && reservation.status === 'Pending';

            return (
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
                      Charge Point #{reservation.charge_point_id}  {reservation.charger_type}  {reservation.power_rating} kW
                    </div>

                    {canStart && (
                      <button
                        onClick={() => openStartModal(reservation)}
                        className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Charging
                      </button>
                    )}
                  </div>

                  {/* Show Cancel button only for Pending reservations that haven't started yet */}
                  {reservation.status === 'Pending' && !canStart && (
                    <button
                      onClick={() => cancelReservation(reservation.reservation_id)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Start Charging Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Start Charging Session</h3>
            
            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm mb-2">Session Details</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Station:</span>
                  <span className="font-medium">{showStartModal.station_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Charge Point:</span>
                  <span className="font-medium">#{showStartModal.charge_point_id}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Vehicle</label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(parseInt(e.target.value))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                {vehicles.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.brand} {v.model} ({v.license_plate})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStartModal(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleStartCharging}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Charging Modal */}
      {showStopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Stop Charging Session</h3>
            
            <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <p className="text-emerald-200">Charging Duration</p>
              </div>
              <p className="text-3xl font-bold text-white">{formatTime(elapsedTime)}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Energy Consumed (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={energyConsumed}
                onChange={(e) => setEnergyConsumed(e.target.value)}
                placeholder="25.5"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-slate-400 text-xs mt-1">Pricing: $0.50/kWh + $2.00/hour</p>
              {energyConsumed && (
                <div className="bg-slate-700 rounded-lg p-3 mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Energy Cost:</span>
                    <span>${(parseFloat(energyConsumed) * 0.50).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Time Cost ({(elapsedTime / 3600).toFixed(2)} hrs):</span>
                    <span>${((elapsedTime / 3600) * 2.00).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 pt-2 border-t border-slate-600">
                    <span>Estimated Total:</span>
                    <span>${(parseFloat(energyConsumed) * 0.50 + (elapsedTime / 3600) * 2.00).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowStopModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleStopCharging}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5" />
                Stop & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Charging Complete!</h3>
              <p className="text-slate-400">Your invoice has been generated</p>
            </div>

            <div className="bg-slate-700 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-600">
                <span className="text-slate-400">Invoice #</span>
                <span className="font-bold text-lg">{showInvoiceModal.invoice_id}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy Consumed</span>
                  <span className="font-medium">{showInvoiceModal.energy_consumed} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy Cost</span>
                  <span className="font-medium">${(showInvoiceModal.energy_consumed * 0.50).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration</span>
                  <span className="font-medium">{showInvoiceModal.duration_hours} hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Time Cost</span>
                  <span className="font-medium">${(parseFloat(showInvoiceModal.duration_hours) * 2.00).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Rate</span>
                  <span>$0.50/kWh + $2.00/hr</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t border-slate-600">
                  <span>Total Amount</span>
                  <span className="text-emerald-400">${showInvoiceModal.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowInvoiceModal(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg"
              >
                View Later
              </button>
              <button
                onClick={() => handlePayNow(showInvoiceModal)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal - Tap Card to Pay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            {loading ? (
              <div className="text-center py-8">
                <div className="relative inline-block mb-6">
                  <CreditCard className="w-24 h-24 text-emerald-500 animate-bounce" />
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping"></div>
                </div>
                <h3 className="text-2xl font-bold mb-2">Processing Payment...</h3>
                <p className="text-slate-400">Please wait</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold mb-6 text-center">Tap Card to Pay</h3>

                <div className="bg-slate-700 rounded-lg p-6 mb-6 text-center">
                  <p className="text-slate-400 text-sm mb-2">Amount to Pay</p>
                  <p className="text-4xl font-bold text-emerald-400">
                    ${showPaymentModal.total_amount.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-8 mb-6 text-center">
                  <CreditCard className="w-16 h-16 text-white mx-auto mb-4" />
                  <p className="text-white font-medium mb-2">Tap your card at the terminal</p>
                  <p className="text-emerald-100 text-sm">Payment Method: Card ending in {paymentMethods[0]?.display_info?.slice(-4) || '****'}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(null)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processPayment}
                    className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 animate-pulse"
                  >
                    <CreditCard className="w-5 h-5" />
                    Tap Card to Pay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
