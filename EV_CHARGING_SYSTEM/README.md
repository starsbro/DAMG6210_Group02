# EV Charging System

A full-stack web application for managing electric vehicle charging stations, featuring user reservations, live charging sessions, automated billing, and operator management capabilities.

## Project Overview

This system provides a complete EV charging ecosystem with:
- **User Interface**: Book charging stations, manage vehicles, track sessions, and process payments
- **Operator Dashboard**: Manage station availability and charge point maintenance
- **Backend API**: RESTful API connecting to SQL Server database
- **Database**: Comprehensive schema with stored procedures for business logic

## Technology Stack

### Frontend
- React 18 with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Lucide React for icons

### Backend
- Node.js with Express.js
- SQL Server (mssql driver)
- Resend API for email OTP authentication
- CORS enabled

### Database
- Microsoft SQL Server
- 12+ tables with relationships
- Stored procedures for business operations
- Proper constraints and triggers

## Prerequisites

Before running this project, ensure you have:
- **Node.js** v18 or higher
- **SQL Server** running on `127.0.0.1:1433`
- **npm** package manager

## Database Setup

1. **Start SQL Server** (Docker recommended):
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Pass123" \
     -p 1433:1433 --name sqlserver \
     -d mcr.microsoft.com/mssql/server:2022-latest
   ```

2. **Create and populate the database**:
   - Connect to SQL Server using Azure Data Studio or SSMS
   - Run the DDL script: `/P5/P4_ddl.sql`
   - Run the insert script: `/P5/EVChargingSystem_INSERT.sql`
   - Run stored procedures: `/P5/psm_script.sql`
   - Run indexes: `/P5/index_script.sql`

## Installation

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Edit .env and set your SQL Server password
# DB_PASSWORD=YourStrong@Pass123!

# Start backend server
npm start
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

## Usage

### User Access (Login Required)

1. **Navigate to**: `http://localhost:3000/login`
2. **Sign up** or **log in** using email OTP authentication
3. **Access features**:
   - Dashboard with statistics
   - Browse charging stations
   - Manage vehicles
   - Book reservations
   - Start/stop charging sessions
   - Process payments and view invoices

### Operator Access (No Login Required)

1. **Navigate to**: `http://localhost:3000/operator`
2. **Manage stations**:
   - View all charging stations
   - Monitor charge point status
   - Set charge points to maintenance
   - Bring charge points back to service

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and login

### Stations
- `GET /api/stations` - Get all stations
- `GET /api/stations/:id/charge-points` - Get charge points

### Users & Vehicles
- `GET /api/users/:id` - Get user details
- `GET /api/vehicles/user/:userId` - Get user vehicles
- `POST /api/vehicles` - Add new vehicle

### Reservations & Sessions
- `POST /api/reservations` - Create reservation
- `GET /api/reservations/user/:userId` - Get user reservations
- `POST /api/charging-sessions/start` - Start charging
- `POST /api/charging-sessions/stop` - Stop charging

### Payments
- `POST /api/payments/complete` - Process payment
- `GET /api/payments/user/:userId/methods` - Get payment methods

### Operator
- `GET /api/operator/stations` - Get all stations with stats
- `PUT /api/operator/charge-points/:id/status` - Update charge point status

## Project Structure

```
EV_CHARGING_SYSTEM/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── stationController.js
│   │   ├── userController.js
│   │   ├── vehicleController.js
│   │   ├── reservationController.js
│   │   ├── chargingSessionController.js
│   │   ├── paymentController.js
│   │   ├── operatorController.js
│   │   └── subscriptionController.js
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Stations.jsx
│   │   │   ├── MyVehicles.jsx
│   │   │   ├── Reservations.jsx
│   │   │   ├── ChargingSessions.jsx
│   │   │   ├── Billing.jsx
│   │   │   └── OperatorDashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── P5/
    ├── P4_ddl.sql
    ├── EVChargingSystem_INSERT.sql
    ├── psm_script.sql
    └── index_script.sql
```

## Features

### User Features
- Email OTP authentication (no password required)
- Dashboard with real-time statistics
- Station discovery and booking
- Vehicle management
- Reservation system with time slots
- Live charging sessions with timer
- Automated billing and invoice generation
- Payment processing

### Operator Features
- Station overview dashboard
- Real-time charge point monitoring
- Maintenance mode control
- Status management (Available/Out of Service)
- Protected in-use charge points

### Business Logic
- Dynamic pricing: $0.50/kWh + $2.00/hour
- Automated invoice generation
- Real-time status updates
- Reservation validation
- Charge point availability management

## Troubleshooting

### Backend won't start
- Ensure SQL Server is running on port 1433
- Check `.env` file has correct database credentials
- Verify EVChargingSystem database exists

### Frontend won't connect
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify API endpoints are accessible

### Login issues
- Check Resend API key in `.env`
- Verify email is correct
- Check backend logs for errors

## Development

### Backend Development Mode
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development Mode
```bash
cd frontend
npm run dev  # Vite hot module replacement
```

## Database Schema

The system uses the following main tables:
- **Station**: Charging station locations
- **Charge_Point**: Individual charging units
- **User**: Customer accounts
- **Vehicle**: User-owned EVs
- **Reservation**: Booking records
- **Charging_Session**: Active/completed sessions
- **Invoice**: Billing records
- **Payment**: Transaction records
- **Maintenance_Record**: Service history

## Contributors

DAMG6210 - Group 02

## License

This project is for educational purposes as part of DAMG6210 coursework.
