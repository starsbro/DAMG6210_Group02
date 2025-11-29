-- encryption_script.sql


USE [EVChargingSystem];
GO

-- =============================================
-- 1. SETUP: Database Master Key
-- This is the root of the encryption hierarchy. It protects the certificate.
-- The password should be replaced with a strong, complex password in a production environment.
-- =============================================
CREATE MASTER KEY ENCRYPTION BY PASSWORD = N'Abc12345!';
GO

-- =============================================
-- 2. SETUP: Certificate
-- The Certificate is used to protect the Symmetric Key.
-- =============================================
CREATE CERTIFICATE CardDataCertificate
WITH SUBJECT = 'Certificate for encrypting credit and debit card numbers';
GO

-- =============================================
-- 3. SETUP: Symmetric Key
-- The Symmetric Key performs the actual data encryption/decryption. It is protected by the Certificate.
-- Using AES 256 for strong encryption.
-- =============================================
CREATE SYMMETRIC KEY CardDataSymmetricKey
WITH ALGORITHM = AES_256
ENCRYPTION BY CERTIFICATE CardDataCertificate;
GO

-- =============================================
-- 4. ENCRYPTION: Encrypt Existing Data
-- NOTE: In a real system, you would typically change the column type to VARBINARY 
-- to hold the encrypted data. We will use the ENCRYPTBYKEY() function to update 
-- the existing NVARCHAR columns, but this method is less ideal than VARBINARY.
-- For a robust solution, the tables would need ALTER to VARBINARY, but 
-- to maintain the original DDL structure, we use the existing NVARCHAR columns.
-- =============================================

-- Open the Symmetric Key before performing encryption
OPEN SYMMETRIC KEY CardDataSymmetricKey
DECRYPTION BY CERTIFICATE CardDataCertificate;
GO

-- 4a. Encrypt the Credit_Card card_number column
PRINT 'Encrypting Credit Card Numbers...';
UPDATE Credit_Card
SET card_number = CONVERT(NVARCHAR(20), EncryptByKey(Key_GUID('CardDataSymmetricKey'), CONVERT(VARBINARY(MAX), card_number)));
GO

-- 4b. Encrypt the Debit_Card card_number column
PRINT 'Encrypting Debit Card Numbers...';
UPDATE Debit_Card
SET card_number = CONVERT(NVARCHAR(20), EncryptByKey(Key_GUID('CardDataSymmetricKey'), CONVERT(VARBINARY(MAX), card_number)));
GO

-- 5. TEARDOWN: Close the Symmetric Key
-- Always close the key after use for security.
CLOSE SYMMETRIC KEY CardDataSymmetricKey;
GO

-- =============================================
-- 6. Store Procedure for Encrypting New Inserts
-- Example function (used internally by stored procedures) to ensure new data is encrypted.
-- =============================================
IF OBJECT_ID('storedProcedures_EncryptCardNumber') IS NOT NULL
    DROP PROCEDURE storedProcedures_EncryptCardNumber;
GO

CREATE PROCEDURE storedProcedures_EncryptCardNumber
    @CardNumber_PlainText NVARCHAR(20),
    @CardNumber_Encrypted NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- 1. Open the Symmetric Key (Allowed in a stored procedure)
        OPEN SYMMETRIC KEY CardDataSymmetricKey
        DECRYPTION BY CERTIFICATE CardDataCertificate;

        -- 2. Encrypt the value
        SELECT @CardNumber_Encrypted = CONVERT(NVARCHAR(MAX),
            EncryptByKey(Key_GUID('CardDataSymmetricKey'), CONVERT(VARBINARY(MAX), @CardNumber_PlainText)));

        -- 3. Close the Symmetric Key
        CLOSE SYMMETRIC KEY CardDataSymmetricKey;
    END TRY
    BEGIN CATCH
        -- Ensure the key is closed on error
        IF EXISTS (SELECT * FROM sys.openkeys WHERE key_name = 'CardDataSymmetricKey')
            CLOSE SYMMETRIC KEY CardDataSymmetricKey;

        THROW; -- Re-raise the error
        RETURN;
    END CATCH
END
GO

PRINT 'Encryption setup complete. Sensitive card numbers have been encrypted.';