import { serve } from "https://deno.fresh.run/std@v9.6.1/http/server.ts";

serve(async (req) => {
  try {
    const { name } = await req.json();
    const secret = Deno.env.get(name);
    
    if (!secret) {
      return new Response(
        JSON.stringify({ error: `Secret ${name} not found` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ secret }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});