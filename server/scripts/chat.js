const axios = require('axios');
require('dotenv').config();

// Function to make POST request to Cloudflare API
async function makePostRequest(text) {
    try {
        const cloudflareAppId = process.env.CLOUDFLARE_APP_ID;

        // Define headers
        const headers = {
            'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // Define request body
        const requestBody = {
            "messages": [
                {
                    "role": "system",
                    "content": "You are a friendly assistant"
                },
                {
                    "role": "user",
                    "content": text
                }
            ]
        };

        // Make POST request
        const response = await axios.post(`https://api.cloudflare.com/client/v4/accounts/${cloudflareAppId}/ai/run/@cf/meta/llama-2-7b-chat-fp16`, requestBody, { headers });

        // Return response data
        console.log('Response:', response.data.result.response);
        return response.data.result.response;
    } catch (error) {
        // Handle error
        console.error('Error:', error);
        throw error;
    }
}

//makePostRequest("hi");
module.exports = makePostRequest;
