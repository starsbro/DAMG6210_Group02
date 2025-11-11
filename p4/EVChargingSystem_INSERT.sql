USE EVChargingSystem;
GO

SET NOCOUNT ON;
GO

------------------------------------------------------------
-- 1) ADDRESS (10 rows)
------------------------------------------------------------
INSERT INTO Address (street, city, state, postal_code, country) VALUES
 ('12 Beacon St',       'Boston',        'MA',               '02108',   'USA'),
 ('450 Pine St',        'Seattle',       'WA',               '98101',   'USA'),
 ('200 Market St',      'San Francisco', 'CA',               '94105',   'USA'),
 ('10 Downing Rd',      'London',        'Greater London',   'SW1A1AA', 'UK'),
 ('88 Queen St',        'Sydney',        'NSW',              '2000',    'Australia'),
 ('150 King St',        'Toronto',       'ON',               'M5H2N2',  'Canada'),
 ('400 Michigan Ave',   'Chicago',       'IL',               '60611',   'USA'),
 ('500 Collins Ave',    'Miami',         'FL',               '33139',   'USA'),
 ('1 Circular Quay',    'Sydney',        'NSW',              '2000',    'Australia'),
 ('77 Oxford St',       'Manchester',    'Greater Manchester','M1 5AN', 'UK');
GO

------------------------------------------------------------
-- 2) PERSON (30 rows)
-- person_id will be 1..30 in this insert order
------------------------------------------------------------
INSERT INTO Person (first_name, last_name, email, phone, date_of_birth) VALUES
 ('Emily','Nguyen','emily.nguyen@example.com','+1-617-555-0101','1990-04-12'),
 ('Michael','Smith','michael.smith@example.com','+1-206-555-0102','1987-09-21'),
 ('Asha','Menon','asha.menon@example.com','+1-415-555-0103','1992-01-05'),
 ('John','Brown','john.brown@example.com','+44-20-7000-0104','1985-12-11'),
 ('Sophie','Turner','sophie.turner@example.com','+61-2-9000-0105','1994-07-19'),
 ('Carlos','Diaz','carlos.diaz@example.com','+1-416-555-0106','1989-11-02'),
 ('Olivia','Martinez','olivia.martinez@example.com','+1-312-555-0107','1991-03-27'),
 ('Daniel','Kim','daniel.kim@example.com','+1-305-555-0108','1988-06-30'),
 ('Lucas','Wang','lucas.wang@example.com','+61-2-9000-0109','1993-02-14'),
 ('Hannah','Lee','hannah.lee@example.com','+44-161-555-0110','1995-08-08'),
 ('Raj','Patel','raj.patel@example.com','+1-617-555-0111','1986-05-22'),
 ('Priya','Sharma','priya.sharma@example.com','+1-206-555-0112','1990-10-10'),
 ('Tom','Wilson','tom.wilson@example.com','+1-415-555-0113','1984-04-04'),
 ('Mia','Garcia','mia.garcia@example.com','+44-20-7000-0114','1992-12-01'),
 ('Ethan','Ng','ethan.ng@example.com','+61-2-9000-0115','1991-09-09'),
 ('Lina','Khan','lina.khan@example.com','+1-416-555-0116','1987-02-02'),
 ('Noah','White','noah.white@example.com','+1-312-555-0117','1990-03-03'),
 ('Zoe','Cruz','zoe.cruz@example.com','+1-305-555-0118','1993-05-05'),
 ('Ibrahim','Hassan','ibrahim.hassan@example.com','+61-2-9000-0119','1985-07-07'),
 ('Anna','Bell','anna.bell@example.com','+44-161-555-0120','1994-11-11'),
 ('Peter','Lopez','peter.lopez@example.com','+1-617-555-0121','1986-01-15'),
 ('Sara','Nakamura','sara.nakamura@example.com','+1-206-555-0122','1989-04-18'),
 ('Mateo','Rossi','mateo.rossi@example.com','+1-415-555-0123','1992-08-20'),
 ('Fatima','Ali','fatima.ali@example.com','+44-20-7000-0124','1991-06-06'),
 ('Luca','Bianchi','luca.bianchi@example.com','+61-2-9000-0125','1988-02-25'),
 ('Grace','Kumar','grace.kumar@example.com','+1-416-555-0126','1993-09-30'),
 ('Omar','Farouk','omar.farouk@example.com','+1-312-555-0127','1986-10-12'),
 ('Yara','Santos','yara.santos@example.com','+1-305-555-0128','1990-07-29'),
 ('Ben','Huang','ben.huang@example.com','+61-2-9000-0129','1995-01-01'),
 ('Nina','Ibrahim','nina.ibrahim@example.com','+44-161-555-0130','1987-12-24');
