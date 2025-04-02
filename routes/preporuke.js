const express = require('express');
const router = express.Router();
const pool = require('../db'); // Pretpostavlja se da imate konfiguraciju baze podataka u db.js

// Dobavi preporuke za korisnika
router.get('/korisnik/:korisnikId', async (req, res) => {
  const korisnikId = req.params.korisnikId;
  try {
    // Dohvati kupljene proizvode korisnika
    const [kupljeniProizvodi] = await pool.query(`
      SELECT DISTINCT p.id
      FROM transakcije t
      JOIN JSON_TABLE(t.proizvodi, '$[*]' COLUMNS (id INT PATH '$.id')) AS p
      WHERE t.email = (SELECT email FROM korisnici WHERE id = ?)
    `, [korisnikId]);

    const kupljeniIds = kupljeniProizvodi.map(p => p.id);
    if (kupljeniIds.length === 0) {
      return res.status(200).json([]);
    }

    // Dohvati preporuke na osnovu kupljenih proizvoda
    const [preporuke] = await pool.query(`
      SELECT DISTINCT p.id, p.ime, p.cena, p.slika
      FROM preporuke pr
      JOIN proizvodi p ON pr.preporuceni_proizvod_id = p.id
      WHERE pr.proizvod_id IN (?)
    `, [kupljeniIds]);

    res.status(200).json(preporuke);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Greška pri dobavljanju preporuka' });
  }
});

router.get('/multiple', async (req, res) => {
    const ids = req.query.ids.split(',');
    try {
      const [preporuke] = await pool.query(`
        SELECT DISTINCT p.id, p.ime, p.cena, p.slika
        FROM preporuke pr
        JOIN proizvodi p ON pr.preporuceni_proizvod_id = p.id
        WHERE pr.proizvod_id IN (?)
      `, [ids]);
      res.status(200).json(preporuke);
    } catch (error) {
      res.status(500).json({ error: 'Greška pri dobavljanju preporuka' });
    }
  });

  router.get('/:proizvodId', async (req, res) => {
    const proizvodId = req.params.proizvodId;
    try {
      const [preporuke] = await pool.query(`
        SELECT p.id, p.ime, p.cena, p.slika
        FROM preporuke pr
        JOIN proizvodi p ON pr.preporuceni_proizvod_id = p.id
        WHERE pr.proizvod_id = ?
      `, [proizvodId]);
      res.status(200).json(preporuke);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Greška pri dobavljanju preporuka' });
    }
  });

  router.post('/', async (req, res) => {
    const { proizvod_id, preporuceni_proizvod_id } = req.body;
    try {
      await pool.query(`
        INSERT INTO preporuke (proizvod_id, preporuceni_proizvod_id)
        VALUES (?, ?)
      `, [proizvod_id, preporuceni_proizvod_id]);
      res.status(201).json({ message: 'Preporuka dodata' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Greška pri dodavanju preporuke' });
    }
  });

module.exports = router;