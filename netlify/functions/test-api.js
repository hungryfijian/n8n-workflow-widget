// File: netlify/functions/test-api.js
// Simple test function to verify Netlify Functions are working

exports.handler = async (event, context) => {
  console.log('Test function called');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Check environment variables
    const hasClaudeKey = !!process.env.CLAUDE_API_KEY;
    const keyPrefix = process.env.CLAUDE_API_KEY ? process.env.CLAUDE_API_KEY.substring(0, 10) + '...' : 'none';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Test function working!',
        timestamp: new Date().toISOString(),
        method: event.httpMethod,
        hasClaudeKey: hasClaudeKey,
        keyPrefix: keyPrefix,
        environment: process.env.NODE_ENV || 'unknown'
      })
    };

  } catch (error) {
    console.error('Test function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Test function failed', 
        details: error.message 
      })
    };
  }
};