GO

------------------------------------------------------------
-- 3) PERSON_ADDRESS (>=10 rows, actually 30)
-- Uses person_ids 1..30, address_ids 1..10
------------------------------------------------------------
INSERT INTO Person_Address (person_id, address_id, address_type) VALUES
 (1,1,'Home'), (2,2,'Home'), (3,3,'Home'), (4,4,'Home'), (5,5,'Home'),
 (6,6,'Home'), (7,7,'Home'), (8,8,'Home'), (9,9,'Home'), (10,10,'Home'),
 (11,1,'Work'), (12,2,'Work'), (13,3,'Work'), (14,4,'Work'), (15,5,'Work'),
 (16,6,'Work'), (17,7,'Work'), (18,8,'Work'), (19,9,'Work'), (20,10,'Work'),
 (21,1,'Billing'), (22,2,'Billing'), (23,3,'Billing'), (24,4,'Billing'), (25,5,'Billing'),
 (26,6,'Billing'), (27,7,'Billing'), (28,8,'Billing'), (29,9,'Billing'), (30,10,'Billing');
GO

------------------------------------------------------------
-- 4) STATION (10 rows)  station_id = 1..10
------------------------------------------------------------
INSERT INTO Station (station_name, address_id, gps_coordinates, opening_time, closing_time) VALUES
 ('Beacon Hill EV',        1, '42.3573,-71.0636', '00:00', NULL),
 ('Pine St Charging',      2, '47.6101,-122.3344', '08:00', '22:00'),
 ('Market St Chargers',    3, '37.7890,-122.3960', '07:00', '23:00'),
 ('Westminster Charge',    4, '51.5034,-0.1276', '06:00', '23:30'),
 ('Harbourfront Station',  6, '43.6426,-79.3871', '00:00', NULL),
 ('Magnificent Mile CS',   7, '41.8916,-87.6244', '07:00', '22:00'),
 ('South Beach Station',   8, '25.7907,-80.1300', '06:00', '21:00'),
 ('Circular Quay EV',      9, '33.8615,151.2099', '00:00', NULL),
 ('Oxford Street Charge', 10, '53.4820,-2.2446', '08:00', '20:00'),
 ('King St EV',            5, '33.8688,151.2093', '07:00', '21:00');
GO

------------------------------------------------------------
-- 5) CHARGE_POINT (10 rows)  charge_point_id = 1..10
------------------------------------------------------------
INSERT INTO Charge_Point (station_id, charger_type, status, power_rating) VALUES
 (1,'Level 2','Available',7.20),
 (1,'Level 2','Available',7.20),
 (2,'DC Fast','In Use',50.00),
 (3,'Level 2','Available',7.20),
 (4,'DC Fast','Out of Service',120.00),
 (5,'Level 2','Available',7.20),
 (6,'Level 2','Available',7.20),
 (7,'DC Fast','Available',75.00),
 (8,'Level 2','Available',7.20),
 (9,'Level 2','Available',7.20);
GO

------------------------------------------------------------
-- 6) USER (10 rows)  user_id = 1..10 (Person 1..10)
------------------------------------------------------------
INSERT INTO [User] (user_id, account_type) VALUES
 (1,'Standard'),
 (2,'Premium'),
 (3,'Standard'),
 (4,'Standard'),
 (5,'Premium'),
 (6,'Standard'),
 (7,'Standard'),
 (8,'Premium'),
 (9,'Standard'),
 (10,'Standard');
GO

------------------------------------------------------------
-- 7) OPERATOR (10 rows)  operator_id = 11..20 (Person), stations 1..10
------------------------------------------------------------
INSERT INTO Operator (operator_id, station_id) VALUES
 (11,1),
 (12,2),
 (13,3),
 (14,4),
 (15,5),
 (16,6),
 (17,7),
 (18,8),
 (19,9),
 (20,10);
GO

