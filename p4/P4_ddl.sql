-- =============================================
-- DATABASE CREATION
-- =============================================
USE master;
GO

IF DB_ID('EVChargingSystem') IS NOT NULL
BEGIN
    ALTER DATABASE EVChargingSystem SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE EVChargingSystem;
END
GO

CREATE DATABASE EVChargingSystem;
GO

USE EVChargingSystem;
GO

-- =============================================
-- ADDRESS AND PERSON RELATIONSHIP
-- =============================================
CREATE TABLE Address
(
    address_id INT IDENTITY(1,1) PRIMARY KEY,
    street NVARCHAR(100) NOT NULL,
    city NVARCHAR(50) NOT NULL,
    state NVARCHAR(50) NOT NULL,
    postal_code NVARCHAR(15) NOT NULL,
    country NVARCHAR(50) NOT NULL
);

CREATE TABLE Person
(
    person_id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(100) UNIQUE NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL
);

-- Junction table for many-to-many between Person and Address
CREATE TABLE Person_Address
(
    person_id INT NOT NULL,
    address_id INT NOT NULL,
    address_type NVARCHAR(20) CHECK (address_type IN ('Home', 'Work', 'Billing')) NOT NULL,
    PRIMARY KEY (person_id, address_id),
    FOREIGN KEY (person_id) REFERENCES Person(person_id),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);
