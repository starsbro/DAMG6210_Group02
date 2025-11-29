import { useState, useEffect } from 'react';
import { Car, Battery, Plug } from 'lucide-react';

const MyVehicles = ({ userId }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, [userId]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/vehicles/user/${userId}`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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
        <Car className="w-8 h-8 text-emerald-500" />
        My Vehicles
      </h1>

      {vehicles.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
          <Car className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No vehicles added</h3>
          <p className="text-slate-400">Add your first electric vehicle to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.vehicle_id}
              className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-emerald-500 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-emerald-500/20 p-3 rounded-lg">
                  <Car className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="bg-slate-700 px-3 py-1 rounded-full text-sm">
                  {vehicle.license_plate}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">{vehicle.brand} {vehicle.model}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Battery className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">Battery: {vehicle.battery_capacity} kWh</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Plug className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Connector: {vehicle.connector_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyVehicles;
