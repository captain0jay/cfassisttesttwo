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
        const transcription = req.body.text;

        // Upload image and transcription
        const answerToGiveUser = await uploadImage(imageData, transcription);
        
        // Construct the response object
        const responseObject = {
            you: transcription,
            cfassist: answerToGiveUser
        };

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

        // Check if audio data is missing
        const audio = req.body.audio;
        if (!audio) {
            return res.status(400).json({ error: 'Audio data is missing' });
        }
        
        // Transcribe audio
        const transcription = await transcribeAudio(audio);

        // Upload image and transcription
        const answerToGiveUser = await uploadImage(imageData, transcription);
        
        // Construct the response object
        const responseObject = {
            you: transcription,
            cfassist: answerToGiveUser
        };

        // Send response as JSON object
        res.status(200).json(responseObject);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred during processing' });
    }
});

// Function to transcribe audio
async function transcribeAudio(audioData) {
    return new Promise(async (resolve, reject) => {
        try {
            const audio = audioData;

            if (!audio) {
                reject('Audio data is missing');
                return;
            }

            // Upload audio and get transcription
            const transcription = await uploadAudio(audio);

            resolve(transcription);
        } catch (error) {
            console.error('Error transcribing audio:', error);
            reject('Error transcribing audio');
        }
    });
}

// Route for uploading audio (transcribe)
app.post('/transcribe', async function (req, res) {
    const audio = req.body.audio;

    if (!audio) {
        res.status(400).send('Audio data is missing');
        return;
    }

    const gottext = await uploadAudio(audio);
    console.log(gottext);
    const responseofchat = await makePostRequest(gottext);
    console.log(responseofchat);

    const responseObject = {
        you: gottext,
        cfassist: responseofchat
    };

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

//module.exports = app;
