// @ts-nocheck
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const serial = url.searchParams.get('serial')?.trim()

  if (!serial) {
    return new Response(JSON.stringify({ error: 'serial is required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  const brand = detectBrand(serial)
  let modelName: string | null = null

  try {
    if (brand === 'lenovo') modelName = await lookupLenovo(serial)
    else if (brand === 'dell')   modelName = await lookupDell(serial)
  } catch (e) {
    console.error('Lookup error:', e)
  }

  return new Response(JSON.stringify({ modelName, brand }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

function detectBrand(serial: string): string | null {
  // Lenovo product IDs: start with 2 digits then 2 uppercase letters, 8+ chars
  if (/^\d{2}[A-Z]{2}/.test(serial) && serial.length >= 8) return 'lenovo'
  // Dell service tags: 5-7 uppercase alphanumeric chars
  if (/^[A-Z0-9]{5,7}$/.test(serial)) return 'dell'
  // HP serial numbers: 3 letters then digits, 10+ chars
  if (/^[A-Z]{3}\d/.test(serial) && serial.length >= 10) return 'hp'
  // Apple: 11-12 chars uppercase alphanumeric
  if (/^[A-Z0-9]{11,12}$/.test(serial)) return 'apple'
  return null
}

async function lookupLenovo(serial: string): Promise<string | null> {
  const res = await fetch(
    `https://pcsupport.lenovo.com/us/en/api/v4/mse/getproducts?productId=${encodeURIComponent(serial)}`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data[0]?.Name ?? null
}

async function lookupDell(serial: string): Promise<string | null> {
  const clientId = Deno.env.get('DELL_CLIENT_ID')
  const clientSecret = Deno.env.get('DELL_CLIENT_SECRET')

  // Dell API requires OAuth2 credentials — skip if not configured
  if (!clientId || !clientSecret) {
    console.log('Dell API credentials not configured')
    return null
  }

  // Get access token
  const tokenRes = await fetch('https://apigtwb2c.us.dell.com/auth/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}&grant_type=client_credentials`,
  })
  if (!tokenRes.ok) return null
  const { access_token } = await tokenRes.json()

  // Look up product by service tag
  const res = await fetch(
    `https://apigtwb2c.us.dell.com/support/assetinfo/v4/getassetwarranty/${encodeURIComponent(serial)}`,
    { headers: { Authorization: `Bearer ${access_token}`, Accept: 'application/json' } }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data?.AssetWarrantyResponse?.[0]?.AssetHeaderData?.SystemDescription ?? null
}
