const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function uploadAudio(audioFileName) {
  try {
    let audioPath = path.join(process.cwd(), `server/audio/${audioFileName}`);
    const audioData = fs.readFileSync(audioPath);
    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_APP_ID}/ai/run/@cf/openai/whisper`;

    const { default: fetch } = await import('node-fetch');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'audio/mpeg',
      },
      body: audioData,
    });

    const responseData = await response.json();
    return responseData.result.text;
  } catch (error) {
    console.error('Error uploading audio:', error);
    return null;
  }
}

module.exports = { uploadAudio };
// Example usage:
// Replace 'audioFileName.mp3' with the name of the audio file you want to upload
// const audioFileName = 'a3d2acb5-768d-4d9c-ab28-a3af9b8e5580.mp3';
// uploadAudio(audioFileName)
//   .then(response => {
//     console.log('Upload response:', response);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
