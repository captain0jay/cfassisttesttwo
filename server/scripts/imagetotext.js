async function uploadImage(imageData, promptext) {
  try {
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
          body: JSON.stringify({ image: imageData, prompt: promptext, max_tokens: 512 }),
      });

      const responseData = await response.json();
      return responseData.result.description;
  } catch (error) {
      console.error('Error uploading image:', error);
      return null;
  }
}

module.exports = { uploadImage };
