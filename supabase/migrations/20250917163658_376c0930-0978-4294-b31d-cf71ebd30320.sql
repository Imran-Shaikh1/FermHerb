-- Fix the remaining function security issue
CREATE OR REPLACE FUNCTION public.validate_blockchain_event()
RETURNS TRIGGER AS $$
DECLARE
    herb_record RECORD;
    validation_errors TEXT[] := '{}';
    is_valid_event BOOLEAN := true;
BEGIN
    -- Get herb information
    SELECT * INTO herb_record FROM public.herbs WHERE id = NEW.herb_id;
    
    -- Validate GPS coordinates for harvest events
    IF NEW.event_type = 'harvest' THEN
        -- Simple geo-fencing validation (mock implementation)
        IF NEW.gps_coordinates IS NULL THEN
            validation_errors := array_append(validation_errors, 'GPS coordinates required for harvest events');
            is_valid_event := false;
        END IF;
        
        -- Season validation (simplified)
        IF herb_record.harvest_season IS NOT NULL AND 
           EXTRACT(MONTH FROM NEW.timestamp) NOT IN (6, 7, 8, 9) THEN
            validation_errors := array_append(validation_errors, 'Harvest outside approved season');
            is_valid_event := false;
        END IF;
    END IF;
    
    -- Quality test validation
    IF NEW.event_type = 'quality_test' THEN
        IF NEW.metadata->>'test_result' = 'fail' THEN
            validation_errors := array_append(validation_errors, 'Quality test failed');
            is_valid_event := false;
        END IF;
    END IF;
    
    NEW.validation_errors := validation_errors;
    NEW.is_valid := is_valid_event;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql 
   SECURITY DEFINER 
   SET search_path = public;