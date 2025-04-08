// functions/upload.js
const axios = require('axios');

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { payload } = body;

  try {
    const response = await axios.post('https://api.fireworks.ai/inference/v1/chat/completions', payload, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process the request' }),
    };
  }
};