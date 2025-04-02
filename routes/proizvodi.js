const express = require('express');
const router = express.Router();
const pool = require('../db'); // Pretpostavljam da je pool podešen za MySQL sa promise-ima
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// Konfiguracija Cloudinary
cloudinary.config({
  cloud_name: 'your_cloud_name', // Zameni sa svojim Cloudinary cloud_name
  api_key: 'your_api_key',       // Zameni sa svojim API ključem
  api_secret: 'your_api_secret'  // Zameni sa svojim API secret-om
});

// Konfiguracija Multer-a za memorijsko skladištenje (jer šaljemo direktno na Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// Dobavi sve proizvode
router.get('/', async (req, res) => {
  try {
    const [proizvodi] = await pool.query(`
      SELECT id, ime, opis, cena, slika, kolicina 
      FROM proizvodi
    `);
    res.status(200).json(proizvodi);
  } catch (error) {
    console.error('Greška u bazi:', error);
    res.status(500).json({ error: 'Greška pri dobavljanju proizvoda' });
  }
});

// Dobavi jedan proizvod po ID-u
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    const [proizvod] = await pool.query(
      `SELECT id, ime, opis, cena, slika, kolicina 
       FROM proizvodi 
       WHERE id = ?`,
      [productId]
    );
    if (proizvod.length === 0) {
      return res.status(404).json({ error: 'Proizvod nije pronađen' });
    }
    res.status(200).json(proizvod[0]);
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Greška pri dobavljanju proizvoda' });
  }
});

// POST ruta za dodavanje novog proizvoda
router.post('/', upload.single('slika'), async (req, res) => {
  const { ime, opis, cena, kolicina } = req.body;
  if (!ime || !cena || !req.file) {
    return res.status(400).json({ error: 'Ime, cena i slika su obavezna polja' });
  }

  try {
    // Upload slike na Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'proizvodi' }, // Folder na Cloudinary-ju
      async (error, result) => {
        if (error) {
          return res.status(500).json({ error: 'Greška pri uploadu slike' });
        }

        const slikaUrl = result.secure_url;

        // Unos proizvoda u bazu sa Cloudinary URL-om
        const [insertResult] = await pool.query(
          `INSERT INTO proizvodi (ime, opis, cena, slika, kolicina) VALUES (?, ?, ?, ?, ?)`,
          [
            ime,
            opis || null,
            parseFloat(cena),
            slikaUrl,
            kolicina !== undefined ? parseInt(kolicina) : 0
          ]
        );

        res.status(201).json({
          message: 'Proizvod uspešno dodat',
          productId: insertResult.insertId,
          slikaUrl
        });
      }
    );

    // Pretvaranje buffer-a u stream za Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Greška pri dodavanju proizvoda' });
  }
});

// Ažuriraj proizvod
router.put('/:id', upload.single('slika'), async (req, res) => {
  const productId = req.params.id;
  const { ime, opis, cena, kolicina } = req.body;
  let slikaUrl;

  try {
    if (req.file) {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'proizvodi' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: 'Greška pri uploadu slike' });
          }
          slikaUrl = result.secure_url;
          await updateProduct();
        }
      );

      const bufferStream = new Readable();
      bufferStream.push(req.file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    } else {
      await updateProduct();
    }

    async function updateProduct() {
      const updates = [];
      const params = [];

      if (ime) {
        updates.push('ime = ?');
        params.push(ime);
      }
      if (opis !== undefined) {
        updates.push('opis = ?');
        params.push(opis);
      }
      if (cena) {
        updates.push('cena = ?');
        params.push(parseFloat(cena));
      }
      if (kolicina !== undefined) {
        updates.push('kolicina = ?');
        params.push(parseInt(kolicina));
      }
      if (slikaUrl) {
        updates.push('slika = ?');
        params.push(slikaUrl);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'Nema podataka za ažuriranje' });
      }

      const query = `UPDATE proizvodi SET ${updates.join(', ')} WHERE id = ?`;
      params.push(productId);

      const [result] = await pool.query(query, params);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Proizvod nije pronađen' });
      }

      res.status(200).json({
        message: 'Proizvod uspešno ažuriran',
        changes: result.changedRows
      });
    }
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Greška pri ažuriranju proizvoda' });
  }
});

// Obriši proizvod
router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM proizvodi WHERE id = ?',
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proizvod nije pronađen' });
    }

    res.status(200).json({
      message: 'Proizvod uspešno obrisan',
      deletedId: productId
    });
  } catch (error) {
    console.error('Greška:', error);
    res.status(500).json({ error: 'Greška pri brisanju proizvoda' });
  }
});

module.exports = router;