--psm_script.sql


-- At least 3 stored procedures with input and output parameters, transaction management, 
-- and error handling (e.g., using TRY...CATCH blocks).

-- =============================================
-- 1. storedProcedures_ProcessChargingSession
-- Records a new charging session, updates charge point status, and creates an invoice.
-- Input: All session and invoice details.
-- Output: @NewSessionId (INT), @NewInvoiceId (INT).
-- =============================================
USE [EVChargingSystem];
GO
CREATE OR ALTER PROCEDURE storedProcedures_ProcessChargingSession
    @UserId INT,
    @UserSubscriptionId INT,
    @VehicleId INT,
    @ChargePointId INT,
    @StartTime DATETIME,
    @EndTime DATETIME,
    @EnergyConsumed DECIMAL(8,2),
    @TotalCost DECIMAL(10,2),
    @BillingAddressId INT = NULL, -- Optional billing address
    @NewSessionId INT OUTPUT,
    @NewInvoiceId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the Charge Point is available (optional business rule check)
    IF (SELECT status FROM Charge_Point WHERE charge_point_id = @ChargePointId) NOT IN ('In Use', 'Available')
    BEGIN
        RAISERROR('Charge Point is not in a valid state (In Use or Available) to log a new session.', 16, 1);
        RETURN;
    END

    -- Start Transaction
    BEGIN TRANSACTION;

    BEGIN TRY
        -- 1. Insert the new Charging Session
        INSERT INTO Charging_Session (user_subscription_id, vehicle_id, charge_point_id, start_time, end_time, energy_consumed, total_cost)
        VALUES (@UserSubscriptionId, @VehicleId, @ChargePointId, @StartTime, @EndTime, @EnergyConsumed, @TotalCost);

        SET @NewSessionId = SCOPE_IDENTITY();

        -- 2. Update the Charge Point status (e.g., to Available after the session)
        UPDATE Charge_Point
        SET status = 'Available' -- Assuming the session is a completed record
        WHERE charge_point_id = @ChargePointId;

        -- 3. Create the Invoice for the session
        INSERT INTO Invoice (user_id, issue_date, total_amount, billing_address_id, user_subscription_id, charging_session_id)
        VALUES (@UserId, CAST(GETDATE() AS DATE), @TotalCost, @BillingAddressId, @UserSubscriptionId, @NewSessionId);

        SET @NewInvoiceId = SCOPE_IDENTITY();

        -- Commit the transaction if all steps succeed
        COMMIT TRANSACTION;
    END TRY

    BEGIN CATCH
        -- If any error occurs, rollback the transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        -- Raise an error message
        THROW;
        RETURN;
    END CATCH
END
GO

