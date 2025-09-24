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

    const { batchId, labName, testResults } = await req.json()

    console.log('Creating quality test event:', { batchId, labName, testResults })

    // Get lab/user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('name', labName)
      .single()

    if (!user) {
      throw new Error('Lab not found')
    }

    // Get herb ID from previous event
    const { data: previousEvent } = await supabase
      .from('blockchain_events')
      .select('herb_id, block_hash')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!previousEvent) {
      throw new Error('No previous events found for this batch')
    }

    // Determine if tests passed
    const testPassed = testResults.moisture <= 12 && 
                      testResults.pesticide === 'Not Detected' && 
                      testResults.dna_authenticity === 'Confirmed'

    // Create blockchain event
    const { data: event, error } = await supabase
      .from('blockchain_events')
      .insert({
        event_type: 'quality_test',
        herb_id: previousEvent.herb_id,
        batch_id: batchId,
        user_id: user.id,
        previous_hash: previousEvent.block_hash,
        metadata: {
          test_result: testPassed ? 'pass' : 'fail',
          moisture_content: testResults.moisture,
          pesticide_residue: testResults.pesticide,
          dna_authenticity: testResults.dna_authenticity,
          test_date: new Date().toISOString(),
          certificate_number: `CERT-${batchId}-${Date.now()}`
        }
      })
      .select()
      .single()

    console.log('Quality test event created:', event)

    return new Response(
      JSON.stringify({ success: true, event, testPassed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating quality test event:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})