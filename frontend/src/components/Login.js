import React, { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./login-page.css"
import { UserContext } from "../context/UserContext"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useContext(UserContext)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password })

      const userData = { name: data.name, token: data.token, email: data.email, role: data.role }
      sessionStorage.setItem("user", JSON.stringify(userData))
      sessionStorage.setItem("token", data.token)

      setUser(userData) // Update the global user state
      navigate("/dashboard")
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.request) {
        setError("Server is not responding. Please check your connection.")
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setIsLoading(false) // Stop loading
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">CT</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to CollabTool</p>
        </div>

        {error && (
          <div className="error-message">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-container">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className={`login-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Create an account</a>
          </p>
        </div>

        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
      </div>
    </div>
  )
}

export default Login

