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

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const { image, mediaType } = await req.json()

  if (!image || !mediaType) {
    return new Response(JSON.stringify({ error: 'image and mediaType are required' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }

  const prompt = `This is a photo of a computer, laptop, or its label/sticker.
Extract the following information if visible:
- model_name: the full model name (e.g. "Dell Inspiron 15 3520", "HP ProBook 450 G8", "Lenovo IdeaPad S340")
- serial_number: the serial number (labeled S/N, Serial No, or similar)
- manufacturer: the brand name (Dell, HP, Lenovo, Apple, Asus, Acer, etc.)

Return ONLY a valid JSON object with exactly these three fields, nothing else:
{"model_name": "", "serial_number": "", "manufacturer": ""}

If a field is not visible or readable, leave it as an empty string.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: image },
          },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    return new Response(JSON.stringify({ error: 'Claude API error', detail: err }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 502,
    })
  }

  const result = await response.json()
  const text = result.content?.[0]?.text ?? '{}'

  let extracted = { model_name: '', serial_number: '', manufacturer: '' }
  try {
    extracted = JSON.parse(text)
  } catch {
    // try to find JSON inside the text if Claude added extra words
    const match = text.match(/\{[^}]+\}/)
    if (match) extracted = JSON.parse(match[0])
  }

  return new Response(JSON.stringify(extracted), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
