import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    const secret = Deno.env.get(name);
    
    if (!secret) {
      return new Response(
        JSON.stringify({ error: `Secret ${name} not found` }),
        { status: 404, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ secret }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error in get-secret function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});