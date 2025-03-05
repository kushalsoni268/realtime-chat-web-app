const { Message, User } = require("../models")
const { Op } = require("sequelize")

// Get chat history between two users
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const { contactId } = req.params

    // Validate contactId
    if (!contactId) {
      return res.status(400).json({ error: "Contact ID is required" })
    }

    // Get messages between the two users
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "color"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "color"],
        },
      ],
    })

    // Mark unread messages as read
    await Message.update(
      { read: true },
      {
        where: {
          receiverId: userId,
          senderId: contactId,
          read: false,
        },
      },
    )

    res.json(messages)
  } catch (error) {
    console.error("Get chat history error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id
    const { receiverId, text } = req.body

    // Validate input
    if (!receiverId || !text) {
      return res.status(400).json({ error: "Receiver ID and message text are required" })
    }

    // Create message
    const message = await Message.create({
      senderId,
      receiverId,
      text,
    })

    // Get message with sender and receiver info
    const messageWithDetails = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "color"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "name", "color"],
        },
      ],
    })

    res.status(201).json(messageWithDetails)
  } catch (error) {
    console.error("Send message error:", error)
    res.status(500).json({ error: "Server error" })
  }
}

