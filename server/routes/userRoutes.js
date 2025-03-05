const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const auth = require("../middleware/auth")

// Public routes
router.post("/register", userController.register)
router.post("/login", userController.login)

// Protected routes
router.get("/profile", auth, userController.getProfile)
router.get("/search", auth, userController.searchUsers)
router.get("/contacts", auth, userController.getContacts)
router.post("/contacts", auth, userController.addContact)
router.delete("/contacts/:contactId", auth, userController.removeContact)

module.exports = router

