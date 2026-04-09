const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config(); 

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));


// This is the endpoint for registering a new user. It will be used by dev1 and dev2 to create new users in the database when they log in with Google for the first time. The providerId is the unique identifier from Google, and it will be used to check if the user already exists in the database. If the user already exists, we can skip creating a new user and just return the existing user data.
app.post('/api/auth/register', async (req, res) => {
  const { email, name, providerId } = req.body;
  try {
    const newUser = await prisma.users.create({
      data: {
        providerId: providerId,
        email: email,
        name: name,
        createdAt: new Date()
      }
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to create user", details: error.message });
  }
});

//This is for logging in a user. It will check if the user exists in the database using the email. If the user exists, it will return the user data (or 404 otherwise). After that, they can use this login endpoint to get the user data for their session.
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.users.findUnique({
      where: { email: email }
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//This will get all the users drom the database to check if they exist and what other information we have about them.
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.users.findMany();
    res.json(users);
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
//The port is from the .env file, if not found it defaults to 3000.
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/index.html to view the frontend`);
});