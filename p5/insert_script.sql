USE EVChargingSystem;
GO

---------------------------------------------
-- 1. ADDRESS (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Address...';
INSERT INTO Address (street, city, state, postal_code, country) VALUES
('100 Charging Ln', 'Greenville', 'CA', '90210', 'USA'),
('25 Electric Ave', 'Tech City', 'NY', '10001', 'USA'),
('3 Battery Blvd', 'Voltville', 'TX', '75001', 'USA'),
('4 Power Plaza', 'Edison', 'FL', '33101', 'USA'),
('5 Grid Road', 'Wattsburgh', 'WA', '98001', 'USA'),
('6 Outlet St', 'Current City', 'IL', '60601', 'USA'),
('7 Solar Way', 'Brighton', 'AZ', '85001', 'USA'),
('8 Turbine Trail', 'Windmill', 'OR', '97201', 'USA'),
('9 Energy Point', 'Fusion', 'MA', '02101', 'USA'),
('10 Eco Drive', 'Resource', 'GA', '30301', 'USA');
GO

---------------------------------------------
-- 2. PERSON (12 ROWS: 6 Users, 3 Operators, 3 Technicians)
---------------------------------------------
PRINT 'Inserting data into Person...';
INSERT INTO Person (first_name, last_name, email, phone, date_of_birth) VALUES
-- Users (IDs 1-6)
('Alice', 'Smith', 'alice.smith@example.com', '555-1001', '1985-05-15'),
('Bob', 'Johnson', 'bob.johnson@example.com', '555-1002', '1992-11-20'),
('Charlie', 'Brown', 'charlie.brown@example.com', '555-1003', '1978-01-30'),
('Dana', 'White', 'dana.white@example.com', '555-1004', '1995-09-01'),
('Eve', 'Davis', 'eve.davis@example.com', '555-1005', '1980-03-25'),
('Frank', 'Miller', 'frank.miller@example.com', '555-1006', '1965-07-11'),
-- Operators (IDs 7-9)
('Grace', 'Wilson', 'grace.wilson@evcharge.com', '555-1007', '1988-12-05'),
('Henry', 'Moore', 'henry.moore@evcharge.com', '555-1008', '1975-04-18'),
('Ivy', 'Taylor', 'ivy.taylor@evcharge.com', '555-1009', '1990-06-22'),
-- Technicians (IDs 10-12)
('Jack', 'Hall', 'jack.hall@evservice.com', '555-1010', '1983-02-14'),
('Kelly', 'Allen', 'kelly.allen@evservice.com', '555-1011', '1994-10-28'),
('Liam', 'King', 'liam.king@evservice.com', '555-1012', '1970-08-03');
GO

---------------------------------------------
-- 3. PERSON_ADDRESS (12 ROWS: Home/Billing for 6 Users)
---------------------------------------------
PRINT 'Inserting data into Person_Address...';
INSERT INTO Person_Address (person_id, address_id, address_type) VALUES
(1, 1, 'Home'), (1, 2, 'Billing'),
(2, 3, 'Home'), (2, 4, 'Billing'),
(3, 5, 'Home'), (3, 6, 'Billing'),
(4, 7, 'Home'), (4, 8, 'Billing'),
(5, 9, 'Home'), (5, 10, 'Billing'),
(6, 1, 'Billing'), (6, 3, 'Work');
GO

---------------------------------------------
-- 4. STATION (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Station...';
-- station_id is IDENTITY(1,1), so no ID needed here.
INSERT INTO Station (station_name, address_id, gps_coordinates, opening_time, closing_time) VALUES
('Greenville Central Station', 1, '34.0522 N, 118.2437 W', '06:00:00', '22:00:00'),
('Tech City Fast Charge', 2, '40.7128 N, 74.0060 W', '00:00:00', NULL), -- 24-hour station
('Voltville Hub', 3, '32.7767 N, 96.7970 W', '05:30:00', '23:30:00'),
('Edison City Port', 4, '25.7617 N, 80.1918 W', '08:00:00', '20:00:00'),
('Wattsburgh Downtown', 5, '47.6062 N, 122.3321 W', '00:00:00', NULL),
('Current City West', 6, '41.8781 N, 87.6298 W', '07:00:00', '21:00:00'),
('Brighton Solar Spot', 7, '33.4484 N, 112.0740 W', '06:30:00', '20:30:00'),
('Windmill Turbine Stop', 8, '45.5051 N, 122.6750 W', '09:00:00', '18:00:00'),
('Fusion East', 9, '42.3601 N, 71.0589 W', '00:00:00', NULL),
('Resource Eco Park', 10, '33.7490 N, 84.3880 W', '07:30:00', '22:30:00');
GO

---------------------------------------------
-- 5. CHARGE_POINT (13 ROWS)
---------------------------------------------
PRINT 'Inserting data into Charge_Point...';
-- station_id references (1-10) are now valid
INSERT INTO Charge_Point (station_id, charger_type, status, power_rating) VALUES
(1, 'DC Fast', 'Available', 150.00), -- CP ID 1
(1, 'Level 2', 'In Use', 7.50),    -- CP ID 2
(2, 'DC Fast', 'Available', 200.00), -- CP ID 3
(2, 'Level 2', 'Out of Service', 11.00), -- CP ID 4
(3, 'Level 2', 'Available', 7.50),    -- CP ID 5
(3, 'Level 1', 'Available', 1.80),    -- CP ID 6
(4, 'DC Fast', 'In Use', 100.00),    -- CP ID 7
(5, 'Level 2', 'Available', 22.00),   -- CP ID 8
(6, 'Level 2', 'Available', 7.50),    -- CP ID 9
(7, 'DC Fast', 'Available', 350.00),  -- CP ID 10
(8, 'Level 2', 'Out of Service', 11.00), -- CP ID 11
(9, 'Level 1', 'Available', 1.80),    -- CP ID 12
(10, 'Level 2', 'Available', 7.50);   -- CP ID 13
GO

---------------------------------------------
-- 6. PERSON SUBTYPES (USERS, OPERATORS, TECHNICIANS)
---------------------------------------------
PRINT 'Inserting data into User, Operator, and Technician...';
-- Users (Person IDs 1-6)
INSERT INTO [User] (user_id, account_type) VALUES
(1, 'Premium'), (2, 'Basic'), (3, 'Basic'),
(4, 'Premium'), (5, 'Premium'), (6, 'Basic');

-- Operators (Person IDs 7-9, assigned to Stations 1, 2, 3)
INSERT INTO Operator (operator_id, station_id) VALUES
(7, 1), (8, 2), (9, 3);

-- Technicians (Person IDs 10-12)
INSERT INTO Technician (technician_id) VALUES
(10), (11), (12);
GO

---------------------------------------------
-- 7. VEHICLE (6 ROWS - One per User)
---------------------------------------------
PRINT 'Inserting data into Vehicle...';
INSERT INTO Vehicle (user_id, license_plate, brand, model, battery_capacity, connector_type) VALUES
(1, 'EV-1A2B3C', 'Tesla', 'Model 3', 75.00, 'Type 2'), -- Vehicle ID 1
(2, 'VOLT-4D5E6F', 'Chevrolet', 'Bolt', 60.00, 'CCS'),    -- Vehicle ID 2
(3, 'NIO-7G8H9I', 'NIO', 'ES8', 100.00, 'Type 2'),  -- Vehicle ID 3
(4, 'L-PL-10JK', 'Lucid', 'Air', 112.00, 'CCS'),    -- Vehicle ID 4
(5, 'CHG-11LM', 'Nissan', 'Leaf', 40.00, 'CHAdeMO'), -- Vehicle ID 5
(6, 'PLG-12NO', 'Kia', 'EV6', 77.40, 'Type 2');    -- Vehicle ID 6
GO

---------------------------------------------
-- 8. SUBSCRIPTION_PLAN (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Subscription_Plan...';
-- plan_id is IDENTITY(1,1)
INSERT INTO Subscription_Plan (plan_name, plan_description, monthly_fee, discount_rate) VALUES
('Pay-As-You-Go', 'No monthly fee, zero discount.', 0.00, 0.00), -- Plan ID 1
('Basic Saver', '5% discount on Level 2 charging.', 9.99, 0.05),  -- Plan ID 2
('Daily Commuter', '10% discount on all charging.', 19.99, 0.10), -- Plan ID 3
('Monthly Unlimited', '20% discount on all charging.', 49.99, 0.20), -- Plan ID 4
('Fast Charge Pro', '25% off DC Fast charging.', 29.99, 0.25),   -- Plan ID 5
('Weekend Warrior', '15% off weekend charging sessions.', 14.99, 0.15), -- Plan ID 6
('Eco Enthusiast', '10% off for using renewable stations.', 12.00, 0.10), -- Plan ID 7
('Premium Access', '30% discount and priority booking.', 79.99, 0.30), -- Plan ID 8
('Student Saver', '10% off for verified students.', 5.00, 0.10), -- Plan ID 9
('Corporate Fleet', 'Bulk discount for fleet vehicles.', 99.99, 0.35); -- Plan ID 10
GO

---------------------------------------------
-- 9. USER_SUBSCRIPTION (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into User_Subscription...';
INSERT INTO User_Subscription (user_id, plan_id, start_date, end_date) VALUES
-- Active subscriptions (IDs 1-6)
(1, 4, '2024-01-01', NULL), -- Sub ID 1 (User 1, Plan 4)
(2, 3, '2024-03-15', NULL), -- Sub ID 2 (User 2, Plan 3)
(3, 2, '2024-05-20', NULL), -- Sub ID 3 (User 3, Plan 2)
(4, 5, '2024-02-10', NULL), -- Sub ID 4 (User 4, Plan 5)
(5, 8, '2024-01-01', NULL), -- Sub ID 5 (User 5, Plan 8)
(6, 1, '2024-06-01', NULL), -- Sub ID 6 (User 6, Plan 1)
-- Expired/Cancelled subscriptions (for history - IDs 7-10)
(1, 3, '2023-01-01', '2023-12-31'), -- Sub ID 7
(2, 1, '2023-11-01', '2024-03-14'), -- Sub ID 8
(4, 4, '2023-05-01', '2024-02-09'), -- Sub ID 9
(5, 5, '2023-09-01', '2023-12-31'); -- Sub ID 10
GO

---------------------------------------------
-- 10. RESERVATION (10 ROWS) - Using DATETIME2 format
---------------------------------------------
PRINT 'Inserting data into Reservation...';
INSERT INTO Reservation (user_id, charge_point_id, start_time, end_time, status) VALUES
(1, 1, '2024-11-01 08:00:00', '2024-11-01 09:00:00', 'Completed'), -- Res ID 1
(2, 3, '2024-11-01 10:00:00', '2024-11-01 11:00:00', 'Confirmed'), -- Res ID 2
(3, 5, '2024-11-02 12:00:00', '2024-11-02 13:00:00', 'Cancelled'), -- Res ID 3
(4, 7, '2024-11-02 14:00:00', '2024-11-02 15:00:00', 'Confirmed'), -- Res ID 4
(5, 8, '2024-11-03 16:00:00', '2024-11-03 17:00:00', 'Completed'), -- Res ID 5
(6, 10, '2024-11-03 18:00:00', '2024-11-03 19:00:00', 'Pending'),  -- Res ID 6
(1, 2, '2024-11-04 11:00:00', '2024-11-04 12:00:00', 'Confirmed'), -- Res ID 7
(2, 4, '2024-11-05 13:00:00', '2024-11-05 14:00:00', 'Pending'),  -- Res ID 8
(3, 6, '2024-11-05 15:00:00', '2024-11-05 16:00:00', 'Completed'), -- Res ID 9
(4, 9, '2024-11-06 17:00:00', '2024-11-06 18:00:00', 'Confirmed'); -- Res ID 10
GO

---------------------------------------------
-- 11. CHARGING_SESSION (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Charging_Session...';
INSERT INTO Charging_Session (user_subscription_id, vehicle_id, charge_point_id, start_time, end_time, energy_consumed, total_cost) VALUES
(1, 1, 1, '2024-10-25 09:00:00', '2024-10-25 10:15:00', 35.50, 18.50), -- Session ID 1
(2, 2, 3, '2024-10-26 12:30:00', '2024-10-26 14:00:00', 45.00, 22.00), -- Session ID 2
(3, 3, 5, '2024-10-27 18:00:00', '2024-10-27 19:30:00', 20.10, 8.90),  -- Session ID 3
(4, 4, 7, '2024-10-28 05:00:00', '2024-10-28 06:45:00', 50.25, 26.50), -- Session ID 4
(5, 5, 8, '2024-10-29 20:00:00', '2024-10-29 21:00:00', 15.00, 6.00),  -- Session ID 5
(6, 6, 9, '2024-10-30 15:30:00', '2024-10-30 17:00:00', 40.00, 21.00), -- Session ID 6
(1, 1, 10, '2024-10-31 10:00:00', '2024-10-31 11:30:00', 30.50, 15.75), -- Session ID 7
(2, 2, 2, '2024-11-01 13:00:00', '2024-11-01 14:30:00', 48.00, 24.50), -- Session ID 8
(3, 3, 4, '2024-11-02 08:30:00', '2024-11-02 09:45:00', 25.00, 10.50), -- Session ID 9
(4, 4, 6, '2024-11-03 16:00:00', '2024-11-03 17:00:00', 38.00, 20.00); -- Session ID 10
GO

---------------------------------------------
-- 12. PAYMENT_METHOD (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Payment_Method...';
-- payment_method_id is IDENTITY(1,1)
INSERT INTO Payment_Method (method_type, user_id) VALUES
('Credit Card', 1), ('Credit Card', 2), -- ID 1, 2
('Debit Card', 3), ('Debit Card', 4),  -- ID 3, 4
('Wallet', 5), ('Wallet', 6),          -- ID 5, 6
('Credit Card', 1), ('Debit Card', 2), -- ID 7, 8
('Wallet', 3), ('Wallet', 4);          -- ID 9, 10
GO

---------------------------------------------
-- 13. PAYMENT METHOD SUBTYPES (10 ROWS total)
---------------------------------------------
PRINT 'Inserting data into Credit_Card, Debit_Card, and Wallet...';
-- Credit Cards (IDs 1, 2, 7)
INSERT INTO Credit_Card (payment_method_id, card_number, expiry_date, card_holder_name) VALUES
(1, '4111********1111', '2026-10-01', 'Alice Smith'),
(2, '4222********2222', '2025-05-01', 'Bob Johnson'),
(7, '4333********3333', '2027-01-01', 'Alice Smith');

-- Debit Cards (IDs 3, 4, 8)
INSERT INTO Debit_Card (payment_method_id, card_number, expiry_date, card_holder_name) VALUES
(3, '5111********1111', '2026-06-01', 'Charlie Brown'),
(4, '5222********2222', '2025-08-01', 'Dana White'),
(8, '5333********3333', '2027-11-01', 'Bob Johnson');

-- Wallets (IDs 5, 6, 9, 10)
INSERT INTO Wallet (payment_method_id, wallet_provider, wallet_account) VALUES
(5, 'PayApp', 'eve@wallet.com'),
(6, 'ChargePal', 'frank@wallet.com'),
(9, 'E-Money', 'charlie@wallet.com'),
(10, 'PayApp', 'dana@wallet.com');
GO

---------------------------------------------
-- 14. INVOICE (10 ROWS - One per Charging Session)
---------------------------------------------
PRINT 'Inserting data into Invoice...';
-- Invoice IDs 1-10 link to Session IDs 1-10
INSERT INTO Invoice (user_id, issue_date, total_amount, billing_address_id, user_subscription_id, charging_session_id) VALUES
(1, '2024-10-25', 18.50, 2, 1, 1), -- Invoice ID 1
(2, '2024-10-26', 22.00, 4, 2, 2), -- Invoice ID 2
(3, '2024-10-27', 8.90, 6, 3, 3),  -- Invoice ID 3
(4, '2024-10-28', 26.50, 8, 4, 4), -- Invoice ID 4
(5, '2024-10-29', 6.00, 10, 5, 5), -- Invoice ID 5
(6, '2024-10-30', 21.00, 1, 6, 6), -- Invoice ID 6
(1, '2024-10-31', 15.75, 2, 1, 7), -- Invoice ID 7
(2, '2024-11-01', 24.50, 4, 2, 8), -- Invoice ID 8
(3, '2024-11-02', 10.50, 6, 3, 9), -- Invoice ID 9
(4, '2024-11-03', 20.00, 8, 4, 10); -- Invoice ID 10
GO

---------------------------------------------
-- 15. PAYMENT (10 ROWS - One per Invoice) - UPDATED: Using DATETIME2 format
---------------------------------------------
PRINT 'Inserting data into Payment...';
-- payment_date is now DATETIME2, so we include a time.
INSERT INTO Payment (invoice_id, payment_method_id, payment_date, amount, status) VALUES
(1, 1, '2024-10-25 10:30:00', 18.50, 'Completed'), -- Payment ID 1
(2, 2, '2024-10-26 14:05:00', 22.00, 'Completed'), -- Payment ID 2
(3, 3, '2024-10-27 19:35:00', 8.90, 'Completed'),  -- Payment ID 3
(4, 4, '2024-10-28 06:50:00', 26.50, 'Completed'), -- Payment ID 4
(5, 5, '2024-10-29 21:05:00', 6.00, 'Completed'),  -- Payment ID 5
(6, 6, '2024-10-30 17:05:00', 21.00, 'Completed'), -- Payment ID 6
(7, 7, '2024-10-31 11:35:00', 15.75, 'Completed'), -- Payment ID 7
(8, 8, '2024-11-01 14:35:00', 24.50, 'Pending'),  -- Payment ID 8
(9, 9, '2024-11-02 09:50:00', 10.50, 'Completed'), -- Payment ID 9
(10, 10, '2024-11-03 17:05:00', 20.00, 'Failed');  -- Payment ID 10
GO

---------------------------------------------
-- 16. SKILL (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Skill...';
-- skill_id is IDENTITY(1,1)
INSERT INTO Skill (skill_name, description) VALUES
('DC Fast Charger Repair', 'Maintenance and repair of high-power DC charging units.'), -- Skill ID 1
('Level 2 Installation', 'Installation and commissioning of standard AC chargers.'), -- Skill ID 2
('Software Diagnostics', 'Troubleshooting and updating charge point firmware.'),    -- Skill ID 3
('Electrical Wiring (High Voltage)', 'Handling high-voltage electrical systems.'), -- Skill ID 4
('Network Connectivity', 'Fixing charge point communication issues (OCPP).'),   -- Skill ID 5
('Mechanical Repair', 'Repairing physical damage to charge point enclosures and cables.'), -- Skill ID 6
('Safety Inspection', 'Conducting routine safety and regulatory checks.'),   -- Skill ID 7
('Battery Storage Systems', 'Maintenance of on-site battery storage connected to the grid.'), -- Skill ID 8
('Solar Integration', 'Managing solar panel integration with charging stations.'), -- Skill ID 9
('Pothole Repair', 'General site maintenance (Not electrical).'); -- Skill ID 10
GO

---------------------------------------------
-- 17. TECHNICIAN_SKILL (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Technician_Skill...';
-- skill_id references (1-10) are now valid
INSERT INTO Technician_Skill (technician_id, skill_id) VALUES
(10, 1), (10, 3), (10, 5), (10, 7),
(11, 2), (11, 4), (11, 6), (11, 9),
(12, 1), (12, 8);
GO

---------------------------------------------
-- 18. MAINTENANCE_RECORD (10 ROWS)
---------------------------------------------
PRINT 'Inserting data into Maintenance_Record...';
-- charge_point_id references (1-10) are valid
INSERT INTO Maintenance_Record (technician_id, charge_point_id, maintenance_date, description, status) VALUES
(10, 1, '2024-09-01', 'DC fast charger annual check-up.', 'Completed'),
(11, 2, '2024-09-10', 'Replaced faulty charging cable.', 'Completed'),
(10, 4, '2024-10-01', 'Charger offline. Found network connectivity issue (OCPP).', 'Completed'),
(12, 8, '2024-10-15', 'Routine L2 inspection and firmware update.', 'Completed'),
(11, 3, '2024-11-01', 'Reported power fluctuation. Diagnostics run.', 'Completed'),
(10, 1, '2024-11-05', 'Emergency call: Charge point stuck in "In Use" state.', 'Completed'),
(12, 10, '2024-11-10', 'Preventative maintenance on Level 2 unit.', 'Pending'),
(11, 7, '2024-11-12', 'DC Fast unit reported failure. Awaiting parts.', 'In Progress'),
(10, 5, '2024-11-15', 'Scheduled software upgrade.', 'Pending'),
(12, 9, '2024-11-17', 'Checking solar integration performance.', 'Completed');
GO

---------------------------------------------
-- 19. NOTIFICATION (10 ROWS) - Using DATETIME2 format
---------------------------------------------
PRINT 'Inserting data into Notification...';
-- date_sent is now DATETIME2
INSERT INTO Notification (user_id, charging_session_id, reservation_id, payment_id, message, date_sent) VALUES
(1, 1, NULL, 1, 'Your charging session is complete. Invoice #1 is paid.', '2024-10-25 10:16:00'),
(2, 2, NULL, 2, 'Session complete. Your discounted rate applied.', '2024-10-26 14:01:00'),
(4, 4, NULL, 4, 'Thank you for charging. Your premium discount saved you $6.50.', '2024-10-28 06:46:00'),
(1, 7, NULL, 7, 'Another successful charge! Invoice #7 paid.', '2024-10-31 11:31:00'),
(2, NULL, 2, NULL, 'Your reservation at Tech City Fast Charge is confirmed for tomorrow.', '2024-10-31 10:30:00'),
(4, NULL, 4, NULL, 'Reservation confirmed at Edison City Port. See you soon!', '2024-11-01 14:30:00'),
(1, NULL, NULL, NULL, 'Your subscription to Monthly Unlimited will renew in 7 days.', '2024-11-03 08:00:00'),
(2, NULL, NULL, 8, 'Action Required: Payment for Invoice #8 is still pending.', '2024-11-02 12:00:00'),
(4, NULL, 10, NULL, 'Reservation confirmed: Your spot is reserved for 5pm today.', '2024-11-06 14:00:00'),
(5, 5, NULL, 5, 'Your vehicle has reached 80% charge threshold.', '2024-10-29 20:45:00');
GO
PRINT 'Data insertion complete.';