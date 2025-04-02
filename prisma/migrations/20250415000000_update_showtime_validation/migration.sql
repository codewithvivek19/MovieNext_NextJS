-- Convert existing time values to the consistent format if needed
-- This script helps standardize time formats in the database

-- First, create a temporary function to check and convert time formats
CREATE OR REPLACE FUNCTION format_time_consistently() RETURNS void AS $$
DECLARE
    showtime_record RECORD;
BEGIN
    -- Iterate through all showtimes
    FOR showtime_record IN SELECT id, time FROM "Showtime" LOOP
        -- If time contains AM/PM, it's already in 12-hour format
        IF showtime_record.time LIKE '%AM%' OR showtime_record.time LIKE '%PM%' THEN
            -- Already in the expected format, no action needed
            CONTINUE;
        -- If time matches HH:MM pattern (24-hour format)
        ELSIF showtime_record.time ~ '^\d{1,2}:\d{2}$' THEN
            -- Parse hours and minutes
            DECLARE
                hours INTEGER := CAST(SPLIT_PART(showtime_record.time, ':', 1) AS INTEGER);
                minutes TEXT := SPLIT_PART(showtime_record.time, ':', 2);
                new_time TEXT;
                period TEXT;
            BEGIN
                -- Determine AM/PM
                IF hours >= 12 THEN
                    period := 'PM';
                    IF hours > 12 THEN
                        hours := hours - 12;
                    END IF;
                ELSE
                    period := 'AM';
                    IF hours = 0 THEN
                        hours := 12;
                    END IF;
                END IF;
                
                -- Format the new time
                new_time := hours || ':' || minutes || ' ' || period;
                
                -- Update the record
                UPDATE "Showtime" SET time = new_time WHERE id = showtime_record.id;
            END;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT format_time_consistently();

-- Drop the function after use
DROP FUNCTION format_time_consistently();

-- Set all dates to have zeroed time component
UPDATE "Showtime"
SET date = DATE_TRUNC('day', date);

-- Update format values to be within allowed options if needed
UPDATE "Showtime"
SET format = 'standard'
WHERE format NOT IN ('standard', 'premium', 'imax', 'vip');

-- Add a comment to the Showtime table
COMMENT ON TABLE "Showtime" IS 'Contains movie screening schedule with consistent time formats';
COMMENT ON COLUMN "Showtime"."time" IS 'Time format should be H:MM AM/PM (12-hour)';
COMMENT ON COLUMN "Showtime"."format" IS 'Valid formats: standard, premium, imax, vip';
COMMENT ON COLUMN "Showtime"."date" IS 'Date with zeroed time component (00:00:00)'; 