const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const dotenv = require("dotenv")
const { sequelize, User, Message } = require("./models")
const userRoutes = require("./routes/userRoutes")
const messageRoutes = require("./routes/messageRoutes")
const { Op } = require("sequelize")

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)

// Create HTTP server
const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Store connected users
const connectedUsers = new Map()

// Socket.io event handlers
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  // User authenticates with token
  socket.on("authenticate", async (token) => {
    try {
      // Verify token and get user
      const jwt = require("jsonwebtoken")
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret")

      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "username", "name", "color", "status"],
      })

      if (!user) {
        socket.emit("authError", "User not found")
        return
      }

      // Store user data with socket
      connectedUsers.set(socket.id, user)

      // Update user status to online
      await User.update({ status: "Online" }, { where: { id: user.id } })

      // Notify user's contacts that they're online
      socket.broadcast.emit("userStatusChanged", {
        userId: user.id,
        status: "Online",
      })

      // Send user data back to client
      socket.emit("authenticated", user)

      // Send online contacts to user
      const onlineContacts = Array.from(connectedUsers.values()).filter((contact) => contact.id !== user.id)

      socket.emit("onlineContacts", onlineContacts)
    } catch (error) {
      console.error("Authentication error:", error)
      socket.emit("authError", "Authentication failed")
    }
  })

  // User sends a message
  socket.on("sendMessage", async (messageData) => {
    try {
      const { senderId, receiverId, text } = messageData

      // Save message to database
      const message = await Message.create({
        senderId,
        receiverId,
        text,
      })

      // Find receiver's socket
      const receiverSocket = Array.from(connectedUsers.entries()).find(([_, user]) => user.id === receiverId)

      if (receiverSocket) {
        // Send message to receiver
        io.to(receiverSocket[0]).emit("receiveMessage", {
          id: message.id,
          senderId,
          receiverId,
          text,
          createdAt: message.createdAt,
          read: false,
        })
      }

      // Send confirmation to sender
      socket.emit("messageSent", {
        id: message.id,
        createdAt: message.createdAt,
      })
    } catch (error) {
      console.error("Send message error:", error)
      socket.emit("messageError", "Failed to send message")
    }
  })

  // User requests chat history
  socket.on("getChatHistory", async ({ senderId, receiverId }) => {
    try {
      // Get messages between the two users
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
          ],
        },
        order: [["createdAt", "ASC"]],
      })

      // Mark messages as read
      await Message.update(
        { read: true },
        {
          where: {
            receiverId: senderId,
            senderId: receiverId,
            read: false,
          },
        },
      )

      socket.emit("chatHistory", messages)
    } catch (error) {
      console.error("Get chat history error:", error)
      socket.emit("chatHistoryError", "Failed to get chat history")
    }
  })

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id)

    // Get user data
    const user = connectedUsers.get(socket.id)

    if (user) {
      // Update user status to offline
      await User.update({ status: "Offline" }, { where: { id: user.id } })

      // Notify user's contacts that they're offline
      socket.broadcast.emit("userStatusChanged", {
        userId: user.id,
        status: "Offline",
      })

      // Remove from connected users
      connectedUsers.delete(socket.id)
    }
  })
})

// Default route
app.get("/", (req, res) => {
  res.send("Chat Server is running")
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`)

  // Sync database
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")
  } catch (error) {
    console.error("Unable to connect to the database:", error)
  }
})