------------------------------------------------------------
-- 8) TECHNICIAN (10 rows) technician_id = 21..30 (Person)
------------------------------------------------------------
INSERT INTO Technician (technician_id) VALUES
 (21),(22),(23),(24),(25),(26),(27),(28),(29),(30);
GO

------------------------------------------------------------
-- 9) VEHICLE (10 rows)  vehicle_id = 1..10, users 1..10
------------------------------------------------------------
INSERT INTO Vehicle (user_id, license_plate, brand, model, battery_capacity, connector_type) VALUES
 (1,'MA-1234','Nissan','Leaf',40.00,'CHAdeMO'),
 (2,'WA-4321','Tesla','Model 3',75.00,'CCS'),
 (3,'CA-5555','Chevy','Bolt',60.00,'CCS'),
 (4,'UK-1010','Nissan','Leaf',40.00,'CHAdeMO'),
 (5,'AU-2020','Hyundai','Kona',64.00,'Type 2'),
 (6,'ON-3030','Kia','Niro',64.00,'Type 2'),
 (7,'IL-4040','BMW','i3',42.20,'Type 2'),
 (8,'FL-5050','Audi','e-tron',95.00,'CCS'),
 (9,'AU-6060','Renault','Zoe',52.00,'Type 2'),
 (10,'UK-7070','VW','ID.3',58.00,'Type 2');
GO

------------------------------------------------------------
-- 10) SUBSCRIPTION_PLAN (10 rows)  plan_id = 1..10
------------------------------------------------------------
INSERT INTO Subscription_Plan (plan_name, plan_description, monthly_fee, discount_rate) VALUES
 ('Basic','Pay-as-you-go discounts',9.99,0.00),
 ('Silver','10% off charging',19.99,10.00),
 ('Gold','20% off charging + priority access',29.99,20.00),
 ('Student','Discounted plan for students',7.99,30.00),
 ('Business','Corporate plan',49.99,25.00),
 ('Weekend','Weekend-friendly plan',12.99,5.00),
 ('NightOwl','Discounts for overnight charging',14.99,15.00),
 ('Family','Multiple vehicle support',34.99,12.00),
 ('CityPass','Local commuter plan',24.99,8.00),
 ('Trial','30-day trial',0.00,0.00);
GO

------------------------------------------------------------
-- 11) USER_SUBSCRIPTION (10 rows)  user_subscription_id = 1..10
------------------------------------------------------------
INSERT INTO User_Subscription (user_id, plan_id, start_date, end_date) VALUES
 (1,2,'2025-07-01', NULL),
 (2,3,'2025-06-15', NULL),
 (3,1,'2025-01-01','2025-06-30'),
 (4,5,'2024-12-01', NULL),
 (5,8,'2025-08-01', NULL),
 (6,2,'2025-02-10', NULL),
 (7,4,'2025-09-01','2026-02-28'),
 (8,3,'2025-04-20', NULL),
 (9,9,'2025-03-01', NULL),
 (10,10,'2025-10-01','2025-10-31');
GO

------------------------------------------------------------
-- 12) RESERVATION (10 rows) reservation_id = 1..10
------------------------------------------------------------
INSERT INTO Reservation (user_id, charge_point_id, start_time, end_time, status) VALUES
 (1,1,'2025-10-01 08:00:00','2025-10-01 09:00:00','Completed'),
 (2,3,'2025-10-02 18:00:00','2025-10-02 18:45:00','Completed'),
 (3,4,'2025-10-05 07:30:00','2025-10-05 08:15:00','Cancelled'),
 (4,5,'2025-11-01 19:00:00','2025-11-01 20:00:00','Pending'),
 (5,6,'2025-09-20 22:00:00','2025-09-20 23:00:00','Completed'),
 (6,2,'2025-09-25 07:00:00','2025-09-25 07:45:00','Completed'),
 (7,8,'2025-10-10 14:00:00','2025-10-10 15:30:00','Confirmed'),
 (8,9,'2025-10-12 09:00:00','2025-10-12 10:30:00','Completed'),
 (9,10,'2025-10-14 12:00:00','2025-10-14 13:00:00','Completed'),
 (10,1,'2025-11-05 06:00:00','2025-11-05 07:00:00','Pending');
GO

