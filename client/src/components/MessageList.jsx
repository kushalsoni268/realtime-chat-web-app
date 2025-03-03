import "../styles/MessageList.css"

function MessageList({ messages, currentUserId, messagesEndRef }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="messages">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.senderId === currentUserId ? "sent" : "received"}`}>
          <p>{message.text}</p>
          <span className="timestamp">{formatTime(message.timestamp)}</span>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

export default MessageList

