require('dotenv').config();
const { auth } = require('express-oauth2-jwt-bearer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const verifyToken = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.AUTH0_AUDIENCE,
});

// Verifies JWT + upserts user in DB
function requireAuth(req, res, next) {
  verifyToken(req, res, async (err) => {
    if (err) return next(err);

    const { sub, email, name } = req.auth.payload;

    try {
      const user = await prisma.user.upsert({
        where:  { providerId: sub },
        update: {},
        create: {
          providerId: sub,
          email:      email ?? `${sub}@noemail.local`,
          name:       name  ?? 'Stokvel User',
          role:       'MEMBER',
        },
      });

      req.user = user;
      next();
    } catch (err) {
      console.error('DB error:', err.message);
      res.status(500).json({ error: 'Database error' });
    }
  });
}

// Blocks access if user's role doesn't match
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: `Requires role: ${role}` });
    next();
  };
}

// Blocks access if user is not a member of the group
function requireGroupMember() {
  return async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    try {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_groupId: {
            userId:  req.user.id,
            groupId: req.params.groupId,
          }
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this group' });
      }

      req.membership = membership; // role available downstream
      next();
    } catch (err) {
      console.error('Group membership check failed:', err.message);
      res.status(500).json({ error: 'Database error' });
    }
  };
}

module.exports = { requireAuth, requireRole, requireGroupMember };