------------------------------------------------------------
-- 13) CHARGING_SESSION (10 rows) session_id = 1..10
------------------------------------------------------------
INSERT INTO Charging_Session (user_subscription_id, vehicle_id, charge_point_id,
                              start_time, end_time, energy_consumed, total_cost) VALUES
 (1,1,1,'2025-10-01 08:05:00','2025-10-01 08:55:00',12.5, 6.25),
 (2,2,2,'2025-10-02 18:05:00','2025-10-02 18:40:00',20.0,10.00),
 (3,3,3,'2025-10-05 07:35:00','2025-10-05 08:10:00', 8.7, 4.35),
 (4,4,4,'2025-11-01 19:05:00','2025-11-01 19:55:00',25.0,20.00),
 (5,5,5,'2025-09-20 22:10:00','2025-09-20 22:55:00',10.0, 5.00),
 (6,6,6,'2025-09-25 07:03:00','2025-09-25 07:40:00', 9.3, 4.65),
 (7,7,7,'2025-10-10 14:05:00','2025-10-10 15:25:00',40.0,20.00),
 (8,8,8,'2025-10-12 09:05:00','2025-10-12 10:25:00',18.4, 9.20),
 (9,9,9,'2025-10-14 12:10:00','2025-10-14 12:50:00',11.0, 5.50),
 (10,10,1,'2025-11-05 06:05:00','2025-11-05 06:50:00', 7.5, 3.75);
GO

------------------------------------------------------------
-- 14) PAYMENT_METHOD (10 rows) payment_method_id = 1..10
------------------------------------------------------------
INSERT INTO Payment_Method (method_type, user_id) VALUES
 ('Credit Card',1),
 ('Debit Card',2),
 ('Wallet',3),
 ('Credit Card',4),
 ('Debit Card',5),
 ('Wallet',6),
 ('Credit Card',7),
 ('Debit Card',8),
 ('Wallet',9),
 ('Credit Card',10);
GO

------------------------------------------------------------
-- 15) CREDIT_CARD / DEBIT_CARD / WALLET (at least 10 rows total)
------------------------------------------------------------
-- Credit cards (4 rows)
INSERT INTO Credit_Card (payment_method_id, card_number, expiry_date, card_holder_name) VALUES
 (1,'4111-1111-1111-1111','2027-04-30','Emily Nguyen'),
 (4,'4242-4242-4242-4242','2026-11-30','John Brown'),
 (7,'4012-8888-8888-1881','2028-01-31','Olivia Martinez'),
 (10,'4532-7597-3456-0123','2026-06-30','Hannah Lee');
-- Debit cards (3 rows)
INSERT INTO Debit_Card (payment_method_id, card_number, expiry_date, card_holder_name) VALUES
 (2,'5500-0000-0000-0004','2026-09-30','Michael Smith'),
 (5,'5105-1051-0510-5100','2027-03-31','Sophie Turner'),
 (8,'6011-0009-9013-9424','2025-12-31','Daniel Kim');
-- Wallets (3 rows)
INSERT INTO Wallet (payment_method_id, wallet_provider, wallet_account) VALUES
 (3,'FastPay','emily.nguyen@fastpay'),
 (6,'GreenWallet','carlos.diaz@gw'),
 (9,'QuickWallet','lucas.wang@qw');
GO

------------------------------------------------------------
-- 16) INVOICE (10 rows) invoice_id = 1..10
-- charging_session_id is UNIQUE, enforcing 1:1 Invoice <-> Charging_Session
------------------------------------------------------------
INSERT INTO Invoice (user_id, issue_date, total_amount,
                     billing_address_id, user_subscription_id, charging_session_id) VALUES
 (1,'2025-10-01', 6.25, 1, 1, 1),
 (2,'2025-10-02',10.00, 2, 2, 2),
 (3,'2025-10-05', 4.35, 3, 3, 3),
 (4,'2025-11-01',20.00, 4, 4, 4),
 (5,'2025-09-20', 5.00, 5, 5, 5),
 (6,'2025-09-25', 4.65, 6, 6, 6),
 (7,'2025-10-10',20.00, 7, 7, 7),
 (8,'2025-10-12', 9.20, 8, 8, 8),
 (9,'2025-10-14', 5.50, 9, 9, 9),
 (10,'2025-11-05',3.75,10,10,10);
GO

