--indexes_script.sql


USE [EVChargingSystem];
GO

-- =============================================
-- Non-Clustered Indexes (3 required)
-- =============================================

-- 1. Index on Person_Address for efficient lookups by address type and joining
-- This is useful for quickly finding all 'Billing' or 'Home' addresses for a person.
CREATE NONCLUSTERED INDEX Index_PersonAddress_Type
ON Person_Address (address_type, person_id);
GO

-- 2. Index on Charging_Session for filtering and sorting by End Time
-- This is crucial for reports and analyses that look at recent sessions or sessions completed within a time range.
CREATE NONCLUSTERED INDEX IndexChargingSession_EndTime
ON Charging_Session (end_time DESC); -- Use DESC for typical "most recent" queries
GO

-- 3. Index on Vehicle for quick lookups by connector type
-- This helps in matching vehicles to compatible charge points and for fleet/user reporting.
CREATE NONCLUSTERED INDEX Index_Vehicle_ConnectorType
ON Vehicle (connector_type);
GO

-- =============================================
-- Additional Performance Indexes (Recommended)
-- =============================================

-- 4. Foreign Key Index: Reservation on Charge_Point_ID
-- Reservations are often checked against specific charge points to manage availability.
CREATE NONCLUSTERED INDEX Index_Reservation_ChargePoint
ON Reservation (charge_point_id);
GO

-- 5. Foreign Key Index: User_Subscription on Plan_ID
-- Useful for quickly identifying all users on a specific subscription plan.
CREATE NONCLUSTERED INDEX Index_UserSubscription_Plan
ON User_Subscription (plan_id);
GO

-- 6. Index on Invoice for quick lookups by Issue Date
-- Important for monthly/quarterly financial reporting.
CREATE NONCLUSTERED INDEX Index_Invoice_IssueDate
ON Invoice (issue_date);
GO

PRINT 'All required and recommended non-clustered indexes have been created.';