# EV Charging System - Backend API

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18 or higher
- SQL Server running on 127.0.0.1:1433
- EVChargingSystem database created and populated

### Installation

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file and add your SQL Server password:**
   ```
   DB_PASSWORD=your_actual_password_here
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

6. **Test the API:**
   Open your browser and go to: `http://localhost:5000/api/health`

## 📡 API Endpoints

### Stations
- `GET /api/stations` - Get all stations with availability
- `GET /api/stations/:id` - Get station details
- `GET /api/stations/:id/charge-points` - Get charge points for a station

### Users
- `GET /api/users/:id` - Get user details
- `GET /api/users/:id/billing-summary` - Get billing summary
- `GET /api/users/:id/billing-details` - Get detailed billing info

### Vehicles
- `GET /api/vehicles/user/:userId` - Get all vehicles for a user
- `GET /api/vehicles/:id` - Get vehicle by ID

### Reservations
- `GET /api/reservations/user/:userId` - Get user reservations
- `POST /api/reservations` - Create new reservation
  - Body: `{ user_id, charge_point_id, start_time, end_time }`

### Charging Sessions
- `GET /api/charging-sessions` - Get all sessions
- `GET /api/charging-sessions/user/:userId` - Get user sessions
- `GET /api/charging-sessions/:id` - Get session by ID

### Payments
- `POST /api/payments/complete` - Complete a payment
  - Body: `{ payment_id, payment_method_id }`
- `GET /api/payments/user/:userId/methods` - Get payment methods

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans
- `GET /api/subscriptions/user/:userId` - Get user subscriptions

## 🔧 Technologies
- Express.js
- mssql (SQL Server driver)
- CORS enabled
- Environment variables via dotenv
