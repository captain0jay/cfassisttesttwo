const fs = require('fs');

async function uploadImage(imageData, promptext) {
    try {
        // Convert base64 image data to buffer
        const imageBuffer = Buffer.from(imageData, 'base64');

        const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_APP_ID}/ai/run/@cf/unum/uform-gen2-qwen-500m`;
        const { default: fetch } = await import('node-fetch');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: [...imageBuffer], prompt: promptext, max_tokens: 512 }),
        });

        const responseData = await response.json();
        return responseData.result.description;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

module.exports = { uploadImage };
