# Realtime Chat Web App

This project is a Realtime Chat Web Application, similar to WhatsApp, built to deliver fast, secure, and efficient messaging. It allows users to communicate seamlessly in real-time, making it ideal for connecting people instantly.

## 📋 Table of Contents

- [About](#user-content-beginner-about)
- [Tech Stack](#user-content-️-tech-stack)
- [Installation](#user-content-️-installation)
- [Run Project](#user-content--run-project)

##  :beginner: About

This Realtime Chat Web App enables instant messaging between users with features inspired by modern messaging platforms like WhatsApp. The app is built using robust web technologies and supports the following key features:

- **Real-time Communication:** Messages are delivered instantly with real-time updates using WebSocket or similar protocols.
- **User Authentication:** Secure login and registration with unique user identification.
- **One-on-One and Group Chats:** Supports private chats as well as group conversations.
- **Media Sharing:** Share images, videos, and files seamlessly.
- **Responsive UI:** Fully responsive design optimized for desktop and mobile devices.
- **Notifications:** Get real-time notifications for new messages.

This project is ideal for learning how to design a real-time web applications, focusing on both backend and frontend development, and understanding the architecture of a scalable chat application.

## 🛠️ Tech Stack

* Node.js
* React.js

## ⚙️ Installation

To set up and install this project, follow these steps:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/kushalsoni268/realtime-chat-web-app.git
```

2. Install the required dependencies for server:

```bash
cd server
npm install
```

3. Create a MySQL database named **realtime-chat-web-app**. Then run the database migrations and seed data:

```bash
npm run db:migrate
npm run db:seed
```

4. Install the required dependencies for client:

```bash
cd client
npm install
```

## 🚀 Run Project

1. Start the server

```bash
npm run dev
```

2. Start the client

```bash
npm start
```

3. Access the application

   Open your browser and navigate to http://localhost:3000.

   You can register a new account or use one of the seeded accounts to log in:

- Username: john_doe, Password: password123
- Username: jane_smith, Password: password123
- Username: bob_johnson, Password: password123