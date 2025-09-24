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

    const { batchId, productName, manufacturerName } = await req.json()

    console.log('Creating product:', { batchId, productName, manufacturerName })

    // Get manufacturer/user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('name', manufacturerName)
      .single()

    if (!user) {
      throw new Error('Manufacturer not found')
    }

    // Get latest event to check if quality tests passed
    const { data: events } = await supabase
      .from('blockchain_events')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: false })

    if (!events || events.length === 0) {
      throw new Error('No events found for this batch')
    }

    // Check if quality tests passed
    const qualityTestEvent = events.find(e => e.event_type === 'quality_test')
    const testsPassed = qualityTestEvent?.metadata?.test_result === 'pass'

    if (!testsPassed) {
      throw new Error('Cannot create product - quality tests failed or not completed')
    }

    const latestEvent = events[0]
    const qrCode = `QR-${batchId}-${Date.now()}`

    // Create manufacturing event first
    const { data: mfgEvent } = await supabase
      .from('blockchain_events')
      .insert({
        event_type: 'manufacturing',
        herb_id: latestEvent.herb_id,
        batch_id: batchId,
        user_id: user.id,
        previous_hash: latestEvent.block_hash,
        metadata: {
          product_name: productName,
          manufacturing_date: new Date().toISOString(),
          qr_code: qrCode,
          batch_size: '1000 units',
          formulation: 'Capsules'
        }
      })
      .select()
      .single()

    // Create product with QR code
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        qr_code: qrCode,
        batch_id: batchId,
        product_name: productName,
        herb_id: latestEvent.herb_id,
        manufacturer_id: user.id,
        manufacturing_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years
        final_tests_passed: true,
        blockchain_hash: mfgEvent.block_hash
      })
      .select()
      .single()

    console.log('Product created:', product)

    return new Response(
      JSON.stringify({ success: true, product, qrCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})