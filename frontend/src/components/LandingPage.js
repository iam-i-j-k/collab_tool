import React from "react"
import { Link } from "react-router-dom"
import "./landing-page.css"

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="highlight">CollabTool</span>
          </h1>
          <p className="hero-description">
            CollabTool is your go-to platform for seamless real-time collaboration. Work together on documents, share
            ideas, and communicate effortlessly with your team.
          </p>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Document Editing</h3>
              <p>Edit documents in real-time with your team</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Team Chat</h3>
              <p>Communicate instantly with integrated messaging</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Project Tracking</h3>
              <p>Keep your projects organized and on schedule</p>
            </div>
          </div>
          <p className="secondary-text">
            Whether you're working on a team project or just need to organize your thoughts, CollabTool offers all the
            features you need to stay productive.
          </p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary">
              Get Started
            </Link>
            <Link to="/login" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="collaboration-illustration">
            <div className="floating-element doc"></div>
            <div className="floating-element chat"></div>
            <div className="floating-element calendar"></div>
            <div className="floating-element user user-1"></div>
            <div className="floating-element user user-2"></div>
            <div className="floating-element user user-3"></div>
          </div>
        </div>
      </div>
      <div className="wave-divider"></div>
    </div>
  )
}

export default LandingPage

