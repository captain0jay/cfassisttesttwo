require('dotenv').config();

async function uploadAudio(audioData) {
  try {
    const base64Audio = audioData.replace(/^data:audio\/mpeg;base64,/, '');
    const base64AudioBuffer = Buffer.from(base64Audio,'base64');

    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_APP_ID}/ai/run/@cf/openai/whisper`;

    const { default: fetch } = await import('node-fetch');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'audio/mpeg',
      },
      body: base64AudioBuffer,
    });

    const responseData = await response.json();
    return responseData.result.text;
  } catch (error) {
    console.error('Error uploading audio:', error);
    return null;
  }
}

module.exports = { uploadAudio };
