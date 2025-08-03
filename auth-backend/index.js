require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

export const API_URL = "https://the-app-task-4.onrender.com/api/auth";

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const authRoutes = require('./router');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));