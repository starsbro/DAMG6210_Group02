import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Stations
export const stationService = {
  getAll: () => api.get('/stations'),
  getById: (id) => api.get(`/stations/${id}`),
  getChargePoints: (id) => api.get(`/stations/${id}/charge-points`),
};

// Users
export const userService = {
  getById: (id) => api.get(`/users/${id}`),
  getBillingSummary: (id) => api.get(`/users/${id}/billing-summary`),
  getBillingDetails: (id) => api.get(`/users/${id}/billing-details`),
};

// Vehicles
export const vehicleService = {
  getUserVehicles: (userId) => api.get(`/vehicles/user/${userId}`),
  getById: (id) => api.get(`/vehicles/${id}`),
};

// Reservations
export const reservationService = {
  getUserReservations: (userId) => api.get(`/reservations/user/${userId}`),
  create: (data) => api.post('/reservations', data),
};

// Charging Sessions
export const chargingSessionService = {
  getAll: () => api.get('/charging-sessions'),
  getUserSessions: (userId) => api.get(`/charging-sessions/user/${userId}`),
  getById: (id) => api.get(`/charging-sessions/${id}`),
};

// Payments
export const paymentService = {
  complete: (data) => api.post('/payments/complete', data),
  getUserPaymentMethods: (userId) => api.get(`/payments/user/${userId}/methods`),
};

// Subscriptions
export const subscriptionService = {
  getAllPlans: () => api.get('/subscriptions/plans'),
  getUserSubscriptions: (userId) => api.get(`/subscriptions/user/${userId}`),
};

export default api;
