"use client"

import { useState } from "react"
import { X, Search } from "react-feather"
import Avatar from "./Avatar"
import api from "../utils/api"
import "../styles/AddContactModal.css"

function AddContactModal({ isOpen, onClose, onAddContact }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setError(null)

      const response = await api.get(`/api/users/search?query=${searchQuery}`)
      setSearchResults(response.data)

      if (response.data.length === 0) {
        setError("No users found")
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Error searching for users")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Contact</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username or name"
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <Search size={20} />
              </button>
            </div>
          </form>

          {loading && <div className="loading-indicator">Searching...</div>}

          {error && <div className="error-message">{error}</div>}

          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Results</h3>
              <ul className="user-list">
                {searchResults.map((user) => (
                  <li key={user.id} className="user-item">
                    <div className="user-info">
                      <Avatar name={user.name} color={user.color} />
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-username">@{user.username}</div>
                      </div>
                    </div>
                    <button className="add-btn" onClick={() => onAddContact(user.id)}>
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddContactModal

