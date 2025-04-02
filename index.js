const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const pool = require('./db');
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici');
const proizvodiRouter = require('./routes/proizvodi');
const transakcijeRouter = require('./routes/transakcije');
const popustiRouter = require('./routes/popusti');
const wishlistRouter = require('./routes/wishlist');
const preporukeRouter = require('./routes/preporuke');
const recenzijeRouter = require('./routes/recenzije');

require('dotenv').config(); // Učitavanje .env fajla
const cloudinary = require('cloudinary').v2;

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // Za multipart/form-data

// Konfiguracija Cloudinary-ja
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Provjera konekcije prema bazi koristeći async/await
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1'); // Test query sa promise sintaksom
    console.log('Connected to MySQL database');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();


// Routes
app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter);
app.use('/api/proizvodi', proizvodiRouter);
app.use('/api/transakcije', transakcijeRouter);
app.use('/api/popusti', popustiRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/preporuke', preporukeRouter);
app.use('/api/recenzije', recenzijeRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});