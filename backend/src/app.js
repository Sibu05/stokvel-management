require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { requireAuth, requireRole, requireGroupMember } = require('./middleware/auth');

const app = express();

// Security headers on all responses
app.use(helmet());

// Allow requests from the frontend URL
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Parse incoming JSON request bodies
app.use(express.json());

// Public route — used by Azure to check if the server is running
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Returns the logged in user's profile
// requireAuth verifies token and upserts user in DB
app.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

// Admin only route — requireRole blocks anyone who isn't ADMIN
app.get('/admin', requireAuth, requireRole('ADMIN'), (req, res) => 
  res.json({ message: 'Admin area' })
);

// Group route — requireGroupMember checks user belongs to this group
app.get('/groups/:groupId', requireAuth, requireGroupMember(), (req, res) => 
  res.json({ message: 'Group area' })
);

// Global error handler — catches any errors from middleware
app.use((err, req, res, next) => {
  res.status(err.status ?? 500).json({ error: err.message ?? 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;