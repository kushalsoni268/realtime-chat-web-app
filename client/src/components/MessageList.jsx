import "../styles/MessageList.css"

function MessageList({ messages, currentUserId, messagesEndRef }) {
  const formatTime = (timestamp) => {
    if (!timestamp) return ""

    try {
      // Try to parse the timestamp
      const date = new Date(timestamp)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid timestamp:", timestamp)
        return ""
      }

      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (error) {
      console.error("Error formatting timestamp:", error)
      return ""
    }
  }

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.senderId === currentUserId ? "sent" : "received"}`}>
          <p>{message.text}</p>
          <span className="timestamp">{formatTime(message.createdAt || message.timestamp)}</span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList

