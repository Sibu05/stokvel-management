require('dotenv').config({ path: '../.env' });; // loads .env from the project root

const express = require('express');
const cors    = require('cors');
const app     = express();

// route files
const userRoutes         = require('./routes/userRoutes');
const groupRoutes        = require('./routes/groupRouter');
const memberRoutes       = require('./routes/memberRouter');
const contributionRoutes = require('./routes/contributionRouter');

// ─── MIDDLEWARE ───────────────────────────────────────────

app.use(cors({ origin: process.env.CLIENT_URL })); // allow requests from the frontend
app.use(express.json());                           // parse JSON request bodies

// ─── ROUTES ───────────────────────────────────────────────

app.use('/api/users',         userRoutes);
app.use('/api/groups',        groupRoutes);
app.use('/api/members',       memberRoutes);
app.use('/api/contributions', contributionRoutes);

// ─── 404 CATCH ALL ────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── START ────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
