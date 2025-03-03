import { Phone, Video, Menu } from "react-feather"
import Avatar from "./Avatar"
import "../styles/ChatHeader.css"

function ChatHeader({ user, activeContact, onMenuToggle }) {
  const handleVoiceCall = () => {
    alert("Voice call feature is not implemented yet.")
  }

  const handleVideoCall = () => {
    alert("Video call feature is not implemented yet.")
  }

  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="mobile-only">
          <Avatar name={user.name} />
        </div>
        <span className="header-title mobile-only">{user.name}</span>
        <button className="menu-btn mobile-only" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
      </div>

      {activeContact && (
        <div className="active-chat">
          <Avatar name={activeContact.name} color={activeContact.color} />
          <span className="contact-name">{activeContact.name}</span>
          <div className="call-actions">
            <button className="call-btn" onClick={handleVoiceCall}>
              <Phone size={20} />
            </button>
            <button className="call-btn" onClick={handleVideoCall}>
              <Video size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatHeader

