"use client"

import { useState } from "react"
import "../styles/Login.css"

function Login({ onLogin }) {
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    // Generate a random ID for the user
    const userId = Math.random().toString(36).substring(2, 9)

    onLogin({
      id: userId,
      name: name.trim(),
    })
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Chat App</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
            {error && <p className="error-message">{error}</p>}
          </div>
          <button type="submit" className="login-button">
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

