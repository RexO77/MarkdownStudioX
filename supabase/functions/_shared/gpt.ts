export async function gptFormat(content: string): Promise<string> {
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set')
  }

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
    throw new Error('Failed to format content with GPT')
  }

  const data = await response.json()
  return data.choices[0].message.content
}