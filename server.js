const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const express = require('express');
const app = express();

app.use(express.json()); 

// checking users table, I'm using it for my groups table
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test user, I'm using it for my groups table
app.post('/api/users/test', async (req, res) => {
  try {
    const testUser = await prisma.users.create({
      data: {
        providerId: "test_subject",
        email: "test@example.com",
        name: "Tester"
      }
    });
    res.json(testUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await prisma.groups.findMany(); 
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

//  Inserting a new group using post
app.post('/api/groups', async (req, res) => {
  const { name, description, contributionAmount, cycleType, payoutOrder, startDate, status, createdBy, FiuserId } = req.body; 
  try {
    const newGroup = await prisma.groups.create({
      data: {
        name: name,
        description: description,
        contributionAmount: contributionAmount,
        cycleType: cycleType,
        payoutOrder: payoutOrder,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: status,
        createdBy: parseInt(createdBy),
        FiuserId: parseInt(FiuserId),
      },
    });
    res.status(201).json(newGroup);
  } catch (error) {
    console.error("DETAILED ERROR:", error); 
    //console.error(error);
    res.status(400).json({ error: "Failed to create the group" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});