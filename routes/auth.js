const express = require('express');
const router = express.Router();
const pool = require('../db'); // Pool već koristi .promise()
const bcrypt = require('bcryptjs');

// Registracija korisnika
router.post('/register', async (req, res) => {
  const { ime, prezime, email, sifra, uloga = 'korisnik' } = req.body;

  // Provera obaveznih polja
  if (!ime || !prezime || !email || !sifra) {
    return res.status(400).json({ error: 'Nedostaju obavezna polja' });
  }

  try {
    // Provera da li korisnik sa unetim email-om već postoji
    const [existing] = await pool.query(
      'SELECT id FROM korisnici WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email već postoji u sistemu' });
    }

    // Hash-ovanje šifre
    const hashedPassword = await bcrypt.hash(sifra, 10);

    // Unos novog korisnika
    const query = `
      INSERT INTO korisnici (ime, prezime, email, sifra, uloga)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      ime,
      prezime,
      email,
      hashedPassword,
      uloga,
    ]);

    res
      .status(201)
      .json({ message: 'Korisnik uspešno registrovan', userId: result.insertId });
  } catch (error) {
    console.error('Greška pri registraciji korisnika:', error);
    res.status(500).json({ error: 'Interna serverska greška' });
  }
});

// Prijava korisnika
router.post('/login', async (req, res) => {
  const { email, sifra } = req.body;

  if (!email || !sifra) {
    return res.status(400).json({ error: 'Nedostaju obavezna polja za prijavu' });
  }

  try {
    // Pretraga korisnika po email-u
    const [users] = await pool.query('SELECT * FROM korisnici WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Neispravni kredencijali' });
    }

    const user = users[0];
    // Provera unete šifre sa hash-ovanom šifrom u bazi
    const isMatch = await bcrypt.compare(sifra, user.sifra);
    if (!isMatch) {
      return res.status(401).json({ message: 'Neispravni kredencijali' });
    }

    // Uklanjanje šifre iz objekta pre slanja odgovora
    const { sifra: hash, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Greška pri prijavi korisnika:', error);
    res.status(500).json({ error: 'Interna serverska greška' });
  }
});

module.exports = router;
