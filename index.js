require('dotenv').config();
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
const affiliateRouter = require('./routes/affiliate');
const paymentRouter = require('./routes/payment');

const cloudinary = require('cloudinary').v2;

const app = express();
const port = process.env.PORT || 4000;

// CORS konfiguracija za Netlify frontend
const corsOptions = {
  origin: [
    'https://balkankeys.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://balkankeys.netlify.app/'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rukovanje preflight zahtevima
app.options('*', cors(corsOptions));

// Konfiguracija Cloudinary-ja
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Provjera konekcije prema bazi koristeći async/await
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
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
app.use('/api/affiliate', affiliateRouter);
app.use('/api/payment', paymentRouter);

// Rukovanje nepostojećim rutama
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist on this server.`
  });
});

// Globalni error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
});

module.exports = app;