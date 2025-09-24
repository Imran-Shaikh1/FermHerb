import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { qr_code } = await req.json();
    
    if (!qr_code) {
      return new Response(
        JSON.stringify({ error: 'QR code is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Fetching provenance for QR: ${qr_code}`);

    // Get product information
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        herbs (
          name,
          scientific_name,
          conservation_status
        )
      `)
      .eq('qr_code', qr_code)
      .single();

    if (productError || !product) {
      console.log('Product not found:', productError);
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get blockchain events for this batch
    const { data: events, error: eventsError } = await supabase
      .from('blockchain_events')
      .select(`
        *,
        users (name, role, location, contact_info)
      `)
      .eq('batch_id', product.batch_id)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch blockchain events' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform GPS coordinates from point to lat/lng objects
    const transformedEvents = (events || []).map(event => {
      let transformedEvent = { ...event };
      
      if (event.gps_coordinates) {
        try {
          // Handle PostgreSQL point format like "(longitude,latitude)"
          const coordString = event.gps_coordinates.toString();
          const cleanCoord = coordString.replace(/[()]/g, '');
          const [lng, lat] = cleanCoord.split(',').map(coord => parseFloat(coord.trim()));
          
          if (!isNaN(lat) && !isNaN(lng)) {
            transformedEvent.coordinates = { lat, lng };
          }
        } catch (error) {
          console.warn('Failed to parse GPS coordinates:', error);
          transformedEvent.coordinates = null;
        }
      }
      
      return transformedEvent;
    });

    // Build provenance object
    const provenance = {
      product: {
        id: product.id,
        product_name: product.product_name,
        batch_id: product.batch_id,
        qr_code: product.qr_code,
        manufacturing_date: product.manufacturing_date,
        expiry_date: product.expiry_date,
        final_tests_passed: product.final_tests_passed,
        herbs: product.herbs
      },
      events: transformedEvents,
      summary: {
        total_events: transformedEvents.length,
        harvest_date: transformedEvents.find(e => e.event_type === 'harvest')?.created_at,
        quality_tests_passed: transformedEvents
          .filter(e => e.event_type === 'quality_test')
          .every(e => e.metadata?.test_result !== 'fail'),
        is_valid_batch: transformedEvents.every(e => e.is_valid === true)
      }
    };

    console.log(`Successfully fetched provenance for ${qr_code}`);

    return new Response(
      JSON.stringify(provenance),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});