"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import Sidebar from "./Sidebar"
import MessageList from "./MessageList"
import MessageInput from "./MessageInput"
import ChatHeader from "./ChatHeader"
import MobileMenu from "./MobileMenu"
import "../styles/Chat.css"

const ENDPOINT = "http://localhost:5000"

function Chat({ user, onLogout }) {
  const [socket, setSocket] = useState(null)
  const [contacts, setContacts] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(ENDPOINT)
    setSocket(newSocket)

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [])

  // Handle socket events
  useEffect(() => {
    if (!socket) return

    // Connect and register user
    socket.emit("userConnected", user)

    // Get contacts list
    socket.on("contactsList", (contactsList) => {
      setContacts(contactsList.filter((contact) => contact.id !== user.id))
      if (contactsList.length > 0 && !activeContact) {
        const firstContact = contactsList.find((contact) => contact.id !== user.id)
        if (firstContact) setActiveContact(firstContact)
      }
    })

    // Receive message
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    // Load chat history when changing active contact
    socket.on("chatHistory", (history) => {
      setMessages(history)
    })

    return () => {
      socket.off("contactsList")
      socket.off("receiveMessage")
      socket.off("chatHistory")
    }
  }, [socket, user, activeContact])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef])

  // Load chat history when active contact changes
  useEffect(() => {
    if (socket && activeContact) {
      socket.emit("getChatHistory", {
        senderId: user.id,
        receiverId: activeContact.id,
      })
    }
  }, [socket, activeContact, user.id])

  const handleSendMessage = (text) => {
    if (!text.trim() || !socket || !activeContact) return

    const messageData = {
      senderId: user.id,
      receiverId: activeContact.id,
      text,
      timestamp: new Date().toISOString(),
    }

    socket.emit("sendMessage", messageData)
    setMessages((prevMessages) => [...prevMessages, { ...messageData, sent: true }])
  }

  const handleContactSelect = (contact) => {
    setActiveContact(contact)
    setMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="app-container">
      <Sidebar
        user={user}
        contacts={contacts}
        activeContact={activeContact}
        onContactSelect={handleContactSelect}
        onLogout={onLogout}
      />

      <div className="chat-container">
        <ChatHeader user={user} activeContact={activeContact} onMenuToggle={toggleMobileMenu} />

        <MessageList messages={messages} currentUserId={user.id} messagesEndRef={messagesEndRef} />

        <MessageInput onSendMessage={handleSendMessage} />
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        user={user}
        contacts={contacts}
        activeContact={activeContact}
        onContactSelect={handleContactSelect}
        onLogout={onLogout}
      />
    </div>
  )
}

export default Chat

