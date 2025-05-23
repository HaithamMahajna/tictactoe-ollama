import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { model,messages } = req.body;
    const OLLAMA_HOST = 'http://10.0.1.31:11434'; // Ollama server private IP and port

    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:1b',
        messages: messages,
        stream: false,
        options: {
          temperature: 0.1, // Lower temperature for more focused responses
          num_predict: 2, // Limit response length to just the number
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ message: 'Ollama API error', error: errorText });
    }


    const data = await response.json();
    const ollamaResponse = data.message?.content?.trim();

    
    if (!ollamaResponse) {
      throw new Error('Invalid response from Ollama');}
    
    


    // Clean up the response to ensure we only get a number
    const cleanResponse = ollamaResponse.replace(/[^0-8]/g, '');
    
    if (!cleanResponse) {
      throw new Error('Invalid response from Ollama');
    }

    return res.status(200).json({ message: cleanResponse });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      message: 'Error communicating with Ollama',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

