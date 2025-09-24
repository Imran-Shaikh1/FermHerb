import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { batchId, herbName, farmerId, gpsCoordinates, metadata } = await req.json()

    console.log('Creating harvest event:', { batchId, herbName, farmerId, gpsCoordinates })

    // Get herb ID
    const { data: herb } = await supabase
      .from('herbs')
      .select('id')
      .eq('name', herbName)
      .single()

    if (!herb) {
      throw new Error('Herb not found')
    }

    // Get farmer/user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('name', farmerId)
      .single()

    if (!user) {
      throw new Error('Farmer not found')
    }

    // Create blockchain event
    const { data: event, error } = await supabase
      .from('blockchain_events')
      .insert({
        event_type: 'harvest',
        herb_id: herb.id,
        batch_id: batchId,
        user_id: user.id,
        gps_coordinates: `(${gpsCoordinates.lat},${gpsCoordinates.lng})`,
        metadata: {
          ...metadata,
          temperature: metadata.temperature || '25°C',
          humidity: metadata.humidity || '60%',
          soil_condition: metadata.soil_condition || 'Good'
        }
      })
      .select()
      .single()

    console.log('Harvest event created:', event)

    return new Response(
      JSON.stringify({ success: true, event }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating harvest event:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})