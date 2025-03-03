"use client"

import { useState } from "react"
import { Send } from "react-feather"
import "../styles/MessageInput.css"

function MessageInput({ onSendMessage }) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage("")
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input type="text" placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
      <button type="submit">
        <Send size={20} />
      </button>
    </form>
  )
}

export default MessageInput

