exports.handler = async (event, context) => {
  // Extend the timeout to 10 minutes (600 seconds)
  context.callbackWaitsForEmptyEventLoop = false;
  
  console.log('Function called with method:', event.httpMethod);
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Non-POST request rejected');
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Starting POST request processing');
    
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    console.log('API key exists:', !!CLAUDE_API_KEY);
    
    if (!CLAUDE_API_KEY) {
      console.log('No API key found');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Claude API key not configured' })
      };
    }

    console.log('Parsing request body');
    const requestBody = JSON.parse(event.body);
    console.log('Request body parsed successfully');

    console.log('Making Claude API request with extended timeout');
    
    // Create a fetch request with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 540000); // 9 minutes
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': CLAUDE_API_KEY
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Claude API response status:', response.status);
    
    const data = await response.json();
    console.log('Claude API response parsed');

    if (!response.ok) {
      console.log('Claude API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data })
      };
    }

    console.log('Returning successful response');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Function error:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        headers,
        body: JSON.stringify({ error: 'Request timeout - image processing took too long' })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
