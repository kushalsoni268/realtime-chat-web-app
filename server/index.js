const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")

const app = express()
app.use(cors())

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Store connected users
const users = new Map()

// Store messages (in-memory for simplicity, use a database in production)
const messages = []

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id)

  // User connects and registers
  socket.on("userConnected", (userData) => {
    users.set(socket.id, {
      ...userData,
      socketId: socket.id,
      color: getRandomColor(),
    })

    // Send updated users list to all clients
    io.emit("contactsList", Array.from(users.values()))
  })

  // Get chat history between two users
  socket.on("getChatHistory", ({ senderId, receiverId }) => {
    const history = messages.filter(
      (msg) =>
        (msg.senderId === senderId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === senderId),
    )
    socket.emit("chatHistory", history)
  })

  // Send a message
  socket.on("sendMessage", (messageData) => {
    // Store the message
    messages.push(messageData)

    // Find the recipient's socket
    const recipient = Array.from(users.values()).find((user) => user.id === messageData.receiverId)

    if (recipient) {
      // Send to specific recipient
      io.to(recipient.socketId).emit("receiveMessage", messageData)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
    users.delete(socket.id)
    io.emit("contactsList", Array.from(users.values()))
  })
})

// Default route
app.get("/", (req, res) => {
  res.send("Chat Server is running")
})

// Generate random color for user avatar
function getRandomColor() {
  const colors = [
    "#1abc9c",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
    "#e74c3c",
    "#f39c12",
    "#d35400",
    "#c0392b",
    "#8e44ad",
    "#2c3e50",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

