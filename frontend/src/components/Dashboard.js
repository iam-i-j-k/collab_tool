import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"
import { Plus, FileText, Calendar, ChevronRight, Search } from 'lucide-react';
import axios from 'axios';
import './dashboard.css';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (!user || Object.keys(user).length === 0) {
          navigate('/login');
          return;
        }
        const token = sessionStorage.getItem('token');

        // Fetch user's documents
        const userDocsResponse = await axios.get(`${process.env.REACT_APP_URL}/api/documents`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch all documents
        const allDocsResponse = await axios.get(`${process.env.REACT_APP_URL}/api/documents/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Combine both sets of documents
        const combinedDocuments = [
          ...userDocsResponse.data.map(doc => ({ ...doc, isUserDoc: true })),
          ...allDocsResponse.data.map(doc => ({ ...doc, isUserDoc: false })),
        ];

        setDocuments(combinedDocuments);
      } catch (error) {
        setError('Failed to fetch documents. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [navigate]);

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => navigate('/document/new');
  const handleOpenDocument = (id) => navigate(`/document/${id}`);

  const getCategoryColor = (category) => {
    const colors = {
      'Business': '#4f46e5',
      'Notes': '#10b981',
      'Academic': '#f59e0b',
      'Marketing': '#ec4899',
      'Finance': '#06b6d4'
    };
    return colors[category] || '#6b7280';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Documents</h1>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading-state">
          {[...Array(6)].map((_, i) => <div key={i} className="document-skeleton"></div>)}
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <>
          {filteredDocuments.filter(doc => doc.isUserDoc).length > 0 && (
            <h2>My Documents</h2>
          )}
          <div className="documents-grid">
            {filteredDocuments.filter(doc => doc.isUserDoc).map((doc) => (
              <div key={doc._id} className="document-card" onClick={() => handleOpenDocument(doc._id)}>
                <div className="document-icon"><FileText size={24} /></div>
                <div className="document-info">
                  <h3>{doc.title}</h3>
                  <div className="document-meta">
                    <span className="document-date">
                      <Calendar size={14} />
                      {new Date(doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {doc.category && (
                      <span className="document-category" style={{ backgroundColor: getCategoryColor(doc.category) }}>
                        {doc.category}
                      </span>
                    )}
                  </div>
                  {doc.lastEdited && <p className="last-edited">Last edited: {doc.lastEdited}</p>}
                </div>
                <div className="document-action"><ChevronRight size={20} /></div>
              </div>
            ))}
          </div>

          {filteredDocuments.filter(doc => !doc.isUserDoc).length > 0 && (
            <h2>All Documents</h2>
          )}
          <div className="documents-grid">
            {filteredDocuments.filter(doc => !doc.isUserDoc).map((doc) => (
              <div key={doc._id} className="document-card" onClick={() => handleOpenDocument(doc._id)}>
                <div className="document-icon"><FileText size={24} /></div>
                <div className="document-info">
                  <h3>{doc.title}</h3>
                  <div className="document-meta">
                    <span className="document-date">
                      <Calendar size={14} />
                      {new Date(doc.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {doc.category && (
                      <span className="document-category" style={{ backgroundColor: getCategoryColor(doc.category) }}>
                        {doc.category}
                      </span>
                    )}
                  </div>
                  {doc.lastEdited && <p className="last-edited">Last edited: {doc.lastEdited}</p>}
                </div>
                <div className="document-action"><ChevronRight size={20} /></div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration"><FileText size={64} /></div>
          <h3>No documents found</h3>
          <p>Create your first document to get started</p>
        </div>
      )}

      <button className="create-document-button" onClick={handleCreateNew}>
        <span className="button-icon"><Plus size={20} /></span>
        <span>Create New Document</span>
      </button>
    </div>
  );
}
