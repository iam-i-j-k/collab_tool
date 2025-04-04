import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import axios from 'axios';
import { Save, ArrowLeft, Clock, Info } from 'lucide-react';
import './document-form.css';

export default function DocumentForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [lastSaved, setLastSaved] = useState(null);
  const [showTip, setShowTip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Update character count when content changes
    setCharCount(content.length);
  }, [content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || '{}');
      const token = sessionStorage.getItem('token');
      
      const { data } = await axios.post('http://localhost:5000/api/documents', 
        { title, content }, 
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setLastSaved(new Date());
      setTimeout(() => {
        navigate(`/document/${data._id}`);
      }, 1000);
    } catch (error) {
      console.error('Failed to create document:', error);
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const toggleTip = () => {
    setShowTip(!showTip);
  };

  return (
    <div className="document-form-container">
      <div className="document-form-header">
        <button className="back-button" onClick={handleBack}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        
        <div className="document-status">
          {lastSaved && (
            <div className="last-saved">
              <Clock size={14} />
              <span>Saved {formatTimeAgo(lastSaved)}</span>
            </div>
          )}
        </div>
        
        <button className="info-button" onClick={toggleTip}>
          <Info size={18} />
        </button>
      </div>
      
      {showTip && (
        <div className="tip-box">
          <p>💡 <strong>Pro Tip:</strong> Write your document title first to help organize your thoughts.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="document-form">
        <div className="form-group title-group">
          <input 
            type="text" 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Enter document title..." 
            className="title-input"
            required 
          />
        </div>
        
        <div className="form-group content-group">
          <textarea 
            id="content" 
            value={content} 
            onChange={handleContentChange} 
            placeholder="Start writing your document content here..." 
            className="content-input"
            required 
          />
          
          <div className="content-footer">
            <div className="char-count">
              {charCount} characters
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`save-button ${isSaving ? 'saving' : ''}`}
          disabled={isSaving || !title || !content}
        >
          {isSaving ? (
            <>
              <span className="save-spinner"></span>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save Document</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// Helper function to format time ago
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}
