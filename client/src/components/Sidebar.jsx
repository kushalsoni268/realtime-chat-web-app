import { Plus, Trash2 } from "react-feather"
import Avatar from "./Avatar"
import "../styles/Sidebar.css"

function Sidebar({ user, contacts, activeContact, onContactSelect, onLogout, onAddContact, onRemoveContact }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Avatar name={user.name} color={user.color} />
        <span>{user.name}</span>
      </div>

      <div className="sidebar-actions">
        <button className="add-contact-btn" onClick={onAddContact}>
          <Plus size={18} />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="chat-list">
        {contacts.length === 0 ? (
          <div className="no-contacts">
            <p>No contacts yet</p>
            <p>Add a contact to start chatting</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              className={`chat-item ${activeContact && activeContact.id === contact.id ? "active" : ""} ${contact.hasUnread ? "unread" : ""}`}
              onClick={() => onContactSelect(contact)}
            >
              <Avatar name={contact.name} color={contact.color} />
              <div className="chat-info">
                <div className="chat-name">{contact.name}</div>
                <div className="chat-preview">{contact.lastMessage || contact.status || "Online"}</div>
              </div>
              <button
                className="remove-contact-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveContact(contact.id)
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar

