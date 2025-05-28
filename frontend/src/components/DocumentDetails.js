"use client"

import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getDocumentById, updateDocument, deleteDocument } from "../services/documentService"
import { io } from "socket.io-client"
import axios from "axios"
import "./document-details.css"
import { UserContext } from "../context/UserContext"

const DocumentDetails = () => {
  const socket = io(`${import.meta.env.BACKEND_URL}`)
  const { id } = useParams()
  const navigate = useNavigate()
  const [document, setDocument] = useState(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [cursors, setCursors] = useState([])
  const [versions, setVersions] = useState([])
  const { user } = useContext(UserContext); // Access user from context
  const [userRole, setUserRole] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [showVersions, setShowVersions] = useState(false)

  const location = useLocation()
  const message = location.state?.message

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await getDocumentById(id)
        setDocument(doc)
        setTitle(doc.title)
        setContent(doc.content)
      } catch (error) {
        setError("Failed to fetch document")
        console.error("Failed to fetch document:", error)
      }
    }
    fetchDocument()
  }, [id])

  useEffect(() => {
    // Join the document room
    socket.emit("joinDocument", id)

    // Listen for real-time updates
    socket.on("receiveUpdate", (updatedData) => {
      if (updatedData.title) {
        setTitle(updatedData.title)
      }
      if (updatedData.content) {
        setContent(updatedData.content)
      }
    })

    socket.on("receiveUpdatedTitle", (updatedContent) => {
      setContent(updatedContent)
    })

    socket.on("cursor-update", (data) => {
      setCursors((prev) => [...prev.filter((c) => c.id !== data.id), data])
    })

    // Cleanup on component unmount
    return () => {
      socket.disconnect()
      socket.off("cursor-update")
    }
  }, [id, socket])

  const fetchVersions = async () => {
    try {
      const token = sessionStorage.getItem("token")
      const { data } = await axios.get(`${import.meta.env.BACKEND_URL}/api/documents/${id}/versions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setVersions(data)
    } catch (error) {
      console.error("Failed to fetch versions:", error)
    }
  }

  useEffect(() => {
    fetchVersions()
  }, [])

  useEffect(() => {
    // Set user role from context
    if (user && user.role) {
      setUserRole(user.role);
    } else {
      setUserRole("viewer"); // Default to 'viewer' if no role is found
    }
  }, [user]);

  const handleUpdate = async () => {
    try {
      await updateDocument(id, { title, content })
      socket.emit("documentUpdate", { documentId: id, title, content })
      setSuccessMessage("Document updated successfully!")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
      navigate(`/dashboard`)
    } catch (error) {
      setError("Failed to update document")
      setTimeout(() => {
        setError(null)
      }, 3000)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id)
        navigate("/dashboard")
      } catch (error) {
        setError("Failed to delete document")
        setTimeout(() => {
          setError(null)
        }, 3000)
      }
    }
  }

  const handleUndo = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const { data } = await axios.post(
        `${import.meta.env.BACKEND_URL}/api/documents/${id}/undo`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setTitle(data.title)
      setContent(data.content)

      const notification = window.document.createElement("div")
      notification.className = "notification success"
      notification.textContent = "Changes undone successfully!"
      window.document.body.appendChild(notification)

      setTimeout(() => {
        window.document.body.removeChild(notification)
      }, 3000)
    } catch (error) {
      console.error("Failed to undo changes:", error)

      const notification = window.document.createElement("div")
      notification.className = "notification error"
      notification.textContent = "Failed to undo changes"
      window.document.body.appendChild(notification)

      setTimeout(() => {
        window.document.body.removeChild(notification)
      }, 3000)
    }
  }

  const toggleVersions = () => {
    setShowVersions(!showVersions)
  }

  if (error) return <div className="error-message">{error}</div>
  if (!document)
    return (
      <div className="loading-spinner">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    )

  return (
    <div className="document-container">
      {message && <div className="success-message">{message}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      {/* Notification for user role */}
      <div className="role-notification">
        You are viewing as <strong>{userRole}</strong>. You can update your role in the settings.
      </div>

      {/* Notify viewer about editing restrictions */}
      {userRole === "viewer" && (
        <div className="viewer-notification">
          You do not have permission to edit or delete this document.
        </div>
      )}

      <div className="document-header">
        <div className="title-section">
          <input
            type="text"
            className="title-input"
            value={title}
            onChange={(e) => {
              if (userRole === "editor") {
                setTitle(e.target.value)
                socket.emit("documentUpdate", { documentId: id, title: e.target.value, content })
              }
            }}
            placeholder="Document Title"
            disabled={userRole !== "editor"} // Disable input if not an editor
          />
          <div className="active-users">
            {cursors.map((cursor, index) => (
              <div key={index} className="user-avatar" title={cursor.name}>
                {cursor.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button history-button" onClick={toggleVersions} title="Version History">
            <span className="icon">📜</span>
          </button>
          <button
            className="action-button undo-button"
            onClick={handleUndo}
            disabled={userRole !== "editor"} // Disable undo button if not an editor
            title="Undo Changes"
          >
            <span className="icon">↩️</span>
          </button>
          <button
            className="action-button save-button"
            onClick={handleUpdate}
            disabled={userRole !== "editor"} // Disable save button if not an editor
            title="Save Document"
          >
            <span className="icon">💾</span>
          </button>
          <button
            className="action-button delete-button"
            onClick={handleDelete}
            disabled={userRole !== "editor"} // Disable delete button if not an editor
            title="Delete Document"
          >
            <span className="icon">🗑️</span>
          </button>
        </div>
      </div>

      <div className="editor-container">
        <textarea
          className="content-editor"
          value={content}
          onChange={(e) => {
            if (userRole === "editor") {
              setContent(e.target.value)
              socket.emit("documentUpdate", { documentId: id, title, content: e.target.value })
            }
          }}
          placeholder="Start typing your document content here..."
          disabled={userRole !== "editor"} // Disable textarea if not an editor
        />

        <div className={`version-panel ${showVersions ? "show" : ""}`}>
          <div className="version-header">
            <h3>Version History</h3>
            <button className="close-button" onClick={toggleVersions}>
              ×
            </button>
          </div>
          <ul className="version-list">
            {versions.length > 0 ? (
              versions.map((version, index) => (
                <li key={index} className="version-item">
                  <div className="version-time">{new Date(version.timestamp).toLocaleString()}</div>
                  <div className="version-title">{version.title}</div>
                  <div className="version-content">{version.content}</div> {/* Display version content */}
                </li>
              ))
            ) : (
              <li className="no-versions">No previous versions found</li>
            )}
          </ul>
        </div>
      </div>

      <div className="cursors-container">
        {cursors.map((cursor) => (
          <div key={cursor.id} className="cursor-indicator" style={{ left: cursor.x, top: cursor.y }}>
            <div className="cursor-name">{cursor.name}</div>
            <div className="cursor-pointer"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DocumentDetails

