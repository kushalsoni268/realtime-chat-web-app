import Avatar from "./Avatar"
import "../styles/Sidebar.css"

function Sidebar({ user, contacts, activeContact, onContactSelect, onLogout }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Avatar name={user.name} />
        <span>{user.name}</span>
      </div>
      <div className="chat-list">
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
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar

