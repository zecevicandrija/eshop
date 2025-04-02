const express = require('express');
const router = express.Router();
const pool = require('../db'); // pool je već promise-based iz db.js
const bcrypt = require('bcryptjs');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Konfiguracija za multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Dobavljanje svih korisnika
router.get('/', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, ime, prezime, email, uloga, telefon, adresa, profilna FROM korisnici'
    );
    res.status(200).json(users);
  } catch (error) {
    console.error('Greška pri dobavljanju korisnika:', error);
    res.status(500).json({ error: 'Greška pri dobavljanju korisnika' });
  }
});

// Dodavanje novog korisnika
router.post('/', async (req, res) => {
  const { ime, prezime, email, sifra, uloga = 'korisnik', adresa, telefon } = req.body;

  if (!ime || !prezime || !email || !sifra || !telefon || !adresa) {
    return res.status(400).json({ error: 'Nedostaju obavezna polja' });
  }

  try {
    // Provera da li email već postoji
    const [existingUser] = await pool.query('SELECT id FROM korisnici WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Email adresa već postoji' });
    }

    const hashedPassword = await bcrypt.hash(sifra, 10);

    const [result] = await pool.query(
      `INSERT INTO korisnici (ime, prezime, email, sifra, uloga, adresa, telefon) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ime, prezime, email, hashedPassword, uloga, adresa, telefon]
    );

    res.status(201).json({ message: 'Korisnik uspešno dodat', userId: result.insertId });
  } catch (error) {
    console.error('Greška pri dodavanju korisnika:', error);
    res.status(500).json({ error: 'Greška pri dodavanju korisnika' });
  }
});

// Ažuriranje korisnika
router.put('/:id', async (req, res) => {
  const userId = req.params.id;
  const { ime, prezime, email, sifra, uloga, adresa, telefon } = req.body;

  try {
    // Provera da li korisnik postoji
    const [existingUser] = await pool.query('SELECT id FROM korisnici WHERE id = ?', [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    let hashedPassword;
    const updates = [];
    const params = [];

    if (ime) { updates.push('ime = ?'); params.push(ime); }
    if (prezime) { updates.push('prezime = ?'); params.push(prezime); }
    if (email) {
      const [emailCheck] = await pool.query('SELECT id FROM korisnici WHERE email = ? AND id != ?', [email, userId]);
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: 'Email adresa već postoji' });
      }
      updates.push('email = ?');
      params.push(email);
    }
    if (uloga) { updates.push('uloga = ?'); params.push(uloga); }
    if (adresa) { updates.push('adresa = ?'); params.push(adresa); }
    if (telefon) { updates.push('telefon = ?'); params.push(telefon); }
    if (sifra) {
      hashedPassword = await bcrypt.hash(sifra, 10);
      updates.push('sifra = ?');
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nema podataka za ažuriranje' });
    }

    params.push(userId);
    const [result] = await pool.query(`UPDATE korisnici SET ${updates.join(', ')} WHERE id = ?`, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    res.status(200).json({ message: `Korisnik #${userId} uspešno ažuriran` });
  } catch (error) {
    console.error('Greška pri ažuriranju korisnika:', error);
    res.status(500).json({ error: 'Greška pri ažuriranju korisnika' });
  }
});

// Brisanje korisnika
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM korisnici WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Korisnik nije pronađen' });
    }

    res.status(200).json({ message: `Korisnik #${userId} uspešno obrisan` });
  } catch (error) {
    console.error('Greška pri brisanju korisnika:', error);
    res.status(500).json({ error: 'Greška pri brisanju korisnika' });
  }
});

// Upload profilne slike
router.post('/upload-avatar/:id', upload.single('avatar'), async (req, res) => {
  const userId = req.params.id;

  if (!req.file) {
    return res.status(400).json({ error: 'Nije poslata slika' });
  }

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'user_avatars',
      public_id: `user_${userId}`,
      overwrite: true,
    },
    async (error, result) => {
      if (error) {
        console.error('Cloudinary greška:', error);
        return res.status(500).json({ error: 'Greška pri uploadu na Cloudinary' });
      }

      try {
        const [updateResult] = await pool.query(
          'UPDATE korisnici SET profilna = ? WHERE id = ?',
          [result.secure_url, userId]
        );

        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: 'Korisnik nije pronađen' });
        }

        res.json({ message: 'Avatar ažuriran', url: result.secure_url });
      } catch (err) {
        console.error('Greška pri update-u baze:', err);
        res.status(500).json({ error: 'Greška u bazi podataka' });
      }
    }
  );

  // Pretvaranje buffer-a u stream i slanje na Cloudinary
  const bufferStream = require('stream').Readable.from(req.file.buffer);
  bufferStream.pipe(uploadStream);
});

module.exports = router;