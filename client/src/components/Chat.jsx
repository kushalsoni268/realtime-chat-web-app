"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import io from "socket.io-client"
import Sidebar from "./Sidebar"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import ChatHeader from "./ChatHeader"
import MobileMenu from "./MobileMenu"
import AddContactModal from "./AddContactModal"
import { useAuth } from "../context/AuthContext"
import api from "../utils/api"
import "../styles/Chat.css"

const ENDPOINT = process.env.REACT_APP_API_URL || "http://localhost:5000"

function Chat() {
  const { user, logout } = useAuth()
  const [socket, setSocket] = useState(null)
  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(ENDPOINT)
    setSocket(newSocket)
    socketRef.current = newSocket

    // Authenticate with token
    const token = localStorage.getItem("token")
    if (token) {
      newSocket.emit("authenticate", token)
    }

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Load contacts from API
  const loadContacts = useCallback(async () => {
    try {
      const response = await api.get("/api/users/contacts")
      setContacts(response.data)

      // Set first contact as active if no active contact
      if (response.data.length > 0 && !activeContact) {
        setActiveContact(response.data[0])
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    }
  }, [activeContact])

  // Load contacts on mount
  useEffect(() => {
    if (user) {
      loadContacts()
    }
  }, [user, loadContacts])

  // Handle socket events
  useEffect(() => {
    if (!socket) return

    // Authentication successful
    socket.on("authenticated", (userData) => {
      console.log("Socket authenticated:", userData)
    })

    // Authentication error
    socket.on("authError", (error) => {
      console.error("Socket authentication error:", error)
      logout()
    })

    // Online contacts
    socket.on("onlineContacts", (onlineContacts) => {
      setContacts((prevContacts) => {
        return prevContacts.map((contact) => {
          const isOnline = onlineContacts.some((online) => online.id === contact.id)
          return {
            ...contact,
            status: isOnline ? "Online" : contact.status,
          }
        })
      })
    })

    // User status changed
    socket.on("userStatusChanged", ({ userId, status }) => {
      setContacts((prevContacts) => {
        return prevContacts.map((contact) => {
          if (contact.id === userId) {
            return { ...contact, status }
          }
          return contact
        })
      })
    })

    // Receive message
    socket.on("receiveMessage", (message) => {
      // Only add message if it's from the active contact or to the active contact
      if (
        activeContact &&
        ((message.senderId === activeContact.id && message.receiverId === user.id) ||
          (message.senderId === user.id && message.receiverId === activeContact.id))
      ) {
        setMessages((prevMessages) => [...prevMessages, message])
      }

      // If message is from a contact that's not active, update their preview
      if (message.senderId !== user.id && (!activeContact || message.senderId !== activeContact.id)) {
        setContacts((prevContacts) => {
          return prevContacts.map((contact) => {
            if (contact.id === message.senderId) {
              return {
                ...contact,
                lastMessage: message.text,
                hasUnread: true,
              }
            }
            return contact
          })
        })
      }
    })

    // Chat history
    socket.on("chatHistory", (history) => {
      setMessages(history)
    })

    return () => {
      socket.off("authenticated")
      socket.off("authError")
      socket.off("onlineContacts")
      socket.off("userStatusChanged")
      socket.off("receiveMessage")
      socket.off("chatHistory")
    }
  }, [socket, user, activeContact, logout])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Load chat history when active contact changes
  useEffect(() => {
    if (socket && activeContact && user) {
      // Clear previous messages
      setMessages([])

      // Get chat history from server
      socket.emit("getChatHistory", {
        senderId: user.id,
        receiverId: activeContact.id,
      })

      // Mark contact as read
      setContacts((prevContacts) => {
        return prevContacts.map((contact) => {
          if (contact.id === activeContact.id) {
            return { ...contact, hasUnread: false }
          }
          return contact
        })
      })
    }
  }, [socket, activeContact, user])

  const handleSendMessage = (text) => {
    if (!text.trim() || !socket || !activeContact || !user) return

    const messageData = {
      senderId: user.id,
      receiverId: activeContact.id,
      text,
      createdAt: new Date().toISOString(),
    }

    socket.emit("sendMessage", messageData)

    // Optimistically add message to UI
    setMessages((prevMessages) => [...prevMessages, { ...messageData, pending: true }])
  }

  const handleContactSelect = (contact) => {
    setActiveContact(contact)
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleAddContact = async (contactId) => {
    try {
      const response = await api.post("/api/users/contacts", { contactId })
      setContacts((prevContacts) => [...prevContacts, response.data])
      setIsAddContactModalOpen(false)
    } catch (error) {
      console.error("Error adding contact:", error)
    }
  }

  const handleRemoveContact = async (contactId) => {
    try {
      await api.delete(`/api/users/contacts/${contactId}`)
      setContacts((prevContacts) => prevContacts.filter((contact) => contact.id !== contactId))

      // If active contact is removed, set first contact as active
      if (activeContact && activeContact.id === contactId) {
        const firstContact = contacts.find((contact) => contact.id !== contactId)
        setActiveContact(firstContact || null)
      }
    } catch (error) {
      console.error("Error removing contact:", error)
    }
  }

  if (!user) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        contacts={contacts}
        activeContact={activeContact}
        onContactSelect={handleContactSelect}
        onLogout={logout}
        onAddContact={() => setIsAddContactModalOpen(true)}
        onRemoveContact={handleRemoveContact}
      />

      <div className="chat-container">
        <ChatHeader user={user} activeContact={activeContact} onMenuToggle={toggleMobileMenu} />

        {activeContact ? (
          <>
            <MessageList messages={messages} currentUserId={user.id} messagesEndRef={messagesEndRef} />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="no-chat-selected">
            <p>Select a contact to start chatting</p>
          </div>
        )}
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        user={user}
        contacts={contacts}
        activeContact={activeContact}
        onContactSelect={handleContactSelect}
        onLogout={logout}
        onAddContact={() => setIsAddContactModalOpen(true)}
        onRemoveContact={handleRemoveContact}
      />

      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onAddContact={handleAddContact}
      />
    </div>
  )
}

export default Chat