-- =============================================
-- 2. storedProcedures_UpdateChargePointStatus
-- Updates the status of a specific charge point.
-- Input: @ChargePointId (INT), @NewStatus (NVARCHAR).
-- Output: None.
-- =============================================
GO
CREATE OR ALTER PROCEDURE storedProcedures_UpdateChargePointStatus
    @ChargePointId INT,
    @NewStatus NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the Charge Point exists
    IF NOT EXISTS (SELECT 1 FROM Charge_Point WHERE charge_point_id = @ChargePointId)
    BEGIN
        RAISERROR('Charge Point ID %d not found.', 16, 1, @ChargePointId);
        RETURN;
    END

    -- Check if the New Status is valid (using the table's CHECK constraint values)
    IF @NewStatus NOT IN ('Available', 'In Use', 'Out of Service')
    BEGIN
        RAISERROR('Invalid status provided. Must be one of: Available, In Use, Out of Service.', 16, 1);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Update the status
        UPDATE Charge_Point
        SET status = @NewStatus
        WHERE charge_point_id = @ChargePointId;

        -- Commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- If any error occurs, rollback the transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Raise an error message
        THROW;
        RETURN;
    END CATCH
END
GO

-- =============================================
-- 3. storedProcedures_AssignTechnicianToMaintenance
-- Assigns a technician to a maintenance record and sets the status to 'In Progress'.
-- Input: @RecordId (INT), @TechnicianId (INT).
-- Output: None.
-- =============================================
GO
CREATE OR ALTER PROCEDURE storedProcedures_AssignTechnicianToMaintenance
    @RecordId INT,
    @TechnicianId INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the Maintenance Record is valid
    IF NOT EXISTS (SELECT 1 FROM Maintenance_Record WHERE record_id = @RecordId)
    BEGIN
        RAISERROR('Maintenance Record ID %d not found.', 16, 1, @RecordId);
        RETURN;
    END

    -- Check if the Technician is valid
    IF NOT EXISTS (SELECT 1 FROM Technician WHERE technician_id = @TechnicianId)
    BEGIN
        RAISERROR('Technician ID %d not found.', 16, 1, @TechnicianId);
        RETURN;
    END

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Update the Maintenance Record
        UPDATE Maintenance_Record
        SET
            technician_id = @TechnicianId,
            status = 'In Progress'
        WHERE record_id = @RecordId
        AND status IN ('Pending', 'In Progress'); -- Only update if not already completed/failed

        -- Commit the transaction
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- If any error occurs, rollback the transaction
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        -- Raise an error message
        THROW;
        RETURN;
    END CATCH
END
GO



-- At least 3 user-defined functions (UDFs)
-- =============================================
-- 1. function_CalculateReservationDurationMinutes (Scalar Function)
-- Calculates the duration of a reservation in minutes.
-- =============================================
GO
CREATE OR ALTER FUNCTION function_CalculateReservationDurationMinutes
(
    @StartTime DATETIME2,
    @EndTime DATETIME2
)
RETURNS INT
AS
BEGIN
    RETURN DATEDIFF(MINUTE, @StartTime, @EndTime);
END
GO


-- =============================================
-- 2. function_GetTotalUserEnergyConsumption (Scalar Function)
-- Calculates the total energy consumed by a specific user (kWh).
-- =============================================
GO
CREATE OR ALTER FUNCTION function_GetTotalUserEnergyConsumption
(
    @UserId INT
)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @TotalConsumption DECIMAL(10,2);

    SELECT @TotalConsumption = SUM(CS.energy_consumed)
    FROM Charging_Session CS
    INNER JOIN User_Subscription US ON CS.user_subscription_id = US.user_subscription_id
    WHERE US.user_id = @UserId;

    -- Handle NULL case
    RETURN ISNULL(@TotalConsumption, 0.00);
END
GO

-- =============================================
-- 3. function_GetTechnicianSkills (Table-Valued Function)
-- Returns a list of skills for a given technician ID.
-- =============================================
GO
CREATE OR ALTER FUNCTION function_GetTechnicianSkills
(
    @TechnicianId INT
)
RETURNS TABLE
AS
RETURN
(
    SELECT
        S.skill_name,
        S.description
    FROM Technician_Skill TS
    INNER JOIN Skill S ON TS.skill_id = S.skill_id
    WHERE TS.technician_id = @TechnicianId
);
GO


-- At least 3 views, commonly used for reporting purposes.

-- =============================================
-- 1. view_MonthlyChargingReport
-- Provides a monthly aggregate report of sessions, energy, and total cost per station.
-- =============================================
GO
CREATE VIEW view_MonthlyChargingReport AS
SELECT
    FORMAT(CS.start_time, 'yyyy-MM') AS ChargingMonth,
    S.station_name,
    COUNT(CS.session_id) AS TotalSessions,
    SUM(CS.energy_consumed) AS TotalEnergy_kWh,
    SUM(CS.total_cost) AS TotalRevenue
FROM Charging_Session CS
INNER JOIN Charge_Point CP ON CS.charge_point_id = CP.charge_point_id
INNER JOIN Station S ON CP.station_id = S.station_id
GROUP BY FORMAT(CS.start_time, 'yyyy-MM'), S.station_name;
GO

-- =============================================
-- 2. view_ActiveUserSubscriptions
-- Lists all users with their currently active subscription details.
-- =============================================
GO
CREATE VIEW view_ActiveUserSubscriptions AS
SELECT
    P.first_name,
    P.last_name,
    P.email,
    SP.plan_name,
    US.start_date,
    SP.monthly_fee,
    SP.discount_rate
FROM [User] U
INNER JOIN Person P ON U.user_id = P.person_id
INNER JOIN User_Subscription US ON U.user_id = US.user_id
INNER JOIN Subscription_Plan SP ON US.plan_id = SP.plan_id
WHERE US.end_date IS NULL OR US.end_date >= CAST(GETDATE() AS DATE);
GO

-- =============================================
-- 3. view_ChargePointStatusSummary
-- Provides a summary of each charge point, including its station location and current status.
-- =============================================
GO
CREATE VIEW view_ChargePointStatusSummary AS
SELECT
    CP.charge_point_id,
    S.station_name,
    A.city,
    CP.charger_type,
    CP.power_rating,
    CP.status
FROM Charge_Point CP
INNER JOIN Station S ON CP.station_id = S.station_id
INNER JOIN Address A ON S.address_id = A.address_id;
GO


-- At least 1 DML trigger

-- =============================================
-- DML Trigger: trigger_UpdateReservationOnSessionInsert
-- Updates the status of an associated reservation to 'Completed'
-- when a new Charging_Session is inserted.
-- =============================================
GO
CREATE TRIGGER trigger_UpdateReservationOnSessionInsert
ON Charging_Session
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Update Reservation status for any new session that matches a Confirmed reservation's time/location
    -- NOTE: A perfect match requires more complex logic (user, CP, time), but we simplify for demonstration.
    -- Assuming a one-to-one or one-to-many relationship where we can infer the reservation.

    -- For this example, we'll try to match a completed session to a 'Confirmed' reservation
    -- that has the same Charge Point ID and overlaps significantly in time.
    UPDATE R
    SET status = 'Completed'
    FROM Reservation R
    INNER JOIN inserted I ON R.charge_point_id = I.charge_point_id
    WHERE R.status = 'Confirmed'
      AND I.start_time >= R.start_time
      AND I.end_time <= R.end_time; -- Simplified time overlap for existing data
END
GO