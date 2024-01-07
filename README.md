# Realtime Chat App with Node.js and WebSockets

## Overview

This Realtime Chat App is a simple yet powerful application built with Node.js and WebSockets, allowing users to join different chat rooms and communicate with each other in real-time.

## Features

- **Real-time Communication:** Utilizes WebSockets to enable instant messaging between users.
- **Multiple Rooms:** Users can join different chat rooms.
- **User-friendly Interface:** Provides an intuitive and clean user interface for an enjoyable chat experience.

## Prerequisites

Before running the application, make sure you have the following installed:

- Node.js: [Download and install Node.js](https://nodejs.org/)

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/realtime-chat-app.git
   ```

2. Navigate to the project directory:

```bash
cd realtime-nodejs-chat-app
```
3. Install dependencies:

```bash
npm install
```
4. Start the server:
```bash
nodemon src/index.js or node src/index.js
```
5. Open your web browser and go to http://localhost:3000 to access the Realtime Chat App.

## Usage
1. Enter a username.
2. Choose a chat room to join.
3. Start chatting with other users in real-time.

## File Structure
- **src/index.js**: The main server file that handles WebSocket connections and serves the HTML page.
- **public/index.html**: The HTML template for the chat application.
- **public/style.css**: The stylesheet for styling the chat application.

## Dependencies
- `express`: Web framework for Node.js.
- `socket.io`: WebSocket library for Node.js.

## Contributing
Feel free to contribute to the development of this Realtime Chat App by creating issues or submitting pull requests. Your feedback and contributions are highly appreciated!