-- =============================================
-- STATION AND CHARGE POINT
-- =============================================
CREATE TABLE Station
(
    station_id INT IDENTITY(1,1) PRIMARY KEY,
    station_name NVARCHAR(100) NOT NULL,
    address_id INT NOT NULL,
    gps_coordinates NVARCHAR(50) NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NULL,
    CONSTRAINT chk_station_hours
        CHECK (
            (closing_time IS NULL) -- 24-hour station
        OR (closing_time > opening_time)  -- valid daily range
        ),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

CREATE TABLE Charge_Point
(
    charge_point_id INT IDENTITY(1,1) PRIMARY KEY,
    station_id INT NOT NULL,
    charger_type NVARCHAR(50) NOT NULL CHECK (charger_type IN ('Level 1', 'Level 2', 'DC Fast')),
    status NVARCHAR(20) NOT NULL CHECK (status IN ('Available', 'In Use', 'Out of Service')),
    power_rating DECIMAL(6,2) NOT NULL,
    FOREIGN KEY (station_id) REFERENCES Station(station_id)
);

-- =============================================
-- PERSON SUBTYPES: USER, OPERATOR, TECHNICIAN
-- =============================================
CREATE TABLE [User]
(
    user_id INT PRIMARY KEY,
    account_type NVARCHAR(20) NOT NULL CHECK (account_type IN ('Standard', 'Premium')),
    FOREIGN KEY (user_id) REFERENCES Person(person_id)
);

CREATE TABLE Operator
(
    operator_id INT PRIMARY KEY,
    station_id INT NOT NULL,
    FOREIGN KEY (operator_id) REFERENCES Person(person_id),
    FOREIGN KEY (station_id) REFERENCES Station(station_id)
);

CREATE TABLE Technician
(
    technician_id INT PRIMARY KEY,
    FOREIGN KEY (technician_id) REFERENCES Person(person_id)
);


-- =============================================
-- VEHICLE
-- =============================================
CREATE TABLE Vehicle
(
    vehicle_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    license_plate NVARCHAR(20) UNIQUE NOT NULL,
    brand NVARCHAR(50),
    model NVARCHAR(50),
    battery_capacity DECIMAL(8,2),
    connector_type NVARCHAR(50) NOT NULL CHECK (connector_type IN ('Type 1', 'Type 2', 'CHAdeMO', 'CCS')),
    FOREIGN KEY (user_id) REFERENCES [User](user_id)
);

-- =============================================
-- SUBSCRIPTION PLAN AND USER SUBSCRIPTION
-- =============================================
CREATE TABLE Subscription_Plan
(
    plan_id INT IDENTITY(1,1) PRIMARY KEY,
    plan_name NVARCHAR(50) NOT NULL,
    plan_description NVARCHAR(255) NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL,
    discount_rate DECIMAL(4,2) NOT NULL
);

CREATE TABLE User_Subscription
(
    user_subscription_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (user_id) REFERENCES [User](user_id),
    FOREIGN KEY (plan_id) REFERENCES Subscription_Plan(plan_id)
);

-- =============================================
-- RESERVATION
-- =============================================
CREATE TABLE Reservation
(
    reservation_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    charge_point_id INT NOT NULL,
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
    status NVARCHAR(20) CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')) DEFAULT 'Pending' NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [User](user_id),
    FOREIGN KEY (charge_point_id) REFERENCES Charge_Point(charge_point_id)
);

-- =============================================
-- CHARGING SESSION
-- =============================================
CREATE TABLE Charging_Session
(
    session_id INT IDENTITY(1,1) PRIMARY KEY,
    user_subscription_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    charge_point_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    energy_consumed DECIMAL(8,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (user_subscription_id) REFERENCES User_Subscription(user_subscription_id),
    FOREIGN KEY (vehicle_id) REFERENCES Vehicle(vehicle_id),
    FOREIGN KEY (charge_point_id) REFERENCES Charge_Point(charge_point_id)
);

-- =============================================
-- PAYMENT METHOD SUPERTYPE AND SUBTYPES
-- =============================================
CREATE TABLE Payment_Method
(
    payment_method_id INT IDENTITY(1,1) PRIMARY KEY,
    method_type NVARCHAR(20) NOT NULL CHECK (method_type IN ('Credit Card', 'Debit Card', 'Wallet')),
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [User](user_id)
);

CREATE TABLE Credit_Card
(
    payment_method_id INT PRIMARY KEY,
    card_number NVARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL,
    card_holder_name NVARCHAR(100),
    FOREIGN KEY (payment_method_id) REFERENCES Payment_Method(payment_method_id)
);

CREATE TABLE Debit_Card
(
    payment_method_id INT PRIMARY KEY,
    card_number NVARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL,
    card_holder_name NVARCHAR(100),
    FOREIGN KEY (payment_method_id) REFERENCES Payment_Method(payment_method_id)
);

CREATE TABLE Wallet
(
    payment_method_id INT PRIMARY KEY,
    wallet_provider NVARCHAR(50),
    wallet_account NVARCHAR(100),
    FOREIGN KEY (payment_method_id) REFERENCES Payment_Method(payment_method_id)
);

-- =============================================
-- INVOICE AND PAYMENT (OPTIONAL 1-TO-1 WITH ADDRESS)
-- =============================================
CREATE TABLE Invoice
(
    invoice_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    issue_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    billing_address_id INT NULL,
    user_subscription_id INT NULL,
    charging_session_id INT NOT NULL UNIQUE,
    FOREIGN KEY (user_id) REFERENCES [User](user_id),
    FOREIGN KEY (user_subscription_id) REFERENCES User_Subscription(user_subscription_id),
    FOREIGN KEY (charging_session_id) REFERENCES Charging_Session(session_id),
    FOREIGN KEY (billing_address_id) REFERENCES Address(address_id)
        ON DELETE SET NULL
);

CREATE TABLE Payment
(
    payment_id INT IDENTITY(1,1) PRIMARY KEY,
    invoice_id INT NOT NULL,
    payment_method_id INT NOT NULL,
    payment_date DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    amount DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) CHECK (status IN ('Completed', 'Pending', 'Failed')) DEFAULT 'Pending' NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES Invoice(invoice_id) ,
    FOREIGN KEY (payment_method_id) REFERENCES Payment_Method(payment_method_id)
);

-- =============================================
-- SKILL AND TECHNICIAN-SKILL (M:N)
-- =============================================
CREATE TABLE Skill
(
    skill_id INT IDENTITY(1,1) PRIMARY KEY,
    skill_name NVARCHAR(100) UNIQUE NOT NULL,
    description NVARCHAR(255)
);

CREATE TABLE Technician_Skill
(
    technician_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (technician_id, skill_id),
    FOREIGN KEY (technician_id) REFERENCES Technician(technician_id),
    FOREIGN KEY (skill_id) REFERENCES Skill(skill_id)
);

-- =============================================
-- MAINTENANCE RECORD
-- =============================================
CREATE TABLE Maintenance_Record
(
    record_id INT IDENTITY(1,1) PRIMARY KEY,
    technician_id INT NOT NULL,
    charge_point_id INT NOT NULL,
    maintenance_date DATE NOT NULL,
    description NVARCHAR(255),
    status NVARCHAR(20) CHECK (status IN ('Completed', 'Pending', 'In Progress')),
    FOREIGN KEY (technician_id) REFERENCES Technician(technician_id),
    FOREIGN KEY (charge_point_id) REFERENCES Charge_Point(charge_point_id)
);

-- =============================================
-- NOTIFICATION
-- =============================================
CREATE TABLE Notification
(
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    charging_session_id INT,
    message NVARCHAR(255),
    reservation_id INT,
    payment_id INT,
    date_sent DATETIME2 DEFAULT SYSDATETIME(),
    FOREIGN KEY (user_id) REFERENCES [User](user_id),
    FOREIGN KEY (charging_session_id) REFERENCES Charging_Session(session_id),
    FOREIGN KEY (reservation_id) REFERENCES Reservation(reservation_id),
    FOREIGN KEY (payment_id) REFERENCES Payment(payment_id)
);
GO
