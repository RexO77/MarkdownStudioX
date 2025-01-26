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
            1. Add relevant emojis to headers and key points (use emojis extensively but appropriately)
            2. Correct any spelling or grammar mistakes
            3. Format code blocks with proper syntax highlighting
            4. Structure the content similar to popular GitHub README.md files
            5. Use clear hierarchical organization with proper heading levels
            6. Add emphasis (bold/italic) for important points
            7. Ensure proper spacing and readability
            8. Convert plain URLs to proper markdown links
            9. Add descriptive emojis to lists and important sections
            10. Keep the content professional but engaging
            11. Add table of contents for longer documents
            12. Use badges where appropriate (e.g., version, status)`
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