const express = require("express")
const router = express.Router()
const messageController = require("../controllers/messageController")
const auth = require("../middleware/auth")

// All routes are protected
router.get("/history/:contactId", auth, messageController.getChatHistory)
router.post("/send", auth, messageController.sendMessage)

module.exports = router

