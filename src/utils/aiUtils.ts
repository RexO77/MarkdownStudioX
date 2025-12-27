export const formatContentWithAI = async (content: string): Promise<string> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
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
            content: content
          }
        ],
        temperature: 1,
        max_completion_tokens: 32768,
        top_p: 1,
        stream: false,
        stop: null
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GROQ API Error:', errorData);
      throw new Error(`Failed to format markdown: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error formatting markdown:', error);
    throw error;
  }
};

// Chrome Extension Message Handler
export const setupChromeExtension = (): void => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((
      request: { action: string; content: string },
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: { success: boolean; content?: string; error?: string }) => void
    ) => {
      if (request.action === 'formatMarkdown') {
        formatContentWithAI(request.content)
          .then(formattedContent => {
            sendResponse({ success: true, content: formattedContent });
          })
          .catch(error => {
            sendResponse({ success: false, error: error.message });
          });
        return true; // Required for async response
      }
    });
  }
};

// Initialize Chrome extension functionality if in extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
  setupChromeExtension();
}