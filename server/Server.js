const express = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');
const { uploadAudio } = require('./scripts/transcribe');
const { uploadImage } = require('./scripts/imagetotext');
const makePostRequest = require('./scripts/chat');
const app = express();

require('dotenv').config();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Route for chat
app.post('/chat', async function (req, res) {
    console.log(req.body);
    const textgive = req.body.text; // Access text from req.body
    const finalResponse = await makePostRequest(textgive);
     // Construct the response object
     const responseObject = {
        you: textgive,
        cfassist: finalResponse
    }

    res.status(200).send(responseObject);
});

app.post('/chatimagetotext', async function (req, res) {
    try {
        // Check if the request contains image data
        if (!req.body || !req.body.image) {
            return res.status(400).json({ error: 'Image data is missing' });
        }

        const imageData = req.body.image;
        const base64Data = imageData.replace(/^data:image\/png;base64,/, ''); // Remove header from base64 data
        const imageName = uuidv4() + '.png'; // Generate a random name for the image file
        const imagePath = `./images/${imageName}`;

        // Save the image
        await saveImage(imagePath, base64Data);

        // Transcribe audio
        const transcription = req.body.text;

        // Upload image and transcription
        const answerToGiveUser = await uploadImage(imageName, transcription);
        
        // Construct the response object
        const responseObject = {
            you: transcription,
            cfassist: answerToGiveUser
        };

        //await deleteFile(imagePath); // Delete the image file after use
        // Send response as JSON object
        res.status(200).json(responseObject);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred during processing' });
    }
});

app.post('/imagetotext', async function (req, res) {
    try {
        // Check if the request contains image data
        if (!req.body || !req.body.image) {
            return res.status(400).json({ error: 'Image data is missing' });
        }

        const imageData = req.body.image;
        const base64Data = imageData.replace(/^data:image\/png;base64,/, ''); // Remove header from base64 data
        const imageName = uuidv4() + '.png'; // Generate a random name for the image file
        const imagePath = `./images/${imageName}`;

        // Save the image
        await saveImage(imagePath, base64Data);

        // Check if audio data is missing
        const audio = req.body.audio;
        if (!audio) {
            return res.status(400).json({ error: 'Audio data is missing' });
        }
        
        // Transcribe audio
        const transcription = await transcribeAudio(audio);

        // Upload image and transcription
        const answerToGiveUser = await uploadImage(imageName, transcription);
        
        // Construct the response object
        const responseObject = {
            you: transcription,
            cfassist: answerToGiveUser
        };

        //await deleteFile(imagePath); // Delete the image file after use
        // Send response as JSON object
        res.status(200).json(responseObject);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred during processing' });
    }
});

// Function to save image to the file system
// Function to save image to the file system
async function saveImage(imagePath, base64Data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(imagePath, base64Data, 'base64', function (err) {
            if (err) {
                console.error(err);
                reject('Error saving image');
            } else {
                console.log('Image saved successfully');
                resolve();
            }
        });
    });
}

// Function to transcribe audio
async function transcribeAudio(audioData) {
    return new Promise(async (resolve, reject) => {
        try {
            const audio = audioData;

            if (!audio) {
                reject('Audio data is missing');
                return;
            }

            const audioName = uuidv4() + '.mp3'; // Generate a random name for the audio file
            const audioPath = `./audio/${audioName}`;

            // Save the audio
            await fs.promises.writeFile(audioPath, audio, 'base64');

            console.log('Audio saved successfully');

            // Upload audio and get transcription
            const transcription = await uploadAudio(audioName);

            await deleteFile(audioPath);

            resolve(transcription);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            reject('Error transcribing audio');
        }
    });
}

async function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
        return;
      }
      console.log('File deleted successfully');
    });
}

// Route for uploading audio (transcribe)
app.post('/transcribe', async function (req, res) {
    const audio = req.body.audio;

    if (!audio) {
        res.status(400).send('Audio data is missing');
        return;
    }

    const audioName = uuidv4() + '.mp3'; // Generate a random name for the audio file
    const audioPath = `./audio/${audioName}`;

    await fs.promises.writeFile(audioPath, audio, 'base64');

    const gottext = await uploadAudio(audioName);
    console.log(gottext);
    const responseofchat = await makePostRequest(gottext);
    console.log(responseofchat);

    const responseObject = {
        you: gottext,
        cfassist: responseofchat
    };

    //await deleteFile(audioPath); // Delete the audio file after use
    // Send response as JSON object
    res.status(200).json(responseObject);
});

// Route for translation (placeholder)
app.get('/translate', async function (req, res) {
    res.send("Translation route");
});

// Error handler middleware
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const port = process.env.PORT || 4000;
app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});

module.exports = app;
