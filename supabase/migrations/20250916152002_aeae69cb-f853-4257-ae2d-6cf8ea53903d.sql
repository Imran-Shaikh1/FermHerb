-- Create blockchain simulation tables for Ayurvedic herb traceability

-- Users table for different stakeholders
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'processor', 'lab', 'manufacturer', 'admin')),
    location TEXT,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Herbs master data
CREATE TABLE public.herbs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    scientific_name TEXT,
    harvest_season TEXT,
    approved_regions TEXT[],
    conservation_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Main blockchain events table
CREATE TABLE public.blockchain_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    block_hash TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    event_type TEXT NOT NULL CHECK (event_type IN ('harvest', 'processing', 'quality_test', 'manufacturing')),
    herb_id UUID REFERENCES public.herbs(id) NOT NULL,
    batch_id TEXT NOT NULL,
    user_id UUID REFERENCES public.users(id) NOT NULL,
    gps_coordinates POINT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL,
    previous_hash TEXT,
    is_valid BOOLEAN NOT NULL DEFAULT true,
    validation_errors TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Products table for final QR code generation
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    qr_code TEXT NOT NULL UNIQUE,
    batch_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    herb_id UUID REFERENCES public.herbs(id) NOT NULL,
    manufacturer_id UUID REFERENCES public.users(id) NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE,
    final_tests_passed BOOLEAN NOT NULL DEFAULT false,
    blockchain_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.herbs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for herbs (read-only for all)
CREATE POLICY "Herbs are viewable by everyone" ON public.herbs FOR SELECT USING (true);

-- RLS Policies for blockchain events
CREATE POLICY "Blockchain events are viewable by everyone" ON public.blockchain_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create blockchain events" ON public.blockchain_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for products
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Manufacturers can create products" ON public.products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Indexes for performance
CREATE INDEX idx_blockchain_events_batch_id ON public.blockchain_events(batch_id);
CREATE INDEX idx_blockchain_events_herb_id ON public.blockchain_events(herb_id);
CREATE INDEX idx_blockchain_events_timestamp ON public.blockchain_events(timestamp);
CREATE INDEX idx_products_qr_code ON public.products(qr_code);
CREATE INDEX idx_products_batch_id ON public.products(batch_id);

-- Function for blockchain validation
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
$$ LANGUAGE plpgsql;

-- Create trigger for blockchain validation
CREATE TRIGGER validate_blockchain_event_trigger
    BEFORE INSERT ON public.blockchain_events
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_blockchain_event();

-- Insert sample data
INSERT INTO public.herbs (name, scientific_name, harvest_season, approved_regions, conservation_status) VALUES
('Ashwagandha', 'Withania somnifera', 'Post-monsoon (Sep-Nov)', ARRAY['Rajasthan', 'Madhya Pradesh', 'Gujarat'], 'Least Concern'),
('Turmeric', 'Curcuma longa', 'Winter (Dec-Feb)', ARRAY['Karnataka', 'Tamil Nadu', 'Andhra Pradesh'], 'Least Concern'),
('Brahmi', 'Bacopa monnieri', 'Year-round', ARRAY['Kerala', 'Tamil Nadu', 'West Bengal'], 'Vulnerable');

-- Sample users (these will be created without auth.uid() for demo purposes)
INSERT INTO public.users (user_id, name, role, location, contact_info) VALUES
(gen_random_uuid(), 'Ravi Kumar', 'farmer', 'Rajasthan', '{"phone": "+91-9876543210", "village": "Jaipur District"}'),
(gen_random_uuid(), 'Ayur Processing Ltd', 'processor', 'Gujarat', '{"phone": "+91-9876543211", "address": "Ahmedabad Industrial Area"}'),
(gen_random_uuid(), 'Quality Labs Pvt Ltd', 'lab', 'Mumbai', '{"phone": "+91-9876543212", "certification": "NABL Accredited"}'),
(gen_random_uuid(), 'Himalaya Wellness', 'manufacturer', 'Bangalore', '{"phone": "+91-9876543213", "license": "AYUSH/MFG/2023/001"}');