# CFassist - Assistive Technology for Visually Impaired and Language Barrier

## Description

CFassist is an innovative project designed to assist individuals facing visual impairments and language barriers. Through a combination of features including visual aid, real-time text-to-speech and speech-to-text capabilities, image question and answer, and more, CFassist aims to provide a comprehensive solution for enhanced accessibility and communication.

## Features

- **Visual Aid:** Utilize image recognition technology to describe visual surroundings and objects.
- **Language Barrier Assistance:** Translate text to different languages and facilitate communication across language barriers.
- **Real-time Chatting:** Engage in text or audio-based conversations using natural language models for seamless communication.
- **Image Question and Answer:** Ask questions about images and receive spoken or textual responses for enhanced understanding.

## Installation

1. Clone the repository:

    ```bash
    git clone <repository_url>
    ```

2. Navigate to the project directory:

    ```bash
    cd cfassist
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Navigate to the server directory:

    ```bash
    cd server
    ```

5. Install server dependencies:

    ```bash
    npm install
    ```

6. Return to the project directory:

    ```bash
    cd ..
    ```

7. Start the development server:

    ```bash
    npm run dev
    ```

## Environment Variables

### Server:

- Create a `.env` file in the `server` directory.
- Obtain `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_APP_ID` from your Cloudflare account.
- Add the following lines to the `.env` file:

    ```bash
    CLOUDFLARE_API_TOKEN=<your_cloudflare_api_token>
    CLOUDFLARE_APP_ID=<your_cloudflare_app_id>
    ```

### Client:

- Create a `.env` file in the `cfassist` directory.
- Define `NEXT_PUBLIC_SERVER_URL` with the server URL. For local development, use:

    ```bash
    NEXT_PUBLIC_SERVER_URL=http://localhost:4000
    ```

**Note:** Ensure that all environment variables are correctly set before running the application.

## Usage

- Access the application through the provided URL.
- Explore the various features to experience enhanced accessibility and communication.

## Contributing

Contributions to CFassist are welcome! Feel free to submit bug reports, feature requests, or pull requests to help improve the project.

## License

This project is licensed under the [MIT License](link_to_license).
