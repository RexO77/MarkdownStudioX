import { supabase } from "@/integrations/supabase/client";

export const formatMarkdownWithAI = async (content: string): Promise<string> => {
  try {
    // Get the GROQ API key from Supabase
    const { data: { secret: GROQ_API_KEY }, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'GROQ_API_KEY' }
    });

    if (error || !GROQ_API_KEY) {
      throw new Error('Failed to get GROQ API key');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: [
          {
            role: 'system',
            content: 'You are a Markdown formatting expert. Format the given Markdown text to improve its hierarchy, readability, and structure while preserving all content. Add appropriate headers, lists, and emphasis where needed. Process the entire document no matter how long it is. Ensure proper nesting of sections and consistent formatting throughout.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.1,
        max_tokens: 100000,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to format markdown');
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
        formatMarkdownWithAI(request.content)
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