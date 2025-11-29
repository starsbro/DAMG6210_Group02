// Quick test for operator endpoints

const testOperatorEndpoints = async () => {
  console.log('Testing Operator API Endpoints...\n');

  try {
    // Test 1: Get all stations
    console.log('1. Testing GET /api/operator/stations');
    const stationsRes = await fetch('http://localhost:5000/api/operator/stations');
    const stations = await stationsRes.json();
    console.log(`✅ Found ${stations.length} stations`);
    if (stations.length > 0) {
      console.log(`   First station: ${stations[0].station_name}`);
    }
    console.log('');

    // Test 2: Get charge points for first station
    if (stations.length > 0) {
      const stationId = stations[0].station_id;
      console.log(`2. Testing GET /api/operator/stations/${stationId}/charge-points`);
      const cpRes = await fetch(`http://localhost:5000/api/operator/stations/${stationId}/charge-points`);
      const chargePoints = await cpRes.json();
      console.log(`✅ Found ${chargePoints.length} charge points for ${stations[0].station_name}`);
      if (chargePoints.length > 0) {
        console.log(`   First CP: ID ${chargePoints[0].charge_point_id} - ${chargePoints[0].status}`);
      }
      console.log('');
    }

    console.log('All tests passed! ✅');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testOperatorEndpoints();
