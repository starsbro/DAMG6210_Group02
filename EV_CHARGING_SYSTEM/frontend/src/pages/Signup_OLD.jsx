import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Zap, Car, Battery, Plug, CheckCircle, Loader, ArrowRight } from 'lucide-react';

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: User Info, 2: Vehicle Info, 3: OTP Verification
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [userForm, setUserForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    account_type: 'Standard'
  });

  const [vehicleForm, setVehicleForm] = useState({
    license_plate: '',
    brand: '',
    model: '',
    battery_capacity: '',
    connector_type: 'Type 2'
  });

  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState(null);

  // Step 1: Register User
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });

      const data = await response.json();

      if (response.ok) {
        setUserId(data.user_id);
        setSuccess('Account created! Now add your vehicle.');
        setStep(2);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Add Vehicle
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const vehicleResponse = await fetch('http://localhost:5000/api/auth/add-vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vehicleForm,
          user_id: userId
        })
      });

      const vehicleData = await vehicleResponse.json();

      if (!vehicleResponse.ok) {
        setError(vehicleData.error || 'Failed to add vehicle');
        setLoading(false);
        return;
      }

      // Now send OTP
      const otpResponse = await fetch('http://localhost:5000/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userForm.email })
      });

      const otpData = await otpResponse.json();

      if (otpResponse.ok) {
        setSuccess('Vehicle added! OTP sent to your email.');
        setStep(3);
      } else {
        setError(otpData.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userForm.email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onLogin) {
          onLogin(data.user);
        }
        navigate('/');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join the EV Charging Network</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm text-slate-300">Account</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm text-slate-300">Vehicle</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-700 mx-2"></div>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              3
            </div>
            <span className="text-sm text-slate-300">Verify</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 text-emerald-200 text-sm mb-4">
              {success}
            </div>
          )}

          {/* Step 1: User Info */}
          {step === 1 && (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={userForm.first_name}
                    onChange={(e) => setUserForm({...userForm, first_name: e.target.value})}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={userForm.last_name}
                    onChange={(e) => setUserForm({...userForm, last_name: e.target.value})}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                    required
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                    required
                    placeholder="+1-234-567-8900"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="date"
                    value={userForm.date_of_birth}
                    onChange={(e) => setUserForm({...userForm, date_of_birth: e.target.value})}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
                <select
                  value={userForm.account_type}
                  onChange={(e) => setUserForm({...userForm, account_type: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium (💎)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Next: Add Vehicle'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {/* Step 2: Vehicle Info */}
          {step === 2 && (
            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Car className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <p className="text-slate-300">Add your electric vehicle</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">License Plate *</label>
                <input
                  type="text"
                  value={vehicleForm.license_plate}
                  onChange={(e) => setVehicleForm({...vehicleForm, license_plate: e.target.value.toUpperCase()})}
                  required
                  placeholder="ABC-1234"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Brand</label>
                  <input
                    type="text"
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm({...vehicleForm, brand: e.target.value})}
                    placeholder="Tesla"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Model</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                    placeholder="Model 3"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Battery Capacity (kWh)</label>
                <div className="relative">
                  <Battery className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    value={vehicleForm.battery_capacity}
                    onChange={(e) => setVehicleForm({...vehicleForm, battery_capacity: e.target.value})}
                    placeholder="75.0"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Connector Type *</label>
                <div className="relative">
                  <Plug className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    value={vehicleForm.connector_type}
                    onChange={(e) => setVehicleForm({...vehicleForm, connector_type: e.target.value})}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-11 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Type 1">Type 1 (J1772)</option>
                    <option value="Type 2">Type 2 (Mennekes)</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="CCS">CCS (Combined Charging System)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-300">
                  OTP sent to <strong>{userForm.email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  placeholder="123456"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-center text-2xl tracking-widest"
                />
                <p className="text-slate-400 text-xs mt-2 text-center">
                  Check your email for the 6-digit OTP
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Start Using'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Login Link */}
        {step === 1 && (
          <p className="text-center text-slate-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:underline">
              Login here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
