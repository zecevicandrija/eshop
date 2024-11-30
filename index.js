const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici'); 
const proizvodiRouter = require('./routes/proizvodi');
const transkacijeRouter = require('./routes/transakcije');
const popustiRouter = require('./routes/popusti');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

app.use('/uploads', express.static('uploads'));



// Routes
app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter);
app.use('/api/proizvodi', proizvodiRouter);
app.use('/api/transakcije', transkacijeRouter);
app.use('/api/popusti', popustiRouter);



// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});