------------------------------------------------------------
-- 17) PAYMENT (10 rows) payment_id = 1..10
------------------------------------------------------------
INSERT INTO Payment (invoice_id, payment_method_id, payment_date, amount, status) VALUES
 (1,1,'2025-10-01 09:00:00', 6.25,'Completed'),
 (2,2,'2025-10-02 19:00:00',10.00,'Completed'),
 (3,3,'2025-10-05 09:00:00', 4.35,'Completed'),
 (4,4,'2025-11-01 20:00:00',20.00,'Pending'),
 (5,5,'2025-09-20 23:00:00', 5.00,'Completed'),
 (6,6,'2025-09-25 08:00:00', 4.65,'Completed'),
 (7,7,'2025-10-10 16:00:00',20.00,'Completed'),
 (8,8,'2025-10-12 11:00:00', 9.20,'Completed'),
 (9,9,'2025-10-14 13:00:00', 5.50,'Completed'),
 (10,10,'2025-11-05 07:00:00',3.75,'Completed');
GO

------------------------------------------------------------
-- 18) SKILL (10 rows) skill_id = 1..10
------------------------------------------------------------
INSERT INTO Skill (skill_name, description) VALUES
 ('Electrical','EV electrical systems and wiring'),
 ('HVAC','Heating & cooling systems relevant to EV chargers'),
 ('Network','Networking for station connectivity'),
 ('Diagnostics','Troubleshooting and diagnostics'),
 ('Mechanical','Mechanical repairs for charge point hardware'),
 ('Safety','Safety and compliance training'),
 ('Software','Firmware and software updates'),
 ('Logistics','Parts and inventory management'),
 ('CustomerSupport','On-site customer assistance'),
 ('Calibration','Metering and calibration skills');
GO

------------------------------------------------------------
-- 19) TECHNICIAN_SKILL (10 rows)
------------------------------------------------------------
INSERT INTO Technician_Skill (technician_id, skill_id) VALUES
 (21,1),
 (21,4),
 (22,3),
 (22,7),
 (23,5),
 (24,2),
 (25,6),
 (26,8),
 (27,9),
 (28,10);
GO

------------------------------------------------------------
-- 20) MAINTENANCE_RECORD (10 rows) record_id = 1..10
------------------------------------------------------------
INSERT INTO Maintenance_Record (technician_id, charge_point_id, maintenance_date, description, status) VALUES
 (21,1,'2025-08-01','Replaced connector','Completed'),
 (22,3,'2025-08-05','Firmware update','Completed'),
 (23,4,'2025-09-10','Replaced fuse','In Progress'),
 (24,5,'2025-09-12','Full diagnostic','Completed'),
 (25,6,'2025-09-20','Calibration','Completed'),
 (26,2,'2025-10-02','Network reconfigure','Completed'),
 (27,7,'2025-10-03','Filter replacement','Pending'),
 (28,8,'2025-10-04','Power module replacement','Completed'),
 (29,9,'2025-10-07','Inspection','Completed'),
 (30,10,'2025-10-10','Routine check','Completed');
GO

------------------------------------------------------------
-- 21) NOTIFICATION (10 rows) notification_id = 1..10
------------------------------------------------------------
INSERT INTO Notification (user_id, charging_session_id, message,
                          reservation_id, payment_id, date_sent) VALUES
 (1,1,'Your charging session completed successfully',1,1,'2025-10-01 09:05:00'),
 (2,2,'Payment received',2,2,'2025-10-02 19:05:00'),
 (3,3,'Reservation cancelled',3,3,'2025-10-05 09:10:00'),
 (4,4,'Invoice pending payment',4,4,'2025-11-01 20:10:00'),
 (5,5,'Station maintenance scheduled',5,5,'2025-09-20 23:10:00'),
 (6,6,'Charging session completed',6,6,'2025-09-25 08:10:00'),
 (7,7,'Reservation confirmed',7,7,'2025-10-10 16:05:00'),
 (8,8,'Your subscription renewed',8,8,'2025-10-12 11:05:00'),
 (9,9,'Invoice sent',9,9,'2025-10-14 13:05:00'),
 (10,10,'Payment completed',10,10,'2025-11-05 07:05:00');
GO

PRINT 'All tables populated with at least 10 rows.';
GO

-- End of EVChargingSystem_INSERT.sql   

SELECT * FROM Charging_Session;
