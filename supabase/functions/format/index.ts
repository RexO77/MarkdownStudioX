
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { content } = await req.json()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not found in environment')
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY is not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Formatting content with GROQ API...')

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'system',
            content: `You are a Markdown formatting expert that makes content engaging and intuitive. 
              Format the given Markdown text following these guidelines:
              1. Add emojis directly using Unicode characters (e.g., "📚 Getting Started" not ":book: Getting Started")
              2. Use emojis extensively but appropriately for headers and key points
              3. Correct any spelling or grammar mistakes
              4. Format code blocks with proper syntax highlighting
              5. Structure the content similar to popular GitHub README.md files
              6. Use clear hierarchical organization with proper heading levels
              7. Add emphasis (bold/italic) for important points
              8. Ensure proper spacing and readability
              9. Convert plain URLs to proper markdown links
              10. Keep the content professional but engaging
              11. Add table of contents for longer documents
              12. Use badges where appropriate (e.g., version, status)
              
              Important: Always use actual Unicode emoji characters, never use emoji shortcodes or text representations.
              Example: Use "# 📝 Introduction" not "# :pencil: Introduction"`
          },
          {
            role: 'user',
            content: `Please format this markdown content:\n\n${content}`
          }
        ],
        temperature: 1,
        max_tokens: 32768,
        top_p: 1,
        stream: false,
        stop: null
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('GROQ API Error:', response.status, errorText)
      return new Response(
        JSON.stringify({ error: `GROQ API Error: ${response.status}` }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const data = await response.json()
    const formattedContent = data.choices[0].message.content

    console.log('Content formatted successfully')

    return new Response(
      JSON.stringify({ formattedContent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in format function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
