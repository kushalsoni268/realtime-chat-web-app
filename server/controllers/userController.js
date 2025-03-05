const { User, Contact } = require("../models")
const jwt = require("jsonwebtoken")
const { Op } = require("sequelize")

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "7d" })
}

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      })
    }

    // Generate random color
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
    const color = colors[Math.floor(Math.random() * colors.length)]

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      name,
      color,
    })

    // Generate token
    const token = generateToken(user)

    // Return user data without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      color: user.color,
      status: user.status,
    }

    res.status(201).json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Server error during registration" })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({
      where: { username },
    })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user)

    // Return user data without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      color: user.color,
      status: user.status,
    }

    res.json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Server error during login" })
  }
}

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user

    // Return user data without password
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      color: user.color,
      status: user.status,
    }

    res.json(userData)
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Search users by username
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query
    const currentUserId = req.user.id

    if (!query) {
      return res.status(400).json({ error: "Search query is required" })
    }

    // Find users matching the query
    const users = await User.findAll({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: currentUserId } }, // Exclude current user
          {
            [Op.or]: [{ username: { [Op.like]: `%${query}%` } }, { name: { [Op.like]: `%${query}%` } }],
          },
        ],
      },
      attributes: ["id", "username", "name", "color", "status"],
    })

    res.json(users)
  } catch (error) {
    console.error("Search users error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Get user contacts
exports.getContacts = async (req, res) => {
  try {
    const userId = req.user.id

    // Find all contacts for the user
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "contacts",
          attributes: ["id", "username", "name", "color", "status"],
          through: { attributes: [] }, // Don't include the join table
        },
      ],
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user.contacts || [])
  } catch (error) {
    console.error("Get contacts error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Add a contact
exports.addContact = async (req, res) => {
  try {
    const userId = req.user.id
    const { contactId } = req.body

    // Check if contact exists
    const contactUser = await User.findByPk(contactId)

    if (!contactUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if already a contact
    const existingContact = await Contact.findOne({
      where: {
        userId,
        contactId,
      },
    })

    if (existingContact) {
      return res.status(400).json({ error: "Already in contacts" })
    }

    // Create contact
    await Contact.create({
      userId,
      contactId,
    })

    // Return contact data
    const contactData = {
      id: contactUser.id,
      username: contactUser.username,
      name: contactUser.name,
      color: contactUser.color,
      status: contactUser.status,
    }

    res.status(201).json(contactData)
  } catch (error) {
    console.error("Add contact error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Remove a contact
exports.removeContact = async (req, res) => {
  try {
    const userId = req.user.id
    const { contactId } = req.params

    // Find and delete contact
    const contact = await Contact.findOne({
      where: {
        userId,
        contactId,
      },
    })

    if (!contact) {
      return res.status(404).json({ error: "Contact not found" })
    }

    await contact.destroy()

    res.json({ message: "Contact removed successfully" })
  } catch (error) {
    console.error("Remove contact error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

