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
          content: 'You are a helpful assistant that formats markdown content to be more readable and organized. Keep the content\'s meaning intact but improve its structure and formatting.'
        },
        {
          role: 'user',
          content: `Please format this markdown content:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 32768,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to format content with GPT')
  }

  const data = await response.json()
  return data.choices[0].message.content
}