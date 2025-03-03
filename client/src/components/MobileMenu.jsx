import Avatar from "./Avatar"
import "../styles/MobileMenu.css"

function MobileMenu({ isOpen, user, contacts, activeContact, onContactSelect, onLogout }) {
  return (
    <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
      <div className="mobile-menu-header">
        <Avatar name={user.name} />
        <span>{user.name}</span>
      </div>
      <div className="mobile-chat-list">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`chat-item ${activeContact && activeContact.id === contact.id ? "active" : ""}`}
            onClick={() => onContactSelect(contact)}
          >
            <Avatar name={contact.name} color={contact.color} />
            <div className="chat-info">
              <div className="chat-name">{contact.name}</div>
              <div className="chat-preview">{contact.status || "Online"}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mobile-menu-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default MobileMenu

