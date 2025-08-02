require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static('./public'));
app.use(express.json());

const authRoutes = require('./router');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));