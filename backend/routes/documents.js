const express = require('express');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Verify token middleware
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('Decoded user:', decoded); // Debug log
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({ message: 'Invalid token' });
    }
};

// Check if the user has the required role
function checkRole(requiredRole) {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        next();
    };
}

// Get all documents for the logged-in user
router.get('/', verifyToken, async (req, res) => {
    try {
        const documents = await Document.find({ owner: req.user.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all documents (accessible to authorized users)
router.get('/all', verifyToken, async (req, res) => {
    try {
        const documents = await Document.find(); // Fetch all documents
        res.json(documents);
    } catch (error) {
        console.error('Error fetching all documents:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single document by ID (accessible to all authorized users)
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Remove ownership restriction to allow access to all documents
        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new document
router.post('/', verifyToken, async (req, res) => {
    const { title, content } = req.body;
    try {
        const newDocument = await Document.create({
            title,
            content,
            owner: req.user.id,
        });
        res.json(newDocument);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a document (only if the user owns it)
router.put('/:id', verifyToken, checkRole('editor'), async (req, res) => {
    const { title, content } = req.body;
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Save the current version before updating
        document.versions.push({
            title: document.title,
            content: document.content,
            timestamp: new Date(),
        });

        document.title = title;
        document.content = content;
        try {
            await document.save();
        } catch (error) {
            console.error('Error saving document:', error);
            return res.status(500).json({ message: 'Failed to save document' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a document (only if the user owns it)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        await document.deleteOne();
        res.json({ message: 'Document deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/undo', verifyToken, checkRole('editor'), async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (document.versions.length === 0) {
            return res.status(400).json({ message: 'No versions to undo' });
        }
        console.log('Versions before undo:', document.versions);
        const lastVersion = document.versions.pop();
        console.log('Versions after undo:', document.versions);
        if (!lastVersion) {
            return res.status(400).json({ message: 'No versions to undo' });
        }
        document.title = lastVersion.title;
        document.content = lastVersion.content;
        try {
            await document.save();
        } catch (error) {
            console.error('Error saving document:', error);
            return res.status(500).json({ message: 'Failed to save document' });
        }
        res.json(document);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/versions', verifyToken, async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Return the version history
        res.json(document.versions || []);
    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
