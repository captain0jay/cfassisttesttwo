const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function uploadImage(imageFileName, promptext) {
  try {
    let imagePath = path.join(process.cwd(), `server/images/${imageFileName}`);
    const imageData = fs.readFileSync(imagePath);
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_APP_ID}/ai/run/@cf/unum/uform-gen2-qwen-500m`;

    const { default: fetch } = await import('node-fetch');

    const inputSchema = JSON.stringify({
      "oneOf": [
        {
          "type": "string",
          "format": "binary"
        },
        {
          "type": "object",
          "properties": {
            "image": {
              "type": "array",
              "items": {
                "type": "number"
              }
            },
            "prompt": {
              "type": "string"
            },
            "max_tokens": {
              "type": "integer",
              "default": 512
            }
          }
        }
      ]
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: [...imageData], prompt: promptext, max_tokens: 512 }),
    });

    const responseData = await response.json();
    return responseData.result.description;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}


module.exports = { uploadImage };
// Example usage:
// Replace 'imageFileName.jpg' with the name of the image file you want to upload
// const imageFileName = '2caa6d33-833b-4861-bcd3-772d802788c5.png';
// uploadImage(imageFileName,"who is in the photo?")
//   .then(response => {
//     console.log('Upload response:', response);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
